import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// A senha do teste de entrada vem de E2E_SENHA (no .env.local, fora do Git).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORTA = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    timezoneId: "America/Cuiaba",
    trace: "on",
    video: "on",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build de produção numa porta própria, para não disputar a porta 3000 da prévia.
  webServer: {
    command: `npm run build && npm run start -- --port ${PORTA}`,
    url: `http://localhost:${PORTA}/entrar`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
