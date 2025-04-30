import { Page, Locator, expect } from '@playwright/test';
import { logAction, logError, logInfo } from '../utils/logger';
import { ErrorHandler } from '../utils/errorHandler';
import { TIMEOUTS } from '../constants';

/**
 * Base page object that handles common actions and provides utility functions
 * All page objects should extend this class
 */
export default class BasePage {
  /**
   * Constructor for the BasePage class
   * @param page - Playwright Page object
   */
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to
   */
  public async navigate(url: string): Promise<void> {
    try {
      logAction('Navigating', url, 'BasePage');
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      logInfo(`Navigated to ${url}`, 'BasePage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'Navigation');
      throw error;
    }
  }

  /**
   * Wait for an element to be visible
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  public async waitForElement(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<Locator> {
    try {
      logAction('Waiting for element', selector, 'BasePage');
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout });
      return element;
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, `WaitForElement: ${selector}`);
      throw error;
    }
  }

  /**
   * Click on an element
   * @param selector - Element selector
   * @param options - Click options
   */
  public async click(selector: string, options?: { force?: boolean, timeout?: number }): Promise<void> {
    try {
      logAction('Clicking', selector, 'BasePage');
      const timeout = options?.timeout || TIMEOUTS.MEDIUM;
      const element = await this.waitForElement(selector, timeout);
      await element.click({ force: options?.force, timeout });
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, `Click: ${selector}`);
      throw error;
    }
  }

  /**
   * Type text into an input field
   * @param selector - Element selector
   * @param text - Text to type
   */
  public async type(selector: string, text: string): Promise<void> {
    try {
      logAction(`Typing "${text}"`, selector, 'BasePage');
      const element = await this.waitForElement(selector);
      await element.fill(text);
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, `Type: ${selector}`);
      throw error;
    }
  }

  /**
   * Get text content of an element
   * @param selector - Element selector
   */
  public async getText(selector: string): Promise<string> {
    try {
      logAction('Getting text', selector, 'BasePage');
      const element = await this.waitForElement(selector);
      return await element.textContent() || '';
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, `GetText: ${selector}`);
      throw error;
    }
  }

  /**
   * Check if an element is visible
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  public async isVisible(selector: string, timeout: number = TIMEOUTS.SHORT): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible({ timeout });
    } catch (error) {
      logError(`Error checking visibility for ${selector}: ${(error as Error).message}`, error as Error, 'BasePage');
      return false;
    }
  }

  /**
   * Wait for an element to disappear
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  public async waitForElementToDisappear(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    try {
      logAction('Waiting for element to disappear', selector, 'BasePage');
      await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, `WaitForElementToDisappear: ${selector}`);
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param name - Name of the screenshot file
   */
  public async takeScreenshot(name: string): Promise<Buffer> {
    logAction('Taking screenshot', name, 'BasePage');
    return await this.page.screenshot({ path: `./screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Dismiss any popups or tooltips that might appear
   */
  public async dismissPopups(): Promise<void> {
    logAction('Dismissing popups', '', 'BasePage');
    
    // List of common popup/tooltip selectors
    const popupSelectors = [
      'button[aria-label="Close"]',
      '.tooltip-close-btn',
      '.close-button',
      '.dismiss-button',
      '.monday-style-dialog button[aria-label="Close"]'
    ];

    for (const selector of popupSelectors) {
      if (await this.isVisible(selector, TIMEOUTS.SHORT)) {
        await this.click(selector, { force: true });
        logInfo(`Dismissed popup: ${selector}`, 'BasePage');
        // Allow time for the animation to complete
        await this.page.waitForTimeout(500);
      }
    }
  }
}