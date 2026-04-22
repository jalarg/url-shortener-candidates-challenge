import { getPublicBaseUrl, shortUrlService } from "@url-shortener/engine";

export async function loadShortUrlDashboard(requestUrl: string) {
  const request = new URL(requestUrl);
  const baseUrl = getPublicBaseUrl(requestUrl);
  const requestedPage = Number(request.searchParams.get("page") ?? "1");
  const shortUrls = await shortUrlService.listShortUrls(requestedPage);

  const hasPreviousPage = shortUrls.page > 1;
  const hasNextPage = shortUrls.page < shortUrls.totalPages;

  const getPageHref = (page: number) => {
    const nextUrl = new URL(requestUrl);

    if (page <= 1) {
      nextUrl.searchParams.delete("page");
    } else {
      nextUrl.searchParams.set("page", String(page));
    }

    return `${nextUrl.pathname}${nextUrl.search}`;
  };

  return {
    baseUrl,
    displayedCount: shortUrls.items.length,
    page: shortUrls.page,
    pageSize: shortUrls.pageSize,
    totalCount: shortUrls.totalCount,
    totalPages: shortUrls.totalPages,
    hasPreviousPage,
    hasNextPage,
    previousPageHref: hasPreviousPage ? getPageHref(shortUrls.page - 1) : null,
    nextPageHref: hasNextPage ? getPageHref(shortUrls.page + 1) : null,
    shortUrls: shortUrls.items.map((shortUrl) => ({
      id: shortUrl.id,
      code: shortUrl.code,
      originalUrl: shortUrl.originalUrl,
      shortUrl: `${baseUrl}/s/${shortUrl.code}`,
      clickCount: shortUrl.clickCount,
      createdAt: shortUrl.createdAt.toISOString(),
      lastVisitedAt: shortUrl.lastVisitedAt?.toISOString() ?? null,
    })),
  };
}

export async function createShortUrl(input: string, requestUrl: string) {
  const baseUrl = getPublicBaseUrl(requestUrl);
  const createdShortUrl = await shortUrlService.createShortUrl(input);

  return {
    id: createdShortUrl.id,
    code: createdShortUrl.code,
    originalUrl: createdShortUrl.originalUrl,
    shortUrl: `${baseUrl}/s/${createdShortUrl.code}`,
  };
}

/** Resolve target URL for redirect without recording a visit (visit tracking comes in a follow-up). */
export async function getRedirectTargetUrl(code: string): Promise<string | null> {
  const record = await shortUrlService.findShortUrl(code);

  return record?.originalUrl ?? null;
}
