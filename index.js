// // EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
// const { chromium } = require("playwright");

// async function sortHackerNewsArticles() {
//   // launch browser
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // go to Hacker News
//   await page.goto("https://news.ycombinator.com/newest");
// }

// (async () => {
//   await sortHackerNewsArticles();
// })();

// Import Playwright for browser automation
const { chromium, firefox, webkit } = require('playwright');

// Import file system module to handle file operations
const fs = require('fs');

// Ensure the 'screenshots/nodejs' folder exists
const screenshotsFolder = 'screenshots/nodejs';
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');  // Create 'screenshots' if it doesn't exist
}
if (!fs.existsSync(screenshotsFolder)) {
  fs.mkdirSync(screenshotsFolder);  // Create 'nodejs' inside 'screenshots' if it doesn't exist
}

// Define the list of browsers to test (Chromium, Firefox, WebKit)
(async () => {
  const browsers = [
    { name: 'Chromium', instance: chromium },
    { name: 'Firefox', instance: firefox },
    { name: 'WebKit', instance: webkit }
  ];

  // Initialize an array to store the results of the tests
  let testResults = [];

  // Loop through each browser for testing
  for (const browserType of browsers) {
    const browser = await browserType.instance.launch();
    const page = await browser.newPage();

    try {
      // Navigate to the Hacker News "newest" page
      await page.goto('https://news.ycombinator.com/newest');
      
      // Wait for the articles to load by waiting for the article selector before continuing
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

      // Log the result of the validation and store it in the testResults array
      const resultMessage = sortedCorrectly
        ? `✔️ ${browserType.name}: Validation successful, articles are sorted correctly.\n`
        : `❌ ${browserType.name}: Validation failed, articles are not sorted correctly.\n`;

      // Log results to console
      console.log(resultMessage);

      // Store the result in the test results array testResults
      testResults.push({
        browser: browserType.name,
        result: sortedCorrectly ? 'success' : 'failure',
        timestamp: new Date().toISOString()
      });

      // Capture a full-page screenshot if validation fails
      if (!sortedCorrectly) {
        const screenshotPath = `${screenshotsFolder}/node_${browserType.name}_failure_screenshot.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`❌ Validation failed.\n📷 Full-page screenshot saved to ${screenshotPath}`);
      }

    } 
    
    // Handle any errors and log them
    catch (error) {
      const errorMessage = `${browserType.name}: Test failed with error: ${error.message}\n`;
      console.error(errorMessage);
      
      testResults.push({
        browser: browserType.name,
        result: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Capture a full-page screenshot if an error occurs
      const screenshotPath = `${screenshotsFolder}/node_${browserType.name}_error_screenshot.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`❌ Error occurred.\n📷 Full-page screenshot saved to ${screenshotPath}`);
    }

    // Close the browser after testing
    await browser.close();
  }

  // Log the test results to a JSON file test_results.json
  const resultsFilePath = 'test_results.json';
  fs.writeFileSync(resultsFilePath, JSON.stringify(testResults, null, 2));
  
  // Log confirmation after JSON results are written
  console.log(`📝 Test results have been logged to ${resultsFilePath}`);
})();
