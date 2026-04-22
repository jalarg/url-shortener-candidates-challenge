import { RateLimitError } from "@url-shortener/engine";

/**
 * Fixed-window, in-memory limiter by client IP (from proxy headers in prod).
 * For production at scale, move this to Redis, an edge rate limiter, or a gateway.
 */
type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const entries = new Map<string, RateLimitEntry>();

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function enforceCreateShortUrlRateLimit(request: Request) {
  const key = getClientIdentifier(request);
  const now = Date.now();
  const currentEntry = entries.get(key);

  if (!currentEntry || currentEntry.expiresAt <= now) {
    entries.set(key, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (currentEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new RateLimitError("Too many shortening requests. Please try again in a minute.");
  }

  entries.set(key, {
    ...currentEntry,
    count: currentEntry.count + 1,
  });
}
