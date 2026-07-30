// ==========================================
// 🧩 [SECTION: TOAST_CONTEXT_ENGINE]
// Description: Global notification state machine. Handles slide-in alerts.
// Location: src/context/ToastContext.jsx
// ==========================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // Function to trigger toast from anywhere
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToast({ id, message, type });

    // Auto dismiss
    setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === id ? null : currentToast));
    }, duration);
  }, []);

  const dismissToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🔔 PREMIUM TOAST UI OVERLAY */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] animate-slideIn flex items-center gap-3 bg-slate-900 text-white border border-slate-800 p-3.5 rounded-xl shadow-2xl max-w-sm text-xs font-bold transition-all duration-300">
          
          {/* Dynamic Icons based on Type */}
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}

          {/* Message Text */}
          <p className="pr-4 leading-relaxed tracking-wide">{toast.message}</p>

          {/* Close Button */}
          <button 
            type="button"
            onClick={dismissToast} 
            className="text-slate-500 hover:text-white ml-auto p-0.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};