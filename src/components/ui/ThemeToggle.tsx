'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/lib/store/useThemeStore';

// 📚 LEARN: The theme toggle hydrates from localStorage on mount,
// then toggles between dark/light by updating both Zustand state
// and the <html> element's class list (so Tailwind dark: variants work).

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-border bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  );
}
