import { ValidationError } from "./errors";

const MAX_URL_LENGTH = 2_048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function validateUrl(input: string): string {
  const candidate = input.trim();

  if (!candidate) {
    throw new ValidationError("URL is required.");
  }

  if (candidate.length > MAX_URL_LENGTH) {
    throw new ValidationError("URL is too long.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new ValidationError("Please enter a valid URL.");
  }

  if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new ValidationError("Only http and https URLs are allowed.");
  }

  return parsedUrl.toString();
}
