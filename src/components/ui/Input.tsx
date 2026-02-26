'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

// 📚 LEARN: Input components should forward refs so form libraries and focus management work.
// We style the input to match our dark Obsidian theme with proper focus states.

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-caption uppercase text-text-secondary tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-bg-surface border border-border
            text-text-primary text-sm placeholder:text-text-secondary/50
            transition-all duration-200
            hover:border-border/80
            focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
