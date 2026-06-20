SESSION HANDOFF — LinkedIn Agent Pipeline
===========================================
Date: Sat Jun 20 2026

DONE
----
- Session save script (save-session.js)
- AI post generator (scripts/generate-post.js)
- Draft + screenshot (create-draft.js) — opens LinkedIn, pastes content, screenshots
- Human approval step (askApproval function) with y/n prompt, defaults to no
- Publish button click (publishPost function)
- Full orchestration (scripts/run-agent.js) — chains generate → draft → approve → publish
- Scheduler (scripts/scheduler.js) — cron-based, reads from posts/latest-post.txt, auto-publishes
- Guide (guide.txt) — full project docs

LAST STATE
----------
- Scheduler is set to run every minute (* * * * *) for testing
- Post button selector was failing — updated to use fallback: 
  button[aria-label="Post"]:not([disabled]), button:has-text("Post"):not([disabled])
  Timeout increased to 15s
- User was testing the scheduler and it failed at the Post button click

OPEN ISSUES
-----------
- Post button selector may need further tuning for LinkedIn's DOM
- Session in auth/linkedin.json may be stale (re-run save-session.js if needed)
- Content read from: posts/latest-post.txt
- Screenshot saved to: posts/draft.png

TO RESUME
---------
1. node scripts/scheduler.js   (runs every 60s — change cron back after testing)
2. Or manually: node scripts/run-agent.js "your topic"
3. Or step by step: node create-draft.js

NEXT LIKELY STEPS
-----------------
- Fix Post button selector if still failing (inspect LinkedIn's actual button HTML)
- Integrate real AI (replace generateWithAI mock in scripts/generate-post.js)
- Switch to headless mode for production
- Add error handling for expired sessions
