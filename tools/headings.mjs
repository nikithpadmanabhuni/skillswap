import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:5173';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
if (process.env.SIGNED_IN !== '0') {
  await c.addCookies([
    { name: process.env.SESSION_COOKIE ?? 'skillswap_session', value: '1', url: new URL(BASE).origin }
  ]);
}
const p = await c.newPage();
for (const r of (process.env.ROUTES ?? '/profile').split(',')) {
  await p.goto(BASE + r, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const h = await p.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4')].map((e) => `${e.tagName}:${e.textContent.trim().slice(0, 28)}`)
  );
  console.log(r);
  for (const x of h) console.log('   ', x);
}
await b.close();
