import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the project under /Headersvg/. Keep the base in sync
// with the repository name so asset URLs resolve correctly in production.
export default defineConfig({
  base: '/Headersvg/',
  plugins: [react()],
});
