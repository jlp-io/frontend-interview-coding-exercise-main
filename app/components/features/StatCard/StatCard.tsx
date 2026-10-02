'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Typography } from '@/app/components/ui/Typography';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon, trend, variant = 'default', size = 'md', className, ...props }, ref) => {
    const variantStyles = {
      default: 'border-gray-200 bg-white',
      success: 'border-green-200 bg-green-50',
      warning: 'border-orange-200 bg-orange-50',
      error: 'border-red-200 bg-red-50',
    };

    const sizeStyles = {
      sm: 'p-4 text-base sm:text-lg',
      md: 'p-5 text-xl sm:text-2xl',
      lg: 'p-6 text-2xl sm:text-3xl',
    };

    const labelSizeStyles = {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border shadow-sm transition-shadow hover:shadow-md',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Typography
              variant="overline"
              color="muted"
              className={cn('font-medium uppercase tracking-wide', labelSizeStyles[size])}
            >
              {label}
            </Typography>
            <Typography
              variant={size === 'sm' ? 'h4' : size === 'md' ? 'h3' : 'h2'}
              weight="bold"
              className={cn('mt-1.5')}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </div>
          {icon && <div className="ml-3 flex-shrink-0 text-gray-600">{icon}</div>}
        </div>

        {trend && (
          <div className="mt-3 flex items-center">
            <Typography
              as="span"
              variant="caption"
              weight="medium"
              color={trend.isPositive ? 'success' : 'error'}
              className="inline-flex items-center"
            >
              {trend.isPositive ? (
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17l10-10-10-10"
                  />
                </svg>
              ) : (
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 7l-10 10 10 10"
                  />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </Typography>
            <Typography as="span" variant="caption" color="muted" className="ml-2">
              vs last period
            </Typography>
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
