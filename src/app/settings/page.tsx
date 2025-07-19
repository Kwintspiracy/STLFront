'use client';

import { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaSave,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getCurrentUser, updateUsername } from '@/lib/api/authService';

interface UserSettings {
  // Profile settings
  email_notifications: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  
  // Privacy settings
  profile_visibility: 'public' | 'private';
  show_email: boolean;
  show_activity: boolean;
  
  // Account settings
  two_factor_enabled: boolean;
  auto_download: boolean;
  default_license: 'personal' | 'commercial';
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UsernameForm {
  new_username: string;
}

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    marketing_emails: false,
    product_updates: true,
    profile_visibility: 'public',
    show_email: false,
    show_activity: true,
    two_factor_enabled: false,
    auto_download: false,
    default_license: 'personal'
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'john_doe',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe'
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [usernameForm, setUsernameForm] = useState<UsernameForm>({
    new_username: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingUsername, setChangingUsername] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    username_current: false
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Load user settings and profile
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load current user data
        const currentUser = await getCurrentUser();
        
        // Update user profile with real data
        setUserProfile({
          username: currentUser.username,
          email: currentUser.email,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name
        });
        
        // Settings are already initialized with default values
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordError(null);
    
    // Validation
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordError('All password fields are required.');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setSaveMessage('Password changed successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Error changing password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const changeUsername = async () => {
    setUsernameError(null);
    
    // Validation
    if (!usernameForm.new_username) {
      setUsernameError('Username field is required.');
      return;
    }
    
    if (usernameForm.new_username.length < 3 || usernameForm.new_username.length > 20) {
      setUsernameError('Username must be between 3 and 20 characters long.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(usernameForm.new_username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores.');
      return;
    }
    
    if (usernameForm.new_username === userProfile.username) {
      setUsernameError('New username must be different from current username.');
      return;
    }

    setChangingUsername(true);
    
    try {
      // Call real API to update username
      const updatedUser = await updateUsername(usernameForm.new_username);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        username: updatedUser.username
      }));
      
      // Reset form
      setUsernameForm({
        new_username: ''
      });
      
      setSaveMessage('Username changed successfully! Refreshing page...');
      
      // Force page refresh to update UserMenu and all components
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Error changing username:', error);
      setUsernameError(error instanceof Error ? error.message : 'Error changing username. Username may already be taken.');
    } finally {
      setChangingUsername(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6">
                <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <FaCog className="text-primary" />
          Settings
        </h1>
        
        {/* Save Message */}
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            saveMessage.includes('Error') 
              ? 'bg-red-600/20 text-red-400 border border-red-600/30' 
              : 'bg-green-600/20 text-green-400 border border-green-600/30'
          }`}>
            <FaCheck className="w-4 h-4" />
            {saveMessage}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Notification Settings */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <FaBell className="text-primary" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-gray-400 text-sm">Receive notifications about your account activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Marketing Emails</h3>
                <p className="text-gray-400 text-sm">Receive updates about new features and promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketing_emails}
                  onChange={(e) => handleSettingChange('marketing_emails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Product Updates</h3>
                <p className="text-gray-400 text-sm">Get notified when followed studios release new products</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.product_updates}
                  onChange={(e) => handleSettingChange('product_updates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <FaLock className="text-primary" />
            Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-gray-400 text-sm">Control who can see your profile</p>
              </div>
              <select
                value={settings.profile_visibility}
                onChange={(e) => handleSettingChange('profile_visibility', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Email</h3>
                <p className="text-gray-400 text-sm">Display your email address on your public profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_email}
                  onChange={(e) => handleSettingChange('show_email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Activity</h3>
                <p className="text-gray-400 text-sm">Display your recent activity on your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_activity}
                  onChange={(e) => handleSettingChange('show_activity', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <FaUser className="text-primary" />
            Account
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.two_factor_enabled}
                  onChange={(e) => handleSettingChange('two_factor_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto Download</h3>
                <p className="text-gray-400 text-sm">Automatically download files after purchase</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_download}
                  onChange={(e) => handleSettingChange('auto_download', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Default License</h3>
                <p className="text-gray-400 text-sm">Default license type for purchases</p>
              </div>
              <select
                value={settings.default_license}
                onChange={(e) => handleSettingChange('default_license', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Change Username */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <FaUser className="text-primary" />
            Change Username
          </h2>
          
          <div className="mb-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Current username:</strong> @{userProfile.username}
            </p>
          </div>
          
          {usernameError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg mb-4">
              <FaExclamationTriangle className="w-4 h-4" />
              {usernameError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Username</label>
              <input
                type="text"
                value={usernameForm.new_username}
                onChange={(e) => setUsernameForm(prev => ({ ...prev, new_username: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                placeholder="Enter new username"
              />
              <p className="text-gray-400 text-xs mt-1">
                Username must be 3-20 characters long and can only contain letters, numbers, and underscores.
              </p>
            </div>

            <button
              onClick={changeUsername}
              disabled={changingUsername}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {changingUsername ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaUser className="w-4 h-4" />
              )}
              {changingUsername ? 'Changing Username...' : 'Change Username'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <FaLock className="text-primary" />
            Change Password
          </h2>
          
          {passwordError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg mb-4">
              <FaExclamationTriangle className="w-4 h-4" />
              {passwordError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white pr-12"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              onClick={changePassword}
              disabled={changingPassword}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {changingPassword ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaLock className="w-4 h-4" />
              )}
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSave className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </main>
  );
}
