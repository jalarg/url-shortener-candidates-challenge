import { Prisma } from "@prisma/client";

import { prisma } from "../db/prisma";

export type ShortUrlRecord = {
  id: string;
  code: string;
  originalUrl: string;
  clickCount: number;
  lastVisitedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateShortUrlInput = {
  code: string;
  originalUrl: string;
};

export type ListShortUrlsOptions = {
  limit?: number;
  offset?: number;
};

export interface ShortUrlRepository {
  create(input: CreateShortUrlInput): Promise<ShortUrlRecord>;
  findByCode(code: string): Promise<ShortUrlRecord | null>;
  count(): Promise<number>;
  list(options?: ListShortUrlsOptions): Promise<ShortUrlRecord[]>;
  registerVisit(code: string): Promise<ShortUrlRecord | null>;
}

export class PrismaShortUrlRepository implements ShortUrlRepository {
  async create(input: CreateShortUrlInput): Promise<ShortUrlRecord> {
    return prisma.shortUrl.create({
      data: input,
    });
  }

  async findByCode(code: string): Promise<ShortUrlRecord | null> {
    return prisma.shortUrl.findUnique({
      where: { code },
    });
  }

  async count(): Promise<number> {
    return prisma.shortUrl.count();
  }

  async list(options: ListShortUrlsOptions = {}): Promise<ShortUrlRecord[]> {
    return prisma.shortUrl.findMany({
      orderBy: { createdAt: "desc" },
      take: options.limit,
      skip: options.offset,
    });
  }

  async registerVisit(code: string): Promise<ShortUrlRecord | null> {
    try {
      return await prisma.shortUrl.update({
        where: { code },
        data: {
          clickCount: { increment: 1 },
          lastVisitedAt: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }

      throw error;
    }
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  const errorWithCode =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown })
      : null;

  return Boolean(
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") ||
      errorWithCode?.code === "P2002",
  );
}
