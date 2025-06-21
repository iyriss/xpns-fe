import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { vercelPreset } from '@vercel/remix/vite';

export default defineConfig({
  server: {
    port: process.env.PORT,
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
  ],
  define: {
    API_URL: process.env.VITE_API_URL,
  },
});
