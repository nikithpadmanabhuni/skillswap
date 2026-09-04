import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // UI-only build: no server runtime. Dynamic routes ([id], [userId], ...)
    // client-render from the shared mock module via the SPA fallback.
    adapter: adapter({ fallback: '200.html', strict: false }),
    alias: {
      $shared: '../shared/lib',
      $styles: '../shared/styles'
    }
  }
};

export default config;
