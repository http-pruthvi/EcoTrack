import { describe, it, expect } from "vitest";
import { generateInsights } from "./generateInsights";
import { FootprintProfile } from "./firebase";

describe("generateInsights", () => {
  it("should return empty array if profile is empty or null", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(generateInsights(null as any)).toEqual([]);
  });

  it("should filter actions and rank them correctly for apartment/vegan lifestyle", () => {
    const profile: FootprintProfile = {
      homeType: "apartment",
      householdSize: 1,
      heatingFuel: "electric",
      primaryCommute: "wfh",
      commuteDistanceKm: 0,
      dietPattern: "vegan",
      flightsPerYear: 0,
      shoppingLevel: "minimal",
      updatedAt: new Date().toISOString(),
    };

    const insights = generateInsights(profile);

    // Apartment + electric heating + wfh + vegan + zero flights + minimal shopping:
    // Should NOT suggest solar panels (requires house)
    // Should NOT suggest upgrade heat pump (already electric)
    // Should NOT suggest commute by bike (already wfh)
    // Should NOT suggest go vegetarian or vegan (already vegan)
    // Should suggest thermostat (id: h_thermostat, estAnnualSavings: 350, effort: 1 => score 350)
    // Should suggest LED (id: h_led, estAnnualSavings: 150, effort: 1 => score 150)
    // Should suggest line drying (id: h_line_dry, estAnnualSavings: 200, effort: 3 => score 66.67)
    // Should suggest cold wash (id: h_cold_wash, estAnnualSavings: 80, effort: 2 => score 40)
    // Let's verify top suggestion is thermostat (score: 350), followed by LED (score: 150), etc.
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].id).toBe("h_thermostat");
    expect(insights[1].id).toBe("h_led");
    expect(insights[2].id).toBe("f_meal_plan");
    expect(insights[3].id).toBe("h_line_dry");
    expect(insights[4].id).toBe("f_compost");
  });

  it("should include high savings transport opportunities for a car-solo commuter", () => {
    const profile: FootprintProfile = {
      homeType: "house_large",
      householdSize: 2,
      heatingFuel: "gas",
      primaryCommute: "car_solo",
      commuteDistanceKm: 25,
      dietPattern: "meat_heavy",
      flightsPerYear: 4,
      shoppingLevel: "high",
      updatedAt: new Date().toISOString(),
    };

    const insights = generateInsights(profile);
    const ids = insights.map((i) => i.id);

    // For a car-solo commuter commuting 25km, they should get options like:
    // - t_wfh (savings 600, effort 2 => score 300)
    // - t_carpool (savings 500, effort 3 => score 166.67)
    // - t_public_transit (savings 750, effort 4 => score 187.5)
    // - h_solar (savings 2000, effort 2 => score 1000)
    // - h_heat_pump (savings 1200, effort 2 => score 600)
    // Check if heat pump, solar are in top suggestions (highest scores: 1000 and 600)
    expect(ids).toContain("h_solar");
    expect(ids).toContain("h_heat_pump");
    expect(insights[0].id).toBe("h_solar"); // score 1000
    expect(insights[1].id).toBe("h_heat_pump"); // score 600
  });
});
