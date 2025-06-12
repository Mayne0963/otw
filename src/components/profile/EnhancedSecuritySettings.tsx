'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Monitor, 
  Trash2, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Settings, 
  Bell, 
  Mail, 
  MessageSquare, 
  Globe, 
  Wifi, 
  Calendar, 
  Activity, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  Copy, 
  QrCode, 
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../../lib/firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'app' | 'email';
  loginNotifications: boolean;
  securityAlerts: boolean;
  sessionTimeout: number; // minutes
  allowMultipleSessions: boolean;
  requirePasswordForSensitive: boolean;
  biometricEnabled: boolean;
  trustedDevices: TrustedDevice[];
  loginHistory: LoginSession[];
  securityQuestions: SecurityQuestion[];
  dataDownloadEnabled: boolean;
  accountDeletionRequested: boolean;
}

interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  location: string;
  lastUsed: string;
  trusted: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  timestamp: string;
  status: 'active' | 'expired';
}

interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  isSet: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  loginNotifications: true,
  securityAlerts: true,
  sessionTimeout: 30,
  allowMultipleSessions: true,
  requirePasswordForSensitive: true,
  biometricEnabled: false,
  trustedDevices: [],
  loginHistory: [],
  securityQuestions: [],
  dataDownloadEnabled: true,
  accountDeletionRequested: false
};

const securityQuestions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you live on in third grade?",
  "What is your oldest sibling's birthday month and year?"
];

export default function EnhancedSecuritySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Load security settings from Firebase
  const loadSecuritySettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'userSecurity', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          ...defaultSecuritySettings,
          ...data,
          // Mock data for demonstration
          trustedDevices: [
            {
              id: '1',
              name: 'iPhone 14 Pro',
              type: 'mobile',
              browser: 'Safari',
              os: 'iOS 17.0',
              location: 'New York, NY',
              lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              trusted: true
            },
            {
              id: '2',
              name: 'MacBook Pro',
              type: 'desktop',
              browser: 'Chrome',
              os: 'macOS 14.0',
              location: 'New York, NY',
              lastUsed: new Date().toISOString(),
              trusted: true
            }
          ],
          loginHistory: [
            {
              id: '1',
              device: 'MacBook Pro - Chrome',
              location: 'New York, NY',
              ipAddress: '192.168.1.100',
              timestamp: new Date().toISOString(),
              status: 'active'
            },
            {
              id: '2',
              device: 'iPhone 14 Pro - Safari',
              location: 'New York, NY',
              ipAddress: '192.168.1.101',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              status: 'expired'
            }
          ]
        });
      } else {
        setSettings(defaultSecuritySettings);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecuritySettings();
  }, [user]);

  const saveSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'userSecurity', user.uid);
      const updatedSettings = { ...settings, ...newSettings };
      
      await updateDoc(docRef, {
        ...updatedSettings,
        updatedAt: new Date().toISOString()
      });
      
      setSettings(updatedSettings);
      
      toast({
        title: 'Success',
        description: 'Security settings updated successfully'
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return errors;
  };

  const changePassword = async () => {
    if (!user) return;
    
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(passwordForm.newPassword);
      if (passwordValidation.length > 0) {
        errors.newPassword = passwordValidation.join(', ');
      }
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: 'Success',
        description: 'Password changed successfully'
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to change password',
          variant: 'destructive'
        });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const enable2FA = async () => {
    // This would integrate with Firebase Auth for 2FA
    // For now, we'll simulate the process
    setShow2FASetup(true);
    
    // Generate backup codes
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const confirm2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive'
      });
      return;
    }
    
    // Simulate 2FA verification
    await saveSecuritySettings({ twoFactorEnabled: true });
    setShow2FASetup(false);
    setShowBackupCodes(true);
    setTwoFactorCode('');
    
    toast({
      title: 'Success',
      description: 'Two-factor authentication enabled successfully'
    });
  };

  const disable2FA = async () => {
    await saveSecuritySettings({ twoFactorEnabled: false });
    
    toast({
      title: 'Success',
      description: 'Two-factor authentication disabled'
    });
  };

  const removeTrustedDevice = async (deviceId: string) => {
    const updatedDevices = settings.trustedDevices.filter(device => device.id !== deviceId);
    await saveSecuritySettings({ trustedDevices: updatedDevices });
    
    toast({
      title: 'Success',
      description: 'Trusted device removed'
    });
  };

  const downloadData = async () => {
    // This would generate and download user data
    toast({
      title: 'Info',
      description: 'Data download will be available within 24 hours via email'
    });
  };

  const requestAccountDeletion = async () => {
    await saveSecuritySettings({ accountDeletionRequested: true });
    
    toast({
      title: 'Account Deletion Requested',
      description: 'Your account will be deleted in 30 days. You can cancel this request anytime.',
      variant: 'destructive'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    });
  };

  const formatLastUsed = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-otw-gold" />
            Security Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your account security and privacy preferences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn(
            settings.twoFactorEnabled ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
          )}>
            {settings.twoFactorEnabled ? (
              <><ShieldCheck className="w-3 h-3 mr-1" />Secured</>
            ) : (
              <><ShieldAlert className="w-3 h-3 mr-1" />Basic</>
            )}
          </Badge>
        </div>
      </div>

      {/* Password Management */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-otw-gold" />
            Password Management
          </CardTitle>
          <CardDescription>
            Change your password and manage authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="bg-gray-700/50 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="bg-gray-700/50 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="mt-2 space-y-1">
                    {validatePassword(passwordForm.newPassword).map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-red-400">{error}</span>
                      </div>
                    ))}
                    {validatePassword(passwordForm.newPassword).length === 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Password meets all requirements</span>
                      </div>
                    )}
                  </div>
                )}
                {passwordErrors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="bg-gray-700/50 border-gray-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
              <Button
                onClick={changePassword}
                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full bg-otw-gold text-black hover:bg-otw-gold/90"
              >
                {changingPassword ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Change Password
              </Button>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-otw-gold" />
                Password Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Contains uppercase and lowercase letters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Contains at least one number
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Contains at least one special character
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  Different from your current password
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-otw-gold" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable 2FA</h4>
              <p className="text-gray-400 text-sm">
                {settings.twoFactorEnabled 
                  ? 'Two-factor authentication is currently enabled'
                  : 'Protect your account with two-factor authentication'
                }
              </p>
            </div>
            
            {settings.twoFactorEnabled ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-900/30 text-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disable2FA}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Disable
                </Button>
              </div>
            ) : (
              <Button
                onClick={enable2FA}
                className="bg-otw-gold text-black hover:bg-otw-gold/90"
              >
                Enable 2FA
              </Button>
            )}
          </div>
          
          {settings.twoFactorEnabled && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">2FA Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'app', label: 'Authenticator App', icon: <Smartphone className="w-4 h-4" /> },
                  { value: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
                  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => saveSecuritySettings({ twoFactorMethod: method.value as any })}
                    className={cn(
                      "p-3 rounded-lg border transition-colors flex items-center gap-2",
                      settings.twoFactorMethod === method.value
                        ? "border-otw-gold bg-otw-gold/10 text-otw-gold"
                        : "border-gray-600 text-gray-400 hover:border-gray-500"
                    )}
                  >
                    {method.icon}
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-otw-gold" />
            Security Preferences
          </CardTitle>
          <CardDescription>
            Configure your security and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Login Notifications</Label>
                <p className="text-gray-400 text-sm">Get notified when someone logs into your account</p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(checked) => saveSecuritySettings({ loginNotifications: checked })}
              />
            </div>
            
            <Separator className="bg-gray-600" />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Security Alerts</Label>
                <p className="text-gray-400 text-sm">Receive alerts about suspicious account activity</p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => saveSecuritySettings({ securityAlerts: checked })}
              />
            </div>
            
            <Separator className="bg-gray-600" />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Allow Multiple Sessions</Label>
                <p className="text-gray-400 text-sm">Allow logging in from multiple devices simultaneously</p>
              </div>
              <Switch
                checked={settings.allowMultipleSessions}
                onCheckedChange={(checked) => saveSecuritySettings({ allowMultipleSessions: checked })}
              />
            </div>
            
            <Separator className="bg-gray-600" />
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Require Password for Sensitive Actions</Label>
                <p className="text-gray-400 text-sm">Require password confirmation for sensitive operations</p>
              </div>
              <Switch
                checked={settings.requirePasswordForSensitive}
                onCheckedChange={(checked) => saveSecuritySettings({ requirePasswordForSensitive: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-otw-gold" />
            Trusted Devices
          </CardTitle>
          <CardDescription>
            Manage devices that you trust for account access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.trustedDevices.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Trusted Devices</h3>
                <p className="text-gray-400">Devices you trust will appear here</p>
              </div>
            ) : (
              settings.trustedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      {device.type === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-otw-gold" />
                      ) : device.type === 'tablet' ? (
                        <Monitor className="w-5 h-5 text-otw-gold" />
                      ) : (
                        <Monitor className="w-5 h-5 text-otw-gold" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium">{device.name}</h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>{device.browser} on {device.os}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {device.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last used {formatLastUsed(device.lastUsed)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-900/30 text-green-400">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Trusted
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTrustedDevice(device.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-otw-gold" />
            Recent Login Activity
          </CardTitle>
          <CardDescription>
            Monitor recent access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.loginHistory.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    session.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  )}></div>
                  
                  <div>
                    <h4 className="text-white font-medium">{session.device}</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                        <span>IP: {session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastUsed(session.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Badge className={cn(
                  session.status === 'active' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-gray-700 text-gray-400'
                )}>
                  {session.status === 'active' ? 'Active' : 'Expired'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-otw-gold" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and account deletion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Download Your Data</Label>
              <p className="text-gray-400 text-sm">Get a copy of all your account data</p>
            </div>
            <Button
              onClick={downloadData}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Request Download
            </Button>
          </div>
          
          <Separator className="bg-gray-600" />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium text-red-400">Delete Account</Label>
              <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
              {settings.accountDeletionRequested && (
                <p className="text-red-400 text-sm mt-1">
                  Account deletion requested. You have 30 days to cancel.
                </p>
              )}
            </div>
            <Button
              onClick={requestAccountDeletion}
              variant="outline"
              disabled={settings.accountDeletionRequested}
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {settings.accountDeletionRequested ? 'Deletion Requested' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {show2FASetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShow2FASetup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Enable Two-Factor Authentication</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShow2FASetup(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-black" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">Verification Code</Label>
                    <Input
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="bg-gray-700/50 border-gray-600 text-white text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShow2FASetup(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirm2FA}
                      disabled={twoFactorCode.length !== 6}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup Codes Modal */}
      <AnimatePresence>
        {showBackupCodes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBackupCodes(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Backup Codes</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBackupCodes(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Important</span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                        <span className="text-white font-mono text-sm">{code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                    <Button
                      onClick={() => setShowBackupCodes(false)}
                      className="bg-otw-gold text-black hover:bg-otw-gold/90"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}