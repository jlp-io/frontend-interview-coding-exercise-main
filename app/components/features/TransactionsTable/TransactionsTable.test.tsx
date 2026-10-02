import { render, screen } from '@testing-library/react';
import { TransactionsTable, type Transaction } from '.';

// Mock data matching the API response structure
const mockTransactions: Transaction[] = [
  {
    transactionId: 'TXN-2024-001',
    date: '2024-01-15T10:30:00Z',
    description: 'Weekly grocery shopping',
    amount: 100.0,
    category: 'Groceries',
  },
  {
    transactionId: 'TXN-2024-002',
    date: '2024-02-20T12:45:00Z',
    description: 'Lunch at Pret A Manger',
    amount: 50.25,
    category: 'Food & Dining',
  },
  {
    transactionId: 'TXN-2024-003',
    date: '2024-03-10T14:20:00Z',
    description: 'New wireless headphones',
    amount: 299.99,
    category: 'Electronics',
  },
  {
    transactionId: 'TXN-2024-004',
    date: '2024-04-05T09:15:00Z',
    description: 'Coffee and pastry',
    amount: 15.75,
    category: 'UnknownCategory',
  },
];

describe('TransactionsTable', () => {
  it('renders without crashing', () => {
    render(<TransactionsTable rows={[]} />);
    expect(screen.getByText('0 transactions')).toBeInTheDocument();
  });

  it('displays column headers correctly', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders all transaction data correctly', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    // Check dates (formatted as DD MMM YYYY)
    expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('20 Feb 2024')).toBeInTheDocument();
    expect(screen.getByText('10 Mar 2024')).toBeInTheDocument();
    expect(screen.getByText('05 Apr 2024')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Weekly grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Lunch at Pret A Manger')).toBeInTheDocument();
    expect(screen.getByText('New wireless headphones')).toBeInTheDocument();
    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument();

    // Check transaction IDs appear in secondary text
    expect(screen.getByText('TXN-2024-001')).toBeInTheDocument();
    expect(screen.getByText('TXN-2024-002')).toBeInTheDocument();
    expect(screen.getByText('TXN-2024-003')).toBeInTheDocument();
    expect(screen.getByText('TXN-2024-004')).toBeInTheDocument();

    // Check categories
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('UnknownCategory')).toBeInTheDocument();
  });

  it('formats amounts correctly with currency symbol', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    expect(screen.getByText('£100.00')).toBeInTheDocument();
    expect(screen.getByText('£50.25')).toBeInTheDocument();
    expect(screen.getByText('£299.99')).toBeInTheDocument();
    expect(screen.getByText('£15.75')).toBeInTheDocument();
  });

  it('applies correct category styles for known categories', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const groceriesCategory = screen.getByText('Groceries');
    const foodDiningCategory = screen.getByText('Food & Dining');
    const electronicsCategory = screen.getByText('Electronics');

    expect(groceriesCategory).toHaveClass('bg-green-100', 'text-green-700');
    expect(foodDiningCategory).toHaveClass('bg-amber-100', 'text-amber-700');
    expect(electronicsCategory).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('applies default styles for unknown categories', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const unknownCategory = screen.getByText('UnknownCategory');
    expect(unknownCategory).toHaveClass('bg-gray-100', 'text-gray-600');
  });

  it('displays correct transaction count', () => {
    render(<TransactionsTable rows={mockTransactions} />);
    expect(screen.getByText('4 transactions')).toBeInTheDocument();

    render(<TransactionsTable rows={[mockTransactions[0]]} />);
    expect(screen.getByText('1 transactions')).toBeInTheDocument();

    render(<TransactionsTable rows={[]} />);
    expect(screen.getByText('0 transactions')).toBeInTheDocument();
  });

  it('applies hover effects to table rows', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const tableRows = screen.getAllByRole('row');
    // Skip header row (index 0) and check data rows
    const dataRows = tableRows.slice(1);

    dataRows.forEach((row) => {
      expect(row).toHaveClass('transition-colors', 'hover:bg-gray-50');
    });
  });

  it('uses monospace font for transaction IDs', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const transactionIdCells = screen.getAllByText(/^TXN-2024-\d{3}$/);
    transactionIdCells.forEach((cell) => {
      expect(cell).toHaveClass('font-mono');
    });
  });

  it('applies proper text alignment', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    // Amount header should be right-aligned
    const headerCells = screen.getAllByRole('columnheader');
    const amountHeader = headerCells.find((cell) => cell.textContent === 'Amount');
    expect(amountHeader).toHaveClass('text-right');

    // Amount cells should be right-aligned
    const amountCells = screen.getAllByText(/£\d+\.\d{2}/);
    amountCells.forEach((cell) => {
      expect(cell).toHaveClass('text-right');
    });
  });

  it('handles empty rows gracefully', () => {
    render(<TransactionsTable rows={[]} />);

    // Headers should still be present
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();

    // No data rows should be present
    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(1); // Only header row

    // Footer should show 0 transactions
    expect(screen.getByText('0 transactions')).toBeInTheDocument();
  });

  it('renders with proper table structure', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    // Check for table element
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('w-full', 'text-sm');

    // Check for proper row count (header + data rows)
    const allRows = screen.getAllByRole('row');
    expect(allRows).toHaveLength(mockTransactions.length + 1); // +1 for header

    // Check for column headers
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(5);
  });

  it('applies tabular-nums class to amount cells for proper alignment', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const amountCells = screen.getAllByText(/£\d+\.\d{2}/);
    amountCells.forEach((cell) => {
      expect(cell).toHaveClass('tabular-nums');
    });
  });

  it('renders category badges with proper styling', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    const categoryBadges = [
      screen.getByText('Groceries'),
      screen.getByText('Food & Dining'),
      screen.getByText('Electronics'),
      screen.getByText('UnknownCategory'),
    ];

    categoryBadges.forEach((badge) => {
      expect(badge).toHaveClass(
        'inline-flex',
        'rounded-full',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-medium'
      );
    });
  });

  it('applies correct styling to table container', () => {
    const { container } = render(<TransactionsTable rows={mockTransactions} />);

    const outerContainer = container.firstChild;
    expect(outerContainer).toHaveClass(
      'overflow-hidden',
      'rounded-xl',
      'border',
      'border-gray-200',
      'bg-white',
      'shadow-sm'
    );

    const scrollContainer = outerContainer?.firstChild;
    expect(scrollContainer).toHaveClass('overflow-x-auto');
  });

  it('includes proper accessibility attributes', () => {
    render(<TransactionsTable rows={mockTransactions} />);

    // Table should be accessible
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // All headers should be accessible
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);

    // All rows should be accessible
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(0);
  });
});
