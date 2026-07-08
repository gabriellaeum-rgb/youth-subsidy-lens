import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
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
