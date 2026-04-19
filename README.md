# IronFeed

**Log. Share. Get stronger.** A Strava-style social app for lifters, built with Next.js 14 App Router, Prisma, NextAuth, and the Anthropic API.

## Features

- **Workout logging** — Push / Pull / Legs categorisation, sets/reps/weight/RPE, automatic PR detection (Epley 1RM), rest timer with audio buzzer.
- **Social feed** — see workouts from people you follow, like & comment, PR badges, shareable Instagram-Stories-sized OG cards (1080×1920).
- **Viral loops** — weekly volume leaderboard, monthly `#IronChallenge`, referral link with +1 month free for both sides, K-factor admin dashboard.
- **Progress tracking** — top-set chart per lift, GitHub-style weekly volume heatmap, streak counter with daily-reminder cron stub.
- **IronCoach AI** — `/api/coach` streams workout history to Claude (`claude-opus-4-7`) for programme tweaks, plateau analysis, and a personalised 5-day PPL plan on signup.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (dark mode) |
| DB | PostgreSQL via Prisma |
| Auth | NextAuth (Google + email magic link) |
| AI | `@anthropic-ai/sdk` |
| OG images | `@vercel/og` |
| Charts | `recharts` |
| Deploy | Vercel |

## Getting started

```bash
# 1. install
pnpm install        # or: npm install / yarn

# 2. env
cp .env.example .env
# → fill in DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, etc.

# 3. database
pnpm prisma migrate dev --name init
pnpm db:seed        # 3 users, 2 weeks of PPL workouts, PRs, likes, 1 challenge

# 4. run
pnpm dev            # http://localhost:3000
```

Seed accounts (sign in with the email magic-link provider if configured):

- `alex@ironfeed.dev` — alex_lifts
- `sam@ironfeed.dev` — sam_strong
- `jordan@ironfeed.dev` — jordan_fit

Drop an MP3 at `public/sounds/buzzer.mp3` for the rest timer alert.

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Vercel Postgres / Supabase / Neon / Railway / local Docker) |
| `NEXTAUTH_URL` | ✅ | Full app URL, e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | optional | Google OAuth client secret |
| `EMAIL_SERVER` | optional | SMTP URL for magic-link sign-in (Resend / Mailtrap / …) |
| `EMAIL_FROM` | optional | From address for magic-link emails |
| `ANTHROPIC_API_KEY` | ✅ for coach | Enables `/api/coach` and onboarding programme generation |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL — used in referral links & OG cards |
| `ADMIN_EMAILS` | optional | Comma-separated admin email list — required to view `/admin` |
| `CRON_SECRET` | optional | Bearer token that `/api/cron/streak-reminder` expects |

At least one of Google OAuth **or** email magic-link must be set for sign-in to work.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server |
| `pnpm build` | `prisma generate && next build` — Vercel-ready |
| `pnpm start` | Run production build |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:push` | Push schema without migrations (dev only) |
| `pnpm db:seed` | Run `prisma/seed.ts` |
| `pnpm db:studio` | Open Prisma Studio |

## Folder structure

```
src/
├── app/                 # Next.js App Router (server components by default)
│   ├── (auth)/          # signin, onboarding
│   ├── (app)/           # authenticated shell — feed, workouts, progress, leaderboard, challenges, invite, coach, admin, profile
│   ├── api/             # auth, workouts, follow, leaderboard, coach, og/workout, invite, cron
│   ├── i/[code]/        # referral landing page
│   ├── layout.tsx       # root (dark mode)
│   └── page.tsx         # landing
├── components/
│   ├── feed/            # WorkoutCard, LikeButton, CommentBox
│   ├── workout/         # ExerciseLogger, RestTimer, PPLBadge
│   ├── progress/        # MaxWeightChart, VolumeHeatmap, StreakCounter
│   ├── nav/             # BottomNav, TopBar
│   ├── ui/              # Avatar
│   ├── PRBadge.tsx
│   └── Providers.tsx
├── lib/                 # prisma, auth, anthropic, pr, volume, streak, ppl, referral, cn
└── types/
prisma/
├── schema.prisma
└── seed.ts
public/
└── sounds/buzzer.mp3    # bring your own (see README inside)
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, create a new project and point it at the repo.
3. Add every env var from the table above in **Project Settings → Environment Variables**.
4. Provision Postgres (Vercel Postgres, Neon, Supabase…) and set `DATABASE_URL`.
5. Under **Storage → Database → Connection**, run the migration: either `pnpm prisma migrate deploy` locally against the production URL, or add a post-install step.
6. *(Optional)* Add a Vercel Cron hitting `/api/cron/streak-reminder` daily with `Authorization: Bearer $CRON_SECRET`.

## Key algorithms

- **PR detection** (`src/lib/pr.ts`) — for every exercise in a new workout, compute Epley estimated 1RM `weight × (1 + reps/30)` for each set, take the max, compare to the user's previous best on that exercise name. If greater, write a `PR` row linked to the workout.
- **Weekly volume leaderboard** (`src/app/api/leaderboard/route.ts`) — sum `weight × reps` across every set from the current user + everyone they follow, for workouts with `performedAt ≥ startOfWeek(now, Monday)`.
- **K-factor** (`src/lib/referral.ts`) — `(invitesPerUser) × (acceptanceRate)` from the `referredById` graph.

## Out of scope for this scaffold

- Real push notifications (VAPID / web-push) — the cron endpoint is wired up but sends nothing yet.
- A full admin view beyond K-factor.
- Tests.

PRs welcome. Get strong. 🏋️
