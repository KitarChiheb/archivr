'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { useToastStore } from '@/lib/store/useToastStore';
import { ToastVariant } from '@/lib/types';

// 📚 LEARN: Custom toast system instead of a library gives us full control over styling
// and animation. The toast store (Zustand) makes it globally accessible — any component
// can trigger a toast without prop drilling.

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; bg: string; border: string }> = {
  error: {
    icon: <AlertTriangle size={16} />,
    bg: 'bg-gradient-to-r from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
  },
  success: {
    icon: <CheckCircle size={16} />,
    bg: 'bg-gradient-to-r from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
  },
  info: {
    icon: <Info size={16} />,
    bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
  },
  ai: {
    icon: <Sparkles size={16} className="text-purple-400" />,
    bg: 'bg-gradient-to-r from-purple-500/20 to-pink-600/10',
    border: 'border-purple-500/30',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border
                backdrop-blur-xl shadow-lg
                ${config.bg} ${config.border}
              `}
              role="alert"
              aria-live="polite"
            >
              <span className="shrink-0">{config.icon}</span>
              <p className="text-sm text-text-primary flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
