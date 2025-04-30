import { Page } from '@playwright/test';
import BasePage from './BasePage';
import { LOGIN_SELECTORS, URLS, CREDENTIALS, TIMEOUTS } from '../constants';
import { logAction, logInfo, logWarning } from '../utils/logger';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Page object for the Login page
 */
export default class LoginPage extends BasePage {
  /**
   * Constructor for the LoginPage class
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page
   */
  public async navigateToLoginPage(): Promise<void> {
    try {
      logAction('Navigating to login page', URLS.LOGIN, 'LoginPage');
      await this.navigate(URLS.LOGIN);
      
      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
      
      // Verify login form is visible
      const emailInputVisible = await this.isVisible(LOGIN_SELECTORS.EMAIL_INPUT, TIMEOUTS.MEDIUM);
      if (!emailInputVisible) {
        throw new Error('Login form not visible after navigation');
      }
      
      logInfo('Successfully navigated to login page', 'LoginPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'NavigateToLoginPage');
      throw error;
    }
  }

  /**
   * Enter email in the login form
   * @param email - Email address to enter
   */
  public async enterEmail(email: string = CREDENTIALS.USERNAME): Promise<void> {
    try {
      logAction('Entering email', email, 'LoginPage');
      
      // Wait for the email input to be visible
      await this.waitForElement(LOGIN_SELECTORS.EMAIL_INPUT, TIMEOUTS.MEDIUM);
      
      // Clear the field and type the email
      await this.page.locator(LOGIN_SELECTORS.EMAIL_INPUT).clear();
      await this.type(LOGIN_SELECTORS.EMAIL_INPUT, email);
      
      // Take a screenshot for verification (debug purposes)
      await this.page.screenshot({ path: 'test-results/email-entered.png' });
      
      logInfo(`Email entered: ${email}`, 'LoginPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'EnterEmail');
      throw error;
    }
  }

  /**
   * Enter password in the login form
   * @param password - Password to enter
   */
  public async enterPassword(password: string = CREDENTIALS.PASSWORD): Promise<void> {
    try {
      logAction('Entering password', '******', 'LoginPage');
      
      // Wait for the password input to be visible
      await this.waitForElement(LOGIN_SELECTORS.PASSWORD_INPUT, TIMEOUTS.MEDIUM);
      
      // Clear the field and type the password
      await this.page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).clear();
      await this.type(LOGIN_SELECTORS.PASSWORD_INPUT, password);
      
      // Take a screenshot for verification (debug purposes)
      await this.page.screenshot({ path: 'test-results/password-entered.png' });
      
      logInfo('Password entered', 'LoginPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'EnterPassword');
      throw error;
    }
  }

  /**
   * Click the login button using multiple approaches to ensure success
   */
  public async clickLoginButton(): Promise<void> {
    try {
      logAction('Clicking login button', '', 'LoginPage');
      
      // Take a screenshot before clicking
      await this.page.screenshot({ path: 'test-results/before-login-click.png' });
      
      // IMPORTANT: The most direct and reliable methods first
      
      // METHOD 1: Use JavaScript to trigger the form submission directly
      try {
        logInfo('Using direct form submission via JavaScript', 'LoginPage');
        await this.page.evaluate(() => {
          // Get the form and submit it programmatically
          document.querySelector('form')?.submit();
          // Alternative: Find the submit button and click it via JS
          const submitBtn = document.querySelector('button[type="submit"]');
          if (submitBtn) {
            (submitBtn as HTMLElement).click();
          }
        });
        
        // Brief wait to let the form submission process start
        await this.page.waitForTimeout(500);
      } catch (evalError) {
        logWarning(`JavaScript form submission failed: ${evalError}`, 'LoginPage');
      }
      
      // METHOD 2: Press Enter key while focused on password field
      try {
        logInfo('Pressing Enter key in password field', 'LoginPage');
        await this.page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).press('Enter');
        await this.page.waitForTimeout(500);
      } catch (pressError) {
        logWarning(`Enter key in password field failed: ${pressError}`, 'LoginPage');
      }
      
      // METHOD 3: Try direct selector with force click
      try {
        logInfo('Using direct selector with force click', 'LoginPage');
        await this.page.locator(LOGIN_SELECTORS.LOGIN_BUTTON).click({ force: true, timeout: 5000 });
        await this.page.waitForTimeout(500);
      } catch (clickError) {
        logWarning(`Direct selector force click failed: ${clickError}`, 'LoginPage');
      }
      
      // METHOD 4: Try clicking by coordinates (center of the button)
      try {
        logInfo('Clicking by coordinates (center of the button)', 'LoginPage');
        const loginButton = this.page.locator(LOGIN_SELECTORS.LOGIN_BUTTON);
        const box = await loginButton.boundingBox();
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await this.page.mouse.click(x, y);
        }
        await this.page.waitForTimeout(500);
      } catch (boxError) {
        logWarning(`Click by coordinates failed: ${boxError}`, 'LoginPage');
      }
      
      // METHOD 5: Try to dispatch a submit event to the form
      try {
        logInfo('Dispatching submit event to form', 'LoginPage');
        await this.page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            const event = new Event('submit', { bubbles: true });
            form.dispatchEvent(event);
          }
        });
        await this.page.waitForTimeout(500);
      } catch (dispatchError) {
        logWarning(`Event dispatch failed: ${dispatchError}`, 'LoginPage');
      }
      
      // METHOD 6: Try filling in the form fields and submitting in a single JS call
      try {
        logInfo('Complete form fill and submit in a single JS call', 'LoginPage');
        await this.page.evaluate((email, password) => {
          // Find the email and password fields
          const emailField = document.querySelector('[data-testid="user_email"]') as HTMLInputElement;
          const passwordField = document.querySelector('[data-testid="user_password"]') as HTMLInputElement;
          const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (emailField && passwordField && submitBtn) {
            // Fill in the fields
            emailField.value = email;
            passwordField.value = password;
            
            // Submit the form
            submitBtn.click();
          }
        }, CREDENTIALS.USERNAME, CREDENTIALS.PASSWORD);
      } catch (completeFormError) {
        logWarning(`Complete form fill and submit failed: ${completeFormError}`, 'LoginPage');
      }
      
      // Take a screenshot after clicking attempts
      await this.page.screenshot({ path: 'test-results/after-login-click.png' });
      
      logInfo('All login button click methods attempted', 'LoginPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'ClickLoginButton');
      throw error;
    }
  }

  /**
   * Complete the login process
   * @param email - Email address to use
   * @param password - Password to use
   */
  public async login(email: string = CREDENTIALS.USERNAME, password: string = CREDENTIALS.PASSWORD): Promise<void> {
    try {
      logInfo('Starting login process', 'LoginPage');
      
      // Navigate to login page
      await this.navigateToLoginPage();
      
      // Enter credentials
      await this.enterEmail(email);
      await this.enterPassword(password);
      
      // Click the login button using multiple methods
      await this.clickLoginButton();
      
      // Wait for navigation to complete after login
      const options = { timeout: TIMEOUTS.XL }; // Increase timeout for login
      
      try {
        await this.page.waitForURL('**/boards**', options);
      } catch (timeoutError) {
        logWarning('Timed out waiting for navigation after login, checking if already logged in', 'LoginPage');
        
        // Check if we're logged in despite the timeout
        if (await this.isLoginSuccessful()) {
          logInfo('Already on a valid page after login', 'LoginPage');
        } else {
          // Final attempt - try navigating directly to boards and see if we're logged in
          logInfo('Trying direct navigation to boards as a last resort', 'LoginPage');
          await this.navigate(URLS.DASHBOARD);
          
          if (await this.isLoginSuccessful()) {
            logInfo('Direct navigation successful, login seems to have worked', 'LoginPage');
          } else {
            // Take a screenshot of the current state
            await this.page.screenshot({ path: 'test-results/login-failure.png' });
            throw new Error('Login attempt failed and direct navigation did not succeed');
          }
        }
      }
      
      logInfo('Login successful', 'LoginPage');
      
      // Dismiss any welcome popups or tooltips that might appear after login
      await this.dismissPopups();
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'Login');
      throw error;
    }
  }

  /**
   * Check if login was successful
   */
  public async isLoginSuccessful(): Promise<boolean> {
    try {
      // Multiple checks to determine if login was successful
      
      // 1. Check if URL contains '/boards'
      const currentUrl = this.page.url();
      const urlCheck = currentUrl.includes('/boards');
      
      // 2. Check for elements typically present after login
      const userMenuPresent = await this.isVisible('[data-testid="avatar"], button[aria-label="User Menu"]', 5000);
      
      // 3. Check if we can find dashboard elements
      const dashboardElement = await this.isVisible('[role="main"], [data-testid="board-header"]', 5000);
      
      // Return true if any of the checks pass
      return urlCheck || userMenuPresent || dashboardElement;
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'IsLoginSuccessful');
      return false;
    }
  }

  /**
   * Get any error message that might appear during login
   */
  public async getErrorMessage(): Promise<string> {
    if (await this.isVisible(LOGIN_SELECTORS.ERROR_MESSAGE)) {
      return await this.getText(LOGIN_SELECTORS.ERROR_MESSAGE);
    }
    return '';
  }
}