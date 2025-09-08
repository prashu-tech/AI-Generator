// components/ui/Toast.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'from-green-500/90 to-green-600/90',
          borderColor: 'border-green-400/30',
          iconColor: 'text-green-200'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'from-yellow-500/90 to-yellow-600/90',
          borderColor: 'border-yellow-400/30',
          iconColor: 'text-yellow-200'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'from-blue-500/90 to-blue-600/90',
          borderColor: 'border-blue-400/30',
          iconColor: 'text-blue-200'
        };
      default: // error
        return {
          icon: AlertCircle,
          bgColor: 'from-red-500/90 to-red-600/90',
          borderColor: 'border-red-400/30',
          iconColor: 'text-red-200'
        };
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = getToastConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`
        max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl
        bg-gradient-to-r ${bgColor} ${borderColor}
        transform hover:scale-[1.02] transition-transform
      `}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${iconColor} flex-shrink-0`} />
          <div className="flex-1">
            <p className="text-white font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Component
export const ToastManager = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${20 + index * 80}px` }} className="relative">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </>
  );
};

export default Toast;
