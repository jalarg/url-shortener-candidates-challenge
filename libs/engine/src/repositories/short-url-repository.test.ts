import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../db/prisma";
import { PrismaShortUrlRepository } from "./short-url-repository";

const repository = new PrismaShortUrlRepository();

describe("PrismaShortUrlRepository", () => {
  beforeEach(async () => {
    await prisma.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and finds a short URL by code", async () => {
    await repository.create({
      code: "abc1234",
      originalUrl: "https://example.com/docs",
    });

    const shortUrl = await repository.findByCode("abc1234");

    expect(shortUrl).toMatchObject({
      code: "abc1234",
      originalUrl: "https://example.com/docs",
      clickCount: 0,
    });
  });

  it("lists short URLs with newest entries first", async () => {
    await repository.create({
      code: "older01",
      originalUrl: "https://example.com/older",
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await repository.create({
      code: "newer01",
      originalUrl: "https://example.com/newer",
    });

    const shortUrls = await repository.list();

    expect(shortUrls.map((item) => item.code)).toEqual(["newer01", "older01"]);
  });

  it("supports limiting the number of listed rows", async () => {
    await repository.create({
      code: "limit01",
      originalUrl: "https://example.com/limit-1",
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await repository.create({
      code: "limit02",
      originalUrl: "https://example.com/limit-2",
    });

    const shortUrls = await repository.list({ limit: 1 });

    expect(shortUrls).toHaveLength(1);
    expect(shortUrls[0]?.code).toBe("limit02");
  });

  it("supports offsets for paginated queries", async () => {
    await repository.create({
      code: "page001",
      originalUrl: "https://example.com/page-1",
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await repository.create({
      code: "page002",
      originalUrl: "https://example.com/page-2",
    });

    const shortUrls = await repository.list({ limit: 1, offset: 1 });

    expect(shortUrls).toHaveLength(1);
    expect(shortUrls[0]?.code).toBe("page001");
  });

  it("returns the total number of persisted short URLs", async () => {
    await repository.create({
      code: "count01",
      originalUrl: "https://example.com/count-1",
    });

    await repository.create({
      code: "count02",
      originalUrl: "https://example.com/count-2",
    });

    await expect(repository.count()).resolves.toBe(2);
  });

  it("registers a visit and updates click metadata", async () => {
    await repository.create({
      code: "visit01",
      originalUrl: "https://example.com/visit",
    });

    const updated = await repository.registerVisit("visit01");

    expect(updated?.clickCount).toBe(1);
    expect(updated?.lastVisitedAt).toBeInstanceOf(Date);
  });

  it("returns null when trying to register a visit for an unknown code", async () => {
    await expect(repository.registerVisit("missing01")).resolves.toBeNull();
  });
});
