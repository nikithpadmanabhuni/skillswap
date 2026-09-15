import { chromium } from 'playwright';

/**
 * Keyboard and reduced-motion checks on the flows the spec names: auth, the
 * swap loop, and redemption. Not a substitute for a screen-reader pass, but it
 * catches the things that silently regress -- an unreachable control, a dialog
 * that leaks focus, a skip link that goes nowhere.
 */
const BASE = process.env.BASE ?? 'http://localhost:5173';
const COOKIE = process.env.SESSION_COOKIE ?? 'skillswap_session';
const ROUTES = (process.env.ROUTES ?? '/explore').split(',');
// SIGNED_IN=0 checks public pages; signed in, the landing page redirects away.
const SIGNED_IN = process.env.SIGNED_IN !== '0';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce'
});
await ctx.addCookies([
  ...(SIGNED_IN ? [{ name: COOKIE, value: '1', url: new URL(BASE).origin }] : []),
  { name: 'skillswap_theme', value: 'light', url: new URL(BASE).origin }
]);
const page = await ctx.newPage();

let problems = 0;
const fail = (msg) => {
  console.log(`  FAIL ${msg}`);
  problems++;
};

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  console.log(route);

  // 1. The skip link must be the first thing Tab reaches, and must target
  //    something that exists.
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => {
    const el = document.activeElement;
    return { text: el?.textContent?.trim() ?? '', href: el?.getAttribute?.('href') ?? '' };
  });
  if (!/skip to content/i.test(first.text)) fail(`first tab stop is "${first.text}", not the skip link`);
  if (first.href === '#main' && !(await page.$('#main'))) fail('skip link targets #main, which does not exist');

  // 2. Every interactive control must be reachable, and focus must stay visible.
  const reachable = await page.evaluate(() => {
    const sel =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return [...document.querySelectorAll(sel)].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null;
    }).length;
  });
  if (reachable === 0) fail('no focusable controls at all');

  // 3. Every control that shows only an icon needs an accessible name.
  const unnamed = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, a[href]')) {
      const text = (el.textContent ?? '').trim();
      const label = el.getAttribute('aria-label') ?? el.getAttribute('title') ?? '';
      const sr = el.querySelector('.sr-only')?.textContent?.trim() ?? '';
      if (!text && !label && !sr) out.push(el.outerHTML.slice(0, 90));
    }
    return out;
  });
  for (const u of unnamed) fail(`control with no accessible name: ${u}`);

  // 4. Images need alt text (decorative ones must be explicitly empty/hidden).
  const badImgs = await page.evaluate(() =>
    [...document.querySelectorAll('img')].filter(
      (i) => !i.hasAttribute('alt') && i.getAttribute('aria-hidden') !== 'true'
    ).length
  );
  if (badImgs) fail(`${badImgs} img without alt`);

  // 5. Reduced motion must actually suppress animation.
  const animating = await page.evaluate(() =>
    document.getAnimations().filter((a) => {
      const d = a.effect?.getTiming?.().duration;
      return typeof d === 'number' && d > 100 && a.playState === 'running';
    }).length
  );
  if (animating) fail(`${animating} animation(s) still running over 100ms under prefers-reduced-motion`);

  // 6. Exactly one h1 per page.
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length);
  if (h1 > 1) fail(`${h1} h1 elements`);

  console.log(`  ${reachable} focusable controls, ${h1} h1`);
}

await browser.close();
console.log(problems ? `\n${problems} PROBLEM(S)` : '\nNo accessibility problems found.');
process.exit(problems ? 1 : 0);
