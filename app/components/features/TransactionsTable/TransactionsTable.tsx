'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/components/ui/Table';

export interface Transaction {
  transactionId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionsTableProps {
  rows: Transaction[];
}

const CATEGORY_STYLES: Record<string, string> = {
  Groceries: 'bg-green-100 text-green-700',
  'Food & Dining': 'bg-amber-100 text-amber-700',
  Electronics: 'bg-blue-100 text-blue-700',
  Transport: 'bg-indigo-100 text-indigo-700',
  Utilities: 'bg-yellow-100 text-yellow-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Travel: 'bg-rose-100 text-rose-700',
  Subscriptions: 'bg-cyan-100 text-cyan-700',
  Healthcare: 'bg-teal-100 text-teal-700',
};

export function TransactionsTable({ rows }: TransactionsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableCell
                as="th"
                className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Date
              </TableCell>
              <TableCell
                as="th"
                className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Transaction ID
              </TableCell>
              <TableCell
                as="th"
                className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Description
              </TableCell>
              <TableCell
                as="th"
                className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Category
              </TableCell>
              <TableCell
                as="th"
                className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {rows.map((transaction) => {
              const date = new Date(transaction.date);
              const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              });

              return (
                <TableRow
                  key={transaction.transactionId}
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell className="px-6 py-4 text-sm text-gray-600">{formattedDate}</TableCell>
                  <TableCell className="px-6 py-4 font-mono text-sm text-gray-500">
                    {transaction.transactionId}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        CATEGORY_STYLES[transaction.category] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-medium tabular-nums text-gray-900">
                    £{transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-400">
        {rows.length} transactions
      </div>
    </div>
  );
}
