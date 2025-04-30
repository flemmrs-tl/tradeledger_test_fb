import { Page } from '@playwright/test';
import BasePage from './BasePage';
import { DASHBOARD_SELECTORS, URLS, TIMEOUTS } from '../constants';
import { logAction, logInfo } from '../utils/logger';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Page object for the Dashboard page
 */
export default class DashboardPage extends BasePage {
  /**
   * Constructor for the DashboardPage class
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the dashboard page
   */
  public async navigateToDashboard(): Promise<void> {
    try {
      await this.navigate(URLS.DASHBOARD);
      await this.dismissPopups();
      logInfo('Navigated to dashboard', 'DashboardPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'NavigateToDashboard');
      throw error;
    }
  }

  /**
   * Click on the "New Task" button
   */
  public async clickNewTaskButton(): Promise<void> {
    try {
      logAction('Clicking New Task button', '', 'DashboardPage');
      
      // Wait for any loading to complete
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
      
      // Dismiss any popups or tooltips that might be blocking the button
      await this.dismissPopups();
      
      // Find and click the New Task button
      await this.click(DASHBOARD_SELECTORS.NEW_TASK_BUTTON);
      
      // Wait for navigation or modal to appear
      await this.page.waitForTimeout(1000);
      
      logInfo('Clicked New Task button', 'DashboardPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'ClickNewTaskButton');
      throw error;
    }
  }

  /**
   * Navigate to the New Task page
   */
  public async navigateToNewTask(): Promise<void> {
    try {
      logAction('Navigating to New Task page', '', 'DashboardPage');
      await this.navigate(URLS.NEW_TASK);
      logInfo('Navigated to New Task page', 'DashboardPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'NavigateToNewTask');
      throw error;
    }
  }

  /**
   * Check if any help dialog is displayed
   */
  public async isHelpDialogDisplayed(): Promise<boolean> {
    return await this.isVisible(DASHBOARD_SELECTORS.HELP_DIALOG, TIMEOUTS.SHORT);
  }

  /**
   * Dismiss help dialog if displayed
   */
  public async dismissHelpDialog(): Promise<void> {
    try {
      if (await this.isHelpDialogDisplayed()) {
        logAction('Dismissing help dialog', '', 'DashboardPage');
        await this.click(DASHBOARD_SELECTORS.HELP_DIALOG_CLOSE);
        await this.waitForElementToDisappear(DASHBOARD_SELECTORS.HELP_DIALOG);
        logInfo('Help dialog dismissed', 'DashboardPage');
      }
    } catch (error) {
      // Just log the error but don't throw since this is not critical
      logInfo(`Failed to dismiss help dialog: ${(error as Error).message}`, 'DashboardPage');
    }
  }

  /**
   * Check if any tooltip is displayed
   */
  public async isTooltipDisplayed(): Promise<boolean> {
    return await this.isVisible(DASHBOARD_SELECTORS.TOOLTIP, TIMEOUTS.SHORT);
  }

  /**
   * Dismiss tooltip if displayed
   */
  public async dismissTooltip(): Promise<void> {
    try {
      if (await this.isTooltipDisplayed()) {
        logAction('Dismissing tooltip', '', 'DashboardPage');
        await this.click(DASHBOARD_SELECTORS.TOOLTIP_CLOSE);
        await this.waitForElementToDisappear(DASHBOARD_SELECTORS.TOOLTIP);
        logInfo('Tooltip dismissed', 'DashboardPage');
      }
    } catch (error) {
      // Just log the error but don't throw since this is not critical
      logInfo(`Failed to dismiss tooltip: ${(error as Error).message}`, 'DashboardPage');
    }
  }

  /**
   * Dismiss all popups and tooltips
   */
  public async dismissAllPopups(): Promise<void> {
    await this.dismissHelpDialog();
    await this.dismissTooltip();
    await this.dismissPopups(); // General popup dismissal from the base class
  }

  /**
   * Wait for dashboard to fully load
   */
  public async waitForDashboardToLoad(): Promise<void> {
    try {
      logAction('Waiting for dashboard to load', '', 'DashboardPage');
      
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
      
      // Dismiss any popups that appear
      await this.dismissAllPopups();
      
      // Wait a bit more to ensure everything is stable
      await this.page.waitForTimeout(1000);
      
      logInfo('Dashboard loaded', 'DashboardPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'WaitForDashboardToLoad');
      throw error;
    }
  }
}