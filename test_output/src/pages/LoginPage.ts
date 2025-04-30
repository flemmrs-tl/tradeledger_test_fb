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
   * Click the login button
   */
  public async clickLoginButton(): Promise<void> {
    try {
      logAction('Clicking login button', '', 'LoginPage');
      
      // Wait for the login button to be visible and enabled
      await this.waitForElement(LOGIN_SELECTORS.LOGIN_BUTTON, TIMEOUTS.MEDIUM);
      
      // Ensure button is clickable
      const loginButton = this.page.locator(LOGIN_SELECTORS.LOGIN_BUTTON);
      
      // Check if button is enabled
      const isEnabled = await loginButton.isEnabled();
      if (!isEnabled) {
        logWarning('Login button appears to be disabled', 'LoginPage');
      }
      
      // Take a screenshot before clicking
      await this.page.screenshot({ path: 'test-results/before-login-click.png' });
      
      // Try clicking with force option to ensure it works
      await loginButton.click({ force: true, timeout: TIMEOUTS.MEDIUM });
      
      // Additional press Enter as a backup method
      await this.page.keyboard.press('Enter');
      
      logInfo('Login button clicked', 'LoginPage');
      
      // Take a screenshot after clicking
      await this.page.screenshot({ path: 'test-results/after-login-click.png' });
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
      
      // Click the login button
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
          // Take a screenshot of the current state
          await this.page.screenshot({ path: 'test-results/login-failure.png' });
          throw timeoutError;
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