import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableBody } from './TableBody';

describe('TableBody', () => {
  // Basic rendering tests
  it('renders correctly as tbody element', () => {
    render(
      <table>
        <TableBody data-testid="test-body">
          <tr>
            <td>Test Content</td>
          </tr>
        </TableBody>
      </table>
    );

    const body = screen.getByTestId('test-body');
    expect(body).toBeInTheDocument();
    expect(body.tagName).toBe('TBODY');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default classes correctly', () => {
    render(
      <table>
        <TableBody data-testid="test-body">
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );

    const body = screen.getByTestId('test-body');
    expect(body).toHaveClass('divide-y', 'divide-gray-200');
  });

  it('applies custom className', () => {
    render(
      <table>
        <TableBody className="custom-body" data-testid="test-body">
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );

    const body = screen.getByTestId('test-body');
    expect(body).toHaveClass('custom-body');
    expect(body).toHaveClass('divide-y'); // should still have default classes
  });

  it('forwards additional props to tbody element', () => {
    render(
      <table>
        <TableBody data-testid="test-body" id="my-body" role="rowgroup" aria-label="Table body">
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );

    const body = screen.getByTestId('test-body');
    expect(body).toHaveAttribute('id', 'my-body');
    expect(body).toHaveAttribute('role', 'rowgroup');
    expect(body).toHaveAttribute('aria-label', 'Table body');
  });

  it('renders multiple rows', () => {
    render(
      <table>
        <TableBody data-testid="multi-body">
          <tr>
            <td>Row 1, Cell 1</td>
            <td>Row 1, Cell 2</td>
          </tr>
          <tr>
            <td>Row 2, Cell 1</td>
            <td>Row 2, Cell 2</td>
          </tr>
          <tr>
            <td>Row 3, Cell 1</td>
            <td>Row 3, Cell 2</td>
          </tr>
        </TableBody>
      </table>
    );

    expect(screen.getByText('Row 1, Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Row 1, Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Row 2, Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2, Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3, Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Row 3, Cell 2')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(
      <table>
        <TableBody data-testid="empty-body"></TableBody>
      </table>
    );

    const body = screen.getByTestId('empty-body');
    expect(body).toBeInTheDocument();
    expect(body).toBeEmptyDOMElement();
  });

  it('supports ref forwarding', () => {
    const bodyRef = React.createRef<HTMLTableSectionElement>();

    render(
      <table>
        <TableBody ref={bodyRef} data-testid="ref-body">
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );

    expect(bodyRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(bodyRef.current?.dataset.testid).toBe('ref-body');
    expect(bodyRef.current?.tagName).toBe('TBODY');
  });

  it('can contain complex row structures', () => {
    render(
      <table>
        <TableBody data-testid="complex-body">
          <tr>
            <td>Simple cell</td>
            <td rowSpan={2}>Spanning cell</td>
            <td>Another cell</td>
          </tr>
          <tr>
            <td>Second row, first cell</td>
            <td>Second row, last cell</td>
          </tr>
        </TableBody>
      </table>
    );

    expect(screen.getByText('Simple cell')).toBeInTheDocument();
    expect(screen.getByText('Spanning cell')).toBeInTheDocument();
    expect(screen.getByText('Another cell')).toBeInTheDocument();
    expect(screen.getByText('Second row, first cell')).toBeInTheDocument();
    expect(screen.getByText('Second row, last cell')).toBeInTheDocument();
  });

  it('preserves data and accessibility attributes', () => {
    render(
      <table>
        <TableBody
          data-testid="data-body"
          data-state="loaded"
          data-total="100"
          aria-live="polite"
          aria-busy="false"
        >
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );

    const body = screen.getByTestId('data-body');
    expect(body).toHaveAttribute('data-state', 'loaded');
    expect(body).toHaveAttribute('data-total', '100');
    expect(body).toHaveAttribute('aria-live', 'polite');
    expect(body).toHaveAttribute('aria-busy', 'false');
  });
});
