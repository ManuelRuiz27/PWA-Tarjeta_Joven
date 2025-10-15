import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true
      }
    }),
    // Sentry sourcemaps upload (solo si variables están definidas en build CI)
    sentryVitePlugin((() => {
      const sentryOrg = process.env['SENTRY_ORG'];
      const sentryProject = process.env['SENTRY_PROJECT'];
      const sentryAuthToken = process.env['SENTRY_AUTH_TOKEN'];
      return {
        ...(sentryOrg ? { org: sentryOrg } : {}),
        ...(sentryProject ? { project: sentryProject } : {}),
        // authToken debe llegar del entorno del CI (no lo guardes en el repo)
        ...(sentryAuthToken ? { authToken: sentryAuthToken } : {}),
        disable: !sentryAuthToken,
        sourcemaps: {
          filesToDeleteAfterUpload: ['dist/**/*.map']
        }
      };
    })())
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@sw': path.resolve(__dirname, 'src/sw'),
      '@i18n': path.resolve(__dirname, 'src/i18n'),
      '@test': path.resolve(__dirname, 'src/test')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts'
  }
});
