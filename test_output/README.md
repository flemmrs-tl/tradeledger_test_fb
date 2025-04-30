# Trade Ledger Monday.com Test Automation Framework

A Playwright TypeScript automation framework for testing Trade Ledger's Monday.com implementation.

## Features

- **Page Object Model (POM)** - Organized, maintainable test structure
- **TypeScript** - Type-safe code with modern JavaScript features
- **Centralized Constants** - Easy configuration and maintenance
- **Comprehensive Logging** - Detailed logging of all test actions
- **Error Handling** - Custom error handling with screenshots and HTML dumps
- **Environment Variables** - Supports .env files for configuration
- **Retry Mechanisms** - Built-in retry logic for flaky operations
- **Popup Management** - Robust handling of dialogs, tooltips and popups
- **Flexible Selectors** - Multiple selector strategies to handle UI variations

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
│   ├── constants/     # Application constants and selectors
│   ├── pages/         # Page object models
│   │   ├── BasePage.ts         # Base page with common methods
│   │   ├── LoginPage.ts        # Login functionality
│   │   ├── DashboardPage.ts    # Dashboard operations
│   │   ├── NewTaskPage.ts      # Task creation operations
│   │   └── index.ts            # Exports all pages
│   └── utils/         # Utilities
│       ├── logger.ts           # Logging functionality
│       ├── errorHandler.ts     # Error handling and reporting
│       └── retryHandler.ts     # Retry mechanisms for reliability
├── tests/             # Test specifications
├── .env               # Environment variables
├── playwright.config.ts  # Playwright configuration
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Enhanced Features

### Improved Selectors

The framework now includes multiple selector strategies for each element to handle UI variations:

- Data-testid selectors for more stability
- Text-based selectors as fallbacks
- Role-based selectors for accessibility
- CSS selectors where appropriate

### Robust Popup Handling

Monday.com shows various popups and tooltips that can interfere with automation:

- Tooltips
- Help dialogs
- Notification prompts
- Gantt view tutorials
- Welcome messages

The framework now includes specialized methods to detect and dismiss each type.

### Retry Mechanisms

Retry logic has been implemented at multiple levels:

- `RetryHandler` utility for retrying flaky operations
- Test-level retry with screenshots for debugging
- Multiple selector strategies for finding elements
- Automatic waiting and retrying for UI stabilization

### Enhanced Error Reporting

Improved error capture and reporting:

- Screenshots on failure
- HTML dumps of the page state
- Detailed error logs with context
- Step-by-step logging

## Adding New Tests

1. Create a new test file in the `tests` directory
2. Import required page objects and utilities
3. Use the established patterns for consistent test structure

Example:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../src/pages';
import { RetryHandler } from '../src/utils/retryHandler';

test.describe('Example Test Suite', () => {
  test('Example test case', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await RetryHandler.executeWithScreenshots(
      page,
      async () => await loginPage.login(),
      { name: 'login process', maxAttempts: 3 }
    );
    
    // Add your test steps here
  });
});
```

## Maintainers

- Flemming Bengtsen (flemming.bengtsen@tradeledger.io)
