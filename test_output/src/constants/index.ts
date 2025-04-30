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
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  ERROR_MESSAGE: '.auth-form-error-message',
};

// Element Selectors for Dashboard Page
export const DASHBOARD_SELECTORS = {
  NEW_TASK_BUTTON: 'button:has-text("New task")',
  HELP_DIALOG: '.monday-style-dialog-content-wrapper',
  HELP_DIALOG_CLOSE: 'button[aria-label="Close"]',
  TOOLTIP: '.tutorial-tooltip-container',
  TOOLTIP_CLOSE: '.tooltip-close-btn',
};

// Element Selectors for New Task Page
export const NEW_TASK_SELECTORS = {
  TASK_TITLE_INPUT: 'input[placeholder="Task name"]',
  CREATE_TASK_BUTTON: 'button:has-text("Create Task")',
  CANCEL_BUTTON: 'button:has-text("Cancel")',
};

// Common Texts
export const TEXTS = {
  LOGIN_PAGE_TITLE: 'Log in to your account',
  DASHBOARD_TITLE: 'My Work',
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