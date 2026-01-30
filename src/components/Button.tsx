import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={loading || props.disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2',
                    {
                        'bg-brand-teal text-white hover:bg-brand-teal/90': variant === 'primary',
                        'bg-brand-green text-white hover:bg-brand-green/90': variant === 'secondary',
                        'border border-gray-300 dark:border-white/20 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5': variant === 'outline',
                        'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-white/70': variant === 'ghost',
                        'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-10 px-6 py-2': size === 'md',
                        'h-12 px-8 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
