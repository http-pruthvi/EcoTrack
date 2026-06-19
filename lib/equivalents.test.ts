import { describe, it, expect } from "vitest";
import { getEquivalent, EQUIVALENT_RANGES } from "./equivalents";

describe("equivalents utility", () => {
  it("should return a phrase from the low range for values between 0 and 15", () => {
    const phrase = getEquivalent(5);
    const lowRange = EQUIVALENT_RANGES[0];
    expect(lowRange.phrases).toContain(phrase);
  });

  it("should return a phrase from the medium range for values between 15 and 80", () => {
    const phrase = getEquivalent(30);
    const midRange = EQUIVALENT_RANGES[1];
    expect(midRange.phrases).toContain(phrase);
  });

  it("should return a phrase from the high range for values between 80 and 300", () => {
    const phrase = getEquivalent(150);
    const highRange = EQUIVALENT_RANGES[2];
    expect(highRange.phrases).toContain(phrase);
  });

  it("should return a phrase from the infinite range for values over 300", () => {
    const phrase1 = getEquivalent(500);
    const phrase2 = getEquivalent(1000);
    const infRange = EQUIVALENT_RANGES[3];
    expect(infRange.phrases).toContain(phrase1);
    expect(infRange.phrases).toContain(phrase2);
  });

  it("should handle negative numbers correctly using absolute values", () => {
    const phrase = getEquivalent(-25);
    const midRange = EQUIVALENT_RANGES[1];
    expect(midRange.phrases).toContain(phrase);
  });

  it("should return stable output for identical input values", () => {
    const res1 = getEquivalent(12.5);
    const res2 = getEquivalent(12.5);
    expect(res1).toBe(res2);
  });
});
