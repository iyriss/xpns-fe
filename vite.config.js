import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { vercelPreset } from '@vercel/remix/vite';

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
  ],
});
