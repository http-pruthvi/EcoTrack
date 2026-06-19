import { FootprintProfile } from "./firebase";

export interface CandidateAction {
  id: string;
  title: string;
  category: "home" | "transport" | "food" | "shopping";
  estAnnualSavingsKg: number;
  effortWeight: number; // 1-5 scale: 1 = passive/one-time, 5 = daily willpower
  condition: (profile: FootprintProfile) => boolean;
}

export const ACTION_CATALOG: CandidateAction[] = [
  {
    id: "h_thermostat",
    title: "Install a smart programmable thermostat",
    category: "home",
    estAnnualSavingsKg: 350,
    effortWeight: 1, // one-time install
    condition: () => true // everyone can save energy by managing heating
  },
  {
    id: "h_led",
    title: "Switch to 100% LED energy-saving bulbs",
    category: "home",
    estAnnualSavingsKg: 150,
    effortWeight: 1, // one-time switch
    condition: () => true
  },
  {
    id: "h_heat_pump",
    title: "Upgrade to a high-efficiency electric heat pump",
    category: "home",
    estAnnualSavingsKg: 1200,
    effortWeight: 2, // major install
    condition: (p) => p.heatingFuel === "gas" || p.heatingFuel === "oil" || p.heatingFuel === "other"
  },
  {
    id: "h_solar",
    title: "Install solar panels on your roof",
    category: "home",
    estAnnualSavingsKg: 2000,
    effortWeight: 2, // high upfront, but passive effort
    condition: (p) => p.homeType === "house_large" || p.homeType === "house_small"
  },
  {
    id: "h_line_dry",
    title: "Line dry laundry instead of using the dryer",
    category: "home",
    estAnnualSavingsKg: 200,
    effortWeight: 3, // requires habit
    condition: () => true
  },
  {
    id: "h_cold_wash",
    title: "Wash clothes in cold water",
    category: "home",
    estAnnualSavingsKg: 80,
    effortWeight: 2, // low effort adjustment
    condition: () => true
  },
  {
    id: "t_bike_commute",
    title: "Commute by bike or walk 2 days per week",
    category: "transport",
    estAnnualSavingsKg: 400,
    effortWeight: 4, // requires regular physical effort
    condition: (p) => p.primaryCommute === "car_solo" || p.primaryCommute === "carpool" || p.primaryCommute === "public_transit"
  },
  {
    id: "t_public_transit",
    title: "Swap your solo drive for public transit",
    category: "transport",
    estAnnualSavingsKg: 750,
    effortWeight: 4, // daily effort change
    condition: (p) => (p.primaryCommute === "car_solo" || p.primaryCommute === "carpool") && p.commuteDistanceKm > 5
  },
  {
    id: "t_carpool",
    title: "Carpool with coworkers on commute days",
    category: "transport",
    estAnnualSavingsKg: 500,
    effortWeight: 3, // coordination required
    condition: (p) => p.primaryCommute === "car_solo"
  },
  {
    id: "t_wfh",
    title: "Request working from home 2 days per week",
    category: "transport",
    estAnnualSavingsKg: 600,
    effortWeight: 2, // negotiation, but high savings
    condition: (p) => p.primaryCommute !== "wfh" && p.primaryCommute !== "bike_walk" && p.commuteDistanceKm > 10
  },
  {
    id: "t_train_travel",
    title: "Swap one medium flight for train travel",
    category: "transport",
    estAnnualSavingsKg: 250,
    effortWeight: 3, // planning required
    condition: (p) => p.flightsPerYear > 0
  },
  {
    id: "f_vegetarian",
    title: "Go vegetarian (meat-free diet)",
    category: "food",
    estAnnualSavingsKg: 800,
    effortWeight: 5, // high willpower
    condition: (p) => p.dietPattern === "meat_heavy" || p.dietPattern === "meat_moderate"
  },
  {
    id: "f_vegan",
    title: "Adopt a fully plant-based vegan diet",
    category: "food",
    estAnnualSavingsKg: 1000,
    effortWeight: 5, // high willpower
    condition: (p) => p.dietPattern !== "vegan"
  },
  {
    id: "f_meatless_mondays",
    title: "Commit to meatless mondays",
    category: "food",
    estAnnualSavingsKg: 200,
    effortWeight: 3, // moderate effort
    condition: (p) => p.dietPattern === "meat_heavy" || p.dietPattern === "meat_moderate"
  },
  {
    id: "f_compost",
    title: "Compost all organic and food waste",
    category: "food",
    estAnnualSavingsKg: 150,
    effortWeight: 3, // routine maintenance
    condition: () => true
  },
  {
    id: "f_meal_plan",
    title: "Meal plan to reduce food waste by half",
    category: "food",
    estAnnualSavingsKg: 250,
    effortWeight: 3, // weekly discipline
    condition: () => true
  },
  {
    id: "s_secondhand",
    title: "Buy clothes secondhand instead of new",
    category: "shopping",
    estAnnualSavingsKg: 300,
    effortWeight: 2, // minimal change
    condition: (p) => p.shoppingLevel !== "minimal"
  },
  {
    id: "s_buy_nothing",
    title: "Practice a 30-day buy-nothing challenge",
    category: "shopping",
    estAnnualSavingsKg: 500,
    effortWeight: 4, // high short-term willpower
    condition: (p) => p.shoppingLevel === "high" || p.shoppingLevel === "moderate"
  },
  {
    id: "s_vampire_power",
    title: "Unplug vampire electronics when away",
    category: "shopping", // consumer goods / home standby
    estAnnualSavingsKg: 100,
    effortWeight: 2, // minor daily routine
    condition: () => true
  }
];
