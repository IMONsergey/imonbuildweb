import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const baseURL = process.env.IMON_E2E_BASE_URL || 'http://localhost:3004'
const parsed = new URL(baseURL)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure',
    launchOptions: process.env.IMON_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.IMON_CHROMIUM_EXECUTABLE_PATH } : undefined,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: 'chrome' } },
  ],
  webServer: {
    command: 'pnpm dev --port ' + parsed.port,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
