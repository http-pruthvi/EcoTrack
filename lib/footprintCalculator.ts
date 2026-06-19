import { FootprintProfile } from "./firebase";

// ----------------------------------------------------
// EMISSION CONSTANTS (kg CO2e/year)
// Note: These are rough approximations and should be swapped
// with region-specific databases in production.
// ----------------------------------------------------

export const HOME_BASE = {
  apartment: 1200,
  house_small: 2200,
  house_large: 3800
};

export const HEATING_MULTIPLIER = {
  electric: 1.0,
  gas: 1.3,
  oil: 1.6,
  other: 1.1
};

export const COMMUTE_FACTOR_PER_KM = {
  car_solo: 0.18,
  carpool: 0.09,
  public_transit: 0.05,
  bike_walk: 0,
  wfh: 0
};

export const FLIGHT_FACTOR_PER_FLIGHT = 250; // Average round-trip flight emission in kg

export const DIET_BASE = {
  meat_heavy: 3300,
  meat_moderate: 2500,
  vegetarian: 1700,
  vegan: 1500
};

export const SHOPPING_BASE = {
  minimal: 500,
  moderate: 1200,
  high: 2400
};

// National average carbon footprint per capita (kg CO2e/year)
// Configurable baseline constant. Typical: US is ~16,000 kg, Europe is ~8,000 kg, global average ~4,700 kg.
// We set a moderate baseline of 10,000 kg CO2e/year.
export const NATIONAL_AVERAGE_CO2E = 10000;

export interface FootprintResult {
  total: number;
  breakdown: {
    home: number;
    transport: number;
    food: number;
    shopping: number;
  };
  comparisonToNationalAvg: number; // percentage difference, e.g. -20 for 20% lower, +15 for 15% higher
}

/**
 * Calculates user's annual carbon footprint in kg CO2e.
 * Pure function with no external API dependency.
 */
export function calculateFootprint(profile: FootprintProfile): FootprintResult {
  // 1. Home Emissions
  // Base energy is divided by household size since utilities are shared.
  const homeBaseValue = HOME_BASE[profile.homeType] || 2200;
  const heatingMult = HEATING_MULTIPLIER[profile.heatingFuel] || 1.1;
  const householdSize = Math.max(1, profile.householdSize || 1);
  const homeEmissions = Math.round((homeBaseValue * heatingMult) / householdSize);

  // 2. Transport Emissions
  // We assume commuteDistanceKm is daily round-trip commute distance.
  // 5 days a week, 52 weeks a year (260 commute days).
  const commuteFactor = COMMUTE_FACTOR_PER_KM[profile.primaryCommute] || 0;
  const commuteKmPerYear = (profile.commuteDistanceKm || 0) * 5 * 52;
  const commuteEmissions = commuteKmPerYear * commuteFactor;
  
  const flightEmissions = (profile.flightsPerYear || 0) * FLIGHT_FACTOR_PER_FLIGHT;
  const transportEmissions = Math.round(commuteEmissions + flightEmissions);

  // 3. Food Emissions
  const foodEmissions = DIET_BASE[profile.dietPattern] || 2500;

  // 4. Shopping Emissions
  const shoppingEmissions = SHOPPING_BASE[profile.shoppingLevel] || 1200;

  // Total
  const total = homeEmissions + transportEmissions + foodEmissions + shoppingEmissions;

  // Comparison to national average
  // e.g. if total = 8,000 and average = 10,000: ((8000 - 10000) / 10000) * 100 = -20%
  const comparisonToNationalAvg = Math.round(((total - NATIONAL_AVERAGE_CO2E) / NATIONAL_AVERAGE_CO2E) * 100);

  return {
    total,
    breakdown: {
      home: homeEmissions,
      transport: transportEmissions,
      food: foodEmissions,
      shopping: shoppingEmissions
    },
    comparisonToNationalAvg
  };
}
