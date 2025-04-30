import { Page } from '@playwright/test';
import BasePage from './BasePage';
import { DASHBOARD_SELECTORS, URLS, TIMEOUTS } from '../constants';
import { logAction, logInfo, logWarning } from '../utils/logger';
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
      
      // Wait for the dashboard to become visible
      await this.waitForElement(DASHBOARD_SELECTORS.BOARD_HEADING, TIMEOUTS.MEDIUM);
      
      // Dismiss any popups or tooltips that might be blocking the button
      await this.dismissAllPopups();
      
      // Handle Gantt tooltip specifically as it often blocks the New Task button
      await this.dismissGanttTooltip();
      
      // Try the standard selector first
      let buttonVisible = await this.isVisible(DASHBOARD_SELECTORS.NEW_TASK_BUTTON, 5000);
      
      if (buttonVisible) {
        await this.click(DASHBOARD_SELECTORS.NEW_TASK_BUTTON);
      } else {
        // Try the alternative selector
        logInfo('Standard New Task button not found, trying alternative selector', 'DashboardPage');
        buttonVisible = await this.isVisible(DASHBOARD_SELECTORS.NEW_TASK_BUTTON_ALT, 5000);
        
        if (buttonVisible) {
          await this.click(DASHBOARD_SELECTORS.NEW_TASK_BUTTON_ALT);
        } else {
          logWarning('New Task button not found with either selector', 'DashboardPage');
          // Force the page to enter a new task mode by typing directly in the add task field
          const addTaskSelector = '[placeholder="+ Add task"]';
          if (await this.isVisible(addTaskSelector, 3000)) {
            await this.click(addTaskSelector);
            logInfo('Used add task field instead of button', 'DashboardPage');
          } else {
            throw new Error('Unable to find any task creation element');
          }
        }
      }
      
      // Wait for dialog or inline editing to appear
      await this.page.waitForTimeout(2000);
      
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
        
        // Try to find the close button
        if (await this.isVisible(DASHBOARD_SELECTORS.TOOLTIP_CLOSE, 2000)) {
          await this.click(DASHBOARD_SELECTORS.TOOLTIP_CLOSE);
        } else {
          // If close button not found, try clicking outside the tooltip
          await this.page.mouse.click(10, 10);
          logInfo('Clicked outside to dismiss tooltip', 'DashboardPage');
        }
        
        await this.waitForElementToDisappear(DASHBOARD_SELECTORS.TOOLTIP);
        logInfo('Tooltip dismissed', 'DashboardPage');
      }
    } catch (error) {
      // Just log the error but don't throw since this is not critical
      logInfo(`Failed to dismiss tooltip: ${(error as Error).message}`, 'DashboardPage');
    }
  }

  /**
   * Dismiss notification prompt if displayed
   */
  public async dismissNotificationPrompt(): Promise<void> {
    try {
      if (await this.isVisible(DASHBOARD_SELECTORS.NOTIFICATION_PROMPT, TIMEOUTS.SHORT)) {
        logAction('Dismissing notification prompt', '', 'DashboardPage');
        
        // Try to click the close button or Enable Now button
        if (await this.isVisible(DASHBOARD_SELECTORS.NOTIFICATION_CLOSE, 2000)) {
          await this.click(DASHBOARD_SELECTORS.NOTIFICATION_CLOSE);
          logInfo('Notification prompt dismissed', 'DashboardPage');
        }
      }
    } catch (error) {
      logInfo(`Failed to dismiss notification prompt: ${(error as Error).message}`, 'DashboardPage');
    }
  }

  /**
   * Dismiss Gantt tooltip which often blocks the New Task button
   */
  public async dismissGanttTooltip(): Promise<void> {
    try {
      if (await this.isVisible(DASHBOARD_SELECTORS.GANTT_TOOLTIP, TIMEOUTS.SHORT)) {
        logAction('Dismissing Gantt tooltip', '', 'DashboardPage');
        
        if (await this.isVisible(DASHBOARD_SELECTORS.GANTT_TOOLTIP_GOT_IT, 2000)) {
          await this.click(DASHBOARD_SELECTORS.GANTT_TOOLTIP_GOT_IT);
          await this.waitForElementToDisappear(DASHBOARD_SELECTORS.GANTT_TOOLTIP);
          logInfo('Gantt tooltip dismissed', 'DashboardPage');
        }
      }
    } catch (error) {
      logInfo(`Failed to dismiss Gantt tooltip: ${(error as Error).message}`, 'DashboardPage');
    }
  }

  /**
   * Dismiss all popups and tooltips
   */
  public async dismissAllPopups(): Promise<void> {
    await this.dismissNotificationPrompt();
    await this.dismissHelpDialog();
    await this.dismissTooltip();
    await this.dismissGanttTooltip();
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
      
      // Wait for the board heading to be visible to ensure we're on the correct page
      await this.waitForElement(DASHBOARD_SELECTORS.BOARD_HEADING, TIMEOUTS.MEDIUM);
      
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