import { describe, it, expect } from "vitest";
import { ACTION_CATALOG } from "./actionCatalog";

describe("actionCatalog integrity", () => {
  it("should have unique IDs for all actions", () => {
    const ids = ACTION_CATALOG.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories for all actions", () => {
    const validCategories = ["home", "transport", "food", "shopping"];
    ACTION_CATALOG.forEach((action) => {
      expect(validCategories).toContain(action.category);
    });
  });

  it("should have positive savings values and valid effort weights between 1 and 5", () => {
    ACTION_CATALOG.forEach((action) => {
      expect(action.estAnnualSavingsKg).toBeGreaterThan(0);
      expect(action.effortWeight).toBeGreaterThanOrEqual(1);
      expect(action.effortWeight).toBeLessThanOrEqual(5);
    });
  });

  it("should have executable condition functions", () => {
    const dummyProfile = {
      homeType: "apartment" as const,
      householdSize: 1,
      heatingFuel: "electric" as const,
      primaryCommute: "wfh" as const,
      commuteDistanceKm: 0,
      dietPattern: "vegetarian" as const,
      flightsPerYear: 0,
      shoppingLevel: "minimal" as const,
      updatedAt: new Date().toISOString(),
    };

    ACTION_CATALOG.forEach((action) => {
      expect(typeof action.condition).toBe("function");
      const result = action.condition(dummyProfile);
      expect(typeof result).toBe("boolean");
    });
  });
});
