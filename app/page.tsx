'use client';

import { useEffect, useState } from 'react';
import { StatCard } from './components/features/StatCard';
import { TransactionsTable, type Transaction } from './components/features/TransactionsTable';
import { Typography } from './components/ui/Typography';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactions_new, setNewTransactions] = useState<Transaction[]>(transactions);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {}, []);

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
  const uniqueCategories = new Set(transactions.map((t) => t.category)).size;

  const categories = [
    `Groceries`,
    `Food & Dining`,
    `Electronics`,
    `Transport`,
    `Utilities`,
    `Entertainment`,
    `Travel`,
    `Subscriptions`,
    `Healthcare`,
  ];

  console.log(
    'transactions',
    transactions,
    transactions_new,
    transactions.map((t) => {
      return t.category;
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <Typography variant="h1" className="text-2xl font-bold sm:text-3xl">
            Transactions
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Overview of all transaction activity
          </Typography>
        </header>

        <label for="categories">Choose a category:</label>
        <select name="categories" id="categories">
          <option value="" onClick={() => setNewTransactions(transactions)}></option>
          {categories.map((c) => {
            return (
              <option
                value={c}
                onClick={() => setNewTransactions(transactions.filter((t) => t.category === c))}
              >
                {c}
              </option>
            );
          })}
        </select>

        <form onSubmit={() => {}}>
          <label for="categories">Search for a transaction:</label>
          <input type="text" value=""></input>
          {/* <select name="categories" id="categories">
            <option value="" onClick={() => setNewTransactions(transactions)}></option>
            {categories.map((c) => {
              return (
                <option
                  value={c}
                  onClick={() => setNewTransactions(transactions.filter((t) => t.category === c))}
                >
                  {c}
                </option>
              );
            })}
          </select> */}
          <button
            onClick={() => setNewTransactions(transactions.filter((t) => t.description === c))}
          >
            Search
          </button>
        </form>

        <label for="categories">Slider date range:</label>
        <select name="categories" id="categories">
          <option value="" onClick={() => setNewTransactions(transactions)}></option>
          {categories.map((c) => {
            return (
              <option
                value={c}
                onClick={() => setNewTransactions(transactions.filter((t) => t.category === c))}
              >
                {c}
              </option>
            );
          })}
        </select>

        <label for="categories">Slider amount range:</label>
        <select name="categories" id="categories">
          <option value="" onClick={() => setNewTransactions(transactions)}></option>
          {categories.map((c) => {
            return (
              <option
                value={c}
                onClick={() => setNewTransactions(transactions.filter((t) => t.category === c))}
              >
                {c}
              </option>
            );
          })}
        </select>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Transactions" value={String(transactions.length)} />
          <StatCard
            label="Total Amount"
            value={`£${totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <StatCard
            label="Average Amount"
            value={`£${avgAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <StatCard label="Categories" value={String(uniqueCategories)} />
        </div>

        <TransactionsTable rows={transactions_new.length > 0 ? transactions_new : transactions} />
      </div>
    </div>
  );
}
