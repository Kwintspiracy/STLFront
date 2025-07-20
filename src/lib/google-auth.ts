// Google Authentication utilities for Next.js frontend

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: { credential?: string }) => void;
      auto_select: boolean;
      cancel_on_tap_outside: boolean;
    }) => void;
    prompt: (callback: (notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
    }) => void) => void;
  };
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string }) => void;
    }) => {
      requestAccessToken: () => void;
    };
  };
}

declare global {
  interface Window {
    google: {
      accounts: GoogleAccounts;
    };
    googleAuthInitialized: boolean;
  }
}

/**
 * Initialize Google Sign-In API
 */
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already initialized
    if (window.googleAuthInitialized) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.googleAuthInitialized = true;
        resolve();
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.googleAuthInitialized = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Sign-In script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Get Google OAuth2 authorization URL
 */
export const getGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/google/callback`,
    scope: 'openid email profile',
    response_type: 'code',
    access_type: 'online',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Handle Google Sign-In with popup
 */
export const signInWithGooglePopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Sign-In not initialized'));
      return;
    }

    // Configure Google Sign-In
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No credential received from Google'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Trigger the sign-in flow
    window.google.accounts.id.prompt((notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
    }) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to popup if prompt is not displayed
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response: { access_token?: string }) => {
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token received'));
            }
          },
        }).requestAccessToken();
      }
    });
  });
};

/**
 * Handle Google Sign-In with redirect
 */
export const signInWithGoogleRedirect = (): void => {
  const authUrl = getGoogleAuthUrl();
  window.location.href = authUrl;
};

/**
 * Exchange authorization code for access token
 * Note: For public clients, we'll send the code directly to our backend
 * and let the backend handle the token exchange with the client secret
 */
export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; user_info: any }> => {
  try {
    // For security reasons, we'll let our backend handle the token exchange
    // since it has access to the client secret
    console.log('🔄 Sending authorization code to backend for token exchange...');
    
    // We'll return the code and let the backend handle the exchange
    // This is a temporary solution - the backend should handle the full OAuth flow
    return {
      access_token: code, // We'll send the code as if it's a token for now
      user_info: null // Backend will get user info after token exchange
    };
  } catch (error) {
    console.error('Error preparing code for backend:', error);
    throw error;
  }
};

/**
 * Get user info from Google using access token
 */
export const getUserInfoFromGoogle = async (accessToken: string): Promise<any> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user info from Google:', error);
    throw error;
  }
};

/**
 * Parse Google OAuth callback URL
 */
export const parseGoogleCallback = (url: string): { code?: string; error?: string } => {
  const urlParams = new URLSearchParams(new URL(url).search);
  
  return {
    code: urlParams.get('code') || undefined,
    error: urlParams.get('error') || undefined,
  };
};
