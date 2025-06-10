import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-background/50 px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default:
          'border-gray-300/50 focus-visible:border-otw-gold focus-visible:ring-2 focus-visible:ring-otw-gold/20 hover:border-gray-400/70',
        error:
          'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 bg-red-50/10',
        success:
          'border-green-500/70 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20 bg-green-50/10',
        warning:
          'border-yellow-500/70 focus-visible:border-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-500/20 bg-yellow-50/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-12 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, error, success, warning, ...props }, ref) => {
    // Determine variant based on state props
    const computedVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: computedVariant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
