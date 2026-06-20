# LinkedIn Post Agent

![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js)
![Playwright](https://img.shields.io/badge/playwright-v1.61-blue?logo=playwright)
![License](https://img.shields.io/badge/license-ISC-green)
![Status](https://img.shields.io/badge/status-active-success)
![PRs](https://img.shields.io/badge/PRs-welcome-orange)

Automated LinkedIn post pipeline: AI generates content, Playwright drafts & publishes it — with human approval before posting.

## Pipeline

```
Topic → [Generate Post] → [Open LinkedIn Composer] → [Paste & Screenshot] → [Approve?] → [Publish]
```

## Project Structure

```
├── scripts/
│   ├── generate-post.js   AI post generator
│   ├── run-agent.js       Full pipeline orchestrator
│   ├── scheduler.js       Cron-based auto-publisher
│   └── save-session.js    One-time LinkedIn login
├── create-draft.js        Opens LinkedIn, pastes, screenshots, publishes
├── save-session.js        Shorthand for scripts/save-session.js
├── auth/
│   └── linkedin.json      Saved Playwright session (cookies)
├── posts/
│   ├── latest-post.txt    Generated post content
│   └── draft.png          Screenshot of drafted post
├── config/                Future configuration
├── scheduler/             Future scheduling configs
└── .specify/              Spec-driven development artifacts
```

## Setup

```bash
npm install
npx playwright install chromium
```

Save your LinkedIn session (one-time — browser opens, you log in):

```bash
node save-session.js
```

## Usage

### One-step pipeline

```bash
node scripts/run-agent.js "Your topic here"
```

Flow:
1. AI generates a LinkedIn post on the topic
2. Browser opens LinkedIn, pastes content, takes a screenshot
3. Terminal prompts approval
4. On `y` → clicks Post; anything else → cancels

### Individual steps

```bash
node scripts/generate-post.js "Your topic"
node create-draft.js
```

### Scheduled execution

```bash
node scripts/scheduler.js
```

Runs the pipeline on a cron schedule. If `posts/latest-post.txt` exists, it publishes it; otherwise it generates a new post automatically.

## How It Works

- **Session management** — Playwright saves LinkedIn cookies after manual login for reuse
- **Post generation** — AI generates formatted LinkedIn posts (currently a mock generator; swap in any LLM)
- **Draft creation** — Opens LinkedIn feed, clicks "Start a post", pastes content into the editor, takes a screenshot
- **Human approval** — Prompts y/n before publishing; defaults to no
- **Publishing** — Clicks the LinkedIn Post button when approved
- **Safety** — Invalid input defaults to no-publish; scheduler prevents overlapping runs

## Dependencies

- Node.js
- Playwright (browser automation)
- node-cron (scheduling)
- dotenv (environment variables)

## TODO

- [ ] Replace mock AI generator with real LLM (OpenAI / OpenRouter / local model)
- [ ] Switch to headless mode for production
- [ ] Better error handling for expired sessions
- [ ] Multi-account support
- [ ] Post history and analytics

## License

ISC
