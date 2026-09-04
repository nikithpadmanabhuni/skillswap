import { browser } from '$app/environment';
import { currentUser } from '$shared/mock';
import type { User } from '$shared/types';

/**
 * Stand-in for the session cookie the real build will verify in hooks.server.ts.
 *
 * This is the ONE place the UI-only build departs from the spec's architecture,
 * and it is deliberate. Spec 5.1 retires audit finding P0-1 (a failed sign-in
 * fabricated a user and navigated in anyway) with a server-verified cookie plus
 * a +layout.server.ts guard. With no server, nothing here is a security control
 * — it is a navigation state machine that keeps the SHAPE of that design so the
 * guard has a home. Swapping this for the real thing is a rename plus moving
 * the read into a server load, not a rewrite.
 */

const COOKIE = 'skillswap_session';

function readCookie(): boolean {
  if (!browser) return false;
  try {
    return document.cookie.includes(`${COOKIE}=1`);
  } catch {
    return false;
  }
}

class SessionStore {
  /**
   * Read at construction, not from an effect in the root layout. Load functions
   * run BEFORE layout effects, so an effect-based init left the (app) guard
   * looking at `false` on a hard navigation and bouncing a signed-in user to
   * /login. The real build has the same ordering constraint and solves it the
   * same way: the session is resolved before any route load reads it.
   */
  signedIn = $state(readCookie());
  /** Set on signup, cleared once onboarding is submitted. */
  needsOnboarding = $state(false);

  /** Re-sync after an external cookie change. Safe to call more than once. */
  init() {
    this.signedIn = readCookie();
  }

  get user(): User | null {
    return this.signedIn ? currentUser : null;
  }

  signIn() {
    this.signedIn = true;
    this.write('1');
  }

  signOut() {
    this.signedIn = false;
    this.needsOnboarding = false;
    this.write('');
  }

  private write(value: string) {
    if (!browser) return;
    try {
      document.cookie = value
        ? `${COOKIE}=1; path=/; max-age=604800; samesite=lax`
        : `${COOKIE}=; path=/; max-age=0; samesite=lax`;
    } catch {
      /* in-memory state still carries the session for this tab */
    }
  }
}

export const session = new SessionStore();
