import { useState, useCallback } from 'react';
import { phoneAuthService } from '@/lib/auth/phoneAuth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UsePhoneAuthReturn {
  // State
  isLoading: boolean;
  verificationId: string | null;
  isCodeSent: boolean;
  error: string | null;
  
  // Actions
  sendVerificationCode: (phoneNumber: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  linkPhoneNumber: (phoneNumber: string) => Promise<void>;
  unlinkPhoneNumber: () => Promise<void>;
  reset: () => void;
}

export const usePhoneAuth = (): UsePhoneAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();

  const sendVerificationCode = useCallback(async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate phone number format
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
      }
      
      const verificationId = await phoneAuthService.sendVerificationCode(phoneNumber);
      setVerificationId(verificationId);
      setIsCodeSent(true);
      
      toast.success('Verification code sent to your phone!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    if (!verificationId) {
      setError('No verification ID found. Please request a new code.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate code format
      if (!code.match(/^\d{6}$/)) {
        throw new Error('Please enter a valid 6-digit verification code');
      }
      
      const userCredential = await phoneAuthService.verifyCode(verificationId, code);
      
      // Refresh user data to get updated phone number
      await refreshUser();
      
      toast.success('Phone number verified successfully!');
      
      // Reset state after successful verification
      reset();
      
      return userCredential;
    } catch (error: any) {
      const errorMessage = getPhoneAuthErrorMessage(error.code) || error.message || 'Failed to verify code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [verificationId, refreshUser]);

  const linkPhoneNumber = useCallback(async (phoneNumber: string) => {
    if (!user) {
      setError('You must be signed in to link a phone number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate phone number format
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
      }
      
      const verificationId = await phoneAuthService.sendVerificationCode(phoneNumber);
      setVerificationId(verificationId);
      setIsCodeSent(true);
      
      toast.success('Verification code sent! Enter the code to link your phone number.');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const unlinkPhoneNumber = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to unlink a phone number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await phoneAuthService.unlinkPhoneNumber();
      
      // Refresh user data to reflect changes
      await refreshUser();
      
      toast.success('Phone number unlinked successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unlink phone number';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshUser]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setVerificationId(null);
    setIsCodeSent(false);
    setError(null);
  }, []);

  return {
    isLoading,
    verificationId,
    isCodeSent,
    error,
    sendVerificationCode,
    verifyCode,
    linkPhoneNumber,
    unlinkPhoneNumber,
    reset,
  };
};

// Helper function to get user-friendly error messages
function getPhoneAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-phone-number':
      return 'The phone number is not valid. Please check the format and try again.';
    case 'auth/missing-phone-number':
      return 'Please enter a phone number.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'Phone authentication is not enabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait before trying again.';
    case 'auth/invalid-verification-code':
      return 'The verification code is invalid. Please check and try again.';
    case 'auth/invalid-verification-id':
      return 'The verification session has expired. Please request a new code.';
    case 'auth/code-expired':
      return 'The verification code has expired. Please request a new one.';
    case 'auth/credential-already-in-use':
      return 'This phone number is already associated with another account.';
    case 'auth/provider-already-linked':
      return 'A phone number is already linked to this account.';
    case 'auth/no-such-provider':
      return 'No phone number is linked to this account.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before linking a phone number.';
    default:
      return 'An error occurred during phone verification. Please try again.';
  }
}

export default usePhoneAuth;