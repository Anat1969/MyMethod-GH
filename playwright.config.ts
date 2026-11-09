import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:4173",
    headless: true,
    launchOptions: {
      args: process.env.CHROME_PROXY_SPKI
        ? [
            "--ignore-certificate-errors-spki-list=" +
              process.env.CHROME_PROXY_SPKI,
          ]
        : [],
    },
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
      },
  reporter: "list",
});
