'use client';

import { forwardRef, HTMLAttributes, createElement } from 'react';
import { cn } from '@/lib/utils';

// Define valid HTML text elements
type TextElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'small'
  | 'strong'
  | 'em';

// Define typography variants
type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'overline';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success' | 'warning';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  children?: React.ReactNode;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as,
      variant = 'body',
      color = 'primary',
      weight,
      align = 'left',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Auto-select element based on variant if not explicitly set
    const getDefaultElement = (variant: TypographyVariant): TextElement => {
      switch (variant) {
        case 'display':
        case 'h1':
          return 'h1';
        case 'h2':
          return 'h2';
        case 'h3':
          return 'h3';
        case 'h4':
          return 'h4';
        case 'h5':
          return 'h5';
        case 'h6':
          return 'h6';
        case 'caption':
        case 'overline':
          return 'small';
        case 'body':
        case 'body-sm':
        default:
          return 'p';
      }
    };

    const element = as || getDefaultElement(variant);

    // Variant styles
    const variantStyles = {
      display: 'text-6xl font-bold leading-tight tracking-tight',
      h1: 'text-4xl font-bold leading-tight tracking-tight',
      h2: 'text-3xl font-semibold leading-tight tracking-tight',
      h3: 'text-2xl font-semibold leading-tight',
      h4: 'text-xl font-semibold leading-snug',
      h5: 'text-lg font-medium leading-snug',
      h6: 'text-base font-medium leading-normal',
      body: 'text-base leading-relaxed',
      'body-sm': 'text-sm leading-relaxed',
      caption: 'text-xs leading-normal',
      overline: 'text-xs font-medium uppercase tracking-wider leading-normal',
    };

    // Color styles using default Tailwind colors
    const colorStyles = {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
      error: 'text-red-600',
      success: 'text-green-600',
      warning: 'text-orange-600',
    };

    // Weight styles (only applied if explicitly set)
    const weightStyles = weight
      ? {
          light: 'font-light',
          normal: 'font-normal',
          medium: 'font-medium',
          semibold: 'font-semibold',
          bold: 'font-bold',
        }[weight]
      : '';

    // Alignment styles
    const alignmentStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    return createElement(
      element,
      {
        ref,
        className: cn(
          // Apply variant styles but filter out font-weight if weight is explicitly provided
          weight ? variantStyles[variant].replace(/font-\w+/g, '').trim() : variantStyles[variant],
          colorStyles[color],
          weightStyles,
          alignmentStyles[align],
          className
        ),
        ...props,
      },
      children
    );
  }
);

Typography.displayName = 'Typography';

export { Typography };
