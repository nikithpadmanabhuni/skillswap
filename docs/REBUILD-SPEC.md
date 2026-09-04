# Part I — What This Project Is

## 1.1 One-sentence definition

**SkillSwap Campus is a peer-to-peer skill exchange marketplace for university students, where knowledge is the traded good and a platform currency called Karma settles trades that cannot be settled by direct barter.**

## 1.2 The problem it solves

A campus is dense with teachable expertise that never gets traded. A computer science student who wants to learn guitar sits fifty metres from a music student who wants to learn Python, and neither knows the other exists. Commercial tutoring platforms price students out; campus notice boards do not scale; study groups only work when everyone already wants the same thing.

The classical obstacle to any barter system is the **double coincidence of wants**: for A and B to trade directly, A must want exactly what B offers *and* B must want exactly what A offers. On a campus of a few thousand students, that condition is rarely met.

SkillSwap solves it three ways, in ascending order of sophistication:

| Mechanism | How it clears a trade | When it applies |
|---|---|---|
| **Direct mutual swap** | A teaches B, B teaches A. No currency changes hands. | Both parties want what the other offers. Rare but ideal. |
| **Karma-settled swap** | A teaches B and earns Karma. A later spends that Karma to learn from C. | One-sided want. This is the common case. |
| **3-way circular mesh** | A teaches B, B teaches C, C teaches A. A closed loop with no currency. | No pair matches, but a triangle does. |

Karma is the general-purpose solvent. The 3-way mesh is the distinguishing feature — it finds trades that a conventional 1:1 marketplace structurally cannot see.

## 1.3 Who it is for

- **Primary users:** undergraduate and postgraduate students at a single campus (multi-campus is a later expansion).
- **Secondary stakeholders:** campus services that honour Karma-redeemed perks (cafés, print stations, gyms, libraries), and the university department that sponsors the platform.

## 1.4 What exists today

A Flutter application — 15,240 lines of Dart across 56 files, 25 screens, backed by Firebase Auth and Cloud Firestore. Deployed as a web build to GitHub Pages.

The presentation layer is genuinely good: clean feature-folder architecture, three themes, responsive across mobile/tablet/desktop, zero static-analyzer findings. The trust layer is not. A companion audit (`docs/AUDIT.md`) documents three blocking defects and a set of correctness bugs. **This rebuild is the remedy for those defects, not merely a change of framework** — Part V explains which ones the new architecture retires structurally.

> **Terminology note.** This document uses the honest names for two features. The existing "1080p HD Video Calling" is a UI mockup with no WebRTC dependency of any kind; the existing "SwapBot AI" is a keyword router returning hardcoded strings. Both are marked accordingly throughout, and Part IV states what it would cost to make each real.


# Part II — How It Works

## 2.1 The Karma economy

Karma is the unit of account. It is earned by teaching and spent on learning or on campus perks.

**Current rules, as implemented:**

| Event | Karma effect |
|---|---|
| Account creation | +60 (starting grant) |
| Teach a session (on review submission) | +10 to the teacher |
| Learn a session (on review submission) | -10 from the learner |
| Complete a 3-way mesh | +10 to each participant |
| Redeem a perk | -40 to -100, per perk |

**Design intent:** the economy should be closed. Every Karma credited to a teacher is debited from a learner, so total supply changes only through the joining grant and perk redemption (a sink).

**Current reality:** it is not closed. The existing implementation debits the learner in the database but credits the teacher only in local memory, so Karma is destroyed on every completed session. The rebuild must implement settlement as a single atomic server-side transaction. This is a hard requirement, not a nicety.

**Also to reconcile:** the marketing copy claims +50/hour and +100 per mesh; the code awards 10 and 10. Pick one set of numbers, define them in one server-side config, and use them everywhere.

## 2.2 The matching engine

Pure, dependency-free logic operating on a user's `skillsOffered` and `skillsWanted` lists. It is the strongest part of the existing codebase and should be ported closely.

**Skill similarity** is fuzzy, deliberately, because students type free text:

1. Exact substring containment either direction (`"Flutter"` matches `"Flutter Development"`).
2. Word-level overlap on tokens of three or more characters.
3. Failing both, a shared category counts as a weak match.

**1:1 match scoring:**

- Mutual match (each party wants what the other offers): base **95**, +5 if the peer's rating is 4.8 or higher.
- One-way match: base **75**, plus up to 15 scaled by peer rating.
- Same-campus is surfaced in the explanation text.
- Results sort mutual-first, then by score descending.

**3-way circular mesh** performs a nested search over the peer set for a closed triangle: A offers something B wants, B offers something C wants, C offers something A wants. Each loop gets a synergy score (94 + a rating bonus) and a four-phase session structure (kickoff, dual-coaching lab, milestone check, completion).

> **Complexity warning.** The mesh search is O(n²) over the full peer list and currently runs on the client with the entire user collection loaded into memory. It is capped at 8 results. This is viable at a few hundred users and collapses beyond that. Part IV.5 specifies moving it server-side.

## 2.3 The session lifecycle

A session is the unit of work. It moves through six states:

```
  pending  ->  accepted  ->  scheduled  ->  completed  ->  reviewed
      \
       -> declined
```

| State | Meaning | Who triggers the transition |
|---|---|---|
| `pending` | A swap has been proposed and awaits the provider's response | Requester creates it |
| `accepted` | Provider agreed; no time set yet | Provider |
| `scheduled` | Date, time, and location agreed | Either party |
| `completed` | The session happened | Either party |
| `reviewed` | A rating and comment were submitted | Reviewer |
| `declined` | Provider refused | Provider |

**Karma settles on the `completed` -> `reviewed` transition**, not on scheduling. Every session carries an auto-created chat thread; state transitions post system messages into it.

## 2.4 Reputation

- Average `rating` (0–5) and `reviewCount`, recomputed on each review as a running mean.
- Cumulative `hoursTaught` and `hoursLearned`.
- Five achievement badges, evaluated as pure predicates over user state: 3-Way Synergy Pioneer, Master Tutor (10h taught), 5-Star Mentor (rating >= 4.8), Karma Wealthy (>= 150 Karma), Multi-Discipline Scholar (>= 2 skill categories).
- Two leaderboards, ranked by hours taught and by Karma balance.

**Rating, review count, and hours must be server-computed and client-read-only.** In the current app they are client-writable, which makes reputation forgeable.

## 2.5 Data model

Seven core entities:

**User** — `id`, `name`, `email`, `phoneNumber`, `campus`, `major`, `bio`, `avatarUrl`, `karmaBalance`, `rating`, `reviewCount`, `hoursTaught`, `hoursLearned`, `skillsOffered[]`, `skillsWanted[]`, `availability[]`, `notificationSettings{}`

**Skill** — `id`, `title`, `category`, `level`, `description`, `isOffering`
- Categories (7): Coding & Tech, Music & Instruments, Design & Visual Arts, Culinary & Cooking, Languages, Fitness & Wellness, Academics & Tutoring
- Levels (3): Beginner, Intermediate, Expert

**Session** — `id`, `requesterId`, `providerId`, `teacherName`, `studentName`, `requestedSkillTitle`, `offeredSkillTitle?`, `scheduledDateTime?`, `location`, `status`, `karmaAmount`, `durationHours`, `notes`

**ChatMessage** — `id`, `sessionId`, `senderId`, `senderName`, `text`, `timestamp`, `isSystemEvent`

**Review** — `id`, `sessionId`, `reviewerId`, `reviewerName`, `revieweeId`, `rating`, `comment`, `skillName`, `createdAt`

**KarmaTransaction** — `id`, `title`, `amount`, `timestamp`, `peerName`

**CampusPerk** — `id`, `title`, `category`, `description`, `karmaCost`, `icon`, `themeColor`

Plus **CircularMeshMatch** (a derived, non-persisted match object) and **CampusBadge** (a derived predicate result).

> **Denormalisation note.** `Session` stores `teacherName` / `studentName` and `requestedSkillTitle` as strings rather than references. That is a reasonable read-optimisation, but it means renames do not propagate. Keep it, and add a nightly reconciliation job, or normalise — decide explicitly rather than by accident.


# Part III — Complete Feature & Functionality Inventory

All 25 screens, split by rebuild effort. **This split matters: the three groups differ by an order of magnitude in cost.**

## 3.1 Group A — Working features, port directly (17 screens)

### Authentication & onboarding

| Feature | Detail |
|---|---|
| Email + password sign-up | With display-name capture |
| Email + password sign-in | |
| Google Sign-In | Popup flow on web, native flow on mobile |
| Splash / session restore | Currently a 2.8s animated splash that then checks auth |
| Onboarding profile capture | Name, campus, major, bio |
| Sign out | |

*Missing today and required:* password reset, email verification, account deletion.

### Explore & matching

| Feature | Detail |
|---|---|
| Ranked match feed | Mutual-first, then by score |
| Free-text search | Across peer name, campus, skill title, skill description |
| Category filter | Seven skill categories |
| "Mutual only" toggle | |
| Match explanation | Human-readable reasoning string per card |
| Peer profile view | Skills, rating, hours, badges, availability |
| Swap proposal dialog | Choose requested skill, optionally offer one in return, add a note |
| Add peer manually | Admin/demo utility |

### Sessions & scheduling

| Feature | Detail |
|---|---|
| Session list | Grouped by status |
| Calendar view | Date, time, location |
| Create session manually | |
| Schedule / reschedule | Sets date, time, location; posts a system message |
| Mark complete | |
| Cancel session | |
| Session detail | Full metadata and notes |

### Messaging

| Feature | Detail |
|---|---|
| Conversation list | One thread per session |
| Real-time thread view | Live updates |
| Send message | |
| System event messages | Auto-posted on state transitions |
| Auto-created thread | On session creation |

### Profile

| Feature | Detail |
|---|---|
| View own profile | Stats, badges, skills |
| Edit profile | Name, campus, major, bio, phone |
| Avatar upload | Image picker / file picker; base64 today |
| Add / remove offered skill | Title, category, level, description |
| Add / remove wanted skill | |
| Availability selection | |
| Deduplication on skill add | Normalised by lowercased title |

### Karma & perks

| Feature | Detail |
|---|---|
| Karma wallet | Balance plus full transaction history |
| Transaction log | Title, amount, timestamp, counterparty |
| Perks catalogue | Six seeded perks, sorted by cost |
| Redeem perk | Affordability check, debit, ledger entry |

*Missing and required:* the redemption produces no voucher, code, or record a campus vendor could honour. See Part IV.4.

### Reputation & social

| Feature | Detail |
|---|---|
| Submit review | 1–5 star rating plus comment |
| Review triggers Karma settlement | |
| Celebration dialog | Post-swap animation |
| Leaderboard by hours taught | |
| Leaderboard by Karma | |
| Badge display | Five badges with locked/unlocked state |

### 3-way skill mesh

| Feature | Detail |
|---|---|
| Mesh discovery | Circular triangle search, up to 8 results |
| Synergy score & reasoning | |
| Initiate mesh | Creates a shared session and broadcasts a system message |
| Smart Lab screen | Four-phase milestone tracker |
| Complete mesh | Awards Karma, records a completion certificate |

### System

| Feature | Detail |
|---|---|
| Notifications centre | In-app list |
| Notification preferences | Six toggles: all, session reminders, Karma alerts, swap requests, email digest, SMS alerts |
| Theme switcher | Light / Dark / Night |
| Settings | Display, notifications, communication, privacy, app info |
| Responsive layout | Mobile bottom nav; desktop sidebar nav |

## 3.2 Group B — UI mockups. Decide: build or relabel (2 screens)

| Feature | Actual state | Cost to make real |
|---|---|---|
| **Video calling** | A gradient background, an avatar, and a `Timer` incrementing a counter. Mute / video-off / screen-share are local booleans that recolour icons. There is no WebRTC, Agora, or LiveKit dependency in the project at all. | 1–2 weeks: LiveKit or Agora integration, server-side token minting, TURN configuration, device permissions, reconnection handling. |
| **SwapBot AI assistant** | A chain of `if (query.contains("..."))` returning hardcoded response strings. No model, no API call, no network dependency. | 3–5 days: a server route proxying the Claude API with user context injected, streaming responses, rate limiting, and cost controls. |

**Recommendation:** relabel both immediately (this costs nothing and is honest), then build them in Phase 5 if they earn their place. A demo screen labelled "Video call — UI prototype" is fine. The same screen advertised as "1080p with noise cancellation" is a credibility problem, because it takes a reviewer about ninety seconds to check.

The same applies to the mesh completion certificate. It is currently `meshId.hashCode.toRadixString(16)` — a 32-bit non-cryptographic hash — string-prefixed `SHA256-` and suffixed `-VERIFIED`. Either issue a genuine server-side signed credential or drop the cryptographic language.

## 3.3 Group C — Broken. Rebuild, do not port (3 flows)

| Flow | Defect | Required rebuild |
|---|---|---|
| **Karma settlement** | Debits the learner in the database; credits the teacher in local memory only. Karma is destroyed every session. | One atomic server-side transaction touching both parties' balances plus a ledger entry. |
| **Authentication gating** | A failed sign-in is caught and a fabricated user is created, then navigation proceeds unconditionally into the app. Any wrong password grants access. | Server `load` guard. See Part V. |
| **Peer directory** | Streams the entire `users` collection unfiltered to every client, including every user's email and phone number, and begins before login. | A public `profiles` projection with no PII, paginated and queried server-side. |

## 3.4 Features to add in the rebuild

Not present today, but needed for a credible product:

- Password reset and email verification
- Account deletion and data export (legally required in most jurisdictions)
- Push and email notifications (the preference toggles exist but drive nothing)
- Report / block a user, and a moderation queue
- Session reminders
- Real perk redemption records with vendor-verifiable codes
- Deep links and shareable URLs (impossible today — there is no router)
- Search across skills and peers with proper indexing
- Admin surface for perk management and moderation
- Analytics and error monitoring


# Part IV — What Exactly We Need

## 4.1 Frontend stack (as specified, with three corrections)

| Layer | Package | Version | Notes |
|---|---|---|---|
| Framework | `svelte` | **5.57.x** | Runes API: `$state`, `$derived`, `$effect`, `$props` |
| Meta-framework | `@sveltejs/kit` | **2.70.x** | Server routes are the trust boundary |
| Build | `vite` | 7.x | Via SvelteKit |
| Styling | `tailwindcss` | **4.3.x** | See correction 1 |
| Tailwind plugin | `@tailwindcss/typography` | 0.5.20 | Supports v4. Needed for AI/chat prose rendering |
| Tailwind Vite plugin | `@tailwindcss/vite` | 4.3.x | Replaces the PostCSS pipeline in v4 |
| Class utilities | `clsx` | 2.1.1 | |
| Class utilities | `tailwind-merge` | 3.6.x | Pair with `clsx` in one `cn()` helper |
| Variant system | `class-variance-authority` | 0.7.1 | Component variant definitions |
| Icons | `lucide-svelte` | **1.0.x** | Declares Svelte 5 support |
| Animation — choreography | `gsap` | 3.15.x | See correction 3 |
| Animation — components | `motion` | **13.x** | See correction 2 |
| Language | `typescript` | 5.x | Strongly recommended |

### Correction 1 — Tailwind v4 makes the container-queries plugin unnecessary

You named `@tailwindcss/container-queries` as a plugin. **That plugin is for Tailwind v3.** Current Tailwind is **4.3.3**, and container queries are built into the core — `@container`, and the `@sm:` / `@max-md:` variant families — with no plugin at all.

**Recommendation: use Tailwind v4 and drop the plugin.** Be aware this changes setup materially:

- `@import "tailwindcss";` in your CSS, replacing the three `@tailwind` directives
- Configuration moves from `tailwind.config.js` to CSS-first `@theme { ... }` blocks
- Use `@tailwindcss/vite` instead of the PostCSS plugin
- `@tailwindcss/typography` still works and is still needed

If you have a specific reason to stay on v3, keep the plugin — but then pin v3 explicitly and do not mix v4 documentation into the build. The two are not interchangeable.

### Correction 2 — `@motionone/svelte` is abandoned. Do not use it.

`@motionone/svelte` was last published **21 September 2023** — three years stale, with no Svelte 5 support.

Its successor is `motion` (v13, published 2 September 2026). Its React peer dependencies are marked **optional**, and it ships a framework-agnostic root export plus a lightweight `motion/mini` build, so it works cleanly in Svelte through a small Svelte action wrapper.

**Recommendation: use `motion`. Drop `@motionone/svelte` entirely.**

### Correction 3 — Three animation libraries is one too many, and you already own a fourth

`motion` is the direct successor to Motion One; they solve the same problem. And Svelte 5 ships its own animation primitives you have not counted: `svelte/transition`, `svelte/animate`, and `svelte/motion` (springs and tweens).

**Assign lanes and hold the line:**

| Need | Use |
|---|---|
| Element enter/exit, list reordering, simple springs | **Svelte built-ins** (`svelte/transition`, `svelte/animate`) — zero bytes added |
| Component-level animation with gestures and layout transitions | **`motion`** |
| Multi-step timelines, scroll choreography, the mesh visualisation, celebration sequences | **GSAP** |
| — | **Not `@motionone/svelte`** |

Reach for the built-ins first. Most of what this app needs — card entrances, list transitions, the celebration dialog — is achievable with `svelte/transition` alone.

## 4.2 Backend — an explicit assumption

> **ASSUMPTION, PLEASE CONFIRM.** You specified the frontend stack only. This document assumes the backend stays on **Firebase (Auth + Firestore)**, accessed through **SvelteKit server routes using the Firebase Admin SDK**. That reading requires no data migration and still closes every blocking defect in the audit, because the fix is the *server layer*, not the database.

**Recommended architecture:**

```
Browser (Svelte 5 + Tailwind)
      |
      |  form actions / fetch  (no direct DB access from the browser)
      v
SvelteKit server  (+page.server.ts / +server.ts / hooks.server.ts)
      |  <-- session cookie verification, authorisation, transactions
      |  <-- Firebase Admin SDK (service account, server-only)
      v
Firebase Auth  +  Cloud Firestore
```

**The critical rule: the browser never talks to Firestore directly.** All reads and writes go through SvelteKit server routes. This single decision is what retires the audit's P0 findings — see Part V.

**Alternative, if you want to leave Firebase:** Postgres (Supabase or Neon) with Drizzle ORM and row-level security. Cleaner transactional semantics for a ledger and better relational queries for matching. **Cost: a full data migration plus a rewritten auth layer — roughly two additional weeks.** Only worth it if you are also planning to move off Firebase for other reasons. Do not undertake it as a side effect of a frontend rebuild.

## 4.3 Infrastructure and services

| Need | Recommendation | Why |
|---|---|---|
| Hosting | Vercel or Cloudflare Pages with the matching SvelteKit adapter | Server routes require a Node/edge runtime. **GitHub Pages cannot host this** — it is static-only, and static hosting defeats the entire security model. |
| Dedicated Firebase project | `skillswap-campus` and `skillswap-campus-dev` | The app currently runs inside `devxai-algo-trader`, an unrelated project — shared quota, billing, and blast radius. |
| Firestore security rules | Committed to the repo, tested against the emulator | Currently no rules exist in version control at all. |
| Local emulator | Firebase Local Emulator Suite | Required for offline development and rules tests. |
| File storage | Firebase Storage with rules | Replaces base64 avatars. |
| Error monitoring | Sentry | |
| Analytics | PostHog or Plausible | |
| Email | Resend or SendGrid | Verification, reset, digests. |
| CI | GitHub Actions | Typecheck, lint, test, build on every PR. |
| Secrets | Platform env vars, `$env/static/private` | The service account key must never reach the client bundle. |

## 4.4 Product decisions needed before Phase 1

These are yours to make; the build blocks on them.

1. **Karma constants.** 10, 50, or 100 per session? Fix one number in one server config.
2. **Video calling.** Build it (1–2 weeks, LiveKit) or relabel it as a prototype?
3. **AI assistant.** Real Claude API integration (3–5 days, ongoing token cost) or relabel?
4. **Certificates.** Real signed credentials or drop the cryptographic claim?
5. **Perk fulfilment.** Who honours a redeemed voucher, and how do they verify it? This determines whether perks are a real feature or a demo.
6. **Single campus or multi-campus?** Affects the data model and every query.
7. **Moderation.** Who handles reports? Manual queue or automated?

## 4.5 Non-functional requirements

- **Security:** no client-side authority over Karma, rating, or hours. No PII in any client-readable collection. All auth state server-verified per request.
- **Performance:** first contentful paint under 1.5s on 4G; match feed paginated at 20; mesh search moved server-side before 500 users.
- **Accessibility:** WCAG 2.1 AA — keyboard navigable, semantic markup, 4.5:1 contrast, visible focus states, `prefers-reduced-motion` honoured across every animation.
- **Testing:** 70%+ coverage on domain logic; Playwright end-to-end on the auth, swap, and Karma flows; Firestore rules tests with positive and negative cases.
- **Observability:** structured server logs, error tracking, Karma-ledger integrity monitoring.


# Part V — Why SvelteKit Fixes the Defects (and the Route Map)

## 5.1 Defects retired structurally by this architecture

This is the argument for a rebuild rather than a port. Each of these is not "fixed by careful coding" — it is made *impossible* by where the code runs.

| Audit finding | Why it exists today | SvelteKit mechanism that retires it |
|---|---|---|
| **P0-1 — failed login grants access** | Auth state lives in a client `ChangeNotifier`; navigation is 40 imperative pushes with no guard | `hooks.server.ts` verifies a session cookie on every request; `+layout.server.ts` redirects unauthenticated users before any page renders. **The client cannot navigate past a server redirect.** |
| **P0-2 — no security rules** | Client writes directly to Firestore, so rules are the only defence and none exist | The browser has no database credentials at all. The Admin SDK runs server-side. Rules become defence-in-depth rather than the sole barrier. |
| **P0-3 — client-authoritative Karma** | Balances computed in the client and written as whole documents | Karma mutations exist only inside `+page.server.ts` form actions running a Firestore transaction. **The client has no code path that can write a balance.** |
| **P1-1 — Karma destroyed each session** | Two separate writes, one of which is local-only | A single server transaction debits and credits both parties, or fails entirely. |
| **P1-3 — swallowed write failures** | 22 silent `catch (_) {}` blocks | Form actions return typed `fail()` results that the page renders. Errors have nowhere to hide. |
| **P1-4 — PII broadcast to all clients** | Whole `users` collection streamed to every browser | Server `load` returns only the fields the page needs. The browser never sees the collection. |
| **P2-4 — no router, no URLs** | Single `home:` widget with imperative pushes | File-based routing gives real URLs, working back button, deep links, and shareable profile links for free. |

## 5.2 Route map

The existing app has no routing at all. **Designing these URLs is the actual structural work of the rebuild** — everything else is component translation.

| Route | Purpose | Rendering | Auth |
|---|---|---|---|
| `/` | Marketing / landing; redirects to `/explore` if signed in | SSR | Public |
| `/login` | Sign in | SSR + form action | Public |
| `/signup` | Register | SSR + form action | Public |
| `/reset-password` | Password reset request | SSR + form action | Public |
| `/onboarding` | First-run profile capture | SSR + form action | Required |
| `/explore` | Ranked match feed, search, filters | SSR, paginated | Required |
| `/u/[userId]` | Peer profile | SSR | Required |
| `/u/[userId]/propose` | Swap proposal | Form action | Required |
| `/sessions` | Session list, grouped by status | SSR | Required |
| `/sessions/[id]` | Session detail, schedule, complete | SSR + actions | Participants only |
| `/sessions/[id]/review` | Submit review; triggers Karma settlement | Form action | Participants only |
| `/sessions/[id]/call` | Video room (or prototype) | CSR | Participants only |
| `/messages` | Conversation list | SSR | Required |
| `/messages/[sessionId]` | Thread; live updates | SSR shell + CSR stream | Participants only |
| `/mesh` | 3-way mesh discovery | SSR | Required |
| `/mesh/[meshId]` | Smart Lab milestone tracker | SSR | Participants only |
| `/karma` | Wallet and ledger | SSR | Required |
| `/perks` | Catalogue | SSR | Required |
| `/perks/[id]/redeem` | Redemption | Form action | Required |
| `/leaderboard` | Both rankings | SSR, cached | Required |
| `/profile` | Own profile | SSR | Required |
| `/profile/edit` | Edit details and skills | SSR + actions | Required |
| `/notifications` | Notification centre | SSR | Required |
| `/settings` | Preferences | SSR + actions | Required |
| `/assistant` | AI chat (or prototype) | CSR + streaming endpoint | Required |
| `/api/…` | Internal JSON endpoints | Server only | Per-route |

**Layout structure:**

```
src/routes/
  +layout.svelte              shell, theme provider, toaster
  +layout.server.ts           reads session cookie -> locals.user
  (public)/                   login, signup, reset
  (app)/
    +layout.server.ts         AUTH GUARD: redirect(303,'/login') if !locals.user
    +layout.svelte            nav shell (sidebar desktop / bottom bar mobile)
    explore/ sessions/ messages/ mesh/ karma/ perks/ profile/ settings/
```

**The auth guard is one file.** A `+layout.server.ts` under `(app)` that throws `redirect(303, '/login')` when `locals.user` is null protects every route beneath it. That single file is the structural fix for P0-1.


# Part VI — Phase-Wise Implementation Plan

Total: **8–10 weeks** for one full-time developer to reach production. Sequenced by dependency — each phase unblocks the next.

## Phase 0 — Foundation and decisions (3–4 days)

*Goal: a running skeleton and no open architectural questions.*

| # | Task |
|---|---|
| 0.1 | Answer the seven product decisions in Part IV.4. Nothing downstream is stable until these are fixed. |
| 0.2 | Scaffold SvelteKit 2 + Svelte 5 + TypeScript; choose the adapter (Vercel or Cloudflare) |
| 0.3 | Install and configure Tailwind v4 via `@tailwindcss/vite`; add `@tailwindcss/typography`; CSS-first `@theme` |
| 0.4 | Port the design tokens from the Flutter theme into `@theme` — colours, radii, spacing, the three theme modes |
| 0.5 | Write the `cn()` helper (`clsx` + `tailwind-merge`); set the CVA conventions |
| 0.6 | Provision `skillswap-campus` and `skillswap-campus-dev` Firebase projects; wire the Local Emulator Suite |
| 0.7 | Set up ESLint, Prettier, `svelte-check`, Vitest, Playwright |
| 0.8 | GitHub Actions: typecheck, lint, test, build on every PR |

**Exit criteria:** `npm run dev` serves a themed page; CI is green; every Part IV.4 question has a written answer.

## Phase 1 — Auth and the trust boundary (1 week)

*Goal: the client can no longer lie about who it is. This phase is mostly server code.*

| # | Task |
|---|---|
| 1.1 | Firebase Admin SDK initialised server-side only, from `$env/static/private` |
| 1.2 | Session-cookie auth: `POST /api/session` exchanges an ID token for an `httpOnly`, `secure`, `sameSite` cookie |
| 1.3 | `hooks.server.ts` verifies the cookie on every request and populates `event.locals.user` |
| 1.4 | `(app)/+layout.server.ts` auth guard — redirect when unauthenticated |
| 1.5 | Login, signup, and password-reset pages as progressively-enhanced form actions |
| 1.6 | Google Sign-In through the same server session exchange |
| 1.7 | Onboarding flow |
| 1.8 | Write, commit, and deploy `firestore.rules`: deny all client access by default; deny writes to `karmaBalance`, `rating`, `reviewCount`, `hoursTaught` unconditionally |
| 1.9 | Rules unit tests against the emulator — positive **and** negative cases |
| 1.10 | Playwright test: **wrong password does not enter the app** (the P0-1 regression test) |

**Exit criteria:** a wrong password shows an error and stays on `/login`. A client attempting to write `karmaBalance: 999999` is rejected, and a test proves it.

## Phase 2 — Design system (1 week)

*Goal: a component vocabulary that the feature phases consume rather than invent.*

| # | Task |
|---|---|
| 2.1 | Primitives with CVA variants: Button, Input, Textarea, Select, Card, Badge, Avatar, Dialog, Sheet, Tabs, Toast, Skeleton, Tooltip |
| 2.2 | Domain components: `SkillChip`, `SkillCategoryIcon`, `KarmaBadge`, `RatingStars`, `MatchCard`, `PeerCard`, `SessionCard`, `MessageBubble`, `PerkCard`, `BadgeTile`, `LeaderboardRow` |
| 2.3 | App shell: responsive nav (sidebar on desktop, bottom bar on mobile) using **container queries**, not viewport media queries |
| 2.4 | Theme switcher — light / dark / night — persisted via cookie so SSR renders the correct theme with no flash |
| 2.5 | Icon layer over `lucide-svelte`; map the seven skill categories to icons |
| 2.6 | Motion foundation: Svelte transitions for enter/exit; a `motion` Svelte action for gesture and layout work; a GSAP setup module for timelines. **`prefers-reduced-motion` respected globally, at the foundation, not per-component.** |
| 2.7 | Accessibility baseline: focus rings, skip links, live regions, keyboard traps in dialogs |

**Exit criteria:** every component renders in all three themes, is keyboard operable, and no feature phase needs to write raw Tailwind for a primitive.

## Phase 3 — Core marketplace (2 weeks)

*Goal: a student can find a peer, propose a swap, schedule it, and talk.*

| # | Task |
|---|---|
| 3.1 | Port `MatchingEngine` to TypeScript **verbatim in behaviour**, with the existing Dart tests translated to Vitest first |
| 3.2 | `profiles` public projection — no email, no phone. All peer reads use it. (Retires P1-4) |
| 3.3 | `/explore`: server-side match computation, pagination, search, category filter, mutual-only toggle |
| 3.4 | `/u/[userId]` peer profile |
| 3.5 | Swap proposal form action; creates the session and its chat thread transactionally |
| 3.6 | `/sessions` list and `/sessions/[id]` detail with schedule / complete / cancel actions |
| 3.7 | System messages posted on every state transition |
| 3.8 | `/messages` and `/messages/[sessionId]` — SSR shell, client-side Firestore listener for live updates, scoped to participants |
| 3.9 | `/profile` and `/profile/edit`, including skill add/remove with normalised deduplication |
| 3.10 | Avatar upload to Firebase Storage with `storage.rules` |

**Exit criteria:** two accounts can complete the full discover -> propose -> schedule -> chat loop.

## Phase 4 — Karma economy (1 week)

*Goal: the currency is real, conserved, and unforgeable. Rebuild, do not port.*

| # | Task |
|---|---|
| 4.1 | Karma as an **append-only ledger**; balance is a derived, server-maintained value |
| 4.2 | Single server transaction on review submission: debit learner, credit teacher, write two ledger rows, update session status. **All or nothing.** (Retires P1-1) |
| 4.3 | Rating, review count, and hours recomputed server-side only |
| 4.4 | `/karma` wallet and ledger view |
| 4.5 | Perk catalogue seeded by a **deploy script**, not by client code |
| 4.6 | `/perks` and redemption as a server action: affordability check, debit, and a real redemption record with a vendor-verifiable code |
| 4.7 | `/leaderboard` — both rankings, cached |
| 4.8 | Badge evaluation server-side |
| 4.9 | **Ledger integrity test:** simulate 100 sessions, assert total supply changes only by joining grants minus redemptions |

**Exit criteria:** Karma is conserved across every flow, and a test proves it. No client code path can write a balance.

## Phase 5 — Differentiators (1–2 weeks)

*Goal: the features that make this more than a listings board. Scope depends on the Part IV.4 answers.*

| # | Task |
|---|---|
| 5.1 | Move mesh search server-side (it is O(n²) and cannot stay on the client); cache results |
| 5.2 | `/mesh` discovery with a GSAP-animated triangle visualisation — this is the app's signature screen and deserves the animation budget |
| 5.3 | `/mesh/[meshId]` Smart Lab milestone tracker; three-party completion with atomic Karma settlement |
| 5.4 | **If building:** LiveKit video — server-side token minting, TURN config, device permissions, reconnection. **If not:** relabel as a prototype and ship the mockup honestly. |
| 5.5 | **If building:** AI assistant via a server route proxying the Claude API (`claude-sonnet-5`) with user skills and peers as context, streamed to the client, rate-limited per user. Never call the API from the browser. **If not:** relabel. |
| 5.6 | Certificates: either a genuine server-signed credential with a public verification endpoint, or drop the cryptographic language |

## Phase 6 — Production hardening (1 week)

| # | Task |
|---|---|
| 6.1 | Push and email notifications wired to the existing preference toggles |
| 6.2 | Session reminders |
| 6.3 | Report / block, plus a moderation queue |
| 6.4 | Account deletion and data export (GDPR) |
| 6.5 | Privacy policy and terms |
| 6.6 | Sentry, analytics, structured server logging |
| 6.7 | Full accessibility audit — WCAG 2.1 AA, screen-reader traversal of every flow |
| 6.8 | Performance: bundle analysis, image optimisation, `Cache-Control` on cacheable loads, self-hosted fonts |
| 6.9 | Playwright end-to-end coverage of auth, swap, and Karma flows |
| 6.10 | Load testing and Firestore index verification |

## Phase 7 — Launch and iterate (ongoing)

Staged rollout to one campus; monitor the Karma ledger for drift; instrument the match-to-session conversion funnel; add search infrastructure (Algolia or Typesense) and multi-campus support as usage warrants.


# Part VII — Summary

## Timeline

| Phase | Duration | Output |
|---|---|---|
| 0 — Foundation | 3–4 days | Skeleton, tokens, CI, decisions answered |
| 1 — Auth & trust boundary | 1 week | Unforgeable auth; rules committed and tested |
| 2 — Design system | 1 week | Component vocabulary, three themes, a11y baseline |
| 3 — Core marketplace | 2 weeks | Discover, propose, schedule, chat |
| 4 — Karma economy | 1 week | Conserved, server-authoritative currency |
| 5 — Differentiators | 1–2 weeks | Mesh; video and AI per decision |
| 6 — Hardening | 1 week | Notifications, moderation, a11y, monitoring |
| **Total** | **8–10 weeks** | Production-ready |

## The three things that matter most

1. **Every write goes through a SvelteKit server route.** This one rule retires seven of the audit's findings, including all three blocking ones. If a browser can write to Firestore, the rebuild has failed regardless of how good the UI is.

2. **Karma is a server-side ledger, not a client-side number.** Rebuild this flow; do not port it. It is currently broken in a way that destroys currency on every transaction.

3. **Say what the software actually does.** Two features are UI mockups and one hash is mislabelled as SHA-256. Relabelling costs half an hour and is the highest-value item in this document.

## Stack corrections, restated

- **Tailwind v4**, container queries native — **drop `@tailwindcss/container-queries`** (that plugin is v3-only). Keep `@tailwindcss/typography`.
- **Drop `@motionone/svelte`** — last published September 2023, no Svelte 5 support. Use `motion` v13.
- **Reach for Svelte's built-in `transition`/`animate` first.** Use `motion` for gestures and layout, GSAP for timelines and scroll. That is three tools with three distinct jobs, not four tools competing for one.

---

*Companion document: `docs/AUDIT.md` — full defect analysis of the existing Flutter codebase, with file and line citations.*
