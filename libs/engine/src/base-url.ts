export function getPublicBaseUrl(fallbackUrl?: string): string {
  const configuredBaseUrl = process.env.PUBLIC_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (fallbackUrl) {
    return new URL(fallbackUrl).origin;
  }

  return "";
}
