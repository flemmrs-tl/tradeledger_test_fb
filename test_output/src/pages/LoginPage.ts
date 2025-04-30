import { Page } from '@playwright/test';
import BasePage from './BasePage';
import { LOGIN_SELECTORS, URLS, CREDENTIALS } from '../constants';
import { logAction, logInfo } from '../utils/logger';
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
    await this.navigate(URLS.LOGIN);
  }

  /**
   * Enter email in the login form
   * @param email - Email address to enter
   */
  public async enterEmail(email: string = CREDENTIALS.USERNAME): Promise<void> {
    try {
      logAction('Entering email', email, 'LoginPage');
      await this.type(LOGIN_SELECTORS.EMAIL_INPUT, email);
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
      await this.type(LOGIN_SELECTORS.PASSWORD_INPUT, password);
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
      await this.click(LOGIN_SELECTORS.LOGIN_BUTTON);
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
      await this.navigateToLoginPage();
      await this.enterEmail(email);
      await this.enterPassword(password);
      await this.clickLoginButton();
      
      // Wait for navigation to complete after login
      await this.page.waitForURL('**/boards**', { timeout: 30000 });
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
      // Check if URL contains '/boards' which indicates successful login
      const currentUrl = this.page.url();
      return currentUrl.includes('/boards');
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