import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';
import { NEW_TASK_SELECTORS, TEST_DATA, TIMEOUTS } from '../constants';
import { logAction, logInfo, logWarning } from '../utils/logger';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Page object for the New Task page
 */
export default class NewTaskPage extends BasePage {
  /**
   * Constructor for the NewTaskPage class
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Enter the task name
   * @param taskName - Name of the task to create
   */
  public async enterTaskName(taskName: string = TEST_DATA.TASK_NAME): Promise<void> {
    try {
      logAction('Entering task name', taskName, 'NewTaskPage');
      
      // Try the modal dialog input field first
      let inputField = await this.findTaskInput();
      
      if (!inputField) {
        throw new Error('Could not find task name input field');
      }
      
      // Clear the field first
      await inputField.clear();
      
      // Enter the task name
      await inputField.fill(taskName);
      
      logInfo(`Entered task name: ${taskName}`, 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'EnterTaskName');
      throw error;
    }
  }

  /**
   * Find the task input field, checking multiple possible selectors
   */
  private async findTaskInput(): Promise<Locator | null> {
    try {
      // Check for the modal input field first
      if (await this.isVisible(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, 3000)) {
        return this.page.locator(NEW_TASK_SELECTORS.TASK_TITLE_INPUT).first();
      }
      
      // Check for inline editing
      if (await this.isVisible(NEW_TASK_SELECTORS.TASK_INLINE_EDIT, 3000)) {
        return this.page.locator(NEW_TASK_SELECTORS.TASK_INLINE_EDIT).first();
      }
      
      // Last resort - look for any visible input or textbox in a row
      const anyInput = this.page.locator('div[role="row"] input, div[role="row"] [role="textbox"]').first();
      if (await anyInput.isVisible()) {
        return anyInput;
      }
      
      logWarning('Could not find task input field with any selector', 'NewTaskPage');
      return null;
    } catch (error) {
      logWarning(`Error finding task input: ${(error as Error).message}`, 'NewTaskPage');
      return null;
    }
  }

  /**
   * Click the Create Task button if available
   */
  public async clickCreateTaskButton(): Promise<void> {
    try {
      logAction('Clicking Create Task button', '', 'NewTaskPage');
      
      // Check if the Create Task button exists
      if (await this.isVisible(NEW_TASK_SELECTORS.CREATE_TASK_BUTTON, 3000)) {
        await this.click(NEW_TASK_SELECTORS.CREATE_TASK_BUTTON);
        logInfo('Clicked Create Task button', 'NewTaskPage');
      } else {
        // If no button, we're likely in inline edit mode, so press Enter
        logInfo('No Create Task button found, pressing Enter to save', 'NewTaskPage');
        await this.page.keyboard.press('Enter');
      }
      
      // Wait for task to be created and page to update
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
      
      logInfo('Task created successfully', 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'ClickCreateTaskButton');
      throw error;
    }
  }

  /**
   * Click the Cancel button if available
   */
  public async clickCancelButton(): Promise<void> {
    try {
      if (await this.isVisible(NEW_TASK_SELECTORS.CANCEL_BUTTON, 3000)) {
        logAction('Clicking Cancel button', '', 'NewTaskPage');
        await this.click(NEW_TASK_SELECTORS.CANCEL_BUTTON);
        logInfo('Cancelled task creation', 'NewTaskPage');
      } else {
        // If no cancel button, we're likely in inline edit mode, so press Escape
        logInfo('No Cancel button found, pressing Escape to cancel', 'NewTaskPage');
        await this.page.keyboard.press('Escape');
      }
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'ClickCancelButton');
      throw error;
    }
  }

  /**
   * Create a new task with the given name
   * @param taskName - Name of the task to create
   */
  public async createNewTask(taskName: string = TEST_DATA.TASK_NAME): Promise<void> {
    try {
      logInfo(`Starting creation of new task: ${taskName}`, 'NewTaskPage');
      
      // Enter the task name
      await this.enterTaskName(taskName);
      
      // Wait a bit for any auto-saving or UI updates
      await this.page.waitForTimeout(1000);
      
      // Dismiss any popups that might have appeared
      await this.dismissPopups();
      
      // Click the Create Task button or press Enter to save
      await this.clickCreateTaskButton();
      
      // Wait for any additional processes to complete
      await this.page.waitForTimeout(2000);
      
      // Verify the task was created
      const taskExists = await this.verifyTaskCreated(taskName);
      
      if (taskExists) {
        logInfo(`Task "${taskName}" created successfully`, 'NewTaskPage');
      } else {
        logWarning(`Task "${taskName}" may not have been created properly`, 'NewTaskPage');
      }
      
      // Dismiss any popups that might appear after task creation
      await this.dismissPopups();
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'CreateNewTask');
      throw error;
    }
  }

  /**
   * Verify that the task was created successfully
   * @param taskName - The name of the task to verify
   */
  public async verifyTaskCreated(taskName: string = TEST_DATA.TASK_NAME): Promise<boolean> {
    try {
      // Multiple ways to check for task existence
      
      // 1. Look for a row containing the task name
      const taskRow = this.page.locator(`div[role="row"]:has-text("${taskName}")`);
      if (await taskRow.isVisible({ timeout: 5000 })) {
        return true;
      }
      
      // 2. Look for a gridcell with the task name
      const taskCell = this.page.locator(`[role="gridcell"]:has-text("${taskName}"), [role="cell"]:has-text("${taskName}")`);
      if (await taskCell.isVisible({ timeout: 3000 })) {
        return true;
      }
      
      // 3. Generic text search as a last resort
      const anyElement = this.page.locator(`:has-text("${taskName}")`);
      return await anyElement.isVisible({ timeout: 3000 });
    } catch (error) {
      logWarning(`Error verifying task creation: ${(error as Error).message}`, 'NewTaskPage');
      return false;
    }
  }

  /**
   * Check if the new task form is displayed
   */
  public async isNewTaskFormDisplayed(): Promise<boolean> {
    try {
      // Check for modal dialog or inline edit mode
      const modalInput = await this.isVisible(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, TIMEOUTS.SHORT);
      const inlineInput = await this.isVisible(NEW_TASK_SELECTORS.TASK_INLINE_EDIT, TIMEOUTS.SHORT);
      
      return modalInput || inlineInput;
    } catch (error) {
      logInfo(`Error checking if new task form is displayed: ${(error as Error).message}`, 'NewTaskPage');
      return false;
    }
  }

  /**
   * Wait for the New Task page to load
   */
  public async waitForNewTaskPageToLoad(): Promise<void> {
    try {
      logAction('Waiting for New Task page to load', '', 'NewTaskPage');
      
      // Try to locate any task input
      const inputField = await this.findTaskInput();
      
      if (!inputField) {
        throw new Error('New task form did not load properly');
      }
      
      // Dismiss any popups that might appear
      await this.dismissPopups();
      
      // Wait for any additional elements to load
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT });
      
      logInfo('New Task page loaded', 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'WaitForNewTaskPageToLoad');
      throw error;
    }
  }
}