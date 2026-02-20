'use client';

import type { HTMLAttributes } from 'react';

interface NeuCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export default function NeuCard({ children, hover = false, className = '', ...props }: NeuCardProps) {
  return (
    <div
      className={`neu-raised rounded-2xl p-6 ${hover ? 'hover:shadow-[10px_10px_20px_var(--neu-shadow-dark),-10px_-10px_20px_var(--neu-shadow-light)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
