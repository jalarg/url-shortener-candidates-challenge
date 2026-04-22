import { generateShortCode } from "../domain/short-code";
import { AppError, NotFoundError } from "../domain/errors";
import { validateUrl } from "../domain/url-validator";
import {
  isUniqueConstraintError,
  PrismaShortUrlRepository,
  type ListShortUrlsOptions,
  type ShortUrlRecord,
  type ShortUrlRepository,
} from "../repositories/short-url-repository";

const MAX_GENERATION_ATTEMPTS = 10;
export const DASHBOARD_SHORT_URL_LIMIT = 20;

export type PaginatedShortUrls = {
  items: ShortUrlRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class ShortUrlService {
  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly codeGenerator: () => string = generateShortCode,
  ) {}

  async createShortUrl(originalUrlInput: string): Promise<ShortUrlRecord> {
    const originalUrl = validateUrl(originalUrlInput);

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const code = this.codeGenerator();

      try {
        return await this.repository.create({ code, originalUrl });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new AppError(
      "We could not generate a unique short code. Please try again.",
      "CODE_GENERATION_FAILED",
    );
  }

  async listShortUrls(page = 1): Promise<PaginatedShortUrls> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const pageSize = DASHBOARD_SHORT_URL_LIMIT;
    const totalCount = await this.repository.count();
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(safePage, totalPages);
    const options: ListShortUrlsOptions = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };

    const items = await this.repository.list(options);

    return {
      items,
      totalCount,
      page: currentPage,
      pageSize,
      totalPages,
    };
  }

  async findShortUrl(code: string): Promise<ShortUrlRecord | null> {
    return this.repository.findByCode(code);
  }

  async resolveShortUrl(code: string): Promise<ShortUrlRecord> {
    const shortUrl = await this.repository.registerVisit(code);

    if (!shortUrl) {
      throw new NotFoundError("Short URL not found.");
    }

    return shortUrl;
  }
}

export const shortUrlService = new ShortUrlService(new PrismaShortUrlRepository());
