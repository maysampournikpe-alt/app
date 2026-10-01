# Rumbo — Find your path. Encuentra tu rumbo.

Rumbo is a free, bilingual (English/Spanish) web app that helps middle and high school students find **real** opportunities near them and online — jobs, internships, competitions, camps, scholarships and more — build skills, and reach their goals. It was built for the 2026 Congressional App Challenge with students in the Rio Grande Valley of South Texas in mind.

- **Find** — tell the AI what you want in your own words; it searches the web, checks every link, flags scams, and explains why each result fits you.
- **Coach** — AI homework help that teaches step by step, mock interviews, debate practice, quizzes, essay feedback, plus daily challenges and flashcards.
- **Plan** — turn a big goal into weekly, monthly and yearly steps, with a deadline calendar and reminders.
- **People** — (planned) safe, moderated, group-only spaces.
- **Me** — profile, saved opportunities, progress, volunteer hours, resume builder, privacy controls.

Student data stays **on the student's own device**. See `PLAN.md` for the full design, `CHANGELOG.md` for what's built, and `CHALLENGES.md` for problems we solved.

---

## Run it on your computer

You need **Node.js 20 or newer** (https://nodejs.org).

```bash
npm install          # installs everything (also prepares the database code)
npm run dev          # starts the app at http://localhost:3000
```

That's it — the app works right away in **demo mode** (sample data, no AI costs).

### Turn on the real AI (optional)

1. Get an Anthropic API key at https://console.anthropic.com (Settings → API Keys). Set a monthly spending limit there too.
2. Copy `.env.example` to a new file named `.env.local`.
3. Paste your key after `ANTHROPIC_API_KEY=` and save.
4. Restart `npm run dev`.

The key is only read by the server and is never sent to the browser. `.env.local` is ignored by Git, so it won't be uploaded.

Cost controls (all in `.env.local`): daily searches per device (`DAILY_SEARCH_LIMIT`, default 15), coach messages (`DAILY_CHAT_LIMIT`, 60), other AI tools (`DAILY_TASK_LIMIT`, 30), and a whole-app daily budget (`DAILY_BUDGET_USD`, default $3). Searches are cached for 24 hours.

### Try the school features (demo codes)

| Who | Code | Where to use it |
|---|---|---|
| Student | `RGV-STUDENT` | Me → My profile → My school group |
| Teacher/counselor | `RGV-STAFF` | Go to `/staff` |
| Parent | `RGV-PARENT` | Me → My profile → My school group |
| Mentor | `RGV-MENTOR` | Me → My profile → My school group |

---

## Checks and tests

```bash
npm run lint        # code style
npm run typecheck   # TypeScript
npm test            # unit tests (translations, safety filters, link checking, calendar...)
npm run build       # production build
npm run test:e2e    # browser tests: every page at phone + desktop size, light + dark, accessibility checks
```

`test:e2e` uses Playwright. Run `npm run build` first; the tests start the app on port 3100.

---

## Put it online for free (Vercel)

1. Push this project to GitHub (it already is, if you're reading this there).
2. Go to https://vercel.com, sign in with GitHub, click **Add New → Project**, and pick this repository.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` (optional) and `HASH_SALT` (any long random text).
4. Click **Deploy**. In about two minutes you get a public `https://...vercel.app` link that works on phones and can be installed as an app.

**About the database on Vercel:** with no `DATABASE_URL`, the app uses a temporary SQLite file. Everything works, but shared data (staff posts, reviews, parent links) can reset when Vercel restarts the server. For a permanent database:

1. Create a free Postgres database (Supabase: https://supabase.com, or Neon: https://neon.tech) and copy its connection string.
2. Add it as `DATABASE_URL` in Vercel and in `.env.local`.
3. On your computer run `npm run db:use-postgres` then `npx prisma db push`, commit, and push.

---

## Project map

```
messages/       Translations (en, es, vi). Add a language = add a folder + one line in src/i18n/config.ts
prisma/         Database schema (server data only — never student personal data)
public/         Service worker (offline mode), icons, fonts
scripts/        Icon maker, database helpers, translation index
src/app/        Pages (each folder is a URL) and api/ (server routes — the only place the AI key is used)
src/components/ Reusable pieces, grouped by feature
src/data/       Hand-checked content: sample opportunities, plan templates, careers, colleges, guides
src/lib/        App logic: on-device store, safety filters, AI, calendar, rate limits
tests/          unit/ (Vitest) and e2e/ (Playwright)
```
