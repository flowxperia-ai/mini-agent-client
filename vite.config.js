import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  // Standalone client repo — its own .env, not a parent monorepo's.
  const env = loadEnv(mode, __dirname, '');
  // Where the API runs in local dev. Override with VITE_API_URL in client/.env if it's not on 4000.
  const apiTarget = env.VITE_API_URL || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '#shared': path.resolve(__dirname, 'src/shared'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      // Same-origin in development: cookies just work and no CORS is involved.
      proxy: {
        '/api': apiTarget,
        '/widget.js': apiTarget,
        '/media': apiTarget,
        '/mock-assets': apiTarget,
      },
    },
    // Pre-bundle everything up front so lazily-loaded pages never trigger a mid-session
    // re-optimisation (which can load two copies of React and break hooks).
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router',
        'axios',
        'zustand',
        'clsx',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
      ],
    },
    preview: { port: 4173 },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-dom/client', 'react-router'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            vendor: ['axios', 'zustand', 'clsx'],
          },
        },
      },
    },
  };
});
