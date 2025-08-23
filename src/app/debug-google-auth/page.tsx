'use client';

import { useState } from 'react';
import { AUTH_ENDPOINTS } from '@/lib/api/config';

export default function DebugGoogleAuth() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    addLog('🔍 Testing backend connection...');

    try {
      // Test 1: Basic connectivity
      addLog('📡 Testing basic connectivity to Django server...');
      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        addLog('✅ Django server is responding');
      } else {
        addLog(`❌ Django server responded with status: ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Cannot connect to Django server: ${errorMessage}`);
    }

    try {
      // Test 2: API root
      addLog('📡 Testing API root endpoint...');
      const apiResponse = await fetch('http://127.0.0.1:8000/api/v1/', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.text();
        addLog('✅ API root is accessible');
        addLog(`📋 API response: ${data.substring(0, 200)}...`);
      } else {
        addLog(`❌ API root responded with status: ${apiResponse.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Cannot access API root: ${errorMessage}`);
    }

    try {
      // Test 3: Auth endpoints discovery
      addLog('📡 Testing auth endpoints...');
      const authResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (authResponse.ok) {
        const data = await authResponse.text();
        addLog('✅ Auth endpoints are accessible');
        addLog(`📋 Auth response: ${data.substring(0, 200)}...`);
      } else {
        addLog(`❌ Auth endpoints responded with status: ${authResponse.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Cannot access auth endpoints: ${errorMessage}`);
    }

    try {
      // Test 4: Google auth endpoint with OPTIONS (CORS preflight)
      addLog('📡 Testing Google auth endpoint CORS...');
      const corsResponse = await fetch(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
        method: 'OPTIONS',
        mode: 'cors',
      });
      
      addLog(`📋 CORS preflight status: ${corsResponse.status}`);
      addLog(`📋 CORS headers: ${JSON.stringify(Object.fromEntries(corsResponse.headers.entries()))}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ CORS preflight failed: ${errorMessage}`);
    }

    setLoading(false);
  };

  const testGoogleAuthEndpoint = async () => {
    setLoading(true);
    addLog('🔍 Testing Google auth endpoint with different payloads...');

    const testCases = [
      { name: 'Empty POST', payload: {} },
      { name: 'Code only', payload: { code: 'test_code_123' } },
      { name: 'Authorization code', payload: { authorization_code: 'test_code_123' } },
      { name: 'Access token', payload: { access_token: 'test_token_123' } },
      { name: 'Google format', payload: { credential: 'test_credential_123' } },
    ];

    for (const testCase of testCases) {
      try {
        addLog(`📡 Testing: ${testCase.name}...`);
        
        const response = await fetch(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(testCase.payload),
          mode: 'cors',
        });

        addLog(`📋 ${testCase.name} - Status: ${response.status}`);
        
        const responseText = await response.text();
        if (responseText) {
          addLog(`📋 ${testCase.name} - Response: ${responseText.substring(0, 300)}...`);
        }

        if (response.status === 400) {
          addLog(`⚠️ ${testCase.name} - Bad Request (expected for test data)`);
        } else if (response.status === 405) {
          addLog(`❌ ${testCase.name} - Method Not Allowed`);
        } else if (response.status === 500) {
          addLog(`❌ ${testCase.name} - Internal Server Error`);
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ ${testCase.name} failed: ${errorMessage}`);
      }
    }

    setLoading(false);
  };

  const showCurrentConfig = () => {
    addLog('📋 Current Configuration:');
    addLog(`- Environment: ${process.env.NODE_ENV}`);
    addLog(`- API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
    addLog(`- API Base URL Prod: ${process.env.NEXT_PUBLIC_API_BASE_URL_PROD}`);
    addLog(`- Google Client ID: ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
    addLog(`- Google Login Endpoint: ${AUTH_ENDPOINTS.GOOGLE_LOGIN}`);
  };

  const generateRealGoogleUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      access_type: 'online',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    addLog('🔗 Real Google Auth URL generated:');
    addLog(`📋 Redirect URI: ${redirectUri}`);
    addLog(`📋 Full URL: ${authUrl}`);
    addLog('⚠️ Make sure this redirect URI is configured in your Google OAuth Console!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🔧 Google Auth Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={showCurrentConfig}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            📋 Show Config
          </button>
          
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            🔌 Test Backend
          </button>
          
          <button
            onClick={testGoogleAuthEndpoint}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            🧪 Test Auth Endpoint
          </button>
          
          <button
            onClick={generateRealGoogleUrl}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            🔗 Generate Google URL
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Debug Logs</h2>
            <button
              onClick={clearLogs}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Click a button above to start debugging...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
            {loading && (
              <div className="text-yellow-400 animate-pulse">
                ⏳ Running tests...
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Troubleshooting Tips</h3>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li><strong>400 Bad Request:</strong> Usually means the request format is wrong or missing required fields</li>
            <li><strong>405 Method Not Allowed:</strong> The endpoint doesn&apos;t accept the HTTP method used</li>
            <li><strong>500 Internal Server Error:</strong> Server-side error, check Django logs</li>
            <li><strong>CORS errors:</strong> Check Django CORS settings for localhost:3002</li>
            <li><strong>Redirect URI mismatch:</strong> Ensure Google Console has the exact redirect URI</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
