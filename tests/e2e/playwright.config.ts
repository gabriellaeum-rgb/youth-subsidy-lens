import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  // Capped, not fully parallel — a single `next dev` instance compiles routes
  // on-demand; too many concurrent workers hitting first-time routes at once
  // starves the compiler and produces page.goto timeouts unrelated to app logic.
  workers: 2,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'iPhone SE', use: { ...devices['iPhone SE'] } },
    { name: 'Galaxy A', use: { ...devices['Galaxy S9+'] } },
    { name: 'Desktop 1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
