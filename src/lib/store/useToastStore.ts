'use client';

import { create } from 'zustand';
import { Toast, ToastVariant } from '@/lib/types';
import { nanoid } from 'nanoid';

// 📚 LEARN: A global toast store lets any component trigger notifications
// without prop drilling. Components call useToastStore.getState().addToast()
// and the ToastContainer component renders them.

interface ToastStore {
  toasts: Toast[];
  addToast: (variant: ToastVariant, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (variant, message, duration = 4000) => {
    const id = nanoid();
    set((state) => ({
      toasts: [...state.toasts, { id, variant, message, duration }],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
