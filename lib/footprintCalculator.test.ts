import { describe, it, expect } from "vitest";
import { calculateFootprint, HOME_BASE, DIET_BASE, SHOPPING_BASE } from "./footprintCalculator";
import { FootprintProfile } from "./firebase";

describe("footprintCalculator", () => {
  it("should calculate correct footprint for a basic profile", () => {
    const profile: FootprintProfile = {
      homeType: "apartment",
      householdSize: 1,
      heatingFuel: "electric",
      primaryCommute: "public_transit",
      commuteDistanceKm: 10,
      dietPattern: "vegetarian",
      flightsPerYear: 0,
      shoppingLevel: "minimal",
      updatedAt: new Date().toISOString(),
    };

    const result = calculateFootprint(profile);

    // 1. Home Emissions: (1200 * 1.0) / 1 = 1200
    // 2. Transport Emissions: (10 * 5 * 52) * 0.05 + 0 * 250 = 2600 * 0.05 = 130
    // 3. Food Emissions: vegetarian = 1700
    // 4. Shopping Emissions: minimal = 500
    // Total = 1200 + 130 + 1700 + 500 = 3530
    expect(result.total).toBe(3530);
    expect(result.breakdown.home).toBe(1200);
    expect(result.breakdown.transport).toBe(130);
    expect(result.breakdown.food).toBe(1700);
    expect(result.breakdown.shopping).toBe(500);
    expect(result.comparisonToNationalAvg).toBe(-65); // ((3530 - 10000) / 10000) * 100 = -64.7 => -65%
  });

  it("should scale home emissions by household size", () => {
    const profile1: FootprintProfile = {
      homeType: "house_large",
      householdSize: 1,
      heatingFuel: "gas",
      primaryCommute: "bike_walk",
      commuteDistanceKm: 0,
      dietPattern: "vegan",
      flightsPerYear: 0,
      shoppingLevel: "moderate",
      updatedAt: new Date().toISOString(),
    };

    const profile2: FootprintProfile = {
      ...profile1,
      householdSize: 4,
    };

    const result1 = calculateFootprint(profile1);
    const result2 = calculateFootprint(profile2);

    // Home Emissions profile 1: (3800 * 1.3) / 1 = 4940
    // Home Emissions profile 2: Math.round((3800 * 1.3) / 4) = Math.round(4940 / 4) = 1235
    expect(result1.breakdown.home).toBe(4940);
    expect(result2.breakdown.home).toBe(1235);
  });

  it("should calculate commute emissions and flight emissions correctly", () => {
    const profile: FootprintProfile = {
      homeType: "apartment",
      householdSize: 2,
      heatingFuel: "electric",
      primaryCommute: "car_solo",
      commuteDistanceKm: 25,
      dietPattern: "meat_heavy",
      flightsPerYear: 4,
      shoppingLevel: "high",
      updatedAt: new Date().toISOString(),
    };

    const result = calculateFootprint(profile);

    // Transport emissions:
    // Commute: 25 km * 5 days * 52 weeks = 6500 km/year
    // commute factor car_solo: 0.18 => 6500 * 0.18 = 1170 kg
    // Flights: 4 * 250 = 1000 kg
    // Total Transport = 1170 + 1000 = 2170 kg
    expect(result.breakdown.transport).toBe(2170);
  });
});
