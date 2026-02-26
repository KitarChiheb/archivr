'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

// 📚 LEARN: A well-designed Button component has multiple variants and sizes.
// Using `forwardRef` lets parent components attach refs (needed for focus management, tooltips, etc).
// We define our own props interface to avoid Framer Motion's type conflicts with React's ButtonHTMLAttributes.

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'gradient-accent text-white font-semibold shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40',
  secondary:
    'bg-bg-surface border border-border text-text-primary hover:bg-bg-surface-hover',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', isLoading, className = '', children, disabled, type = 'button', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        onClick={props.onClick}
        aria-label={props['aria-label']}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
