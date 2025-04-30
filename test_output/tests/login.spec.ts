import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages';
import { CREDENTIALS, TIMEOUTS } from '../src/constants';
import { logInfo, logWarning } from '../src/utils/logger';
import { RetryHandler } from '../src/utils/retryHandler';

/**
 * Test suite specifically for login functionality
 */
test.describe('Login Functionality', () => {
  test('Should login successfully with valid credentials', async ({ page }) => {
    // Initialize login page
    const loginPage = new LoginPage(page);
    
    // For extra logging
    logInfo('Starting login test with credentials:', 'Test');
    logInfo(`Username: ${CREDENTIALS.USERNAME}`, 'Test');
    logInfo(`Password: ${CREDENTIALS.PASSWORD.charAt(0)}${'*'.repeat(CREDENTIALS.PASSWORD.length - 2)}${CREDENTIALS.PASSWORD.charAt(CREDENTIALS.PASSWORD.length - 1)}`, 'Test');
    
    try {
      // Navigate to login page
      await loginPage.navigateToLoginPage();
      await page.screenshot({ path: 'test-results/login-page.png' });
      
      // Enter email with verification
      await loginPage.enterEmail();
      const emailValue = await page.locator('[data-testid="user_email"]').inputValue();
      expect(emailValue).toBe(CREDENTIALS.USERNAME);
      logInfo(`Email field contains: ${emailValue}`, 'Test');
      
      // Enter password with verification
      await loginPage.enterPassword();
      const passwordField = page.locator('[data-testid="user_password"]');
      expect(await passwordField.isVisible()).toBeTruthy();
      expect(await passwordField.inputValue()).not.toBe('');
      logInfo('Password field is filled', 'Test');
      
      // Take a screenshot before clicking login
      await page.screenshot({ path: 'test-results/before-login-click.png' });
      
      // Click login button using different methods for robustness
      await RetryHandler.executeWithScreenshots(
        page,
        async () => {
          // Method 1: Using the page object
          await loginPage.clickLoginButton();
          
          // Method 2: Direct selector click as backup
          if (!await page.url().includes('/boards')) {
            logWarning('Login button click via page object may have failed, trying direct click', 'Test');
            await page.locator('button[type="submit"]').click({ force: true });
          }
          
          // Method 3: Form submission as last resort
          if (!await page.url().includes('/boards')) {
            logWarning('Direct click may have failed, trying form submission', 'Test');
            await page.evaluate(() => {
              // Submit any form on the page
              document.querySelector('form')?.submit();
            });
          }
          
          // Wait for navigation
          await page.waitForURL('**/boards**', { timeout: TIMEOUTS.XL });
        },
        { 
          name: 'login-button-click',
          maxAttempts: 3,
          screenshotPath: 'test-results'
        }
      );
      
      // Take a screenshot after login attempt
      await page.screenshot({ path: 'test-results/after-login-click.png' });
      
      // Verify login was successful
      const isLoggedIn = await loginPage.isLoginSuccessful();
      expect(isLoggedIn).toBeTruthy();
      
      // Log the current URL for verification
      logInfo(`Current URL after login: ${page.url()}`, 'Test');
      
      // Take a screenshot of the dashboard
      await page.screenshot({ path: 'test-results/dashboard.png' });
      
      logInfo('Login test completed successfully', 'Test');
    } catch (error) {
      // Capture failure state
      logWarning(`Login test failed: ${error}`, 'Test');
      await page.screenshot({ path: 'test-results/login-failure.png' });
      
      // Additional debugging info on failure
      try {
        const html = await page.content();
        require('fs').writeFileSync('test-results/page-content.html', html);
        logInfo('Saved page HTML content for debugging', 'Test');
      } catch (e) {
        logWarning(`Failed to save HTML content: ${e}`, 'Test');
      }
      
      throw error;
    }
  });
});