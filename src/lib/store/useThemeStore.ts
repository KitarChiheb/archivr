'use client';

import { create } from 'zustand';

// 📚 LEARN: Theme state is stored in Zustand and synced to localStorage.
// We apply the theme class to <html> so Tailwind's `dark:` variants work.

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('archivr-theme') as Theme | null;
    const theme = stored || 'light';
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('archivr-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
