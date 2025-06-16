import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-otw-gold disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-ring',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-otw-red to-otw-gold text-black shadow-lg hover:shadow-xl hover:from-otw-gold hover:to-yellow-500 hover:scale-105 focus:ring-otw-gold/50',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 hover:scale-105 focus:ring-red-500/50',
        outline:
          'border-2 border-otw-gold/50 bg-transparent text-otw-gold shadow-sm hover:bg-otw-gold hover:text-black hover:border-otw-gold hover:scale-105 focus:ring-otw-gold/50 backdrop-blur-sm',
        secondary:
          'bg-gray-800/80 text-white shadow-sm hover:bg-gray-700 hover:scale-105 focus:ring-gray-500/50 backdrop-blur-sm border border-gray-600/50',
        ghost: 
          'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 focus:ring-white/20 backdrop-blur-sm',
        link: 
          'text-otw-gold underline-offset-4 hover:underline hover:text-yellow-400 focus:ring-otw-gold/30',
        success:
          'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 hover:scale-105 focus:ring-green-500/50',
        warning:
          'bg-gradient-to-r from-yellow-600 to-orange-600 text-black shadow-lg hover:shadow-xl hover:from-yellow-700 hover:to-orange-700 hover:scale-105 focus:ring-yellow-500/50',
      },
      size: {
        default: 'h-10 px-6 py-2 text-sm',
        sm: 'h-8 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled ? 'true' : undefined}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
