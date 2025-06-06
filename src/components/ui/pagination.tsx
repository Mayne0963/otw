'use client';

import type * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeftIcon as DoubleArrowLeft,
  ArrowRightIcon as DoubleArrowRight,
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  pageCount,
  currentPage,
  onPageChange,
  className,
  ...props
}: PaginationProps) => {
  return (
    <div
      className={cn('flex items-center justify-between', className)}
      {...props}
    >
      <div className="flex-1 text-sm text-muted-foreground">
        Page {currentPage} of {pageCount}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
