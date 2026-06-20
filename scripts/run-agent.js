const { generatePost } = require('./generate-post');
const { createDraft, askApproval, publishPost } = require('../create-draft');

async function runAgent(topic) {
  console.log('STEP 1: generating post');
  await generatePost(topic);

  console.log('STEP 2: creating draft');
  const { browser, page } = await createDraft();

  console.log('STEP 3: waiting approval');
  const approved = await askApproval();

  if (approved) {
    console.log('STEP 4: publishing');
    await publishPost(page);
  } else {
    console.log('STEP 4: canceled');
  }

  await browser.close();
}

if (require.main === module) {
  const topic = process.argv[2];
  if (!topic) {
    console.error('Usage: node scripts/run-agent.js "<topic>"');
    process.exit(1);
  }
  runAgent(topic).catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { runAgent };
