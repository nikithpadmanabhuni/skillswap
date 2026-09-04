import { browser } from '$app/environment';

/**
 * Admin sign-in state. Same caveat as the student app: with no server this is a
 * navigation state machine, not an access control. A real admin surface needs
 * a server-verified session AND a role claim -- being signed in is not the same
 * as being an administrator, and that distinction only exists server-side.
 */
const COOKIE = 'skillswap_admin';

function readCookie(): boolean {
  if (!browser) return false;
  try {
    return document.cookie.includes(`${COOKIE}=1`);
  } catch {
    return false;
  }
}

class AdminSession {
  // Read at construction: load functions run before layout effects, so an
  // effect-based init leaves the guard looking at a stale value.
  signedIn = $state(readCookie());
  name = 'Priya Nair';
  role = 'Platform administrator';
  email = 'admin@northgate.ac.uk';

  signIn() {
    this.signedIn = true;
    this.write('1');
  }

  signOut() {
    this.signedIn = false;
    this.write('');
  }

  private write(value: string) {
    if (!browser) return;
    try {
      document.cookie = value
        ? `${COOKIE}=1; path=/; max-age=604800; samesite=lax`
        : `${COOKIE}=; path=/; max-age=0; samesite=lax`;
    } catch {
      /* in-memory state still carries this tab */
    }
  }
}

export const admin = new AdminSession();
