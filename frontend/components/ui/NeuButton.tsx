'use client';

import type { ButtonHTMLAttributes } from 'react';

interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function NeuButton({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: NeuButtonProps) {
  const base = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-600)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'py-2 px-4 min-h-[36px] text-sm',
    md: 'py-3 px-6 min-h-[44px] text-base',
    lg: 'py-4 px-8 min-h-[48px] text-lg',
  };
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white neu-raised-sm shadow-md shadow-indigo-500/20',
    secondary: 'neu-raised text-gray-700',
    danger: 'neu-raised text-red-600 hover:text-red-700',
    ghost: 'neu-pressed text-gray-700',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
