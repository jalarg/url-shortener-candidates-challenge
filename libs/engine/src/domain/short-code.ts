import { randomInt } from "node:crypto";

const CODE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_CODE_LENGTH = 7;

/**
 * Cryptographically better-than-Math.random base62 code.
 * Uniqueness is enforced by storage (e.g. unique index + retries in the service), not by this function alone.
 */
export function generateShortCode(length = DEFAULT_CODE_LENGTH): string {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }

  return code;
}
