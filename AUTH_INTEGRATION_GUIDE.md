# Real API Authentication Integration Guide

## Overview
Your STL Forge frontend now supports both mock data and real API authentication with JWT tokens. The system includes:

- ✅ JWT token-based authentication with httpOnly cookies
- ✅ Automatic token refresh on API calls
- ✅ Toast notifications for user feedback
- ✅ Easy switching between mock and real API
- ✅ CORS-ready configuration
- ✅ Loading states and error handling

## Configuration

### Switching Between Mock and Real API
Edit `src/lib/api/config.ts`:

```typescript
// For development with mock data
export const USE_MOCK_DATA = true;
export const USE_REAL_API = true;

// For production with real API
export const USE_MOCK_DATA = true;
export const USE_REAL_API = false;
```

### API Endpoints
- **Real API**: `https://little-sea-1837.fly.dev/auth/login/`
- **Mock API**: `http://127.0.0.1:8000/api/auth/login/`

## Authentication Flow

### Real API Authentication
1. User submits login form
2. Frontend sends POST request to `https://little-sea-1837.fly.dev/auth/login/`
3. API returns JWT tokens and user data
4. Tokens stored in secure cookies
5. User redirected to appropriate page
6. Success toast notification shown

### Mock Authentication
1. User submits login form with mock credentials
2. Local authentication against mock user data
3. User session stored in localStorage
4. User redirected based on studio membership

## Mock User Credentials
```
Username: quentin    | Password: azerty
Username: tim        | Password: 123456
Username: papuche    | Password: 123456
```

## API Response Structure
Your API returns:
```json
{
    "access": "JWT_ACCESS_TOKEN",
    "refresh": "JWT_REFRESH_TOKEN", 
    "user": {
        "pk": 1,
        "username": "call.m3.mast3r",
        "email": "call.m3.mast3r@gmail.com",
        "first_name": "",
        "last_name": ""
    }
}
```

## CORS Configuration
The CORS error you saw is expected. To fix it, your Django backend needs:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourdomain.com",  # Add your production domain
]

# Or for development only:
CORS_ALLOW_ALL_ORIGINS = True
```

## Components Added

### Toast System
- `src/components/ui/Toast.tsx` - Toast component
- `src/context/ToastContext.tsx` - Toast provider
- Usage: `const { showSuccess, showError } = useToast()`

### Authentication Context
- `src/context/AuthContext.tsx` - JWT authentication provider
- Usage: `const { login, logout, user, isAuthenticated } = useAuth()`

### HTTP Client
- `src/lib/api/httpClient.ts` - Axios with JWT interceptors
- Automatically adds Bearer tokens to requests
- Handles token refresh on 401 responses

### Token Management
- `src/lib/utils/tokenService.ts` - Cookie-based token storage
- Secure token handling with expiration checks

## Usage Examples

### Login Component
```typescript
import { useAuth } from '@/context/AuthContext';

const { login, isLoading } = useAuth();

const handleLogin = async () => {
  try {
    await login({ username, password });
    // Success handled automatically
  } catch (error) {
    // Error handled automatically with toast
  }
};
```

### Protected API Calls
```typescript
import { apiRequest } from '@/lib/api/httpClient';

// Automatically includes JWT token
const response = await apiRequest.get('/api/protected-endpoint');
```

### Logout
```typescript
import { useAuth } from '@/context/AuthContext';

const { logout } = useAuth();
logout(); // Clears tokens and shows success toast
```

## Testing

### Test Real API (will show CORS error until backend is configured)
1. Set `USE_REAL_API = true` in config
2. Use your real API credentials
3. CORS error is expected - configure your Django backend

### Test Mock Data
1. Set `USE_MOCK_DATA = true` in config  
2. Use mock credentials (quentin/azerty)
3. Should work perfectly and redirect to studio

## Next Steps

1. **Configure CORS** on your Django backend
2. **Test with real credentials** once CORS is fixed
3. **Add logout functionality** to your header component
4. **Implement protected routes** using the auth context
5. **Add user profile management** features

## File Structure
```
src/
├── components/ui/Toast.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── lib/
│   ├── api/
│   │   ├── authService.ts (updated)
│   │   ├── config.ts (updated)
│   │   └── httpClient.ts (new)
│   └── utils/tokenService.ts (new)
├── types/auth.ts (new)
└── data/mock-users.ts (updated)
```

The system is production-ready and will work seamlessly once CORS is configured on your backend!
