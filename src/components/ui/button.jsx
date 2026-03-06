import React from 'react';

export function Button({ className, children, variant = 'default', size = 'md', ...props }) {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer',
    outline: 'border border-input hover:bg-white hover:shadow-sm cursor-pointer',
    ghost: 'hover:bg-muted cursor-pointer',
  };

  const sizes = {
    xs: 'h-6 px-1 py-1 text-xs',
    sm: 'h-9 px-3 py-2 text-sm',
    md: 'h-10 px-4 py-4 text-md',
    lg: 'h-12 px-8 py-2 text-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
