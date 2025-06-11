import { 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithCredential,
  ConfirmationResult,
  ApplicationVerifier
} from 'firebase/auth';
import { auth } from '../firebase/config';

/**
 * Phone Authentication Service
 * Requires Firebase Blaze Plan for phone authentication
 */
export class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Initialize reCAPTCHA verifier
   * @param containerId - ID of the container element for reCAPTCHA
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container'): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: (response: string) => {
        console.log('reCAPTCHA solved:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }

  /**
   * Send SMS verification code to phone number
   * @param phoneNumber - Phone number in E.164 format (e.g., +1234567890)
   * @returns Promise<ConfirmationResult>
   */
  async sendVerificationCode(phoneNumber: string): Promise<ConfirmationResult> {
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier not initialized. Call initializeRecaptcha() first.');
    }

    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
      }

      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        this.recaptchaVerifier
      );

      console.log('SMS sent successfully');
      return this.confirmationResult;
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Verify SMS code and sign in user
   * @param verificationCode - 6-digit SMS verification code
   * @returns Promise<UserCredential>
   */
  async verifyCodeAndSignIn(verificationCode: string) {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result available. Send verification code first.');
    }

    try {
      const result = await this.confirmationResult.confirm(verificationCode);
      console.log('Phone authentication successful:', result.user.uid);
      return result;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      throw new Error(`Invalid verification code: ${error.message}`);
    }
  }

  /**
   * Link phone number to existing account
   * @param phoneNumber - Phone number in E.164 format
   * @param verificationCode - 6-digit SMS verification code
   */
  async linkPhoneNumber(phoneNumber: string, verificationCode: string) {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const credential = PhoneAuthProvider.credential(
        this.confirmationResult?.verificationId || '',
        verificationCode
      );

      const result = await auth.currentUser.linkWithCredential(credential);
      console.log('Phone number linked successfully:', result.user.uid);
      return result;
    } catch (error: any) {
      console.error('Error linking phone number:', error);
      throw new Error(`Failed to link phone number: ${error.message}`);
    }
  }

  /**
   * Validate phone number format (E.164)
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format
   * @param phoneNumber - Raw phone number
   * @param countryCode - Country code (default: +1 for US)
   * @returns Formatted phone number
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      return `${countryCode}${digits}`;
    }
    
    return phoneNumber;
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const phoneAuthService = new PhoneAuthService();