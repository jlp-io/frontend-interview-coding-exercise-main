import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableHeader } from './TableHeader';

describe('TableHeader', () => {
  // Basic rendering tests
  it('renders correctly as thead element', () => {
    render(
      <table>
        <TableHeader data-testid="test-header">
          <tr>
            <th>Test Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    const header = screen.getByTestId('test-header');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('THEAD');
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  it('applies default classes correctly', () => {
    render(
      <table>
        <TableHeader data-testid="test-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    const header = screen.getByTestId('test-header');
    expect(header).toHaveClass('border-b', 'border-gray-200', 'bg-gray-50/50');
  });

  it('applies custom className', () => {
    render(
      <table>
        <TableHeader className="custom-header" data-testid="test-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    const header = screen.getByTestId('test-header');
    expect(header).toHaveClass('custom-header');
    expect(header).toHaveClass('border-b'); // should still have default classes
  });

  it('forwards additional props to thead element', () => {
    render(
      <table>
        <TableHeader
          data-testid="test-header"
          id="my-header"
          role="rowgroup"
          aria-label="Table header"
        >
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    const header = screen.getByTestId('test-header');
    expect(header).toHaveAttribute('id', 'my-header');
    expect(header).toHaveAttribute('role', 'rowgroup');
    expect(header).toHaveAttribute('aria-label', 'Table header');
  });

  it('renders multiple header rows', () => {
    render(
      <table>
        <TableHeader data-testid="multi-header">
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
          <tr>
            <th>Subheader 1</th>
            <th>Subheader 2</th>
          </tr>
        </TableHeader>
      </table>
    );

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Subheader 1')).toBeInTheDocument();
    expect(screen.getByText('Subheader 2')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(
      <table>
        <TableHeader data-testid="empty-header" />
      </table>
    );

    const header = screen.getByTestId('empty-header');
    expect(header).toBeInTheDocument();
    expect(header).toBeEmptyDOMElement();
  });

  it('supports ref forwarding', () => {
    const headerRef = React.createRef<HTMLTableSectionElement>();

    render(
      <table>
        <TableHeader ref={headerRef} data-testid="ref-header">
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );

    expect(headerRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(headerRef.current?.dataset.testid).toBe('ref-header');
    expect(headerRef.current?.tagName).toBe('THEAD');
  });

  it('can contain complex header structures', () => {
    render(
      <table>
        <TableHeader data-testid="complex-header">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Age</th>
            <th scope="col" colSpan={2}>
              Contact Info
            </th>
          </tr>
          <tr>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
          </tr>
        </TableHeader>
      </table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Contact Info')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });
});
