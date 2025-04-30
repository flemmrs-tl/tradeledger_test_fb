import { Page } from '@playwright/test';
import { logError } from './logger';
import fs from 'fs';
import path from 'path';

/**
 * Custom Error class for test failures
 */
export class TestError extends Error {
  constructor(
    message: string,
    public readonly context?: string,
    public readonly screenshot?: Buffer,
    public readonly htmlDump?: string
  ) {
    super(message);
    this.name = 'TestError';
  }
}

/**
 * Handles errors during test execution
 */
export class ErrorHandler {
  private static readonly SCREENSHOTS_DIR = 'error-screenshots';
  private static readonly HTML_DUMPS_DIR = 'error-html-dumps';

  /**
   * Captures error evidence (screenshot and HTML) and logs error
   */
  public static async handleError(
    page: Page,
    error: Error,
    context: string
  ): Promise<TestError> {
    let screenshot: Buffer | undefined;
    let htmlDump: string | undefined;

    try {
      // Ensure directories exist
      this.ensureDirectoriesExist();

      // Capture screenshot
      screenshot = await page.screenshot({ fullPage: true });
      const screenshotPath = path.join(
        this.SCREENSHOTS_DIR,
        `${context}-${Date.now()}.png`
      );
      fs.writeFileSync(screenshotPath, screenshot);

      // Capture HTML content
      htmlDump = await page.content();
      const htmlPath = path.join(
        this.HTML_DUMPS_DIR,
        `${context}-${Date.now()}.html`
      );
      fs.writeFileSync(htmlPath, htmlDump);

      // Log the error with details
      logError(
        `Test failure in ${context}: ${error.message}`,
        error,
        'ErrorHandler'
      );

      return new TestError(error.message, context, screenshot, htmlDump);
    } catch (captureError) {
      // Log if evidence capture fails
      logError(
        `Failed to capture error evidence: ${(captureError as Error).message}`,
        captureError as Error,
        'ErrorHandler'
      );
      return new TestError(error.message, context);
    }
  }

  /**
   * Ensures required directories exist
   */
  private static ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.SCREENSHOTS_DIR)) {
      fs.mkdirSync(this.SCREENSHOTS_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(this.HTML_DUMPS_DIR)) {
      fs.mkdirSync(this.HTML_DUMPS_DIR, { recursive: true });
    }
  }
}