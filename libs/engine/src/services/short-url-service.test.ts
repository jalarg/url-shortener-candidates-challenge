import { describe, expect, it, vi } from "vitest";

import { AppError, NotFoundError, ValidationError } from "../domain/errors";
import { ShortUrlService } from "./short-url-service";
import type {
  CreateShortUrlInput,
  ListShortUrlsOptions,
  ShortUrlRecord,
  ShortUrlRepository,
} from "../repositories/short-url-repository";

class InMemoryShortUrlRepository implements ShortUrlRepository {
  private readonly items = new Map<string, ShortUrlRecord>();

  async create(input: CreateShortUrlInput): Promise<ShortUrlRecord> {
    if (this.items.has(input.code)) {
      const error = new Error("Unique constraint failed");
      Object.assign(error, { code: "P2002", name: "PrismaClientKnownRequestError" });
      throw error;
    }

    const record: ShortUrlRecord = {
      id: input.code,
      code: input.code,
      originalUrl: input.originalUrl,
      clickCount: 0,
      lastVisitedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.set(record.code, record);

    return record;
  }

  async findByCode(code: string): Promise<ShortUrlRecord | null> {
    return this.items.get(code) ?? null;
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async list(options: ListShortUrlsOptions = {}): Promise<ShortUrlRecord[]> {
    const items = [...this.items.values()];
    const offset = options.offset ?? 0;
    const end = typeof options.limit === "number" ? offset + options.limit : undefined;

    return items.slice(offset, end);
  }

  async registerVisit(code: string): Promise<ShortUrlRecord | null> {
    const record = this.items.get(code);

    if (!record) {
      return null;
    }

    const updatedRecord = {
      ...record,
      clickCount: record.clickCount + 1,
      lastVisitedAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.set(code, updatedRecord);

    return updatedRecord;
  }
}

describe("ShortUrlService", () => {
  it("rejects non-http URLs", async () => {
    const service = new ShortUrlService(new InMemoryShortUrlRepository());

    await expect(service.createShortUrl("javascript:alert('xss')")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("retries when a generated code collides", async () => {
    const repository = new InMemoryShortUrlRepository();
    const generator = vi.fn().mockReturnValueOnce("repeat1").mockReturnValueOnce("unique1");
    const service = new ShortUrlService(repository, generator);

    await repository.create({ code: "repeat1", originalUrl: "https://existing.example/" });

    const created = await service.createShortUrl("https://example.com/some-page");

    expect(created.code).toBe("unique1");
    expect(generator).toHaveBeenCalledTimes(2);
  });

  it("increments clicks when resolving a short URL", async () => {
    const repository = new InMemoryShortUrlRepository();
    const service = new ShortUrlService(repository, () => "resolve1");

    await service.createShortUrl("https://example.com/articles");
    const resolved = await service.resolveShortUrl("resolve1");

    expect(resolved.clickCount).toBe(1);
    expect(resolved.lastVisitedAt).toBeInstanceOf(Date);
  });

  it("returns paginated short URLs metadata", async () => {
    const repository = new InMemoryShortUrlRepository();
    const service = new ShortUrlService(repository, () => "page001");

    for (let index = 0; index < 25; index += 1) {
      await repository.create({
        code: `code${index.toString().padStart(2, "0")}`,
        originalUrl: `https://example.com/${index}`,
      });
    }

    const pageTwo = await service.listShortUrls(2);

    expect(pageTwo.page).toBe(2);
    expect(pageTwo.pageSize).toBe(20);
    expect(pageTwo.totalCount).toBe(25);
    expect(pageTwo.totalPages).toBe(2);
    expect(pageTwo.items).toHaveLength(5);
  });

  it("throws not found when resolving an unknown short URL", async () => {
    const service = new ShortUrlService(new InMemoryShortUrlRepository());

    await expect(service.resolveShortUrl("missing1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails after exhausting unique code generation retries", async () => {
    const repository = new InMemoryShortUrlRepository();
    const generator = vi.fn().mockReturnValue("repeat1");
    const service = new ShortUrlService(repository, generator);

    await repository.create({ code: "repeat1", originalUrl: "https://existing.example/" });

    await expect(service.createShortUrl("https://example.com/exhausted")).rejects.toEqual(
      new AppError(
        "We could not generate a unique short code. Please try again.",
        "CODE_GENERATION_FAILED",
      ),
    );

    expect(generator).toHaveBeenCalledTimes(10);
  });
});
