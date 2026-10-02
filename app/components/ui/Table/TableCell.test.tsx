import React from 'react';
import Image from 'next/image';
import { render, screen } from '@testing-library/react';
import { TableCell } from './TableCell';

describe('TableCell', () => {
  // Basic rendering tests - td (default)
  it('renders correctly as td element by default', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="test-cell">Test Content</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('test-cell');
    expect(cell).toBeInTheDocument();
    expect(cell.tagName).toBe('TD');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders correctly as th element when as="th"', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell as="th" data-testid="test-header-cell">
              Header Content
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    const cell = screen.getByTestId('test-header-cell');
    expect(cell).toBeInTheDocument();
    expect(cell.tagName).toBe('TH');
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  // Default classes tests
  it('applies default td classes correctly', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="td-cell">Content</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('td-cell');
    expect(cell).toHaveClass(
      'px-4',
      'py-3',
      'text-left',
      'align-middle',
      'font-medium',
      'text-gray-900'
    );
  });

  it('applies default th classes correctly', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell as="th" data-testid="th-cell">
              Header
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    const cell = screen.getByTestId('th-cell');
    expect(cell).toHaveClass(
      'px-4',
      'py-3',
      'text-left',
      'align-middle',
      'text-gray-700',
      'font-semibold',
      'bg-gray-50/50'
    );
  });

  // Custom className tests
  it('applies custom className to td', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="custom-td" data-testid="custom-td-cell">
              Content
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('custom-td-cell');
    expect(cell).toHaveClass('custom-td');
    expect(cell).toHaveClass('px-4'); // should still have default classes
  });

  it('applies custom className to th', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell as="th" className="custom-th" data-testid="custom-th-cell">
              Header
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    const cell = screen.getByTestId('custom-th-cell');
    expect(cell).toHaveClass('custom-th');
    expect(cell).toHaveClass('px-4'); // should still have default classes
  });

  // Props forwarding tests
  it('forwards additional props to td element', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell
              data-testid="props-td"
              id="my-cell"
              role="gridcell"
              aria-label="Data cell"
              colSpan={2}
              rowSpan={1}
            >
              Content
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('props-td');
    expect(cell).toHaveAttribute('id', 'my-cell');
    expect(cell).toHaveAttribute('role', 'gridcell');
    expect(cell).toHaveAttribute('aria-label', 'Data cell');
    expect(cell).toHaveAttribute('colSpan', '2');
    expect(cell).toHaveAttribute('rowSpan', '1');
  });

  it('forwards additional props to th element', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell
              as="th"
              data-testid="props-th"
              id="my-header"
              role="columnheader"
              aria-label="Header cell"
              scope="col"
              colSpan={2}
            >
              Header
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    const cell = screen.getByTestId('props-th');
    expect(cell).toHaveAttribute('id', 'my-header');
    expect(cell).toHaveAttribute('role', 'columnheader');
    expect(cell).toHaveAttribute('aria-label', 'Header cell');
    expect(cell).toHaveAttribute('scope', 'col');
    expect(cell).toHaveAttribute('colSpan', '2');
  });

  // Ref forwarding tests
  it('supports ref forwarding for td', () => {
    const cellRef = React.createRef<HTMLTableCellElement>();

    render(
      <table>
        <tbody>
          <tr>
            <TableCell ref={cellRef} data-testid="ref-td">
              Content
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(cellRef.current).toBeInstanceOf(HTMLTableCellElement);
    expect(cellRef.current?.dataset.testid).toBe('ref-td');
    expect(cellRef.current?.tagName).toBe('TD');
  });

  it('supports ref forwarding for th', () => {
    const cellRef = React.createRef<HTMLTableCellElement>();

    render(
      <table>
        <thead>
          <tr>
            <TableCell as="th" ref={cellRef} data-testid="ref-th">
              Header
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    expect(cellRef.current).toBeInstanceOf(HTMLTableCellElement);
    expect(cellRef.current?.dataset.testid).toBe('ref-th');
    expect(cellRef.current?.tagName).toBe('TH');
  });

  // Content tests
  it('handles empty children', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="empty-cell"></TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('empty-cell');
    expect(cell).toBeInTheDocument();
    expect(cell).toBeEmptyDOMElement();
  });

  it('handles complex children in td', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="complex-td">
              <div>
                <span>Text content</span>
                <button>Action</button>
                <Image alt="Icon" src="/test.jpg" width={10} height={10} />
              </div>
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByText('Text content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByAltText('Icon')).toBeInTheDocument();
  });

  it('handles complex children in th', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell as="th" data-testid="complex-th">
              <div>
                <span>Header Text</span>
                <button>Sort</button>
              </div>
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText('Header Text')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('handles undefined children gracefully', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="undefined-children">{undefined}</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('undefined-children');
    expect(cell).toBeInTheDocument();
  });

  it('handles null children gracefully', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="null-children">{null}</TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('null-children');
    expect(cell).toBeInTheDocument();
  });

  // Accessibility tests
  it('preserves accessibility attributes for td', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell
              data-testid="accessible-td"
              aria-describedby="description"
              aria-sort="ascending"
              tabIndex={0}
            >
              Content
            </TableCell>
          </tr>
        </tbody>
      </table>
    );

    const cell = screen.getByTestId('accessible-td');
    expect(cell).toHaveAttribute('aria-describedby', 'description');
    expect(cell).toHaveAttribute('aria-sort', 'ascending');
    expect(cell).toHaveAttribute('tabIndex', '0');
  });

  it('preserves accessibility attributes for th', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell
              as="th"
              data-testid="accessible-th"
              aria-describedby="help-text"
              aria-sort="descending"
              tabIndex={-1}
            >
              Header
            </TableCell>
          </tr>
        </thead>
      </table>
    );

    const cell = screen.getByTestId('accessible-th');
    expect(cell).toHaveAttribute('aria-describedby', 'help-text');
    expect(cell).toHaveAttribute('aria-sort', 'descending');
    expect(cell).toHaveAttribute('tabIndex', '-1');
  });
});
