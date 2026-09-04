# SkillSwap Campus — Codebase Audit & Production-Readiness Plan

**Audited:** 2026-09-04 · commit `e691e35` · branch `main`
**Scope:** 56 Dart files, 15,240 LOC in `lib/`, 1,299 LOC in `test/`
**Verification performed:** `flutter analyze` (clean, 0 issues) · `flutter test` (28/28 pass) · full manual read of the data, domain, and auth layers

---

## 1. Executive summary

This is a well-organised, visually polished Flutter app with a clean feature-folder layout, a passing test suite, and a static analyzer with zero findings. The presentation layer is genuinely good work.

The problem is that **almost none of the trust-bearing logic is trustworthy**. Three issues are blocking, and they are not stylistic:

1. **A failed login logs you in anyway.** `signIn` swallows `FirebaseAuthException` and fabricates a local user; the login screen then navigates unconditionally into the app.
2. **There are no Firestore security rules in the repository.** The Karma economy — the app's currency — is computed entirely client-side and written with full-document writes. Any client can set its own balance.
3. **22 `catch (_) {}` blocks in the backend service** swallow every Firestore write failure, so the UI optimistically shows success while the database silently diverges.

Separately, several README claims do not match the code (see §4). That is worth fixing before this is shown to anyone evaluating the project, because the gap is checkable in about ninety seconds.

**Verdict:** strong UI scaffold, demo-grade backend. It is roughly 4–5 focused weeks from being genuinely production-ready (Phases 0–4 below), and the first week is almost entirely non-Flutter work.

---

## 2. What is good

These are real strengths and should be preserved through any refactor.

| Area | Assessment |
|---|---|
| **Project structure** | `lib/data` / `lib/domain` / `lib/ui` with per-feature folders under `ui/features/`. Clean, conventional, easy to navigate. |
| **Domain modelling** | 11 immutable-style models with `copyWith` / `toJson` / `fromJson` (`lib/domain/models/`). Consistent and readable. |
| **Analyzer hygiene** | `flutter analyze` returns **0 issues** across 15k LOC. Rare and worth noting. |
| **Test suite exists and passes** | 28 tests across 8 files, all green. Most Flutter projects at this stage have `widget_test.dart` and nothing else. |
| **Matching engine is isolated and pure** | [`lib/domain/matching_engine.dart`](../lib/domain/matching_engine.dart) is static, dependency-free, and directly unit-testable. This is the single best-architected file in the project. |
| **Theming** | Three themes (light / dark / night) via a `ThemeProvider`, centralised in [`lib/ui/core/theme.dart`](../lib/ui/core/theme.dart). |
| **Responsive design** | `ResponsiveViewWrapper` plus `IndexedStack` navigation — the web build genuinely adapts across breakpoints. |
| **Real Firestore streaming** | The listener architecture in `_initializeUserStreams` is the right shape: server-driven streams feeding a `ChangeNotifier`. The wiring is sound even though the error handling is not. |

---

## 3. What is bad — ranked by severity

### 🔴 P0 — Blocking. Do not ship or demo publicly until these are closed.

---

#### P0-1 · Failed authentication grants full app access

**Files:** [`lib/data/app_backend_service.dart:353-401`](../lib/data/app_backend_service.dart#L353) · [`lib/ui/features/auth/login_screen.dart:46-95`](../lib/ui/features/auth/login_screen.dart#L46)

`FirebaseAuthService.signInWithEmailAndPassword` correctly rethrows on bad credentials. But `AppBackendService.signIn` catches it:

```dart
} catch (_) {
  final displayName = _formatNameFromEmail(email);
  _currentUser = User(
    id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
    ...
    karmaBalance: 60,
  );
}
_hasLoadedUser = true;
notifyListeners();
```

Because `signIn` never rethrows, the login screen's `on FirebaseAuthException` handler is unreachable. Control falls through to:

```dart
Widget nextScreen = const MainNavigation();
if (!_isLogin || !backend.isReady) { nextScreen = const OnboardingScreen(); }
Navigator.of(context).pushReplacement(...);
```

`isReady` is hardcoded `=> true` ([app_backend_service.dart:325](../lib/data/app_backend_service.dart#L325)), so on the login path this always routes to `MainNavigation`.

**Net effect:** enter any email with any wrong password → you land inside the app with a fabricated identity and 60 Karma. The same pattern exists in `signUp` (:431) and `signInWithGoogle` (:481).

**Fix:** delete all three `catch` fallbacks. Let auth errors propagate to the UI. Gate every navigation on `isAuthenticated`, never on `hasLoadedUser`.

---

#### P0-2 · No Firestore security rules under version control

**Files:** none — that is the finding. No `firestore.rules`, no `firestore.indexes.json`, no `storage.rules`. `firebase.json` contains only FlutterFire platform config.

Every read and write in the app goes straight from an untrusted client to Firestore with no server-side authorization expressed anywhere in this repository.

> **Caveat:** I can verify only that no rules are version-controlled. Rules may be deployed live. **Confirm in the Firebase console before treating this as open** — but either way, un-versioned rules cannot be reviewed, tested, or safely redeployed, so this must be fixed regardless.

**Fix:** author `firestore.rules`, commit it, deploy it, and add rules unit tests via `@firebase/rules-unit-testing` against the emulator.

---

#### P0-3 · The Karma economy is client-authoritative

**Files:** [`app_backend_service.dart:832-856`](../lib/data/app_backend_service.dart#L832) (`addKarma`), [`:857-950`](../lib/data/app_backend_service.dart#L857) (`submitReview`), [`:1120-1147`](../lib/data/app_backend_service.dart#L1120) (`redeemPerk`) · [`firestore_service.dart:24`](../lib/data/firestore_service.dart#L24)

Balances are computed in Dart on the device and persisted with a whole-document write:

```dart
await _db!.collection('users').doc(user.id).update(user.toJson());
```

`user.toJson()` includes `karmaBalance`, `hoursTaught`, `rating`, and `reviewCount`. A modified client — or anyone with the web app open and a Firestore console — can write any values it likes. Perk redemption checks affordability client-side only.

**This cannot be fixed in Dart.** No client-side refactor closes it.

**Fix:** make Karma server-authoritative.
- Rules must forbid clients from writing `karmaBalance`, `rating`, `reviewCount`, `hoursTaught`.
- Move mutations into Cloud Functions (or a Firestore transaction gated by rules) that debit and credit atomically.
- Model Karma as an append-only ledger; treat the balance as a derived value.

---

### 🟠 P1 — Correctness and privacy. Fix before real users.

---

#### P1-1 · Karma is destroyed on every completed session

**File:** [`app_backend_service.dart:857-950`](../lib/data/app_backend_service.dart#L857)

`submitReview` persists only the *current* user's balance. The partner's Karma, hours, and rating are mutated **in the local `_peers` list only** (`:942-956`), which is overwritten on the next `streamPeers` tick and never written to Firestore.

Result: when a learner reviews a session, the learner's balance is debited in the database, and the teacher's is never credited. Karma leaves the economy on every transaction. A local-only rating update also means the peer's displayed rating flickers back on the next stream event.

**Fix:** a Cloud Function (or single Firestore transaction) that debits and credits both parties atomically. This is the same fix as P0-3.

---

#### P1-2 · Profile edits silently do nothing for fabricated users

**File:** [`firestore_service.dart:24`](../lib/data/firestore_service.dart#L24)

`updateUser` uses `.update()`, which throws `not-found` when the document does not exist. Users created by the P0-1 fallback path have no Firestore document at all. The throw is swallowed by `catch (_) {}` at [`app_backend_service.dart:611`](../lib/data/app_backend_service.dart#L611).

Result: the profile screen shows the edit succeeded, and nothing is saved. No error is ever surfaced.

**Fix:** use `.set(..., SetOptions(merge: true))`, and surface write failures.

---

#### P1-3 · Every Firestore write failure is swallowed

**File:** `app_backend_service.dart` — **22 occurrences** of `catch (_)`

```dart
_currentUser = updatedUser;
notifyListeners();          // UI updated optimistically
try {
  await _firestoreService.updateUser(updatedUser);
} catch (_) {}              // failure discarded
```

Offline writes, permission denials, and validation failures are all indistinguishable from success. The user sees a confirmed action; the database never receives it. Stream `onError` handlers are empty too (`onError: (_) {}`, `:143`, `:257`).

**Fix:** every catch either surfaces to the user, rolls back the optimistic update, or logs to Crashlytics. Zero silent catches.

---

#### P1-4 · Every user's email and phone number is broadcast to every client

**File:** [`firestore_service.dart:51-63`](../lib/data/firestore_service.dart#L51)

```dart
return _db!.collection('users').snapshots().map(...)
```

Unfiltered, unpaginated, un-projected. Every connected client receives the **entire** `users` collection, and `User.toJson()` includes `email` and `phoneNumber`. This starts before login — `_startPeersStream()` runs in the constructor ([`:49`](../lib/data/app_backend_service.dart#L49)).

Two problems: a privacy exposure (PII of every user to every user), and a cost/performance cliff (full-collection read on every membership change, at 10k users this is a per-client full-collection download).

**Fix:** a public `profiles` projection containing only display fields; paginate; never stream PII collections wholesale.

---

#### P1-5 · Mock data renders as real data

**File:** [`app_backend_service.dart:313-318`](../lib/data/app_backend_service.dart#L313)

```dart
User get currentUser {
  _currentUser ??= MockData.currentUser;   // getter mutates state
  return _currentUser!;
}
List<User> get peers => _peers.isNotEmpty ? _peers : MockData.peerStudents;
```

When Firestore is unreachable, or rules deny the read, or the collection is empty, the app silently renders fixture data as though it were live. There is no visual distinction. `MockData.currentUser` is also a `static` non-`final` field — mutable global state shared across the process and across tests.

The `currentUser` getter additionally performs assignment, so reading it during `build()` mutates provider state.

**Fix:** delete both fallbacks. Model `loading` / `empty` / `error` as explicit UI states. Keep `MockData` for tests only.

---

#### P1-6 · Firebase project is `devxai-algo-trader`

**File:** [`firebase.json`](../firebase.json)

Every platform config points at project `devxai-algo-trader` — an unrelated algorithmic-trading project. SkillSwap's `users`, `sessions`, and `reviews` collections live inside it.

This means shared quota, shared billing, shared rules surface, and shared blast radius with unrelated production data.

**Fix:** provision a dedicated `skillswap-campus` project (plus a `-dev` project for the emulator/staging), and re-run `flutterfire configure`.

---

---

#### P1-7 · `dispose()` leaks a Firestore listener and then uses the disposed notifier

**File:** [`app_backend_service.dart:231-311`](../lib/data/app_backend_service.dart#L231)

```dart
@override
void dispose() {
  _clearUserData();     // cancels every sub, then RE-STARTS the peers stream
  _perksSub?.cancel();
  super.dispose();
}
```

`_clearUserData` (`:231`) cancels all subscriptions and then calls `_startPeersStream()` at `:249`, followed by `notifyListeners()`. So disposing the provider:

1. leaves a **live Firestore listener running** after disposal, and
2. that listener calls `notifyListeners()` on a disposed `ChangeNotifier` when the next snapshot arrives → `A AppBackendService was used after being disposed`.

The `notifyListeners()` reached from inside `dispose()` is itself illegal in current Flutter.

**Fix:** separate "sign-out cleanup" from "disposal". `dispose()` must cancel everything and start nothing.

### 🟡 P2 — Architecture, maintainability, and delivery.

| # | Finding | Location | Why it matters |
|---|---|---|---|
| P2-1 | **1,147-line `ChangeNotifier` god object** — auth, repository, cache, ledger, matching facade, badge rules, and perk seeding in one class | `app_backend_service.dart` | Nothing is mockable; `FirestoreService` and `FirebaseAuthService` are constructed inline (`:21-22`), so no test can substitute a fake. All 28 tests exercise in-memory state only. |
| P2-2 | **Test helpers ship in production** — `setCurrentUserForTesting`, `setPeersForTesting`, `addSessionForTesting` | `:329-347` | Public mutators that bypass all validation, compiled into the release binary. |
| P2-3 | **`notifyListeners()` on every stream tick** | `:231-303` | Six streams each rebuild the entire widget tree. Session stream fires it once per snapshot *and* opens a new message subscription per session with no cleanup on session removal — a subscription leak. |
| P2-4 | **No router** — single `home:` with 40 imperative `Navigator.push` calls | `main.dart:54`, 40 sites | For a web app on GitHub Pages this means no deep links, no shareable URLs, no working browser back button, and no route guards (which is part of why P0-1 is possible). Adopt `go_router`. |
| P2-5 | **Non-deterministic sort comparator** | [`firestore_service.dart:99`](../lib/data/firestore_service.dart#L99) | `(b.scheduledDateTime ?? DateTime.now()).compareTo(a.scheduledDateTime ?? DateTime.now())` — `DateTime.now()` is re-evaluated per comparison, violating the comparator contract. Unscheduled sessions reorder randomly between frames. |
| P2-6 | **Every client races to seed the perks catalogue** | [`app_backend_service.dart:155-229`](../lib/data/app_backend_service.dart#L155) | Any empty snapshot triggers a 6-document batch write from every client that sees it. Seed data belongs in a deploy script, not in app startup. |
| P2-7 | **~150 lines of dedup code defending against an impossible failure** | 7 `_deduplicateX` helpers + repeated dedup in all 6 `FirestoreService` stream mappers | Firestore cannot return duplicate document IDs. The real duplicate source was almost certainly the mock-data fallback (P1-5) double-listing entries. `data_deduplication_test.dart` locks the workaround in place. Fix the cause, delete the defense. |
| P2-7b | **Perk redemption produces no redeemable record** — `redeemPerk` debits Karma and writes a ledger line, but creates no redemption document, code, or voucher | [`app_backend_service.dart:1120`](../lib/data/app_backend_service.dart#L1120) | A redeemed voucher leaves nothing a campus vendor could verify or honour. The perks feature is functionally incomplete, not just insecure. |
| P2-8 | **57 MB `app-release.apk` committed to git** | `app-release.apk` | The `.git` directory is **112 MB**; the source is under 1 MB. Every clone pays for it, permanently. |
| P2-9 | **No CI** | no `.github/` | `analyze` and `test` both pass today and nothing enforces that they keep passing. |
| P2-10 | **Stock lint config** — every rule commented out | `analysis_options.yaml` | "0 analyzer issues" is a floor, not a ceiling. It's `flutter_lints` defaults only. |
| P2-11 | **`google_fonts` fetches at runtime** | `pubspec.yaml` | Web font fetch on first paint; fails offline and adds a flash of unstyled text. Bundle the fonts as assets. |
| P2-12 | **No `firestore.indexes.json`** | — | `streamSessionsForUser` uses an `or` filter plus sort, and `streamReviews` uses `where` + `orderBy`. These need composite indexes that aren't version-controlled. |

---

## 4. Claimed vs. implemented

The README describes features that are not present in the code. These are directly checkable by anyone reading the repo.

| README claim | Actual implementation | Status |
|---|---|---|
| "1080p HD Live Video Calling … screen sharing, PiP camera, and noise cancellation" | [`video_call_screen.dart`](../lib/ui/features/video_call/video_call_screen.dart) is a gradient `Container`, a `UserAvatar`, and a `Timer.periodic` incrementing a counter. `_isMuted` / `_isScreenSharing` are local `bool`s toggling icon colours. No WebRTC, Agora, LiveKit, or `camera` dependency in `pubspec.yaml`. | **Not implemented** — UI mockup |
| "SwapBot AI 2.0 Assistant … intelligent campus AI advisor" (in-app: "Universal AI 3.0") | [`ai_assistant_service.dart`](../lib/data/ai_assistant_service.dart) is a chain of `if (q.contains('...'))` returning hardcoded strings. No model, no API call, no network dependency. | **Not implemented** — keyword router |
| "Cryptographic Proof of Mastery", `certificateHash: 'SHA256-...-VERIFIED'` | [`matching_engine.dart:192`](../lib/domain/matching_engine.dart#L192): `meshId.hashCode.abs().toRadixString(16)` — a 32-bit non-cryptographic hash, string-prefixed with `SHA256-` and suffixed `-VERIFIED`. Not stored, not verifiable, collides trivially. | **Mislabelled** |
| "+50⚡/hr for teaching" | `submitReview` awards `karmaAmount > 0 ? karmaAmount : 10` — i.e. 10. In-app AI copy says +100 for a mesh; `complete3WayMeshSession` awards 10. | **Inconsistent** |
| "Firebase Integration: real-time Firestore + Auth" | Accurate. This one is real. | ✅ |
| "Cross-Platform Responsive UI" | Accurate. | ✅ |

**Recommendation:** either implement these or relabel them. A demo screen honestly labelled "Video call — UI prototype" costs nothing. A 32-bit `hashCode` labelled `SHA256-…-VERIFIED` is the item most likely to damage credibility with a technical reviewer, and it is a one-line honest rename.

---

## 5. Test suite assessment

28 tests, all passing — but measuring the wrong thing.

- **Zero Firestore coverage.** Every test constructs `AppBackendService()`, whose `FirestoreService` writes go nowhere (`Firebase.apps.isEmpty` → all methods early-return `null`). The tests exercise in-memory list manipulation and are named "Backend Connectivity" while connecting to no backend.
- **Zero coverage of the P0 auth bypass.** No test calls `signIn` with bad credentials.
- **`widget_test.dart` is the only widget test** for 40+ screens, and it asserts that a title string renders.
- **`data_deduplication_test.dart` codifies a workaround** for a problem Firestore cannot produce (P2-7).
- **No coverage measurement** and no CI gate.

Measured with `flutter test --coverage`: **14.1% line coverage (819 / 5,804 lines)**. The covered lines are concentrated in `MatchingEngine` — correctly, the best-tested part of the codebase — and in in-memory list manipulation inside `AppBackendService`. Almost none of it exercises a real backend.

---

## 6. Phase-wise plan to production

Sequenced by dependency, not by convenience. **Phase 0 and most of Phase 1 are not Flutter work** — the security model cannot be built from the client, and every later phase depends on it.

---

### Phase 0 — Stop the bleeding (2–3 days)

*Goal: the app is no longer unsafe to have online.*

| # | Task | Files |
|---|---|---|
| 0.1 | Delete the three `catch` blocks that fabricate users; let auth errors propagate | `app_backend_service.dart:381, 431, 481` |
| 0.2 | Gate all navigation on `isAuthenticated`; delete `isReady => true` | `splash_screen.dart`, `login_screen.dart`, `app_backend_service.dart:325` |
| 0.3 | Remove `MockData` fallbacks from `currentUser` and `peers`; add explicit loading/empty/error states | `app_backend_service.dart:313-318` |
| 0.4 | Take the APK out of git history (`git filter-repo`), add `*.apk` to `.gitignore` | repo-wide |
| 0.5 | Provision dedicated `skillswap-campus` + `skillswap-campus-dev` Firebase projects; re-run `flutterfire configure` | `firebase.json`, `firebase_options.dart` |
| 0.6 | Correct the README claims (§4) and rename `certificateHash` honestly | `README.md`, `matching_engine.dart` |

**Exit criteria:** a wrong password shows an error and does not enter the app. No fixture data can render as live data.

---

### Phase 1 — Server-side trust boundary (1 week)

*Goal: the client can no longer lie about anything that matters. Mostly rules + Functions, not Dart.*

| # | Task |
|---|---|
| 1.1 | Write and commit `firestore.rules`: users write only their own doc; `karmaBalance`, `rating`, `reviewCount`, `hoursTaught` are **deny-write** from clients; sessions writable only by `requesterId` / `providerId`; messages writable only by session participants; `perks` read-only |
| 1.2 | Rules unit tests against the emulator (`@firebase/rules-unit-testing`) — positive *and* negative cases |
| 1.3 | Karma as an append-only ledger: `karma_ledger` collection, balance derived server-side |
| 1.4 | Cloud Functions for every balance mutation: `onReviewSubmitted` (atomic debit/credit — fixes P1-1), `redeemPerk` (server-side affordability check), `onSessionCompleted` |
| 1.5 | Commit `firestore.indexes.json` for the `or`-filter and `where`+`orderBy` queries |
| 1.6 | Replace the client-side perk seeding with a deploy-time seed script |
| 1.7 | Add a `profiles` public projection (no email/phone); repoint `streamPeers` at it, paginated |
| 1.8 | Firebase Local Emulator Suite wired into local dev |

**Exit criteria:** a client that writes `karmaBalance: 999999` is rejected by rules, and there is a test proving it.

---

### Phase 2 — Architecture (1 week)

*Goal: the code is testable and changeable.*

| # | Task |
|---|---|
| 2.1 | Split `AppBackendService` into `AuthRepository`, `UserRepository`, `SessionRepository`, `KarmaRepository`, `PerkRepository` behind interfaces; inject dependencies rather than constructing them inline |
| 2.2 | Replace the single `ChangeNotifier` with per-feature notifiers (or Riverpod), so a session update doesn't rebuild the profile screen |
| 2.3 | Adopt `go_router`: real URLs for the web build, working back button, deep links, and **route-level auth guards** |
| 2.4 | Delete all `*ForTesting` methods; tests use injected fakes |
| 2.5 | Every `catch (_)` either surfaces an error, rolls back, or logs to Crashlytics — target zero silent catches |
| 2.6 | Delete the 7 `_deduplicateX` helpers and the per-stream dedup once P1-5 is fixed; retire `data_deduplication_test.dart` |
| 2.7 | Fix the `DateTime.now()` sort comparator; cancel message subscriptions when sessions leave the stream; split sign-out cleanup from `dispose()` (P1-7) |
| 2.8 | Sealed `Result<T>` / `AsyncValue` types so loading and error states are unrepresentable-as-success |

**Exit criteria:** `AppBackendService` no longer exists; every repository has a fake; no file exceeds ~400 lines.

---

### Phase 3 — Real features (1–2 weeks)

*Goal: the README becomes true.*

| # | Task |
|---|---|
| 3.1 | **Real video calling** — integrate LiveKit or Agora (`flutter_webrtc` if self-hosting). Token minting in a Cloud Function; never embed API secrets in the client. Or: keep the mockup and label it as one. |
| 3.2 | **Real AI assistant** — call the Claude API (`claude-sonnet-5` is the right default here) from a Cloud Function proxy, never from the client. Pass user skills/peers as context. Keep the keyword router as an offline fallback. |
| 3.3 | **Real credentials** — either a genuine signed certificate (server-side HMAC/SHA-256 over session facts, verifiable via an endpoint) or a plain badge without cryptographic claims |
| 3.4 | **Push notifications** — FCM; the `notificationSettings` map is already modelled and currently unused |
| 3.5 | **Profile images** — Firebase Storage with `storage.rules`, replacing the base64/`ui-avatars.com` approach |
| 3.6 | **Reconcile the Karma constants** (50 vs 10 vs 100) into a single server-side config |
| 3.7 | **Issue real redemption records** for perks — a `redemptions` document with a verifiable code and vendor-facing lookup (P2-7b) |

---

### Phase 4 — Production hardening (1 week)

| # | Task |
|---|---|
| 4.1 | GitHub Actions: `flutter analyze --fatal-infos` + `flutter test --coverage` on every PR; block merge on failure |
| 4.2 | Strengthen `analysis_options.yaml` — `prefer_single_quotes`, `avoid_print`, `require_trailing_commas`, `always_declare_return_types`, and treat warnings as errors |
| 4.3 | Raise coverage to ≥70% on `domain/` and `data/`; widget tests for the auth, explore, and profile flows; integration tests against the emulator |
| 4.4 | Crashlytics + Firebase Analytics + Performance Monitoring |
| 4.5 | Bundle Google Fonts as assets; audit web bundle size; add `--wasm` / deferred loading where it helps |
| 4.6 | Accessibility pass: semantic labels, contrast ratios, minimum tap targets, screen-reader traversal |
| 4.7 | Privacy policy, terms, GDPR data-export and account-deletion flows (mandatory for app-store review) |
| 4.8 | Store readiness: signing config, ProGuard, release-mode `firebase_options`, App Store / Play listings |

---

### Phase 5 — Scale (ongoing)

Move matching server-side once peer counts exceed what a client can hold in memory (`findCircularMeshMatches` is O(n²) over the full peer list, executed on-device). Add search (Algolia / Typesense), caching, offline persistence, and rate limiting.

---

## 7. Priority-ordered next five actions

1. **Delete the three auth `catch` fallbacks** (P0-1) — under an hour, closes the auth bypass.
2. **Write and deploy `firestore.rules`** (P0-2) — one day, closes the open-database exposure.
3. **Move Karma mutations into Cloud Functions** (P0-3, P1-1) — two to three days, makes the currency real and stops Karma being destroyed on every session.
4. **Remove the `MockData` fallbacks** (P1-5) — a few hours, stops fixtures rendering as live data.
5. **Correct the README** (§4) — thirty minutes, and the highest credibility-per-minute item in this document.

---

*Findings verified against commit `e691e35`. Every location is cited by file and line; `flutter analyze` and `flutter test` were run and are clean. Deployed Firestore rules could not be inspected from the repository and should be confirmed in the Firebase console.*
