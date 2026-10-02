'use client';

import { forwardRef, TdHTMLAttributes, ThHTMLAttributes, createElement } from 'react';
import { cn } from '@/lib/utils';

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  as?: 'td' | 'th';
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  as: 'th';
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps | TableHeaderCellProps>(
  ({ className, children, as = 'td', ...props }, ref) => {
    const baseStyles = 'px-4 py-3 text-left align-middle font-medium';

    const cellStyles = {
      td: 'text-gray-900',
      th: 'text-gray-700 font-semibold bg-gray-50/50',
    };

    return createElement(
      as,
      {
        ref,
        className: cn(baseStyles, cellStyles[as], className),
        ...props,
      },
      children
    );
  }
);

TableCell.displayName = 'TableCell';

export { TableCell };
