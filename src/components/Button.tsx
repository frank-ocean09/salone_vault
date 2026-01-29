import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
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
            />
        );
    }
);

Button.displayName = 'Button';
