import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

/**
 * Screenshot harness. Walks a route list, captures each at the given viewport
 * and theme, and reports any console error or failed request it saw along the
 * way — a page that renders but throws is not a page that works.
 */
const BASE = process.env.BASE ?? 'http://localhost:5175';
const OUT = process.env.OUT ?? 'shots';
const THEME = process.env.THEME ?? 'light';
const WIDTH = Number(process.env.WIDTH ?? 1440);
const HEIGHT = Number(process.env.HEIGHT ?? 900);
const ROUTES = (process.env.ROUTES ?? '/').split(',').filter(Boolean);
const SIGNED_IN = process.env.SIGNED_IN !== '0';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference'
});

const origin = new URL(BASE).origin;
const cookies = [{ name: 'skillswap_theme', value: THEME, url: origin }];
// Each app has its own session cookie name; SESSION_COOKIE selects it.
const sessionCookie = process.env.SESSION_COOKIE ?? 'skillswap_session';
if (SIGNED_IN) cookies.push({ name: sessionCookie, value: '1', url: origin });
await ctx.addCookies(cookies);

const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 200)}`);
});
page.on('pageerror', (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on('requestfailed', (r) => {
  const u = r.url();
  if (!u.startsWith('data:')) problems.push(`requestfailed: ${u.slice(0, 120)}`);
});

for (const route of ROUTES) {
  const before = problems.length;
  const slug = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
  try {
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
    // Long enough for entrance animations to finish; a screenshot taken
    // mid-timeline shows a half-drawn page and reads as a rendering bug.
    await page.waitForTimeout(Number(process.env.SETTLE ?? 1200));
    const status = res?.status() ?? 0;
    const path = `${OUT}/${THEME}-${WIDTH}-${slug}.png`;
    await page.screenshot({ path, fullPage: true });
    const landed = new URL(page.url()).pathname;
    const redirected = landed !== route && landed !== route + '/';
    const issues = problems.slice(before);
    console.log(
      `${status} ${route}${redirected ? ` -> ${landed}` : ''}` +
        (issues.length ? `  ⚠ ${issues.length} issue(s)` : '')
    );
    for (const i of issues) console.log(`      ${i}`);
  } catch (e) {
    console.log(`ERR ${route}: ${String(e).split('\n')[0].slice(0, 160)}`);
  }
}

await browser.close();
console.log(problems.length ? `\nTOTAL ISSUES: ${problems.length}` : '\nNo console or network errors.');
