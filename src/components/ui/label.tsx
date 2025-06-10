import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const labelVariants = cva(
  'text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        error: 'text-red-600 dark:text-red-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        muted: 'text-muted-foreground',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
      required: {
        true: 'after:content-["*"] after:ml-1 after:text-red-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      required: false,
    },
  },
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, size, required, className }))}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
