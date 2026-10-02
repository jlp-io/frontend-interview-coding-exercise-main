import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '.';

describe('StatCard', () => {
  // Basic rendering tests
  it('renders correctly with required props', () => {
    render(<StatCard label="Total Sales" value="1,234" data-testid="stat-card" />);

    const card = screen.getByTestId('stat-card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard label="Status" value="Active" />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with number value', () => {
    render(<StatCard label="Count" value={42} />);

    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('formats number values with localization', () => {
    render(<StatCard label="Large Number" value={1234567} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  // Variant tests
  it('applies default variant styles correctly', () => {
    render(<StatCard label="Default" value="100" data-testid="default-card" />);

    const card = screen.getByTestId('default-card');
    expect(card).toHaveClass('border-gray-200', 'bg-white');
  });

  it('applies success variant styles correctly', () => {
    render(<StatCard label="Success" value="100" variant="success" data-testid="success-card" />);

    const card = screen.getByTestId('success-card');
    expect(card).toHaveClass('border-green-200', 'bg-green-50');
  });

  it('applies warning variant styles correctly', () => {
    render(<StatCard label="Warning" value="100" variant="warning" data-testid="warning-card" />);

    const card = screen.getByTestId('warning-card');
    expect(card).toHaveClass('border-orange-200', 'bg-orange-50');
  });

  it('applies error variant styles correctly', () => {
    render(<StatCard label="Error" value="100" variant="error" data-testid="error-card" />);

    const card = screen.getByTestId('error-card');
    expect(card).toHaveClass('border-red-200', 'bg-red-50');
  });

  // Size tests
  it('applies small size styles correctly', () => {
    render(<StatCard label="Small" value="100" size="sm" data-testid="small-card" />);

    const card = screen.getByTestId('small-card');
    expect(card).toHaveClass('p-4', 'text-base', 'sm:text-lg');
  });

  it('applies medium size styles correctly (default)', () => {
    render(<StatCard label="Medium" value="100" data-testid="medium-card" />);

    const card = screen.getByTestId('medium-card');
    expect(card).toHaveClass('p-5', 'text-xl', 'sm:text-2xl');
  });

  it('applies large size styles correctly', () => {
    render(<StatCard label="Large" value="100" size="lg" data-testid="large-card" />);

    const card = screen.getByTestId('large-card');
    expect(card).toHaveClass('p-6', 'text-2xl', 'sm:text-3xl');
  });

  // Icon tests
  it('renders with icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">📊</span>;

    render(<StatCard label="With Icon" value="100" icon={<TestIcon />} data-testid="icon-card" />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('does not render icon section when icon not provided', () => {
    const { container } = render(<StatCard label="No Icon" value="100" />);

    const iconContainer = container.querySelector('.flex-shrink-0');
    expect(iconContainer).not.toBeInTheDocument();
  });

  // Trend tests
  it('renders positive trend correctly', () => {
    render(
      <StatCard
        label="Growth"
        value="100"
        trend={{ value: 12.5, isPositive: true }}
        data-testid="positive-trend-card"
      />
    );

    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();

    const trendElement = screen.getByText('12.5%');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('renders negative trend correctly', () => {
    render(
      <StatCard
        label="Decline"
        value="100"
        trend={{ value: -5.2, isPositive: false }}
        data-testid="negative-trend-card"
      />
    );

    expect(screen.getByText('5.2%')).toBeInTheDocument(); // Should show absolute value
    expect(screen.getByText('vs last period')).toBeInTheDocument();

    const trendElement = screen.getByText('5.2%');
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('does not render trend section when trend not provided', () => {
    const { container } = render(<StatCard label="No Trend" value="100" />);

    const trendContainer = container.querySelector('.mt-3');
    expect(trendContainer).not.toBeInTheDocument();
  });

  it('renders trend icons correctly', () => {
    // Positive trend
    const { container: positiveContainer } = render(
      <StatCard label="Up" value="100" trend={{ value: 10, isPositive: true }} />
    );

    const positiveIcon = positiveContainer.querySelector('svg');
    expect(positiveIcon).toBeInTheDocument();

    // Negative trend
    const { container: negativeContainer } = render(
      <StatCard label="Down" value="100" trend={{ value: -10, isPositive: false }} />
    );

    const negativeIcon = negativeContainer.querySelector('svg');
    expect(negativeIcon).toBeInTheDocument();
  });

  // Custom props tests
  it('applies custom className', () => {
    render(
      <StatCard label="Custom" value="100" className="custom-class" data-testid="custom-card" />
    );

    const card = screen.getByTestId('custom-card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-xl'); // Should still have default classes
  });

  it('forwards additional props', () => {
    render(
      <StatCard
        label="Props"
        value="100"
        data-testid="props-card"
        id="stat-card-id"
        role="region"
        aria-label="Statistics card"
      />
    );

    const card = screen.getByTestId('props-card');
    expect(card).toHaveAttribute('id', 'stat-card-id');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Statistics card');
  });

  // Ref forwarding test
  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<StatCard ref={ref} label="Ref Test" value="100" data-testid="ref-card" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.dataset.testid).toBe('ref-card');
  });

  // Combination tests
  it('works with all props combined', () => {
    const TestIcon = () => <span data-testid="combined-icon">💰</span>;

    render(
      <StatCard
        label="Revenue"
        value={150000}
        variant="success"
        size="lg"
        icon={<TestIcon />}
        trend={{ value: 25.3, isPositive: true }}
        className="custom-combined"
        data-testid="combined-card"
      />
    );

    const card = screen.getByTestId('combined-card');

    // Check all features are present
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('150,000')).toBeInTheDocument();
    expect(screen.getByTestId('combined-icon')).toBeInTheDocument();
    expect(screen.getByText('25.3%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();

    // Check styling
    expect(card).toHaveClass('border-green-200', 'bg-green-50'); // success variant
    expect(card).toHaveClass('p-6', 'text-2xl', 'sm:text-3xl'); // lg size
    expect(card).toHaveClass('custom-combined'); // custom class
  });

  // Edge cases
  it('handles zero value correctly', () => {
    render(<StatCard label="Zero Value" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles empty string value correctly', () => {
    render(<StatCard label="Empty String" value="" />);

    expect(screen.getByText('Empty String')).toBeInTheDocument();
    const valueElement = screen.getByText((content, element) => {
      return element?.textContent === '';
    });
    expect(valueElement).toBeInTheDocument();
  });

  it('handles very long labels correctly', () => {
    const longLabel = 'This is a very long label that might wrap to multiple lines in some cases';

    render(<StatCard label={longLabel} value="100" />);

    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });

  it('handles very large numbers correctly', () => {
    render(<StatCard label="Large Number" value={999999999} />);

    expect(screen.getByText('999,999,999')).toBeInTheDocument();
  });

  // Accessibility tests
  it('has proper structure for accessibility', () => {
    render(
      <StatCard
        label="Accessible Card"
        value="100"
        data-testid="accessible-card"
        aria-label="Statistics showing 100 accessible cards"
      />
    );

    const card = screen.getByTestId('accessible-card');
    expect(card).toHaveAttribute('aria-label');
  });

  it('maintains proper heading hierarchy', () => {
    render(<StatCard label="Test Label" value="100" />);

    // Check that label uses overline variant (small tag) for proper semantics
    const labelElement = screen.getByText('Test Label');
    expect(labelElement.tagName).toBe('SMALL');

    // Check that value uses appropriate heading level (h3 for medium size)
    const valueElement = screen.getByText('100');
    expect(valueElement.tagName).toBe('H3');
  });

  // Hover states
  it('applies hover styles correctly', () => {
    render(<StatCard label="Hover Test" value="100" data-testid="hover-card" />);

    const card = screen.getByTestId('hover-card');
    expect(card).toHaveClass('hover:shadow-md');
  });

  // Layout tests
  it('maintains proper flex layout', () => {
    const TestIcon = () => <span>🎯</span>;

    const { container } = render(<StatCard label="Layout Test" value="100" icon={<TestIcon />} />);

    const flexContainer = container.querySelector('.flex.items-start.justify-between');
    expect(flexContainer).toBeInTheDocument();

    const textContainer = container.querySelector('.flex-1');
    expect(textContainer).toBeInTheDocument();

    const iconContainer = container.querySelector('.flex-shrink-0');
    expect(iconContainer).toBeInTheDocument();
  });
});
