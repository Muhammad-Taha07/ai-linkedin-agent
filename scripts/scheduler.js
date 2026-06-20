const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { createDraft, askApproval, publishPost } = require('../create-draft');
const { generatePost } = require('./generate-post');

const POST_PATH = path.resolve(__dirname, '..', 'posts', 'latest-post.txt');
let isRunning = false;

async function job() {
  if (isRunning) {
    console.log('Previous run still executing. Skipping this scheduled run.');
    return;
  }

  isRunning = true;
  console.log('Job started');

  let browser;

  try {
    const draftExists = fs.existsSync(POST_PATH);

    if (draftExists) {
      console.log('Unpublished draft found. Publishing it without generating new content.');
    } else {
      console.log('No pending draft. Generating new post...');
      await generatePost();
    }

    const { browser: br, page } = await createDraft();
    browser = br;

    const approved = await askApproval();

    if (!approved) {
      console.log('Post not approved. Cancelling publish.');
      await browser.close();
      browser = null;
      return;
    }

    console.log('Publishing post...');
    await publishPost(page);

    fs.rmSync(POST_PATH, { force: true });
    console.log('Draft file removed after successful publish.');

    console.log('Job finished');
  } catch (err) {
    console.error('Job failed:', err.message);
  } finally {
    if (browser) await browser.close();
    isRunning = false;
  }
}

cron.schedule('* * * * *', job);

console.log('Scheduler started. Will execute every minute.');
console.log('Flow: if latest-post.txt exists → publish it; otherwise → AI picks a topic, generates, drafts, publishes.');

if (require.main === module) {
  process.stdin.resume();
}
