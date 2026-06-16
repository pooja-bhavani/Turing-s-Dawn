import { defineConfig } from 'vitest/config';

// Engine tests are pure TypeScript — no React/Tailwind plugins needed.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
