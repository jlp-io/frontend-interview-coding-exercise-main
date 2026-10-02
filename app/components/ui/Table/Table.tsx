'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
}

const Table = forwardRef<HTMLTableElement, TableProps>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

Table.displayName = 'Table';

export { Table };
