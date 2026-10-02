import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table } from './Table';

describe('Table', () => {
  // Basic rendering tests
  it('renders correctly with children', () => {
    render(
      <Table data-testid="test-table">
        <tbody>
          <tr>
            <td>Test content</td>
          </tr>
        </tbody>
      </Table>
    );

    const table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    expect(table.tagName).toBe('TABLE');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes correctly', () => {
    render(
      <Table data-testid="test-table">
        <tbody></tbody>
      </Table>
    );

    const table = screen.getByTestId('test-table');
    expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm', 'border-collapse');
  });

  it('applies custom className', () => {
    render(
      <Table className="custom-table" data-testid="test-table">
        <tbody></tbody>
      </Table>
    );

    const table = screen.getByTestId('test-table');
    expect(table).toHaveClass('custom-table');
    expect(table).toHaveClass('w-full'); // should still have default classes
  });

  it('forwards additional props to table element', () => {
    render(
      <Table data-testid="test-table" id="my-table" role="table" aria-label="Test table">
        <tbody></tbody>
      </Table>
    );

    const table = screen.getByTestId('test-table');
    expect(table).toHaveAttribute('id', 'my-table');
    expect(table).toHaveAttribute('role', 'table');
    expect(table).toHaveAttribute('aria-label', 'Test table');
  });

  it('renders wrapper div with correct classes', () => {
    const { container } = render(
      <Table data-testid="test-table">
        <tbody></tbody>
      </Table>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper).toHaveClass('relative', 'w-full', 'overflow-auto');
  });

  it('can be used with complex table structure', () => {
    render(
      <Table data-testid="complex-table">
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Footer 1</td>
            <td>Footer 2</td>
          </tr>
        </tfoot>
      </Table>
    );

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 3')).toBeInTheDocument();
    expect(screen.getByText('Cell 4')).toBeInTheDocument();
    expect(screen.getByText('Footer 1')).toBeInTheDocument();
    expect(screen.getByText('Footer 2')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(<Table data-testid="empty-table"></Table>);

    const table = screen.getByTestId('empty-table');
    expect(table).toBeInTheDocument();
    expect(table).toBeEmptyDOMElement();
  });

  it('supports ref forwarding', () => {
    const tableRef = React.createRef<HTMLTableElement>();

    render(
      <Table ref={tableRef} data-testid="ref-table">
        <tbody></tbody>
      </Table>
    );

    expect(tableRef.current).toBeInstanceOf(HTMLTableElement);
    expect(tableRef.current?.dataset.testid).toBe('ref-table');
  });
});
