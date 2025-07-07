'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Start exit animation before removal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "relative p-4 rounded-xl shadow-2xl transition-all duration-300 ease-out max-w-md mx-auto backdrop-blur-sm border";
    
    const typeStyles = {
      success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-400/30 shadow-emerald-500/25",
      error: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400/30 shadow-red-500/25",
      warning: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400/30 shadow-amber-500/25",
      info: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400/30 shadow-blue-500/25",
    };

    const animationClass = isExiting 
      ? 'opacity-0 -translate-y-2 scale-95' 
      : isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 -translate-y-4 scale-95';
    
    return `${baseStyles} ${typeStyles[type]} ${animationClass}`;
  };

  const getIconForType = () => {
    const iconStyles = "w-5 h-5 mr-3 flex-shrink-0";
    switch (type) {
      case 'success':
        return (
          <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIconForType()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
          }}
          className="ml-4 flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-white/40 transition-all ease-linear rounded-b-xl"
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
            animationPlayState: isExiting ? 'paused' : 'running'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col items-center space-y-3 pt-4 px-4">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </div>
  );
}
