'use client';

import type { InputHTMLAttributes } from 'react';

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function NeuInput({
  label,
  error,
  className = '',
  id,
  ...props
}: NeuInputProps) {
  const inputId = id ?? `neu-input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full neu-pressed rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500
          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-600) focus-visible:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          ${error ? 'ring-2 ring-red-500' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
