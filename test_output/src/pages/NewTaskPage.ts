import { Page } from '@playwright/test';
import BasePage from './BasePage';
import { NEW_TASK_SELECTORS, TEST_DATA, TIMEOUTS } from '../constants';
import { logAction, logInfo } from '../utils/logger';
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
      
      // Wait for the input field to be ready
      await this.waitForElement(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, TIMEOUTS.MEDIUM);
      
      // Enter the task name
      await this.type(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, taskName);
      
      logInfo(`Entered task name: ${taskName}`, 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'EnterTaskName');
      throw error;
    }
  }

  /**
   * Click the Create Task button
   */
  public async clickCreateTaskButton(): Promise<void> {
    try {
      logAction('Clicking Create Task button', '', 'NewTaskPage');
      await this.click(NEW_TASK_SELECTORS.CREATE_TASK_BUTTON);
      
      // Wait for task to be created and page to update
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
      
      logInfo('Task created successfully', 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'ClickCreateTaskButton');
      throw error;
    }
  }

  /**
   * Click the Cancel button
   */
  public async clickCancelButton(): Promise<void> {
    try {
      logAction('Clicking Cancel button', '', 'NewTaskPage');
      await this.click(NEW_TASK_SELECTORS.CANCEL_BUTTON);
      logInfo('Cancelled task creation', 'NewTaskPage');
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
      
      // Dismiss any popups that might have appeared
      await this.dismissPopups();
      
      // Click the Create Task button
      await this.clickCreateTaskButton();
      
      // Wait for any additional processes to complete
      await this.page.waitForTimeout(1000);
      
      // Dismiss any popups that might appear after task creation
      await this.dismissPopups();
      
      logInfo(`Task "${taskName}" created successfully`, 'NewTaskPage');
    } catch (error) {
      await ErrorHandler.handleError(this.page, error as Error, 'CreateNewTask');
      throw error;
    }
  }

  /**
   * Check if the new task form is displayed
   */
  public async isNewTaskFormDisplayed(): Promise<boolean> {
    try {
      return await this.isVisible(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, TIMEOUTS.SHORT);
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
      
      // Wait for the task name input field to be visible
      await this.waitForElement(NEW_TASK_SELECTORS.TASK_TITLE_INPUT, TIMEOUTS.MEDIUM);
      
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