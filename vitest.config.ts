import { defineConfig } from 'vitest/config';

// Domain-logic tests for the shared layer. The apps themselves are UI-only.
export default defineConfig({
  test: {
    include: ['shared/lib/**/*.test.ts'],
    environment: 'node'
  }
});
