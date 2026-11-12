import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, channel: 'chrome' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    {
      name: 'small',
      use: { channel: 'chrome', viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
