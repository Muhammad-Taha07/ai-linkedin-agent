const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  // Load saved session
  const context = await browser.newContext({
    storageState: 'auth/linkedin.json'
  });

  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/feed/');

  console.log('✅ Logged in automatically using saved session');

  await page.waitForTimeout(10000);

  await browser.close();
})();