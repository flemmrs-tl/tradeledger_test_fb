import { Page } from '@playwright/test';
import { logInfo, logWarning } from './logger';

/**
 * Utility class to handle retries for flaky operations
 */
export class RetryHandler {
  /**
   * Execute a function with retry logic
   * @param fn - The function to execute
   * @param options - Retry options
   * @returns The result of the function
   */
  public static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      retryDelay?: number;
      name?: string;
      shouldRetry?: (error: unknown) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      retryDelay = 1000,
      name = 'operation',
      shouldRetry = () => true
    } = options;

    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // If it's not the first attempt, log that we're retrying
        if (attempt > 1) {
          logInfo(`Retry attempt ${attempt}/${maxAttempts} for ${name}`, 'RetryHandler');
        }
        
        // Execute the function
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (!shouldRetry(error)) {
          logWarning(`Not retrying ${name} due to error type: ${error}`, 'RetryHandler');
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxAttempts) {
          logWarning(`All ${maxAttempts} retry attempts for ${name} failed`, 'RetryHandler');
          throw error;
        }
        
        // Log the error and wait before retrying
        logWarning(`Attempt ${attempt}/${maxAttempts} for ${name} failed: ${error}`, 'RetryHandler');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // This should never happen due to the throw in the loop,
    // but TypeScript needs it for type safety
    throw lastError;
  }

  /**
   * Execute a function with retry logic and capture screenshots on failure
   * @param page - Playwright page
   * @param fn - The function to execute
   * @param options - Retry options including screenshot path
   * @returns The result of the function
   */
  public static async executeWithScreenshots<T>(
    page: Page,
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      retryDelay?: number;
      name?: string;
      screenshotPath?: string;
      shouldRetry?: (error: unknown) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      retryDelay = 1000,
      name = 'operation',
      screenshotPath = 'test-results',
      shouldRetry = () => true
    } = options;

    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // If it's not the first attempt, log that we're retrying
        if (attempt > 1) {
          logInfo(`Retry attempt ${attempt}/${maxAttempts} for ${name}`, 'RetryHandler');
        }
        
        // Execute the function
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Take a screenshot to help debug
        try {
          await page.screenshot({ 
            path: `${screenshotPath}/${name.replace(/\s+/g, '-')}-attempt-${attempt}-fail.png` 
          });
        } catch (screenshotError) {
          logWarning(`Failed to take screenshot: ${screenshotError}`, 'RetryHandler');
        }
        
        // Check if we should retry
        if (!shouldRetry(error)) {
          logWarning(`Not retrying ${name} due to error type: ${error}`, 'RetryHandler');
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxAttempts) {
          logWarning(`All ${maxAttempts} retry attempts for ${name} failed`, 'RetryHandler');
          throw error;
        }
        
        // Log the error and wait before retrying
        logWarning(`Attempt ${attempt}/${maxAttempts} for ${name} failed: ${error}`, 'RetryHandler');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // This should never happen due to the throw in the loop,
    // but TypeScript needs it for type safety
    throw lastError;
  }

  /**
   * Wait for a condition to be true with retry logic
   * @param condition - The condition function to check
   * @param options - Retry options
   * @returns True if the condition became true, false if timed out
   */
  public static async waitForCondition(
    condition: () => Promise<boolean>,
    options: {
      maxAttempts?: number;
      retryDelay?: number;
      name?: string;
    } = {}
  ): Promise<boolean> {
    const {
      maxAttempts = 10,
      retryDelay = 500,
      name = 'condition'
    } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Check the condition
        const result = await condition();
        
        // If the condition is true, return success
        if (result) {
          return true;
        }
        
        // If this was the last attempt, return failure
        if (attempt === maxAttempts) {
          logWarning(`Condition '${name}' did not become true after ${maxAttempts} attempts`, 'RetryHandler');
          return false;
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        // If this was the last attempt, return failure
        if (attempt === maxAttempts) {
          logWarning(`Error checking condition '${name}' after ${maxAttempts} attempts: ${error}`, 'RetryHandler');
          return false;
        }
        
        // Log the error and wait before retrying
        logWarning(`Error checking condition '${name}' on attempt ${attempt}: ${error}`, 'RetryHandler');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // This should never happen due to the return in the loop
    return false;
  }
}