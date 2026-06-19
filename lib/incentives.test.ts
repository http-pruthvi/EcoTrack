import { describe, it, expect } from "vitest";
import { GREEN_INCENTIVES } from "./incentives";

describe("GREEN_INCENTIVES database integrity", () => {
  it("should have unique IDs for all incentives", () => {
    const ids = GREEN_INCENTIVES.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories for all items", () => {
    const validCategories = ["home", "transport", "solar", "other"];
    GREEN_INCENTIVES.forEach((incentive) => {
      expect(validCategories).toContain(incentive.category);
    });
  });

  it("should have non-empty details and proper links", () => {
    GREEN_INCENTIVES.forEach((incentive) => {
      expect(incentive.title.trim().length).toBeGreaterThan(0);
      expect(incentive.description.trim().length).toBeGreaterThan(0);
      expect(incentive.amount.trim().length).toBeGreaterThan(0);
      expect(incentive.link.startsWith("http")).toBe(true);
    });
  });
});
