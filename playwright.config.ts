import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  globalSetup: "./playwright.global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && pnpm --filter web exec react-router-serve ./build/server/index.js",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NODE_ENV: "test",
      PORT: "3100",
      PUBLIC_URL: "http://127.0.0.1:3100",
      DATABASE_URL: "file:./data/url-shortener.e2e.db",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
