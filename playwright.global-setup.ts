import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function globalSetup() {
  const dataDir = path.resolve(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const databasePath = path.join(dataDir, "url-shortener.e2e.db");
  if (existsSync(databasePath)) {
    rmSync(databasePath, { force: true });
  }

  await execFileAsync(
    process.platform === "win32" ? "cmd.exe" : "pnpm",
    process.platform === "win32" ? ["/c", "pnpm prisma db push"] : ["prisma", "db", "push"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "test",
        PUBLIC_URL: "http://127.0.0.1:3100",
        DATABASE_URL: "file:./data/url-shortener.e2e.db",
      },
    },
  );
}

export default globalSetup;
