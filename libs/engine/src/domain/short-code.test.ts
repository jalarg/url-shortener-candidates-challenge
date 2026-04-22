import { describe, expect, it } from "vitest";

import { generateShortCode } from "./short-code";

describe("generateShortCode", () => {
  it("uses the default length of seven characters", () => {
    expect(generateShortCode()).toHaveLength(7);
  });

  it("supports custom lengths", () => {
    expect(generateShortCode(10)).toHaveLength(10);
  });

  it("only uses base62-safe characters", () => {
    const code = generateShortCode(64);

    expect(code).toMatch(/^[0-9a-zA-Z]+$/);
  });
});
