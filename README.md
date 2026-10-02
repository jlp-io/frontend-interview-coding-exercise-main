# 💼 CreateFuture Coding challenge

## 📋 Overview

You'll be working with a **transaction dashboard** application built with Next.js 16, React 19, TypeScript, and v4 Tailwind CSS. The dashboard displays financial transactions with statistics and a data table. Your task is to add advanced filtering capabilities.

## 🚀 Getting Started

### Prerequisites

- Node.js 22.13.0
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## ⚠️ Client Components

All components in this project are **client-side rendered**. When creating new components, remember to add the `'use client'` directive at the top of the file:

```tsx
'use client';

export const MyComponent = () => {
...
}
```

The only exception is the API route (`app/api/`), which remains server-side. Data fetching is done client-side via `fetch` calls to the API.

## 🎯 Your Challenge: Add Transaction Filtering

### Task 1. Description

Users need the ability to filter transactions by multiple criteria. Your task is to build a comprehensive filter system that works seamlessly with the existing dashboard.

- Include **unit testing** for the new component(s).
- All filtering functionality should be done via front-end only.

### Requirements

Build a `TransactionsTableFilters` component with the following features:

#### 1.1 **Search Filter**

- Text input that filters by Transaction ID and Description.
- Case-insensitive matching

#### 1.2 **Category Filter**

- Multi-select dropdown/chips for categories
- Available categories: `Groceries`, `Food & Dining`, `Electronics`, `Transport`, `Utilities`, `Entertainment`, `Travel`, `Subscriptions`, `Healthcare`
- Users can select multiple categories simultaneously

#### 1.3 **Amount Range Filter**

- Two number inputs: Min Amount and Max Amount
- Filter transactions within the specified range
- Handle edge cases (only min, only max, invalid ranges)

#### 1.4 **Date Range Filter**

- Date range picker with "From" and "To" date inputs
- Filter transactions within the selected date range
- Support open-ended ranges (only "From" or only "To" date)
