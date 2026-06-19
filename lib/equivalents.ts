export interface EquivalentRange {
  minKg: number;
  maxKg: number;
  phrases: string[];
}

export const EQUIVALENT_RANGES: EquivalentRange[] = [
  {
    minKg: 0,
    maxKg: 15,
    phrases: [
      "About one less load of laundry's energy use.",
      "Roughly one fewer hot shower this week.",
      "Like choosing not to run the dishwasher on heat-dry.",
      "Equivalent to avoiding 4 hours of streaming in high definition."
    ]
  },
  {
    minKg: 15,
    maxKg: 80,
    phrases: [
      "That's like skipping a 9-mile drive.",
      "Roughly one fewer takeout delivery this month.",
      "Like bypassing 3 single-use plastic shipping packages.",
      "About the carbon saved by line-drying 10 loads of laundry."
    ]
  },
  {
    minKg: 80,
    maxKg: 300,
    phrases: [
      "Equivalent to skipping a 150-mile road trip.",
      "Like turning down the thermostat by 2 degrees for the winter.",
      "Roughly the emissions saved by going vegetarian for two months.",
      "About the impact of avoiding one short-haul flight."
    ]
  },
  {
    minKg: 300,
    maxKg: Infinity,
    phrases: [
      "Like leaving the car parked for a whole month.",
      "Equivalent to avoiding a round-trip flight from New York to Chicago.",
      "Roughly the impact of transitioning your home heating off natural gas for a season.",
      "Like bypassing 100 new clothing purchases this year."
    ]
  }
];

/**
 * Returns a stable equivalent phrase for a given kg CO2e value.
 */
export function getEquivalent(kg: number): string {
  const absoluteKg = Math.abs(kg);
  const range = EQUIVALENT_RANGES.find(r => absoluteKg >= r.minKg && absoluteKg < r.maxKg) || EQUIVALENT_RANGES[EQUIVALENT_RANGES.length - 1];
  
  // Use a stable index based on the kg value to prevent visual flickering
  const index = Math.floor(absoluteKg * 10) % range.phrases.length;
  return range.phrases[index];
}
