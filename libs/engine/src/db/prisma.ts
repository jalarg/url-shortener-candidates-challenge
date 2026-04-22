import { PrismaClient } from "@prisma/client";

declare global {
  var __urlShortenerPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__urlShortenerPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__urlShortenerPrisma__ = prisma;
}
