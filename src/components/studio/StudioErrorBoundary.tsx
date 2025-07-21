'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface StudioErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function StudioErrorFallback({ error, resetError }: StudioErrorFallbackProps) {
  const isStudioNotFound = error.message.includes('404') || error.message.includes('not found');
  
  return (
    <div className="min-h-screen bg-[#131618] text-white">
      {/* Header to maintain layout consistency */}
      <div className="bg-[#0F1213] border-b border-[#2A2D30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Studio Profile</h1>
            <p className="text-gray-400">Unable to load studio information</p>
          </div>
        </div>
      </div>

      {/* Error content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            {isStudioNotFound ? (
              // Studio not found specific UI
              <>
                <div className="w-24 h-24 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Studio Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  The studio you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
              </>
            ) : (
              // General error UI
              <>
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    className="w-12 h-12 text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Studio</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  We encountered an error while loading this studio profile. This might be a temporary issue.
                </p>
              </>
            )}

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-[#1A1C21] border border-[#2A2D30] rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <details className="text-left">
                  <summary className="text-red-400 text-sm font-mono cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40 bg-[#0F1213] p-3 rounded">
                    {error.message}
                    {error.stack && '\n\n' + error.stack}
                  </pre>
                </details>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
              {!isStudioNotFound && (
                <button
                  onClick={resetError}
                  className="px-6 py-3 bg-[#FDD811] text-black rounded-lg font-medium hover:bg-[#FDD811]/90 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-[#2A2D30] text-white rounded-lg font-medium hover:bg-[#3A3D40] transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StudioErrorBoundaryProps {
  children: React.ReactNode;
}

export function StudioErrorBoundary({ children }: StudioErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<StudioErrorFallback error={new Error('Unknown error')} resetError={() => window.location.reload()} />}
      onError={(error, errorInfo) => {
        // Log studio-specific error context
        console.error('Studio page error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
