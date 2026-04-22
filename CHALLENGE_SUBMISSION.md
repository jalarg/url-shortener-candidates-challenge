# Submission

Short notes for whoever reviews this.

## What I did

The starter had an in-memory `Map`, ugly UI, and that collision bug where you only get nine possible codes. I focused on getting **persistence and correctness** right first, then the UI.

I put **Prisma + SQLite** at the repo root and moved the work into `libs/engine` with a `ShortUrlService` and a small repository so create / list / resolve (and **recording a visit** on redirect) are not copy-pasted around the routes. Codes are **Base62** with **retries** if something collides. URLs are restricted to **http** / **https** and errors from validation show up in the form instead of a generic 500.

The **redirect** route was the one I didn’t want to get wrong: it goes through `resolveShortUrl` so the click count in the database actually moves when you hit a short link.

On the app side, `short-url.server.ts` stays thin, the list is paginated off the query string, and the form uses `useNavigation` so you see that something is happening when you submit. I replaced the starter UI with a simple dashboard (form, messages, table), reusing small components in a **shadcn**-ish style, and I used **`PUBLIC_URL`** so generated short links don’t point at the wrong host when you’re not on localhost. **Rate limiting** is IP-based, in memory, before the service, returning **429** with a message in the UI. Honest limit: it’s enough for a demo, not for multiple app servers without something shared behind them.

**Tests:** I spent time on **Vitest** in the engine (domain, repo with SQLite, service). I **didn’t get to real E2E** (e.g. Playwright) in the time I had, so that’s a gap and I call it out below.

**Docker** mounts `./data` and `start:docker` runs `prisma db push` before `pnpm --filter web start` so the container doesn’t start with an empty DB. I updated the **README** so the Docker path is copy-pasteable.

## What I would do with more time

- **E2E:** Add Playwright (happy path, bad URL, maybe pagination and a 429) and only then wire it into CI. I’d want it stable in CI, not only on my machine.
- **CI:** Typecheck, run Vitest, and maybe a coverage threshold on `libs/engine` for the important layers—not chasing 100%.
- **Ops:** Replace the in-memory limiter with **Redis** (or similar), add `/health`, structured logs, and basic metrics. That’s the “multiple instances” story.
- **Data:** Use **migrations** for real, document moving to **Postgres** for production, keep SQLite for local.
- **Product polish:** One-click copy for short links, clearer empty state in the list.

## AI usage

I used **Cursor** day to day, and a bit of **Opencode** as a second pair of eyes, same as I’d use any fast autocomplete plus chat: good for file layout, Prisma setup, and dropping in UI pieces. In both, I also leaned on **agents with skills** (project-specific or stack-focused checklists) when it made sense—mostly to move faster on repetitive steps and **catch silly mistakes** before they landed in a commit, not to outsource the design. I still traced the **redirect** and error paths myself—those are the things that are easy to break and annoying to debug later.

I didn’t paste in a “solution” and ship it. The useful prompts were the boring ones: how to keep **Vitest** against a real SQLite file from turning into spaghetti, and where to put the repository so the web app doesn’t own business rules.

## Feedback

I liked that the **starter is incomplete**; you can’t just grind features. The **~2h** budget is real—worth saying in the README that first install or Docker can take a while so nobody thinks the process hung.

I’m fine with being allowed to use **AI** if you own the result. That’s how a lot of people work now; the important part is still reading what you commit.
