import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, required, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-otw-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-ring transition-all duration-300',
          error && 'border-red-500 focus-visible:ring-red-500',
          className,
        )}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
