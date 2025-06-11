'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, CheckCircle } from 'lucide-react';
import { phoneAuthService } from '@/lib/auth/phoneAuth';
import { useAuth } from '@/hooks/useAuth';

interface PhoneAuthComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'signin' | 'link'; // Sign in with phone or link to existing account
}

export const PhoneAuthComponent: React.FC<PhoneAuthComponentProps> = ({
  onSuccess,
  onError,
  mode = 'signin'
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (recaptchaRef.current) {
      phoneAuthService.initializeRecaptcha('recaptcha-container');
    }

    // Cleanup on unmount
    return () => {
      phoneAuthService.cleanup();
    };
  }, []);

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format phone number to E.164
      const formattedPhone = phoneAuthService.formatPhoneNumber(phoneNumber);
      
      await phoneAuthService.sendVerificationCode(formattedPhone);
      setStep('verify');
      setSuccess('Verification code sent to your phone!');
    } catch (err: any) {
      setError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await phoneAuthService.verifyCodeAndSignIn(verificationCode);
        setSuccess('Successfully signed in with phone number!');
      } else if (mode === 'link' && user) {
        await phoneAuthService.linkPhoneNumber(phoneNumber, verificationCode);
        setSuccess('Phone number linked to your account!');
      }
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setVerificationCode('');
    setError('');
    setSuccess('');
  };

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#111111] border-[#333333]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-otw-gold/10 rounded-full w-fit">
          {step === 'phone' ? (
            <Phone className="w-6 h-6 text-otw-gold" />
          ) : (
            <Shield className="w-6 h-6 text-otw-gold" />
          )}
        </div>
        <CardTitle className="text-white">
          {mode === 'signin' ? 'Sign In with Phone' : 'Link Phone Number'}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {step === 'phone'
            ? 'Enter your phone number to receive a verification code'
            : `Enter the 6-digit code sent to ${formatPhoneDisplay(phoneNumber)}`
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-[#1a1a1a] border-[#333333] text-white"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            {/* reCAPTCHA container */}
            <div 
              id="recaptcha-container" 
              ref={recaptchaRef}
              className="flex justify-center"
            />

            <Button
              onClick={handleSendCode}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-otw-gold hover:bg-otw-gold/90 text-black font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-white">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-[#1a1a1a] border-[#333333] text-white text-center text-lg tracking-widest"
                disabled={loading}
                maxLength={6}
              />
              <p className="text-xs text-gray-500">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={loading}
                className="flex-1 border-[#333333] text-white hover:bg-[#333333]"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-otw-gold hover:bg-otw-gold/90 text-black font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>
            </div>

            <Button
              onClick={handleSendCode}
              variant="ghost"
              disabled={loading}
              className="w-full text-otw-gold hover:text-otw-gold/90 hover:bg-otw-gold/10"
            >
              Resend Code
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          By continuing, you agree to receive SMS messages. Message and data rates may apply.
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneAuthComponent;