import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simu — Loan simulator',
  description: 'Plan your loan with a clear, detailed repayment simulation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
