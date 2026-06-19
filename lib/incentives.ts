export interface GreenIncentive {
  id: string;
  title: string;
  category: "home" | "transport" | "solar" | "other";
  amount: string;
  description: string;
  country: string;
  region: string; // "Federal" or state/province code
  link: string;
}

export const GREEN_INCENTIVES: GreenIncentive[] = [
  // US Federal
  {
    id: "us_fed_solar",
    title: "Residential Clean Energy Credit (Section 25D)",
    category: "solar",
    amount: "30% Tax Credit",
    description: "Receive a tax credit representing 30% of the cost to install solar panels, battery storage, or solar water heaters at your home.",
    country: "US",
    region: "Federal",
    link: "https://www.energy.gov/save/solar"
  },
  {
    id: "us_fed_heat_pump",
    title: "Energy Efficient Home Improvement Credit (Section 25C)",
    category: "home",
    amount: "Up to $2,000 / year",
    description: "Claim 30% of the cost for high-efficiency electric heat pumps, heat pump water heaters, or biomass stoves, capped at $2,000 annually.",
    country: "US",
    region: "Federal",
    link: "https://www.irs.gov/clean-energy-vehicle-credits"
  },
  {
    id: "us_fed_ev_new",
    title: "Clean Vehicle Tax Credit (Section 30D)",
    category: "transport",
    amount: "Up to $7,500 Credit",
    description: "Get up to $7,500 in tax credits for purchasing a qualified new electric vehicle or plug-in hybrid vehicle.",
    country: "US",
    region: "Federal",
    link: "https://www.fueleconomy.gov/feg/taxcenter.shtml"
  },
  {
    id: "us_fed_ev_used",
    title: "Used Clean Vehicle Tax Credit (Section 25E)",
    category: "transport",
    amount: "Up to $4,000 Credit",
    description: "Claim 30% of the sale price (up to $4,000) for qualifying pre-owned plug-in electric vehicles priced under $25,000.",
    country: "US",
    region: "Federal",
    link: "https://www.irs.gov/credits-deductions/used-clean-vehicle-credit"
  },

  // California
  {
    id: "us_ca_sgip",
    title: "Self-Generation Incentive Program (SGIP)",
    category: "solar",
    amount: "Up to $1,000 / kWh",
    description: "Get rebates for installing battery storage systems at your residence, with higher amounts for low-income or high-fire-risk communities.",
    country: "US",
    region: "CA",
    link: "https://www.cpuc.ca.gov/sgip/"
  },
  {
    id: "us_ca_clean_cars",
    title: "Clean Cars 4 All Program",
    category: "transport",
    amount: "Up to $9,500 Rebate",
    description: "Scrap your older, polluting vehicle and get up to $9,500 to purchase or lease a new or used hybrid, plug-in hybrid, or battery electric vehicle.",
    country: "US",
    region: "CA",
    link: "https://ww2.arb.ca.gov/our-work/programs/clean-cars-4-all"
  },

  // New York
  {
    id: "us_ny_solar",
    title: "NY-Sun Residential Solar Incentive",
    category: "solar",
    amount: "Up to $1,000 rebate",
    description: "Direct regional megawatt incentives that lower the upfront installation cost of solar panels in NY State.",
    country: "US",
    region: "NY",
    link: "https://www.nyserda.ny.gov/All-Programs/NY-Sun"
  },
  {
    id: "us_ny_drive_clean",
    title: "Drive Clean Rebate for Electric Vehicles",
    category: "transport",
    amount: "Up to $2,000 Rebate",
    description: "NY State point-of-sale rebate applied directly to the purchase or lease price of a new electric car.",
    country: "US",
    region: "NY",
    link: "https://www.nyserda.ny.gov/All-Programs/Drive-Clean-Rebate-Program"
  },

  // Texas
  {
    id: "us_tx_utility",
    title: "Local Utility Smart Thermostat Rebates",
    category: "home",
    amount: "Up to $85 rebate",
    description: "Major Texas utilities (Oncor, CenterPoint, Austin Energy) offer credits and rebates for installing Nest or Ecobee programmable thermostats.",
    country: "US",
    region: "TX",
    link: "https://www.austinenergy.com"
  },

  // India
  {
    id: "in_solar_rooftop",
    title: "PM-Surya Ghar: Muft Bijli Yojana (Rooftop Solar)",
    category: "solar",
    amount: "Up to ₹78,000 Subsidy",
    description: "Receive direct central government subsidies of ₹30,000 per kW up to 2kW, and ₹18,000 per kW for the 3rd kW, plus free solar setup guidance.",
    country: "IN",
    region: "National",
    link: "https://pmsuryaghar.gov.in/"
  },
  {
    id: "in_fame",
    title: "FAME-II / Electric Vehicle Subsidies",
    category: "transport",
    amount: "₹10,000 - ₹50,000 Rebate",
    description: "Direct upfront purchase incentives on electric 2-wheelers, 3-wheelers, and electric cars to accelerate clean transport adoption.",
    country: "IN",
    region: "National",
    link: "https://heavyindustries.gov.in"
  },
  {
    id: "in_delhi_ev",
    title: "Delhi Electric Vehicle Policy",
    category: "transport",
    amount: "Road tax & registration waiver",
    description: "Get full exemption from road tax and registration fees for electric vehicles in the National Capital Territory of Delhi.",
    country: "IN",
    region: "DL",
    link: "https://ev.delhi.gov.in"
  },

  // UK
  {
    id: "uk_boiler_upgrade",
    title: "Boiler Upgrade Scheme (BUS)",
    category: "home",
    amount: "Up to £7,500 grant",
    description: "Get financial help from the UK government to replace your fossil fuel boiler with a low-carbon air source heat pump, ground source heat pump, or biomass boiler.",
    country: "UK",
    region: "National",
    link: "https://www.gov.uk/apply-boiler-upgrade-scheme"
  },
  {
    id: "uk_ev_charger",
    title: "EV Chargepoint Grant for Renters & Flat Owners",
    category: "transport",
    amount: "Up to £350 grant",
    description: "Covers 75% of the cost to purchase and install a home EV smart charger for individuals living in flats or rented accommodation.",
    country: "UK",
    region: "National",
    link: "https://www.gov.uk/government/publications/customer-guidance-ev-chargepoint-grant-for-flat-owner-occupiers-and-landlords"
  },

  // Canada
  {
    id: "ca_greener_homes",
    title: "Canada Greener Homes Loan",
    category: "home",
    amount: "Up to $40,000 (0% interest)",
    description: "Interest-free loan over 10 years to help implement major energy retrofits (insulation, windows, heat pumps, solar installations).",
    country: "CA",
    region: "Federal",
    link: "https://www.nrcan.gc.ca/energy-efficiency/homes/canada-greener-homes-initiative/24838"
  },
  {
    id: "ca_izev",
    title: "Incentives for Zero-Emission Vehicles (iZEV)",
    category: "transport",
    amount: "Up to $5,000 rebate",
    description: "Point-of-sale purchase incentive on eligible light-duty fully electric or plug-in hybrid vehicles in Canada.",
    country: "CA",
    region: "Federal",
    link: "https://tc.canada.ca/en/road-transportation/innovative-technologies/zero-emission-vehicles"
  }
];
