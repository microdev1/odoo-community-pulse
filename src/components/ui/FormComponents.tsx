'use client';

import React, { forwardRef } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

// Form Field Wrapper Component
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  description,
  required = false,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        className={`mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, ...props }, ref) => {
    return (
      <select
        className={`mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        className={`mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        ref={ref}
        rows={4}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading = false, disabled, children, ...props }, ref) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    };

    const isDisabled = isLoading || disabled;

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Component
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return <div className={`border-b border-gray-200 px-4 py-3 ${className}`}>{children}</div>;
}

export function CardContent({ className = '', children }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }: CardProps) {
  return <div className={`border-t border-gray-200 px-4 py-3 ${className}`}>{children}</div>;
}
