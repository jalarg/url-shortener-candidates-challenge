import { describe, expect, it } from "vitest";

import { ValidationError } from "./errors";
import { validateUrl } from "./url-validator";

describe("validateUrl", () => {
  it("rejects an empty string", () => {
    expect(() => validateUrl("   ")).toThrowError(new ValidationError("URL is required."));
  });

  it("rejects malformed URLs", () => {
    expect(() => validateUrl("not-a-url")).toThrowError(
      new ValidationError("Please enter a valid URL."),
    );
  });

  it("rejects unsupported protocols", () => {
    expect(() => validateUrl("ftp://example.com/file.txt")).toThrowError(
      new ValidationError("Only http and https URLs are allowed."),
    );
  });

  it("rejects URLs longer than the supported max length", () => {
    const oversizedUrl = `https://example.com/${"a".repeat(2_100)}`;

    expect(() => validateUrl(oversizedUrl)).toThrowError(
      new ValidationError("URL is too long."),
    );
  });

  it("normalizes and accepts valid https URLs", () => {
    expect(validateUrl(" https://example.com/docs ")).toBe("https://example.com/docs");
  });
});
