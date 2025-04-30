# Trade Ledger Monday.com Test Automation Framework

A Playwright TypeScript automation framework for testing Trade Ledger's Monday.com implementation.

## Features

- **Page Object Model (POM)** - Organized, maintainable test structure
- **TypeScript** - Type-safe code with modern JavaScript features
- **Centralized Constants** - Easy configuration and maintenance
- **Comprehensive Logging** - Detailed logging of all test actions
- **Error Handling** - Custom error handling with screenshots and HTML dumps
- **Environment Variables** - Supports .env files for configuration

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/flemmrs-tl/tradeledger_test_fb.git
cd tradeledger_test_fb/test_output
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

## Configuration

Update the `.env` file with your credentials and configuration:

```
BASE_URL=https://tldgr.monday.com
USERNAME=your-email@tradeledger.io
PASSWORD=your-password
LOG_LEVEL=info
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in headed mode (with browser visible):

```bash
npm run test:headed
```

Run tests with UI mode for debugging:

```bash
npm run test:ui
```

View test report:

```bash
npm run report
```

## Project Structure

```
├── src/
│   ├── constants/     # Application constants
│   ├── pages/         # Page object models
│   └── utils/         # Utilities (logger, error handler)
├── tests/             # Test specifications
├── .env               # Environment variables
├── playwright.config.ts  # Playwright configuration
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Page Objects

The framework includes the following page objects:

- **BasePage**: Base page with common methods
- **LoginPage**: Handles login functionality
- **DashboardPage**: Dashboard page operations
- **NewTaskPage**: Task creation operations

## Adding New Tests

1. Create a new test file in the `tests` directory
2. Import required page objects and utilities
3. Use the established patterns for consistent test structure

Example:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../src/pages';

test.describe('Example Test Suite', () => {
  test('Example test case', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
    // Add your test steps here
  });
});
```

## Logging

The framework uses Winston for logging. Logs are saved to the `logs` directory and also output to the console.

## Error Handling

When errors occur, the framework:

1. Takes a screenshot
2. Captures the HTML content
3. Logs detailed error information
4. Stores evidence for later analysis

## Maintainers

- Flemming Bengtsen (flemming.bengtsen@tradeledger.io)
