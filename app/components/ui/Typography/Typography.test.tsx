import React from 'react';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  // Basic rendering tests
  it('renders correctly with default props', () => {
    render(<Typography data-testid="typography">Hello World</Typography>);

    const element = screen.getByTestId('typography');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P'); // default element for body variant
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<Typography>Test content</Typography>);

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  // Element selection tests
  it('uses explicit "as" element when provided', () => {
    render(
      <Typography as="h1" data-testid="explicit-h1">
        Heading
      </Typography>
    );

    const element = screen.getByTestId('explicit-h1');
    expect(element.tagName).toBe('H1');
  });

  it('auto-selects correct element based on variant', () => {
    const testCases = [
      { variant: 'display' as const, expectedTag: 'H1' },
      { variant: 'h1' as const, expectedTag: 'H1' },
      { variant: 'h2' as const, expectedTag: 'H2' },
      { variant: 'h3' as const, expectedTag: 'H3' },
      { variant: 'h4' as const, expectedTag: 'H4' },
      { variant: 'h5' as const, expectedTag: 'H5' },
      { variant: 'h6' as const, expectedTag: 'H6' },
      { variant: 'body' as const, expectedTag: 'P' },
      { variant: 'body-sm' as const, expectedTag: 'P' },
      { variant: 'caption' as const, expectedTag: 'SMALL' },
      { variant: 'overline' as const, expectedTag: 'SMALL' },
    ];

    testCases.forEach(({ variant, expectedTag }) => {
      const { container } = render(
        <Typography variant={variant} data-testid={`auto-${variant}`}>
          Content
        </Typography>
      );
      const element = container.querySelector(`[data-testid="auto-${variant}"]`);
      expect(element?.tagName).toBe(expectedTag);
    });
  });

  // Variant styles tests
  it('applies display variant styles correctly', () => {
    render(
      <Typography variant="display" data-testid="display">
        Display Text
      </Typography>
    );

    const element = screen.getByTestId('display');
    expect(element).toHaveClass('text-6xl', 'font-bold', 'leading-tight', 'tracking-tight');
  });

  it('applies h1 variant styles correctly', () => {
    render(
      <Typography variant="h1" data-testid="h1">
        H1 Text
      </Typography>
    );

    const element = screen.getByTestId('h1');
    expect(element).toHaveClass('text-4xl', 'font-bold', 'leading-tight', 'tracking-tight');
  });

  it('applies h2 variant styles correctly', () => {
    render(
      <Typography variant="h2" data-testid="h2">
        H2 Text
      </Typography>
    );

    const element = screen.getByTestId('h2');
    expect(element).toHaveClass('text-3xl', 'font-semibold', 'leading-tight', 'tracking-tight');
  });

  it('applies h3 variant styles correctly', () => {
    render(
      <Typography variant="h3" data-testid="h3">
        H3 Text
      </Typography>
    );

    const element = screen.getByTestId('h3');
    expect(element).toHaveClass('text-2xl', 'font-semibold', 'leading-tight');
  });

  it('applies h4 variant styles correctly', () => {
    render(
      <Typography variant="h4" data-testid="h4">
        H4 Text
      </Typography>
    );

    const element = screen.getByTestId('h4');
    expect(element).toHaveClass('text-xl', 'font-semibold', 'leading-snug');
  });

  it('applies h5 variant styles correctly', () => {
    render(
      <Typography variant="h5" data-testid="h5">
        H5 Text
      </Typography>
    );

    const element = screen.getByTestId('h5');
    expect(element).toHaveClass('text-lg', 'font-medium', 'leading-snug');
  });

  it('applies h6 variant styles correctly', () => {
    render(
      <Typography variant="h6" data-testid="h6">
        H6 Text
      </Typography>
    );

    const element = screen.getByTestId('h6');
    expect(element).toHaveClass('text-base', 'font-medium', 'leading-normal');
  });

  it('applies body variant styles correctly', () => {
    render(
      <Typography variant="body" data-testid="body">
        Body Text
      </Typography>
    );

    const element = screen.getByTestId('body');
    expect(element).toHaveClass('text-base', 'leading-relaxed');
  });

  it('applies body-sm variant styles correctly', () => {
    render(
      <Typography variant="body-sm" data-testid="body-sm">
        Small Body
      </Typography>
    );

    const element = screen.getByTestId('body-sm');
    expect(element).toHaveClass('text-sm', 'leading-relaxed');
  });

  it('applies caption variant styles correctly', () => {
    render(
      <Typography variant="caption" data-testid="caption">
        Caption Text
      </Typography>
    );

    const element = screen.getByTestId('caption');
    expect(element).toHaveClass('text-xs', 'leading-normal');
  });

  it('applies overline variant styles correctly', () => {
    render(
      <Typography variant="overline" data-testid="overline">
        Overline Text
      </Typography>
    );

    const element = screen.getByTestId('overline');
    expect(element).toHaveClass(
      'text-xs',
      'font-medium',
      'uppercase',
      'tracking-wider',
      'leading-normal'
    );
  });

  // Color tests
  it('applies primary color correctly', () => {
    render(
      <Typography color="primary" data-testid="primary-color">
        Primary
      </Typography>
    );

    const element = screen.getByTestId('primary-color');
    expect(element).toHaveClass('text-gray-900');
  });

  it('applies secondary color correctly', () => {
    render(
      <Typography color="secondary" data-testid="secondary-color">
        Secondary
      </Typography>
    );

    const element = screen.getByTestId('secondary-color');
    expect(element).toHaveClass('text-gray-600');
  });

  it('applies muted color correctly', () => {
    render(
      <Typography color="muted" data-testid="muted-color">
        Muted
      </Typography>
    );

    const element = screen.getByTestId('muted-color');
    expect(element).toHaveClass('text-gray-500');
  });

  it('applies accent color correctly', () => {
    render(
      <Typography color="accent" data-testid="accent-color">
        Accent
      </Typography>
    );

    const element = screen.getByTestId('accent-color');
    expect(element).toHaveClass('text-blue-600');
  });

  it('applies error color correctly', () => {
    render(
      <Typography color="error" data-testid="error-color">
        Error
      </Typography>
    );

    const element = screen.getByTestId('error-color');
    expect(element).toHaveClass('text-red-600');
  });

  it('applies success color correctly', () => {
    render(
      <Typography color="success" data-testid="success-color">
        Success
      </Typography>
    );

    const element = screen.getByTestId('success-color');
    expect(element).toHaveClass('text-green-600');
  });

  it('applies warning color correctly', () => {
    render(
      <Typography color="warning" data-testid="warning-color">
        Warning
      </Typography>
    );

    const element = screen.getByTestId('warning-color');
    expect(element).toHaveClass('text-orange-600');
  });

  // Weight tests
  it('applies light weight correctly', () => {
    render(
      <Typography weight="light" data-testid="light-weight">
        Light
      </Typography>
    );

    const element = screen.getByTestId('light-weight');
    expect(element).toHaveClass('font-light');
  });

  it('applies normal weight correctly', () => {
    render(
      <Typography weight="normal" data-testid="normal-weight">
        Normal
      </Typography>
    );

    const element = screen.getByTestId('normal-weight');
    expect(element).toHaveClass('font-normal');
  });

  it('applies medium weight correctly', () => {
    render(
      <Typography weight="medium" data-testid="medium-weight">
        Medium
      </Typography>
    );

    const element = screen.getByTestId('medium-weight');
    expect(element).toHaveClass('font-medium');
  });

  it('applies semibold weight correctly', () => {
    render(
      <Typography weight="semibold" data-testid="semibold-weight">
        Semibold
      </Typography>
    );

    const element = screen.getByTestId('semibold-weight');
    expect(element).toHaveClass('font-semibold');
  });

  it('applies bold weight correctly', () => {
    render(
      <Typography weight="bold" data-testid="bold-weight">
        Bold
      </Typography>
    );

    const element = screen.getByTestId('bold-weight');
    expect(element).toHaveClass('font-bold');
  });

  it('does not apply weight class when weight is not specified', () => {
    render(<Typography data-testid="no-weight">No Weight</Typography>);

    const element = screen.getByTestId('no-weight');
    expect(element.className).not.toMatch(/font-(light|normal|medium|semibold|bold)/);
  });

  // Alignment tests
  it('applies left alignment correctly', () => {
    render(
      <Typography align="left" data-testid="left-align">
        Left
      </Typography>
    );

    const element = screen.getByTestId('left-align');
    expect(element).toHaveClass('text-left');
  });

  it('applies center alignment correctly', () => {
    render(
      <Typography align="center" data-testid="center-align">
        Center
      </Typography>
    );

    const element = screen.getByTestId('center-align');
    expect(element).toHaveClass('text-center');
  });

  it('applies right alignment correctly', () => {
    render(
      <Typography align="right" data-testid="right-align">
        Right
      </Typography>
    );

    const element = screen.getByTestId('right-align');
    expect(element).toHaveClass('text-right');
  });

  it('applies justify alignment correctly', () => {
    render(
      <Typography align="justify" data-testid="justify-align">
        Justify
      </Typography>
    );

    const element = screen.getByTestId('justify-align');
    expect(element).toHaveClass('text-justify');
  });

  // Custom props tests
  it('applies custom className', () => {
    render(
      <Typography className="custom-class" data-testid="custom">
        Custom
      </Typography>
    );

    const element = screen.getByTestId('custom');
    expect(element).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(
      <Typography
        data-testid="props-forward"
        id="typography-id"
        title="Typography Title"
        aria-label="Typography Label"
      >
        Content
      </Typography>
    );

    const element = screen.getByTestId('props-forward');
    expect(element).toHaveAttribute('id', 'typography-id');
    expect(element).toHaveAttribute('title', 'Typography Title');
    expect(element).toHaveAttribute('aria-label', 'Typography Label');
  });

  // Ref forwarding test
  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLElement>();

    render(
      <Typography ref={ref} data-testid="ref-test">
        Ref Test
      </Typography>
    );

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    expect(ref.current?.dataset.testid).toBe('ref-test');
  });

  // Edge cases
  it('handles empty children', () => {
    render(<Typography data-testid="empty"></Typography>);

    const element = screen.getByTestId('empty');
    expect(element).toBeInTheDocument();
    expect(element).toBeEmptyDOMElement();
  });

  it('handles complex children', () => {
    render(
      <Typography data-testid="complex">
        <span>Span content</span>
        <strong>Strong content</strong>
        Plain text
      </Typography>
    );

    expect(screen.getByText('Span content')).toBeInTheDocument();
    expect(screen.getByText('Strong content')).toBeInTheDocument();
    expect(screen.getByText('Plain text')).toBeInTheDocument();
  });

  // Combination tests
  it('works with multiple props combined', () => {
    render(
      <Typography
        as="h2"
        variant="h3"
        color="accent"
        weight="bold"
        align="center"
        className="custom-combined"
        data-testid="combined"
      >
        Combined Props
      </Typography>
    );

    const element = screen.getByTestId('combined');
    expect(element.tagName).toBe('H2');
    expect(element).toHaveClass('text-2xl'); // h3 variant
    expect(element).toHaveClass('text-blue-600'); // accent color
    expect(element).toHaveClass('font-bold'); // bold weight
    expect(element).toHaveClass('text-center'); // center align
    expect(element).toHaveClass('custom-combined'); // custom class
  });

  it('weight prop overrides variant weight', () => {
    render(
      <Typography variant="h1" weight="light" data-testid="weight-override">
        Weight Override
      </Typography>
    );

    const element = screen.getByTestId('weight-override');
    // h1 variant has font-bold, but weight="light" should override
    expect(element).toHaveClass('font-light');
    expect(element).not.toHaveClass('font-bold'); // variant weight should be removed
  });

  // All element types test
  it('renders all supported element types correctly', () => {
    const elements = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'span',
      'div',
      'label',
      'small',
      'strong',
      'em',
    ] as const;

    elements.forEach((element) => {
      const { container } = render(
        <Typography as={element} data-testid={`element-${element}`}>
          {element} content
        </Typography>
      );

      const renderedElement = container.querySelector(`[data-testid="element-${element}"]`);
      expect(renderedElement?.tagName).toBe(element.toUpperCase());
    });
  });
});
