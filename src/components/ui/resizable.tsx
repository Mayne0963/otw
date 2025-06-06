'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minSize?: number;
  maxSize?: number;
  initialSize?: number;
  direction?: 'horizontal' | 'vertical';
  onResize?: (size: number) => void;
}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  (
    {
      className,
      children,
      minSize = 50,
      maxSize = 500,
      initialSize = 200,
      direction = 'horizontal',
      onResize,
      ...props
    },
    ref,
  ) => {
    const [size, setSize] = useState(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Connect the forwarded ref to the container ref
    React.useImperativeHandle(
      ref,
      () => containerRef.current as HTMLDivElement,
    );

    useEffect(() => {
      setSize(initialSize);
    }, [initialSize]);

    const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsResizing(true);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    useEffect(() => {
      if (!isResizing) {return;}

      const handleResize = (e: MouseEvent) => {
        if (!containerRef.current) {return;}

        const containerRect = containerRef.current.getBoundingClientRect();
        let newSize = 0;

        if (direction === 'horizontal') {
          newSize = e.clientX - containerRect.left;
        } else {
          newSize = e.clientY - containerRect.top;
        }

        newSize = Math.min(Math.max(newSize, minSize), maxSize);
        setSize(newSize);
        onResize?.(newSize);
      };

      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }, [isResizing, direction, minSize, maxSize, onResize]);

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative',
          direction === 'horizontal' ? 'w-fit' : 'h-fit',
          className,
        )}
        style={direction === 'horizontal' ? { width: size } : { height: size }}
        {...props}
      >
        {children}
        <div
          className={cn(
            'absolute bg-border cursor-col-resize',
            direction === 'horizontal'
              ? 'right-0 top-0 h-full w-2'
              : 'bottom-0 left-0 w-full h-2 cursor-row-resize',
          )}
          style={{
            ...(direction === 'horizontal'
              ? { right: 0, top: 0, height: '100%', width: '5px' }
              : { bottom: 0, left: 0, width: '100%', height: '5px' }),
            zIndex: 10,
          }}
          onMouseDown={handleResizeStart}
        />
      </div>
    );
  },
);
Resizable.displayName = 'Resizable';

export { Resizable };
