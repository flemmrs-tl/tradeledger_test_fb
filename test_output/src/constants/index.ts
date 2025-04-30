/**
 * Application Constants
 * 
 * This file contains all constants used throughout the test framework.
 * Centralizing these values makes maintenance easier.
 */

// Timeouts
export const TIMEOUTS = {
  SHORT: 5000,    // 5 seconds
  MEDIUM: 15000,  // 15 seconds
  LONG: 30000,    // 30 seconds
  XL: 60000       // 1 minute
};

// Application URLs
export const URLS = {
  LOGIN: 'https://tldgr.monday.com/auth/login_monday/email_password',
  DASHBOARD: 'https://tldgr.monday.com/boards',
  NEW_TASK: 'https://tldgr.monday.com/boards/new',
};

// Element Selectors for Login Page
export const LOGIN_SELECTORS = {
  EMAIL_INPUT: '[data-testid="user_email"]',
  PASSWORD_INPUT: '[data-testid="user_password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  ERROR_MESSAGE: '.auth-form-error-message',
};

// Element Selectors for Dashboard Page
export const DASHBOARD_SELECTORS = {
  NEW_TASK_BUTTON: 'button:has-text("New task")',
  NEW_TASK_BUTTON_ALT: '[data-testid="button"]:has-text("New task")',
  HELP_DIALOG: '.monday-style-dialog-content-wrapper',
  HELP_DIALOG_CLOSE: 'button[aria-label="Close"]',
  TOOLTIP: '.tutorial-tooltip-container, [data-testid="tooltip"]',
  TOOLTIP_CLOSE: '.tooltip-close-btn, [data-testid="tipseen-title"] + button:has-text("Got it")',
  GANTT_TOOLTIP: '[role="heading"]:has-text("Click here for Gantt view")',
  GANTT_TOOLTIP_GOT_IT: 'button:has-text("Got it")',
  NOTIFICATION_PROMPT: '[data-testid="enable-notification-prompt"]',
  NOTIFICATION_CLOSE: '[data-testid="enable-notification-prompt"] button:has-text("Enable Now!")',
  BOARD_HEADING: 'h2:has-text("Test")',
};

// Element Selectors for New Task Page
export const NEW_TASK_SELECTORS = {
  TASK_TITLE_INPUT: '[placeholder="Task name"], input[placeholder="New item"]',
  TASK_INLINE_EDIT: 'div[role="row"] input, div[role="row"] [role="textbox"]',
  CREATE_TASK_BUTTON: 'button:has-text("Create Task")',
  CANCEL_BUTTON: 'button:has-text("Cancel")',
  TASK_ROW: 'div[role="row"]:has-text("QA Testing")',
};

// Common Texts
export const TEXTS = {
  LOGIN_PAGE_TITLE: 'Log In',
  DASHBOARD_TITLE: 'Test',
  NEW_TASK_TITLE: 'Create Task',
};

// API Endpoints (if needed for future API tests)
export const API = {
  BASE_URL: 'https://api.monday.com/v2',
  TASKS: '/tasks',
  USERS: '/users',
};

// Credentials (These would typically be loaded from environment variables)
export const CREDENTIALS = {
  USERNAME: process.env.USERNAME || 'flemming.bengtsen@tradeledger.io',
  PASSWORD: process.env.PASSWORD || 'This15aTestP%wd',
};

// Test Data
export const TEST_DATA = {
  TASK_NAME: 'QA Testing',
  TASK_DESCRIPTION: 'This is a test task created via automation',
};

// File Paths
export const PATHS = {
  SCREENSHOTS: './screenshots',
  REPORTS: './reports',
  LOGS: './logs',
};