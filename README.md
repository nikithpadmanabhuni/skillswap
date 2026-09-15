# SkillSwap Campus — web front ends

Two separate front-end projects for a peer-to-peer campus skill exchange, sharing one
design layer. **UI only: there is no backend.** Every screen reads from a deterministic
mock module.

| | |
|---|---|
| `user-web/` | Student app — 24 routes |
| `admin-web/` | Admin panel — 13 routes |
| `shared/` | Design tokens, 34 components, mock data, types. Consumed by both. |
| `docs/` | `REBUILD-SPEC.md`, `AUDIT.md`, and the Flutter theme this design is ported from |

Built to `docs/REBUILD-SPEC.md`: SvelteKit 2 · Svelte 5 (runes) · Tailwind v4 (CSS-first
`@theme`) · TypeScript · lucide · motion v13 · GSAP.

## Running it

```bash
npm install                        # root — shared/ resolves its deps by walking up
npm install --prefix user-web
npm install --prefix admin-web

npm run dev --prefix user-web      # http://localhost:5173
npm run dev --prefix admin-web     # http://localhost:5174
```

Sign in with any email and the password `demo`.

## Checks

```bash
npm test          # 20 domain tests — ledger conservation, PII, fixture integrity
npm run check     # svelte-check across both projects
npm run build     # static build of both
```

## Previewing the production build

```bash
npm run build
npm run preview:user     # http://localhost:4173
npm run preview:admin    # http://localhost:4174
```

Use these rather than `vite preview`. `adapter-static` writes `200.html` as the fallback
for parameterised routes (`/sessions/[id]`, `/u/[userId]`, …); real hosts serve it on a
miss, `vite preview` does not, so previewing there 404s every dynamic route and makes a
correct build look broken. `tools/preview.mjs` serves it the way a host would.

## Screenshot sweep

```bash
./tools/sweep.sh                   # all 37 routes x 3 themes x 3 breakpoints -> shots/
ROUTES=/explore,/karma node tools/shoot.mjs      # or a subset
REDUCED=1 ROUTES=/mesh node tools/shoot.mjs      # with prefers-reduced-motion
```

The harness fails loudly on console errors, page errors and failed requests — a page that
renders but throws is not a page that works.

## What is deliberately not real

This is the honest list. Two screens in the original Flutter app were presented as
features they were not, and the spec's highest-value item (section 7, item 3) is saying
what the software actually does.

| Screen | Status |
|---|---|
| `/sessions/[id]/call` | Labelled **UI prototype** on screen. No WebRTC, LiveKit or Agora; nothing is captured. |
| `/assistant` | Labelled **UI prototype**. Scripted pattern matching, no model, no API call. Figures it quotes are read from real fixture data. |
| Mesh certificate | A plain reference id, described as one. Not `SHA256-…-VERIFIED`, which is what the Flutter app rendered over a 32-bit non-cryptographic hash. |
| Landing page and auth panel | Every name, quote and figure is read from the demo dataset at render time, with suspended accounts filtered out. No invented metrics, logos or testimonials; the footer says it is a demo build. |
| Notification toggles | Save, but nothing delivers against them. The settings screen says so. |
| Auth | `(app)/+layout.ts` is a **navigation guard, not a security boundary** — there is no server to verify anything. This is the one file the real build must change. |
| Rendering | `ssr = false` in both root layouts, so every route is client-rendered. Spec §5.2 specifies SSR for most routes; that is the second thing the real build changes after the guard. Loads are universal `+page.ts` reading the mock module, so each becomes a `+page.server.ts` by rename plus moving the fetch. |

Every mutation is local state with a `// TODO: convert to a form action` marker at the
seam — 19 files. The shapes the routes read are already the shapes a server load would
return, so the conversion is a rename plus moving the fetch.

## The Karma economy

Karma is earned by teaching and spent on learning or campus perks. Constants live in one
place, `shared/lib/mock/constants.ts`: **+60** joining grant, **10** per session, perks
40–100.

The ledger is **built from events rather than hand-written**, so a teach credit cannot
exist without its matching learn debit — they are emitted by the same loop. Balances,
hours, rating and review count are all derived from it; nothing lets a caller set them,
because in the Flutter app they were client-writable and reputation was forgeable.

`npm test` asserts the conservation invariant: total supply equals joining grants minus
redemptions, every teach pairs with a learn, and nobody is overdrawn. This is the one
piece of logic worth testing at UI stage — it is the defect (audit P1-1) the whole
rebuild exists to fix.

Two findings worth a product decision, both flagged in code:

1. **Spec section 2.1 contradicts itself.** It lists "+10 to each participant" for a
   completed 3-way mesh, which mints 30 Karma from nothing, while the same section states
   the economy should be closed. Implemented as the closed reading: in a mesh each person
   teaches once and learns once, so it nets to zero exactly like a 1:1 swap.
2. **A closed economy structurally caps how rich anyone can get.** With a 60 grant and 10
   per session, a student cannot go more than six sessions net-negative before hitting a
   zero balance, so the total surplus available to the top teachers is bounded by roughly
   six times the number of net learners. The fixture distribution reflects that rather
   than papering over it.

## Design system

Tokens are ported from the Flutter `AppTheme` (`docs/reference/flutter-theme.dart`) into
one `@theme` block. Three themes — light, dark, and a true-black OLED night mode —
switched by a `data-theme` attribute applied before first paint, so there is no flash.

It is a **flat plus 1px-border system, elevation 0 throughout**. Cards are radius 20 with
a 1.2px border, inputs radius 16 going to 2px on focus, buttons radius 14. Resist adding
shadows. The one deliberate exception is `KarmaBadge`, which keeps its amber glow.

Two additions over the Dart source: `--color-karma` (`#F59E0B`, used 33 times across the
Flutter screens but absent from `AppTheme`) and a `--gradient-*` layer, because the
original rolled 21 ad-hoc `LinearGradient`s with no tokens.

Inter is self-hosted, not fetched from a CDN at runtime.

Accessibility is handled at the foundation rather than per screen: focus rings and the
skip link in `base.css`, `prefers-reduced-motion` gated once in `shared/lib/motion`,
dialogs that trap Tab and restore focus, a roving tabindex on tabs, text equivalents for
the star rating and the mesh diagram, and wide tables that scroll inside their own
container so the page never scrolls sideways.

## Matching

`shared/lib/mock/matches.ts` reproduces the **scoring and ordering** rules from spec 2.2
(mutual 95, +5 above a 4.8 rating; one-way 75 plus up to 15 by rating; mutual-first) over
exact skill titles. It is deliberately **not** a port of the Flutter `MatchingEngine` —
that engine's value is its fuzzy similarity, which belongs in the domain layer with the
Dart test suite translated alongside it (spec task 3.1).
