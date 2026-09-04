import { browser } from '$app/environment';

export const THEMES = ['light', 'dark', 'night'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  night: 'Night'
};

const COOKIE = 'skillswap_theme';

function isTheme(v: string | null): v is Theme {
  return v === 'light' || v === 'dark' || v === 'night';
}

/**
 * Must stay in sync with the blocking script in app.html, which applies the
 * theme before first paint so the background never flashes.
 */
function read(): Theme {
  if (!browser) return 'light';
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    const stored = m ? decodeURIComponent(m[1]) : null;
    if (isTheme(stored)) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

class ThemeStore {
  current = $state<Theme>('light');

  init() {
    this.current = read();
  }

  set(theme: Theme) {
    this.current = theme;
    if (!browser) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      // A cookie rather than localStorage: when these routes become server-rendered
      // the cookie is already readable in the load, so SSR emits the right theme.
      document.cookie = `${COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* storage can be blocked; the in-memory value still works for this session */
    }
  }

  cycle() {
    const i = THEMES.indexOf(this.current);
    this.set(THEMES[(i + 1) % THEMES.length]);
  }
}

export const theme = new ThemeStore();
