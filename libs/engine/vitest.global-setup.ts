import { existsSync } from "node:fs";
import { rmSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export default function globalSetup() {
  const databasePath = path.resolve(__dirname, "../../data/url-shortener.test.db");

  if (existsSync(databasePath)) {
    rmSync(databasePath, { force: true });
  }

  execFileSync(
    process.platform === "win32" ? "cmd.exe" : "pnpm",
    process.platform === "win32"
      ? ["/c", "pnpm prisma db push --skip-generate --schema ../../prisma/schema.prisma"]
      : ["prisma", "db", "push", "--skip-generate", "--schema", "../../prisma/schema.prisma"],
    {
      cwd: __dirname,
      env: {
        ...process.env,
        DATABASE_URL: "file:../../data/url-shortener.test.db",
      },
      stdio: "pipe",
    },
  );
}
