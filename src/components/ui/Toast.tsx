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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50 max-w-sm";
    const typeStyles = {
      success: "bg-green-600 text-white border border-green-500",
      error: "bg-red-600 text-white border border-red-500",
      warning: "bg-yellow-600 text-white border border-yellow-500",
      info: "bg-blue-600 text-white border border-blue-500",
    };
    
    return `${baseStyles} ${typeStyles[type]} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-0 right-0 z-50">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${16 + index * 80}px` }} className="absolute right-4">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
