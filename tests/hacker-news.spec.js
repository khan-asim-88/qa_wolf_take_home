// Import Playwright's test and assertion modules
const { test, expect } = require('@playwright/test');

// Import file system module to handle file operations
const fs = require('fs');

// Ensure the 'screenshots/playwright' folder exists
const screenshotsFolder = 'screenshots/playwright';
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');  // Create 'screenshots' if it doesn't exist
}
if (!fs.existsSync(screenshotsFolder)) {
  fs.mkdirSync(screenshotsFolder);  // Create 'playwright' inside 'screenshots' if it doesn't exist
}

// Test function for each browser
test.describe('Hacker News Sorting Validation', () => {
  test('Validate articles are sorted by time', async ({ page, browserName }) => {
    
    // Navigate to the Hacker News newest page
    await page.goto('https://news.ycombinator.com/newest');
    
    // Wait for the first article to load
    await page.waitForSelector('.athing');

    // Scrape the first 100 articles (title and age)
    const articles = await page.$$eval('.athing', rows => {
      return rows.slice(0, 100).map(row => {
        const titleElement = row.querySelector('.titleline a');
        const ageElement = row.querySelector('.age a');

        // Extract title and age, or use fallback messages if not found
        const title = titleElement ? titleElement.innerText : 'No title found';
        const age = ageElement ? ageElement.innerText : 'No age found';

        return { title, age };
      });
    });

    // Check if articles are sorted from newest to oldest
    let sortedCorrectly = true;
    for (let i = 0; i < articles.length - 1; i++) {
      const currentTime = new Date(articles[i].age);
      const nextTime = new Date(articles[i + 1].age);

      // Stop checking further if any article is out of order
      if (currentTime < nextTime) {
        sortedCorrectly = false;
        break;
      }
    }

    // Use Playwright's expect to assert that articles are sorted correctly
    expect(sortedCorrectly).toBe(true);

    // Capture a full-page screenshot if validation fails
    if (!sortedCorrectly) {
      const screenshotPath = `${screenshotsFolder}/playwright_${browserName}_failure_screenshot.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`❌ Validation failed.\n📷 Full-page screenshot saved to ${screenshotPath}`);
    }
  });

  // Capture a full-page screenshot if an error occurs during the test
  test.afterEach(async ({ page, browserName }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `${screenshotsFolder}/playwright_${browserName}_error_screenshot.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`❌ Error occurred.\n📷 Full-page screenshot saved to ${screenshotPath}`);
    }

    // Log confirmation after JSON results are written
    console.log('📝 Test results have been logged to playwright_test_results.json');
  });
});
