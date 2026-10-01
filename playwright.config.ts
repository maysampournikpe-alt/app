import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a production build on port 3100.
// They check every page at phone size (375px) and desktop size.
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    serviceWorkers: "block",
  },
  projects: [
    { name: "phone", use: { ...devices["iPhone SE"], browserName: "chromium", viewport: { width: 375, height: 667 } } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { ANTHROPIC_API_KEY: "", DATABASE_URL: `file:${process.cwd()}/prisma/e2e.db` },
  },
});
