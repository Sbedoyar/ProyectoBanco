import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5187', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5187',
    url: 'http://127.0.0.1:5187',
    reuseExistingServer: false,
    env: { BANK_API_TARGET: 'http://127.0.0.1:8081' },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
