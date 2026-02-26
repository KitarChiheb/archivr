'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// 📚 LEARN: Badges are small visual indicators. Using deterministic colors (from getTagColor)
// ensures the same tag always has the same color, creating visual consistency.

interface BadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ label, color, onRemove, onClick, size = 'sm', className = '' }: BadgeProps) {
  const isInteractive = !!onClick || !!onRemove;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center gap-1
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}
        rounded-full font-medium
        ${isInteractive ? 'cursor-pointer hover:brightness-110' : ''}
        ${className}
      `}
      style={{
        backgroundColor: color ? `${color}20` : 'rgba(136, 136, 168, 0.15)',
        color: color || '#8888A8',
        border: `1px solid ${color ? `${color}30` : 'rgba(136, 136, 168, 0.2)'}`,
      }}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${label} tag`}
        >
          <X size={10} />
        </button>
      )}
    </motion.span>
  );
}
