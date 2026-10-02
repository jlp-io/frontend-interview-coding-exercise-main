import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableRow } from './TableRow';

describe('TableRow', () => {
  // Basic rendering tests
  it('renders correctly as tr element', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="test-row">
            <td>Test Cell</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('test-row');
    expect(row).toBeInTheDocument();
    expect(row.tagName).toBe('TR');
    expect(screen.getByText('Test Cell')).toBeInTheDocument();
  });

  it('applies default classes correctly', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="test-row">
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('test-row');
    expect(row).toHaveClass(
      'border-b',
      'transition-colors',
      'hover:bg-gray-50/50',
      'data-[state=selected]:bg-blue-50'
    );
  });

  it('applies custom className', () => {
    render(
      <table>
        <tbody>
          <TableRow className="custom-row" data-testid="test-row">
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('test-row');
    expect(row).toHaveClass('custom-row');
    expect(row).toHaveClass('border-b'); // should still have default classes
  });

  it('forwards additional props to tr element', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="test-row" id="my-row" role="row" aria-selected="true">
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('test-row');
    expect(row).toHaveAttribute('id', 'my-row');
    expect(row).toHaveAttribute('role', 'row');
    expect(row).toHaveAttribute('aria-selected', 'true');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();

    render(
      <table>
        <tbody>
          <TableRow onClick={handleClick} data-testid="clickable-row">
            <td>Clickable content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('clickable-row');
    fireEvent.click(row);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();

    render(
      <table>
        <tbody>
          <TableRow onKeyDown={handleKeyDown} data-testid="keyboard-row">
            <td>Keyboard content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('keyboard-row');
    fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'Enter',
        code: 'Enter',
      })
    );
  });

  it('renders multiple cells', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="multi-cell-row">
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 3')).toBeInTheDocument();
    expect(screen.getByText('Cell 4')).toBeInTheDocument();
  });

  it('handles data-state attributes for styling', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="selected-row" data-state="selected">
            <td>Selected content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('selected-row');
    expect(row).toHaveAttribute('data-state', 'selected');
  });

  it('supports ref forwarding', () => {
    const rowRef = React.createRef<HTMLTableRowElement>();

    render(
      <table>
        <tbody>
          <TableRow ref={rowRef} data-testid="ref-row">
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(rowRef.current).toBeInstanceOf(HTMLTableRowElement);
    expect(rowRef.current?.dataset.testid).toBe('ref-row');
    expect(rowRef.current?.tagName).toBe('TR');
  });

  it('handles empty children', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="empty-row"></TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('empty-row');
    expect(row).toBeInTheDocument();
    expect(row).toBeEmptyDOMElement();
  });

  it('can contain complex cell structures', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="complex-row">
            <td>
              <div>
                <span>Complex content</span>
                <button>Action</button>
              </div>
            </td>
            <td colSpan={2}>Spanning cell</td>
          </TableRow>
        </tbody>
      </table>
    );

    expect(screen.getByText('Complex content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Spanning cell')).toBeInTheDocument();
  });

  it('preserves accessibility attributes', () => {
    render(
      <table>
        <tbody>
          <TableRow
            data-testid="accessible-row"
            aria-selected="false"
            aria-expanded="true"
            aria-label="Customer data row"
            tabIndex={0}
          >
            <td>Accessible content</td>
          </TableRow>
        </tbody>
      </table>
    );

    const row = screen.getByTestId('accessible-row');
    expect(row).toHaveAttribute('aria-selected', 'false');
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(row).toHaveAttribute('aria-label', 'Customer data row');
    expect(row).toHaveAttribute('tabIndex', '0');
  });
});
