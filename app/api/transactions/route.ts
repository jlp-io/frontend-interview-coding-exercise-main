import { NextResponse } from 'next/server';
import transactions from './data.json';

export async function GET() {
  return NextResponse.json(transactions);
}
