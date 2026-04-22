import path from "node:path";
import { defineConfig } from "vitest/config";

process.env.DATABASE_URL = "file:../../data/url-shortener.test.db";
process.env.PUBLIC_URL ??= "http://localhost:3000";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    maxWorkers: 1,
    globalSetup: [path.resolve(__dirname, "vitest.global-setup.ts")],
  },
});
