'use client';

import type React from 'react';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaIdCard,
  FaCamera,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useAgeVerification } from '../../lib/context/AgeVerificationContext';
import { auth } from '../../lib/services/firebase';
import { onAuthStateChanged, User as FirebaseUser, Auth } from 'firebase/auth';
import Image from 'next/image';

interface IDVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IDVerificationModal: React.FC<IDVerificationModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { verifyAge } = useAgeVerification();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    // Ensure auth is properly typed as Auth
    const unsubscribe = onAuthStateChanged(
      auth as Auth,
      (user: FirebaseUser | null) => {
        if (user && user.uid) {
          setUserId(user.uid);
        } else {
          // Generate a local ID if no user is authenticated
          setUserId(
            `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          );
        }
      },
    );

    return () => unsubscribe();
  }, []);

  const handleIDUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target && event.target.result) {
            setIdImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleSelfieUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target && event.target.result) {
            setSelfieImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerSelfieInput = useCallback(() => {
    selfieInputRef.current?.click();
  }, []);

  const handleNextStep = useCallback(() => {
    if (step === 1 && !idImage) {
      setError('Please upload an image of your ID');
      return;
    }

    if (step === 2 && !selfieImage) {
      setError('Please take a selfie for verification');
      return;
    }

    setError(null);
    setStep(step + 1);
  }, [step, idImage, selfieImage]);

  // Define the expected API response type
  interface VerificationResponse {
    success: boolean;
    dob?: string;
    isOver21?: boolean;
    isAuthentic?: boolean;
    facesMatch?: boolean;
    message?: string;
  }

  const handleVerification = useCallback(async () => {
    if (!idImage || !selfieImage) {
      setError('Missing required information for verification');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call our API to verify the ID
      const response = await fetch('/api/verify-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idImage,
          selfieImage,
          userId:
            userId ||
            `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      const result = (await response.json()) as VerificationResponse;

      if (result.success) {
        // If the API verification was successful, update the age verification context
        if (result.dob) {
          // Extract month and year from DOB
          const dobDate = new Date(result.dob);
          const month = String(dobDate.getMonth() + 1); // JavaScript months are 0-indexed
          const year = String(dobDate.getFullYear());

          await verifyAge(month, year);
        } else {
          // If no DOB was returned, just verify with current date - 21 years
          const today = new Date();
          const month = String(today.getMonth() + 1);
          const year = String(today.getFullYear() - 21);

          await verifyAge(month, year);
        }

        setStep(4); // Success
      } else {
        // Handle different failure reasons
        if (result.isOver21 === false) {
          setError('Age verification failed. You must be 21 or older.');
        } else if (result.isAuthentic === false) {
          setError(
            'ID verification failed. Please ensure your ID is valid and clearly visible.',
          );
        } else if (result.facesMatch === false) {
          setError(
            'Face verification failed. Please ensure your selfie clearly matches your ID photo.',
          );
        } else {
          setError(result.message || 'Verification failed. Please try again.');
        }

        setStep(5); // Failure
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
      setStep(5); // Failure
    } finally {
      setIsProcessing(false);
    }
  }, [idImage, selfieImage, userId, verifyAge]);

  const handleSuccess = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  // Non-async wrapper for the verification function
  const handleVerificationClick = useCallback((): void => {
    void handleVerification();
  }, [handleVerification]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="id-verification-title"
    >
      <div className="bg-[#1A1A1A] rounded-lg shadow-xl w-full max-w-md mx-4 relative animate-fade-in">
        <div className="relative p-6 border-b border-[#333333]">
          <h2 id="id-verification-title" className="text-xl font-bold pr-8">
            Age & Identity Verification
          </h2>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
            aria-label="Close"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaIdCard className="text-gold-foil text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">Upload Your ID</h3>
                <p className="text-gray-400">
                  Please upload a clear photo of your government-issued ID
                  (driver&apos;s license, passport, etc.)
                </p>
              </div>

              <div
                className={`border-2 border-dashed ${idImage ? 'border-emerald-green' : 'border-[#333333]'} rounded-lg p-6 text-center cursor-pointer hover:border-gold-foil transition-colors`}
                onClick={triggerFileInput}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && triggerFileInput()
                }
                role="button"
                tabIndex={0}
                aria-label="Upload ID photo"
              >
                {idImage ? (
                  <div className="relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={idImage || '/placeholder.svg'}
                        alt="ID"
                        className="rounded object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-green rounded-full p-1">
                      <FaCheck className="text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <FaIdCard className="text-4xl text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Click to upload ID</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleIDUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {error && (
                <div className="bg-blood-red bg-opacity-20 text-blood-red p-3 rounded">
                  {error}
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>
                  Your ID will be securely processed by our AI verification
                  system and will not be stored after verification.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCamera className="text-gold-foil text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">Take a Selfie</h3>
                <p className="text-gray-400">
                  Please take a clear selfie to verify your identity matches
                  your ID
                </p>
              </div>

              <div
                className={`border-2 border-dashed ${selfieImage ? 'border-emerald-green' : 'border-[#333333]'} rounded-lg p-6 text-center cursor-pointer hover:border-gold-foil transition-colors`}
                onClick={triggerSelfieInput}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && triggerSelfieInput()
                }
                role="button"
                tabIndex={0}
                aria-label="Take a selfie photo"
              >
                {selfieImage ? (
                  <div className="relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={selfieImage || '/placeholder.svg'}
                        alt="Selfie"
                        className="rounded object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-green rounded-full p-1">
                      <FaCheck className="text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <FaCamera className="text-4xl text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Click to take selfie</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Look directly at the camera in good lighting
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={selfieInputRef}
                  onChange={handleSelfieUpload}
                  accept="image/*"
                  capture="user"
                  className="hidden"
                />
              </div>

              {error && (
                <div className="bg-blood-red bg-opacity-20 text-blood-red p-3 rounded">
                  {error}
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>
                  Your selfie will be securely processed by our AI verification
                  system and will not be stored after verification.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-gold-foil bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaIdCard className="text-gold-foil text-2xl" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Verifying Your Identity
              </h3>
              <p className="text-gray-400 mb-6">
                Our AI system is verifying your ID and confirming you are 21 or
                older.
              </p>

              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#333333] border-opacity-25"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-gold-foil border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-400">
                  This may take a few moments...
                </p>
              </div>

              {error && (
                <div className="bg-blood-red bg-opacity-20 text-blood-red p-3 rounded mt-6">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-emerald-green text-2xl" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Verification Successful!
              </h3>
              <p className="text-gray-400 mb-6">
                Your identity has been verified and you are confirmed to be 21
                or older.
              </p>
              <button
                className="btn-primary w-full"
                onClick={handleSuccess}
                aria-label="Continue to Infused Menu"
              >
                Continue to Infused Menu
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-blood-red bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-blood-red text-2xl" />
              </div>
              <h3 className="text-lg font-bold mb-2">Verification Failed</h3>
              <p className="text-gray-400 mb-2">
                We were unable to verify your identity or confirm you are 21 or
                older.
              </p>
              <p className="text-blood-red mb-6">
                {error || 'Please ensure your ID is valid and clearly visible.'}
              </p>
              <div className="flex gap-3">
                <button
                  className="btn-outline flex-1"
                  onClick={onClose}
                  type="button"
                  aria-label="Cancel verification"
                >
                  Cancel
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={() => setStep(1)}
                  type="button"
                  aria-label="Try verification again"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {(step === 1 || step === 2) && (
          <div className="p-6 bg-[#111111] border-t border-[#333333]">
            <div className="flex justify-between">
              {step > 1 ? (
                <button
                  className="btn-outline"
                  onClick={() => setStep(step - 1)}
                  type="button"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
              ) : (
                <button
                  className="btn-outline"
                  onClick={onClose}
                  type="button"
                  aria-label="Cancel verification"
                >
                  Cancel
                </button>
              )}
              <button
                className="btn-primary"
                onClick={handleNextStep}
                type="button"
                aria-label="Proceed to next step"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 bg-[#111111] border-t border-[#333333]">
            <button
              className="btn-outline w-full"
              onClick={handleVerificationClick}
              disabled={isProcessing}
              aria-busy={isProcessing}
              type="button"
              aria-label={
                isProcessing
                  ? 'Verification in progress'
                  : 'Start verification process'
              }
            >
              {isProcessing ? 'Verifying...' : 'Start Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDVerificationModal;
