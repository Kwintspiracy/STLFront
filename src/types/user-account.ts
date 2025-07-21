// Types stricts pour la gestion des comptes utilisateur

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profilePicture?: string;
  date_joined: string;
  role: 'user' | 'creator' | 'admin';
  total_downloads: number;
  total_purchases: number;
  wishlist_count: number;
}

export interface UserStats {
  downloads: number;
  purchases: number;
  wishlist_items: number;
  followed_studios: number;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
}

export interface NotificationSettings {
  email_marketing: boolean;
  email_updates: boolean;
  push_notifications: boolean;
  new_followers: boolean;
  product_updates: boolean;
  order_updates: boolean;
  studio_updates: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_real_name: boolean;
  show_activity: boolean;
  allow_messages: boolean;
  show_wishlist: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  session_timeout: number;
  trusted_devices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  last_used: string;
  location?: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  added_date: string;
  product: {
    id: number;
    name: string;
    price: string;
    images: Array<{
      id: number;
      image: string;
      title: string;
      rank: number;
    }>;
    creator: {
      id: number;
      name: string;
      badge?: string;
    };
    category: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    is_free: boolean;
    rating?: number;
    download_count: number;
  };
}

// Types pour les paramètres de navigation
export type UserAccountSection = 'profile' | 'wishlist' | 'settings';
export type SettingsSection = 'general' | 'notifications' | 'privacy' | 'security';

// Types pour les formulaires
export interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  bio: string;
  profilePicture?: File | null;
}

export interface SettingsUpdateData {
  section: SettingsSection;
  data: Partial<NotificationSettings | PrivacySettings | SecuritySettings>;
}
