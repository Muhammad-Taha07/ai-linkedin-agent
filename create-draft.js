const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const STATE_PATH = path.resolve(__dirname, 'auth', 'linkedin.json');
const POST_PATH = path.resolve(__dirname, 'posts', 'latest-post.txt');
const SCREENSHOT_PATH = path.resolve(__dirname, 'posts', 'draft.png');

function readPostContent(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8').trim();

  if (!content) {
    throw new Error(`Post file is empty: ${filePath}`);
  }

  return content;
}

function askApproval() {
  return new Promise((resolve) => {
    console.log('Draft ready for review');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Approve this post? (y/n) ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();

      if (trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        console.log('Post not approved. Skipping publish.');
        resolve(false);
      }
    });
  });
}

async function createDraft() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  console.log('Feed loaded.');

  // Wait and check if session is valid
  await page.waitForTimeout(3000);

  const isLoggedIn = await page.evaluate(() => !window.location.href.includes('/login'));
  if (!isLoggedIn) {
    throw new Error('Session expired. Re-run: node save-session.js');
  }

  // Click "Start a post" using Playwright's getByRole
  const startPostBtn = page.getByRole('button', { name: /start a post/i });
  const btnCount = await startPostBtn.count();

  if (btnCount === 0) {
    // Fallback: click the share box area directly
    const shareBox = page.locator('.share-box-feed-entry, [data-view-name="share-box"]').first();
    if (await shareBox.count() > 0) {
      await shareBox.click();
    } else {
      throw new Error('Start a post button not found.');
    }
  } else {
    await startPostBtn.first().click();
  }
  console.log('Post composer opened.');

  await page.waitForTimeout(2000);

  const content = readPostContent(POST_PATH);

  // Find the editor: wait for contenteditable
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: 'attached', timeout: 10000 });
  await editor.click();
  await page.waitForTimeout(500);

  const lines = content.split('\n').filter(l => l.trim());
  for (let i = 0; i < lines.length; i++) {
    await page.keyboard.insertText(lines[i]);
    if (i < lines.length - 1) {
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(100);
  }
  console.log('Post content pasted.');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
  console.log(`Screenshot saved to ${SCREENSHOT_PATH}`);

  return { browser, page };
}

async function publishPost(page) {
  const postBtn = page.locator('button.share-actions__primary-action').first();
  await postBtn.waitFor({ state: 'attached', timeout: 10000 });

  // Scroll button into view and click via Playwright
  await postBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await postBtn.click();
  console.log('Post published.');
}

if (require.main === module) {
  (async () => {
    const { browser, page } = await createDraft();
    const approved = await askApproval();
    if (approved) {
      await publishPost(page);
    }
    await browser.close();
  })().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { createDraft, askApproval, publishPost };
