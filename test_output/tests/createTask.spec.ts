import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage, NewTaskPage } from '../src/pages';
import { TEST_DATA } from '../src/constants';
import { logInfo } from '../src/utils/logger';

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

    // Navigate to login page and login
    await loginPage.login();

    // Verify login was successful
    const isLoggedIn = await loginPage.isLoginSuccessful();
    expect(isLoggedIn).toBeTruthy();
    logInfo('Login successful', 'Test');

    // Allow some time for the dashboard to fully load
    await dashboardPage.waitForDashboardToLoad();

    // Dismiss any popups or tooltips that might be displayed
    await dashboardPage.dismissAllPopups();

    // Step 2: Navigate to New Task
    logInfo('Navigating to create a new task', 'Test');
    
    // Click New Task button
    await dashboardPage.clickNewTaskButton();
    
    // Verify we're on the new task page
    const isNewTaskFormDisplayed = await newTaskPage.isNewTaskFormDisplayed();
    expect(isNewTaskFormDisplayed).toBeTruthy();
    logInfo('New Task form displayed', 'Test');

    // Step 3: Create a new task with the specified name
    logInfo(`Creating a new task with name: ${TEST_DATA.TASK_NAME}`, 'Test');
    await newTaskPage.createNewTask(TEST_DATA.TASK_NAME);

    // Take a screenshot after task creation 
    await page.screenshot({ path: 'test-results/task-created.png' });
    
    logInfo('Test completed successfully', 'Test');
  });
});