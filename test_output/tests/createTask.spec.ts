import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage, NewTaskPage } from '../src/pages';
import { TEST_DATA, TIMEOUTS } from '../src/constants';
import { logInfo, logWarning } from '../src/utils/logger';

/**
 * Test suite for creating a new task in Monday.com
 */
test.describe('Task Creation', () => {
  test('Login and create a new task', async ({ page }) => {
    // Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const newTaskPage = new NewTaskPage(page);

    // Step 1: Login to the application
    logInfo('Starting test: Login and create a new task', 'Test');

    try {
      // Navigate to login page and login
      await loginPage.login();

      // Verify login was successful
      const isLoggedIn = await loginPage.isLoginSuccessful();
      expect(isLoggedIn).toBeTruthy();
      logInfo('Login successful', 'Test');

      // Wait for dashboard to fully load with increased timeout
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.LONG });
      await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
      await dashboardPage.waitForDashboardToLoad();

      // Take a screenshot after login
      await page.screenshot({ path: 'test-results/dashboard-loaded.png' });

      // Dismiss any popups or tooltips that might be displayed
      await dashboardPage.dismissAllPopups();

      // Step 2: Navigate to New Task
      logInfo('Navigating to create a new task', 'Test');
      
      // Handle any Gantt view tooltips specifically
      await dashboardPage.dismissGanttTooltip();
      
      // Add a retry mechanism for clicking the New Task button
      let attempts = 0;
      const maxAttempts = 3;
      let taskFormDisplayed = false;
      
      while (attempts < maxAttempts && !taskFormDisplayed) {
        try {
          // Click New Task button with a retry mechanism
          await dashboardPage.clickNewTaskButton();
          
          // Verify we're on the new task page/form
          taskFormDisplayed = await newTaskPage.isNewTaskFormDisplayed();
          
          if (taskFormDisplayed) {
            logInfo('New Task form displayed', 'Test');
            break;
          } else {
            // Take a screenshot to help debug
            await page.screenshot({ path: `test-results/task-form-attempt-${attempts+1}.png` });
            logWarning(`New Task form not displayed on attempt ${attempts+1}`, 'Test');
            
            // Wait before retrying
            await page.waitForTimeout(2000);
          }
        } catch (error) {
          logWarning(`Error on attempt ${attempts+1}: ${error}`, 'Test');
          await page.screenshot({ path: `test-results/error-attempt-${attempts+1}.png` });
        }
        
        attempts++;
      }
      
      expect(taskFormDisplayed).toBeTruthy();

      // Step 3: Create a new task with the specified name
      logInfo(`Creating a new task with name: ${TEST_DATA.TASK_NAME}`, 'Test');
      await newTaskPage.createNewTask(TEST_DATA.TASK_NAME);

      // Step 4: Verify task was created
      const taskCreated = await newTaskPage.verifyTaskCreated(TEST_DATA.TASK_NAME);
      expect(taskCreated).toBeTruthy();
      logInfo(`Task "${TEST_DATA.TASK_NAME}" verified as created`, 'Test');

      // Take a screenshot after task creation for evidence
      await page.screenshot({ path: 'test-results/task-created.png' });
      
      logInfo('Test completed successfully', 'Test');
    } catch (error) {
      // Capture error evidence
      logWarning(`Test failed: ${error}`, 'Test');
      await page.screenshot({ path: 'test-results/test-failed.png' });
      
      // Re-throw to fail the test
      throw error;
    }
  });
  
  // Add a retry policy for the entire test 
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      logInfo(`Test status: ${testInfo.status}. Capturing final evidence.`, 'Test');
      await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
    }
  });
});