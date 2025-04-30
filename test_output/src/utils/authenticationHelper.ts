import { Page } from '@playwright/test';
import { CREDENTIALS, URLS, TIMEOUTS } from '../constants';
import { logInfo, logWarning } from './logger';

/**
 * Special helper for authentication that provides multiple strategies
 * when the regular login process fails
 */
export class AuthenticationHelper {
  /**
   * Attempt to set authentication cookies directly
   * This approach skips the login page entirely
   * @param page - Playwright page
   * @returns true if successful, false otherwise
   */
  public static async setAuthCookiesDirectly(page: Page): Promise<boolean> {
    try {
      logInfo('Attempting to set authentication cookies directly', 'AuthHelper');
      
      // Take screenshot before attempting
      await page.screenshot({ path: 'test-results/before-direct-auth.png' });
      
      // Go to the login page first to get initial cookies
      await page.goto(URLS.LOGIN, { waitUntil: 'networkidle' });
      
      // Use context.addCookies to set auth cookies
      // Note: This is just a demonstration - actual cookies would need to be captured
      // from a successful manual login
      await page.context().addCookies([
        {
          name: 'monday_logged_in_user',
          value: 'true',
          domain: 'tldgr.monday.com',
          path: '/',
        },
        {
          name: 'session_token',
          value: 'demo-token',  // This would be a real token in practice
          domain: 'tldgr.monday.com',
          path: '/',
        }
      ]);
      
      // Navigate to dashboard to see if cookies worked
      await page.goto(URLS.DASHBOARD, { waitUntil: 'networkidle', timeout: TIMEOUTS.MEDIUM });
      
      // Take screenshot after attempt
      await page.screenshot({ path: 'test-results/after-direct-auth.png' });
      
      // Check if we're logged in
      const isLoggedIn = 
        page.url().includes('/boards') && 
        !page.url().includes('login');
      
      if (isLoggedIn) {
        logInfo('Direct cookie authentication successful', 'AuthHelper');
      } else {
        logWarning('Direct cookie authentication failed', 'AuthHelper');
      }
      
      return isLoggedIn;
    } catch (error) {
      logWarning(`Direct cookie authentication error: ${error}`, 'AuthHelper');
      return false;
    }
  }
  
  /**
   * Bypass login by directly navigating to dashboard 
   * and filling auto-login form if it appears
   * @param page - Playwright page
   * @returns true if successful, false otherwise
   */
  public static async directNavigationBypass(page: Page): Promise<boolean> {
    try {
      logInfo('Attempting login bypass via direct navigation', 'AuthHelper');
      
      // Take screenshot before attempting
      await page.screenshot({ path: 'test-results/before-nav-bypass.png' });
      
      // Navigate directly to boards
      await page.goto(URLS.DASHBOARD, { waitUntil: 'networkidle', timeout: TIMEOUTS.MEDIUM });
      
      // Check if we landed on login page
      if (page.url().includes('login')) {
        logInfo('Landed on login page, attempting auto-login', 'AuthHelper');
        
        // Fill login form
        await page.fill('[data-testid="user_email"]', CREDENTIALS.USERNAME);
        await page.fill('[data-testid="user_password"]', CREDENTIALS.PASSWORD);
        
        // Try multiple submit methods
        try {
          await page.click('button[type="submit"]', { force: true, timeout: 5000 });
        } catch (e) {
          logWarning(`Click failed: ${e}`, 'AuthHelper');
          
          // Try form submission via JavaScript
          await page.evaluate(() => {
            document.querySelector('form')?.submit();
          });
        }
        
        // Wait for navigation
        await page.waitForURL('**/boards**', { timeout: TIMEOUTS.MEDIUM });
      }
      
      // Take screenshot after attempt
      await page.screenshot({ path: 'test-results/after-nav-bypass.png' });
      
      // Check if we're logged in
      const isLoggedIn = 
        page.url().includes('/boards') && 
        !page.url().includes('login');
      
      if (isLoggedIn) {
        logInfo('Direct navigation bypass successful', 'AuthHelper');
      } else {
        logWarning('Direct navigation bypass failed', 'AuthHelper');
      }
      
      return isLoggedIn;
    } catch (error) {
      logWarning(`Direct navigation bypass error: ${error}`, 'AuthHelper');
      return false;
    }
  }
  
  /**
   * Use localStorage to set authentication state
   * @param page - Playwright page
   * @returns true if successful, false otherwise
   */
  public static async setLocalStorageAuth(page: Page): Promise<boolean> {
    try {
      logInfo('Attempting authentication via localStorage', 'AuthHelper');
      
      // Navigate to site first
      await page.goto(URLS.LOGIN, { waitUntil: 'networkidle' });
      
      // Set localStorage items that might indicate logged in state
      await page.evaluate(() => {
        localStorage.setItem('logged_in', 'true');
        localStorage.setItem('user_email', 'flemming.bengtsen@tradeledger.io');
      });
      
      // Navigate to dashboard
      await page.goto(URLS.DASHBOARD, { waitUntil: 'networkidle', timeout: TIMEOUTS.MEDIUM });
      
      // Check if we're logged in
      const isLoggedIn = 
        page.url().includes('/boards') && 
        !page.url().includes('login');
      
      if (isLoggedIn) {
        logInfo('localStorage authentication successful', 'AuthHelper');
      } else {
        logWarning('localStorage authentication failed', 'AuthHelper');
      }
      
      return isLoggedIn;
    } catch (error) {
      logWarning(`localStorage authentication error: ${error}`, 'AuthHelper');
      return false;
    }
  }
  
  /**
   * Try ALL authentication methods
   * This is the "nuclear option" when nothing else works
   * @param page - Playwright page
   * @returns true if any method succeeded, false if all failed
   */
  public static async tryAllAuthMethods(page: Page): Promise<boolean> {
    logInfo('🔴 NUCLEAR OPTION: Trying all authentication methods', 'AuthHelper');
    
    // Method 1: Regular form submission via JavaScript
    try {
      logInfo('Nuclear Option - Method 1: Form submission', 'AuthHelper');
      await page.goto(URLS.LOGIN, { waitUntil: 'networkidle' });
      
      await page.fill('[data-testid="user_email"]', CREDENTIALS.USERNAME);
      await page.fill('[data-testid="user_password"]', CREDENTIALS.PASSWORD);
      
      // Submit via JS
      await page.evaluate(() => {
        document.querySelector('form')?.submit();
      });
      
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/boards')) {
        logInfo('Nuclear Option - Method 1 succeeded!', 'AuthHelper');
        return true;
      }
    } catch (e) {
      logWarning(`Nuclear Option - Method 1 failed: ${e}`, 'AuthHelper');
    }
    
    // Method 2: Direct navigation bypass
    try {
      if (await this.directNavigationBypass(page)) {
        logInfo('Nuclear Option - Method 2 succeeded!', 'AuthHelper');
        return true;
      }
    } catch (e) {
      logWarning(`Nuclear Option - Method 2 failed: ${e}`, 'AuthHelper');
    }
    
    // Method 3: Cookie attempt
    try {
      if (await this.setAuthCookiesDirectly(page)) {
        logInfo('Nuclear Option - Method 3 succeeded!', 'AuthHelper');
        return true;
      }
    } catch (e) {
      logWarning(`Nuclear Option - Method 3 failed: ${e}`, 'AuthHelper');
    }
    
    // Method 4: localStorage attempt
    try {
      if (await this.setLocalStorageAuth(page)) {
        logInfo('Nuclear Option - Method 4 succeeded!', 'AuthHelper');
        return true;
      }
    } catch (e) {
      logWarning(`Nuclear Option - Method 4 failed: ${e}`, 'AuthHelper');
    }
    
    // Method 5: Session storage attempt
    try {
      logInfo('Nuclear Option - Method 5: sessionStorage', 'AuthHelper');
      
      // Navigate to site first
      await page.goto(URLS.LOGIN, { waitUntil: 'networkidle' });
      
      // Set sessionStorage items
      await page.evaluate(() => {
        sessionStorage.setItem('logged_in', 'true');
        sessionStorage.setItem('user_email', 'flemming.bengtsen@tradeledger.io');
      });
      
      // Navigate to dashboard
      await page.goto(URLS.DASHBOARD, { waitUntil: 'networkidle' });
      
      if (page.url().includes('/boards') && !page.url().includes('login')) {
        logInfo('Nuclear Option - Method 5 succeeded!', 'AuthHelper');
        return true;
      }
    } catch (e) {
      logWarning(`Nuclear Option - Method 5 failed: ${e}`, 'AuthHelper');
    }
    
    // All methods failed
    logWarning('🔴 NUCLEAR OPTION: All authentication methods failed', 'AuthHelper');
    return false;
  }
}