import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// Project Pages live under /<repo>/, so the production build needs that base.
// Local dev stays at / so http://localhost:5173 works normally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Turing-s-Dawn/' : '/',
  plugins: [react(), tailwindcss()],
}));
