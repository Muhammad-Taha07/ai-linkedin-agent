const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // 1. Launch browser (VISIBLE)
  const browser = await chromium.launch({
    headless: false
  });

  // 2. Create a new context
  const context = await browser.newContext();

  // 3. Open new page
  const page = await context.newPage();

  // 4. Go to LinkedIn login
  await page.goto('https://www.linkedin.com/login');

  console.log('👉 Please login manually in the browser...');

  // 5. Wait until user is logged in
  // We detect LinkedIn feed (simple reliable check)
  await page.waitForURL('**/feed/**', { timeout: 0 });

  console.log('✅ Login detected, saving session...');

  // 6. Save storage state (cookies + session)
  await context.storageState({
    path: 'auth/linkedin.json'
  });

  console.log('🎉 Session saved successfully!');

  await browser.close();
})();