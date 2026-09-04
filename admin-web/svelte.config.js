import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // UI-only build: no server runtime. Dynamic routes ([id], [userId], ...)
    // client-render from the shared mock module via the SPA fallback.
    adapter: adapter({ fallback: '200.html', strict: false }),
    prerender: {
      // Parameterised routes are reached by id at runtime and served from the
      // SPA fallback, so the crawler will never find them and does not need to.
      // Without this the build fails demanding entries() for every [id] route.
      handleUnseenRoutes: 'ignore'
    },
    alias: {
      $shared: '../shared/lib',
      $lib: './src/lib',
      $styles: '../shared/styles'
    }
  }
};

export default config;
