'use client';

import { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaLock, 
  FaEye, 
  FaSave,
  FaTrash
} from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import type { 
  UserSettings, 
  NotificationSettings, 
  PrivacySettings, 
  SecuritySettings,
  TrustedDevice,
  SettingsSection 
} from '@/types/user-account';

export default function UserAccountSettingsPage() {
  const { showError, showSuccess } = useToast();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load user settings
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        // Mock settings data - replace with actual API call
        const mockSettings: UserSettings = {
          notifications: {
            email_marketing: false,
            email_updates: true,
            push_notifications: true,
            new_followers: true,
            product_updates: true,
            order_updates: true,
            studio_updates: false
          },
          privacy: {
            profile_visibility: 'public',
            show_email: false,
            show_real_name: true,
            show_activity: true,
            allow_messages: true,
            show_wishlist: true
          },
          security: {
            two_factor_enabled: false,
            login_notifications: true,
            session_timeout: 30,
            trusted_devices: [
              {
                id: '1',
                name: 'Chrome on Windows',
                device_type: 'desktop',
                last_used: '2024-01-20T10:30:00Z',
                location: 'Paris, France'
              },
              {
                id: '2',
                name: 'Safari on iPhone',
                device_type: 'mobile',
                last_used: '2024-01-19T15:45:00Z',
                location: 'Paris, France'
              }
            ]
          }
        };

        setSettings(mockSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        showError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [showError]);

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean): void => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    } : null);
    setHasChanges(true);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean | string): void => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    } : null);
    setHasChanges(true);
  };

  const handleSecurityChange = (key: keyof SecuritySettings, value: boolean | number): void => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    } : null);
    setHasChanges(true);
  };

  const handleRemoveTrustedDevice = (deviceId: string): void => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      security: {
        ...prev.security,
        trusted_devices: prev.security.trusted_devices.filter(device => device.id !== deviceId)
      }
    } : null);
    setHasChanges(true);
  };

  const handleSaveSettings = async (): Promise<void> => {
    if (!settings) return;
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasChanges(false);
      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType: TrustedDevice['device_type']): React.ReactNode => {
    switch (deviceType) {
      case 'desktop':
        return '🖥️';
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      default:
        return '💻';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-background-hover rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-background-hover rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="bg-background-card rounded-lg p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-background-hover rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Settings Not Found</h2>
        <p className="text-text-muted">Unable to load your settings.</p>
      </div>
    );
  }

  const sections = [
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: FaBell },
    { id: 'privacy' as SettingsSection, label: 'Privacy', icon: FaEye },
    { id: 'security' as SettingsSection, label: 'Security', icon: FaLock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Account Settings</h2>
          <p className="text-text-muted mt-1">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSave className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <aside className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="bg-background-card border border-border rounded-xl p-6">
            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Notification Preferences</h3>
                  <p className="text-text-muted text-sm">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Email Marketing</h4>
                      <p className="text-sm text-text-muted">Promotional emails and special offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_marketing}
                        onChange={(e) => handleNotificationChange('email_marketing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Product Updates</h4>
                      <p className="text-sm text-text-muted">Updates about products you follow</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.product_updates}
                        onChange={(e) => handleNotificationChange('product_updates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Order Updates</h4>
                      <p className="text-sm text-text-muted">Updates about your orders and downloads</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.order_updates}
                        onChange={(e) => handleNotificationChange('order_updates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">New Followers</h4>
                      <p className="text-sm text-text-muted">When someone follows your studio</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.new_followers}
                        onChange={(e) => handleNotificationChange('new_followers', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Privacy Settings</h3>
                  <p className="text-text-muted text-sm">Control who can see your information</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-background-hover rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">Profile Visibility</h4>
                    <p className="text-sm text-text-muted mb-3">Who can see your profile</p>
                    <select
                      value={settings.privacy.profile_visibility}
                      onChange={(e) => handlePrivacyChange('profile_visibility', e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="private">Private - Only you</option>
                      <option value="friends">Friends - Only followers</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Show Email Address</h4>
                      <p className="text-sm text-text-muted">Display your email on your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.show_email}
                        onChange={(e) => handlePrivacyChange('show_email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Show Real Name</h4>
                      <p className="text-sm text-text-muted">Display your first and last name</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.show_real_name}
                        onChange={(e) => handlePrivacyChange('show_real_name', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Show Wishlist</h4>
                      <p className="text-sm text-text-muted">Allow others to see your wishlist</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.show_wishlist}
                        onChange={(e) => handlePrivacyChange('show_wishlist', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Security Settings</h3>
                  <p className="text-text-muted text-sm">Manage your account security</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Two-Factor Authentication</h4>
                      <p className="text-sm text-text-muted">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.two_factor_enabled}
                        onChange={(e) => handleSecurityChange('two_factor_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background-hover rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">Login Notifications</h4>
                      <p className="text-sm text-text-muted">Get notified when someone logs into your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.login_notifications}
                        onChange={(e) => handleSecurityChange('login_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-background-hover rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">Session Timeout</h4>
                    <p className="text-sm text-text-muted mb-3">Automatically log out after inactivity (minutes)</p>
                    <select
                      value={settings.security.session_timeout}
                      onChange={(e) => handleSecurityChange('session_timeout', parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>

                  {/* Trusted Devices */}
                  <div className="p-4 bg-background-hover rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">Trusted Devices</h4>
                    <p className="text-sm text-text-muted mb-4">Devices you&apos;ve logged in from recently</p>
                    
                    <div className="space-y-3">
                      {settings.security.trusted_devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDeviceIcon(device.device_type)}</span>
                            <div>
                              <p className="font-medium text-text-primary">{device.name}</p>
                              <p className="text-sm text-text-muted">
                                Last used: {formatDate(device.last_used)}
                                {device.location && ` • ${device.location}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveTrustedDevice(device.id)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Remove device"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
