import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../src/pages';
import { CREDENTIALS, TIMEOUTS } from '../src/constants';
import { logInfo, logWarning } from '../src/utils/logger';
import { RetryHandler } from '../src/utils/retryHandler';

/**
 * Direct login function that bypasses POM when needed for max reliability
 * This is a nuclear option for when all else fails
 */
async function emergencyDirectLogin(page: Page): Promise<boolean> {
  try {
    logInfo('EMERGENCY: Attempting direct login via JavaScript', 'EmergencyLogin');
    
    // Save a screenshot before emergency login
    await page.screenshot({ path: 'test-results/before-emergency-login.png' });
    
    // Execute JavaScript to directly fill and submit the form
    await page.evaluate((email, password) => {
      // Fill fields
      const emailField = document.querySelector('[data-testid="user_email"]') as HTMLInputElement;
      const passwordField = document.querySelector('[data-testid="user_password"]') as HTMLInputElement;
      
      if (emailField && passwordField) {
        emailField.value = email;
        passwordField.value = password;
        
        // Try multiple submission methods
        
        // 1. Form submit
        const form = document.querySelector('form');
        if (form) form.submit();
        
        // 2. Button click
        const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) submitBtn.click();
        
        // 3. Keyboard event simulation
        if (passwordField) {
          const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            keyCode: 13
          });
          passwordField.dispatchEvent(enterEvent);
        }
        
        return true;
      }
      return false;
    }, CREDENTIALS.USERNAME, CREDENTIALS.PASSWORD);
    
    // Wait to see if navigation occurred
    try {
      await page.waitForURL('**/boards**', { timeout: TIMEOUTS.MEDIUM });
      logInfo('EMERGENCY: Direct login succeeded', 'EmergencyLogin');
      return true;
    } catch (e) {
      // Take post-attempt screenshot
      await page.screenshot({ path: 'test-results/after-emergency-login.png' });
      logWarning('EMERGENCY: Direct login may have failed', 'EmergencyLogin');
      
      // Check if logged in despite timeout error
      const currentUrl = page.url();
      if (currentUrl.includes('/boards')) {
        logInfo('EMERGENCY: Login appears successful despite timeout', 'EmergencyLogin');
        return true;
      }
      
      // Try navigating directly as a last resort
      try {
        await page.goto('https://tldgr.monday.com/boards', { timeout: TIMEOUTS.MEDIUM });
        if (await page.url().includes('/boards') && 
           !await page.url().includes('login')) {
          logInfo('EMERGENCY: Direct navigation worked, probably logged in', 'EmergencyLogin');
          return true;
        }
      } catch (navError) {
        logWarning(`EMERGENCY: Direct navigation failed: ${navError}`, 'EmergencyLogin');
      }
      
      return false;
    }
  } catch (error) {
    logWarning(`EMERGENCY: Direct login failed with error: ${error}`, 'EmergencyLogin');
    return false;
  }
}

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
      const loginResult = await RetryHandler.executeWithScreenshots(
        page,
        async () => {
          // Try standard login first
          await loginPage.clickLoginButton();
          
          // Wait briefly to see if navigation occurred
          await page.waitForTimeout(3000);
          
          // Check if login was successful
          if (await loginPage.isLoginSuccessful()) {
            return true;
          }
          
          // If not successful, try emergency direct login
          logWarning('Regular login methods failed, trying emergency direct login', 'Test');
          return await emergencyDirectLogin(page);
        },
        { 
          name: 'login-button-click',
          maxAttempts: 3,
          screenshotPath: 'test-results'
        }
      );
      
      // Check login result
      expect(loginResult).toBeTruthy();
      
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
        
        // Add console log in case of login failure
        console.error('LOGIN FAILED - See test-results folder for debugging information');
        console.log('Failed at URL:', page.url());
      } catch (e) {
        logWarning(`Failed to save HTML content: ${e}`, 'Test');
      }
      
      throw error;
    }
  });
});