/**
 * Lookup tables for garden properties
 * Maps display names to database IDs
 */
export const LOOKUP_TABLES = {
  light: [
    { label: "Full Sun (6 or more hours of direct sunlight a day)", value: 1 },
    { label: "Part Sun (4-6 hours of direct sunlight a day)", value: 2 },
    { label: "Part Shade (2-4 hours of direct sunlight a day)", value: 3 },
    { label: "Deep shade (Less than 2 hours to no direct sunlight)", value: 4 },
  ],
  soil_texture: [
    { label: "none", value: 1 },
    { label: "Clay", value: 2 },
    { label: "High Organic Matter", value: 3 },
    { label: "Loam (Silt)", value: 4 },
    { label: "Sand", value: 5 },
    { label: "Shallow Rocky", value: 6 },
  ],
  soil_drainage: [
    { label: "Good Drainage", value: 1 },
    { label: "Moist", value: 2 },
    { label: "none", value: 3 },
    { label: "Occasionally Dry", value: 4 },
    { label: "Occasionally Wet", value: 5 },
    { label: "Very Dry", value: 6 },
    { label: "Frequent Standing Water", value: 7 },
    { label: "Occasional Flooding", value: 8 },
  ],
  soil_ph: [
    { label: "Acid (<6.0)", value: 1 },
    { label: "Neutral (6.0-8.0)", value: 2 },
    { label: "Alkaline (>8.0)", value: 3 },
    { label: "none", value: 4 },
  ],
  maintenance: [
    { label: "Low", value: 1 },
    { label: "none", value: 2 },
    { label: "Medium", value: 3 },
    { label: "High", value: 4 },
  ],
  texture: [
    { label: "Medium", value: 1 },
    { label: "Fine", value: 2 },
    { label: "none", value: 3 },
    { label: "Coarse", value: 4 },
  ],
  growth_rate: [
    { label: "Medium", value: 1 },
    { label: "none", value: 2 },
    { label: "Rapid", value: 3 },
    { label: "Slow", value: 4 },
  ],
  available_space_to_plant: [
    { label: "3 feet-6 feet", value: 1 },
    { label: "6-feet-12 feet", value: 2 },
    { label: "12 inches-3 feet", value: 3 },
    { label: "more than 60 feet", value: 4 },
    { label: "12-24 feet", value: 5 },
    { label: "24-60 feet", value: 6 },
    { label: "none", value: 7 },
    { label: "Less than 12 inches", value: 8 },
  ],
  landscape_location: [
    { label: "Patio", value: 1 },
    { label: "Recreational Play Area", value: 2 },
    { label: "Coastal", value: 3 },
    { label: "Container", value: 4 },
    { label: "Lawn", value: 5 },
    { label: "Naturalized Area", value: 6 },
    { label: "Slope/Bank", value: 7 },
    { label: "Small Space", value: 8 },
    { label: "none", value: 9 },
    { label: "Riparian", value: 10 },
    { label: "Woodland", value: 11 },
    { label: "Meadow", value: 12 },
    { label: "Rock Wall", value: 13 },
    { label: "Houseplants", value: 14 },
    { label: "Hanging Baskets", value: 15 },
    { label: "Pool/Hardscape", value: 16 },
    { label: "Walkways", value: 17 },
    { label: "Pond", value: 18 },
    { label: "Vertical Spaces", value: 19 },
    { label: "Near Septic", value: 20 },
  ],
  landscape_theme: [
    { label: "Children's Garden", value: 1 },
    { label: "Pollinator Garden", value: 2 },
    { label: "Cottage Garden", value: 3 },
    { label: "Butterfly Garden", value: 4 },
    { label: "Drought Tolerant Garden", value: 5 },
    { label: "Winter Garden", value: 6 },
    { label: "Rock Garden", value: 7 },
    { label: "none", value: 8 },
    { label: "Cutting Garden", value: 9 },
    { label: "Edible Garden", value: 10 },
    { label: "Water Garden", value: 11 },
    { label: "Rain Garden", value: 12 },
    { label: "Garden for the Blind", value: 13 },
    { label: "Nighttime Garden", value: 14 },
    { label: "Asian Garden", value: 15 },
    { label: "English Garden", value: 16 },
    { label: "Shade Garden", value: 17 },
    { label: "Native Garden", value: 18 },
    { label: "Fairy Garden", value: 19 },
  ],
  attracts: [
    { label: "Butterflies", value: 1 },
    { label: "Hummingbirds", value: 2 },
    { label: "Pollinators", value: 3 },
    { label: "Bees", value: 4 },
    { label: "none", value: 5 },
    { label: "Songbirds", value: 6 },
    { label: "Small Mammals", value: 7 },
    { label: "Moths", value: 8 },
    { label: "Specialized Bees", value: 9 },
    { label: "Predatory Insects", value: 10 },
    { label: "Reptiles", value: 11 },
    { label: "Frogs", value: 12 },
    { label: "Bats", value: 13 },
  ],
  resistance_to_challenges: [
    { label: "Deer", value: 1 },
    { label: "Drought", value: 2 },
    { label: "Heat", value: 3 },
    { label: "Diseases", value: 4 },
    { label: "Insect Pests", value: 5 },
    { label: "Erosion", value: 6 },
    { label: "Pollution", value: 7 },
    { label: "Salt", value: 8 },
    { label: "Urban Conditions", value: 9 },
    { label: "Dry Soil", value: 10 },
    { label: "none", value: 11 },
    { label: "Humidity", value: 12 },
    { label: "Wet Soil", value: 13 },
    { label: "Rabbits", value: 14 },
    { label: "Compaction", value: 15 },
    { label: "Wind", value: 16 },
    { label: "Fire", value: 17 },
    { label: "Heavy Shade", value: 18 },
    { label: "Black Walnut", value: 19 },
    { label: "Poor Soil", value: 20 },
    { label: "Foot Traffic", value: 21 },
    { label: "Squirrels", value: 22 },
    { label: "Voles", value: 23 },
    { label: "Storm damage", value: 24 },
    { label: "Slugs", value: 25 },
  ],
  problems: [
    { label: "none", value: 1 },
    { label: "Contact Dermatitis", value: 2 },
    { label: "Poisonous to Humans", value: 3 },
    { label: "Problem for Cats", value: 4 },
    { label: "Problem for Dogs", value: 5 },
    { label: "Problem for Horses", value: 6 },
    { label: "Weedy", value: 7 },
    { label: "Spines/Thorns", value: 8 },
    { label: "Weak Wood", value: 9 },
    { label: "Messy", value: 10 },
    { label: "Short-lived", value: 11 },
    { label: "Problem for Children", value: 12 },
    { label: "Invasive Species", value: 13 },
    { label: "Malodorous", value: 14 },
    { label: "Allelopathic", value: 15 },
    { label: "Frequent Disease Problems", value: 16 },
    { label: "Frequent Insect Problems", value: 17 },
  ],
  flower_color: [
    { label: "Gold/Yellow", value: 1 },
    { label: "Pink", value: 2 },
    { label: "White", value: 3 },
    { label: "Purple/Lavender", value: 4 },
    { label: "Red/Burgundy", value: 5 },
    { label: "none", value: 6 },
    { label: "Brown/Copper", value: 7 },
    { label: "Insignificant", value: 8 },
    { label: "Green", value: 9 },
    { label: "Orange", value: 10 },
    { label: "Variegated", value: 11 },
    { label: "Cream/Tan", value: 12 },
    { label: "Gray/Silver", value: 13 },
    { label: "Blue", value: 14 },
    { label: "Black", value: 15 },
  ],
  leaf_color: [
    { label: "Green", value: 1 },
    { label: "Gold/Yellow", value: 2 },
    { label: "Purple/Lavender", value: 3 },
    { label: "Variegated", value: 4 },
    { label: "Red/Burgundy", value: 5 },
    { label: "Cream/Tan", value: 6 },
    { label: "Gray/Silver", value: 7 },
    { label: "White", value: 8 },
    { label: "Blue", value: 9 },
    { label: "Black", value: 10 },
    { label: "Orange", value: 11 },
    { label: "Pink", value: 12 },
    { label: "Brown/Copper", value: 13 },
    { label: "none", value: 14 },
    { label: "Insignificant", value: 15 },
  ],
  // Updated lookup tables based on database values
  nc_regions: [
    { label: "none", value: 1 },
    { label: "Coastal", value: 2 },
    { label: "Mountains", value: 3 },
    { label: "Piedmont", value: 4 },
  ],
  usda_zone: [
    { label: "1a", value: 24 },
    { label: "1b", value: 25 },
    { label: "2a", value: 20 },
    { label: "2b", value: 21 },
    { label: "3a", value: 16 },
    { label: "3b", value: 17 },
    { label: "4a", value: 10 },
    { label: "4b", value: 11 },
    { label: "5a", value: 12 },
    { label: "5b", value: 13 },
    { label: "6a", value: 7 },
    { label: "6b", value: 8 },
    { label: "7a", value: 1 },
    { label: "7b", value: 2 },
    { label: "8a", value: 3 },
    { label: "8b", value: 4 },
    { label: "9a", value: 5 },
    { label: "9b", value: 6 },
    { label: "10a", value: 14 },
    { label: "10b", value: 15 },
    { label: "11a", value: 18 },
    { label: "11b", value: 19 },
    { label: "12a", value: 22 },
    { label: "12b", value: 23 },
    { label: "13a", value: 26 },
    { label: "13b", value: 27 },
  ],
  flower_bloom_time: [
    { label: "Spring", value: 2 },
    { label: "Summer", value: 3 },
    { label: "Fall", value: 1 },
    { label: "none", value: 4 },
    { label: "Winter", value: 5 },
  ],
  flower_value_to_gardener: [
    { label: "Fragrant", value: 1 },
    { label: "Showy", value: 2 },
    { label: "Long Bloom Season", value: 3 },
    { label: "Long-lasting", value: 4 },
    { label: "Good Cut", value: 5 },
    { label: "Edible", value: 6 },
    { label: "none", value: 7 },
    { label: "Good Dried", value: 8 },
  ],
  leaf_feel: [
    { label: "none", value: 1 },
    { label: "Glossy", value: 2 },
    { label: "Smooth", value: 3 },
    { label: "Prickly", value: 4 },
    { label: "Soft", value: 5 },
    { label: "Leathery", value: 6 },
    { label: "Rough", value: 7 },
    { label: "Slippery", value: 8 },
    { label: "Velvety", value: 9 },
    { label: "Papery", value: 10 },
    { label: "Fleshy", value: 11 },
    { label: "Waxy", value: 12 },
    { label: "Rubbery", value: 13 },
  ],
  leaf_value: [
    { label: "none", value: 1 },
    { label: "Long-lasting", value: 2 },
    { label: "Showy", value: 3 },
    { label: "Edible", value: 4 },
    { label: "Fragrant", value: 5 },
    { label: "Good Dried", value: 6 },
    { label: "Good Cut", value: 7 },
  ],
  fall_color: [
    { label: "none", value: 1 },
    { label: "Brown/Copper", value: 2 },
    { label: "Purple/Lavender", value: 3 },
    { label: "Red/Burgundy", value: 4 },
    { label: "Gold/Yellow", value: 5 },
    { label: "Orange", value: 6 },
    { label: "Pink", value: 8 },
    { label: "Gray/Silver", value: 9 },
    { label: "Cream/Tan", value: 10 },
  ],
  habit_form: [
    { label: "Erect", value: 1 },
    { label: "Open", value: 2 },
    { label: "Rounded", value: 3 },
    { label: "Spreading", value: 4 },
    { label: "Arching", value: 5 },
    { label: "Dense", value: 6 },
    { label: "Multi-stemmed", value: 7 },
    { label: "none", value: 8 },
    { label: "Mounding", value: 9 },
    { label: "Prostrate", value: 10 },
    { label: "Multi-trunked", value: 11 },
    { label: "Conical", value: 12 },
    { label: "Columnar", value: 13 },
    { label: "Pyramidal", value: 14 },
    { label: "Irregular", value: 15 },
    { label: "Cascading", value: 16 },
    { label: "Weeping", value: 17 },
    { label: "Clumping", value: 18 },
    { label: "Creeping", value: 19 },
    { label: "Oval", value: 20 },
    { label: "Horizontal", value: 21 },
    { label: "Vase", value: 22 },
    { label: "Broad", value: 23 },
    { label: "Climbing", value: 24 },
    { label: "Ascending", value: 25 },
  ],
  plant_type: [
    { label: "Shrub", value: 1 },
    { label: "Perennial", value: 2 },
    { label: "Ground Cover", value: 3 },
    { label: "Annual", value: 4 },
    { label: "Edible", value: 5 },
    { label: "Vegetable", value: 6 },
    { label: "Warm Season Vegetable", value: 7 },
    { label: "Herbaceous Perennial", value: 8 },
    { label: "Tree", value: 9 },
    { label: "Native Plant", value: 10 },
    { label: "Poisonous", value: 11 },
    { label: "Vine", value: 12 },
    { label: "Houseplant", value: 13 },
    { label: "Weed", value: 14 },
    { label: "Wildflower", value: 15 },
    { label: "Bulb", value: 16 },
    { label: "none", value: 17 },
    { label: "Water Plant", value: 18 },
    { label: "Ornamental Grasses and Sedges", value: 19 },
    { label: "Succulent", value: 20 },
    { label: "Fern", value: 21 },
    { label: "Epiphyte", value: 22 },
    { label: "Turfgrass", value: 23 },
    { label: "Cool Season Vegetable", value: 24 },
    { label: "Herb", value: 25 },
    { label: "Mushroom", value: 26 },
    { label: "Carnivorous", value: 27 },
    { label: "Rose", value: 28 },
  ],
  design_feature: [
    { label: "Accent", value: 1 },
    { label: "Border", value: 2 },
    { label: "Hedge", value: 3 },
    { label: "Mass Planting", value: 4 },
    { label: "Specimen", value: 5 },
    { label: "Foundation Planting", value: 6 },
    { label: "Screen/Privacy", value: 7 },
    { label: "none", value: 8 },
    { label: "Small groups", value: 9 },
    { label: "Barrier", value: 10 },
    { label: "Shade Tree", value: 11 },
    { label: "Small Tree", value: 12 },
    { label: "Flowering Tree", value: 13 },
    { label: "Street Tree", value: 14 },
    { label: "Understory Tree", value: 15 },
    { label: "Security", value: 16 },
  ],
};

/**
 * Convert garden display names to database IDs
 *
 * @param names Array of display names (e.g., ["Full Sun", "Partial Shade"])
 * @param lookupTable Lookup table with label/value pairs
 * @returns Array of numeric IDs
 */
export const getIdsFromNames = (
  names: string[] | undefined,
  lookupTable: Array<{ label: string; value: number }>
): number[] => {
  if (!names || names.length === 0) return [];
  return names
    .map((name) => {
      const option = lookupTable.find((option) => option.label === name);
      return option ? option.value : null;
    })
    .filter((id): id is number => id !== null);
};

/**
 * Convert database IDs to display names
 *
 * @param ids Array of database IDs
 * @param lookupTable Lookup table with label/value pairs
 * @returns Array of display names
 */
export const getNamesFromIds = (
  ids: number[] | undefined,
  lookupTable: Array<{ label: string; value: number }>
): string[] => {
  if (!ids || ids.length === 0) return [];
  return ids
    .map((id) => {
      const option = lookupTable.find((option) => option.value === id);
      return option ? option.label : null;
    })
    .filter((name): name is string => name !== null);
};

/**
 * Format garden condition values for display
 *
 * @param values Array of condition values
 * @returns Formatted string for display
 */
export const formatConditionValues = (values: string[] | undefined): string => {
  if (!values || values.length === 0) return "";
  return values.join(", ");
};

/**
 * Get a visual indicator color based on the number of conditions set
 *
 * @param percent Number of condition values
 * @returns Color code for completeness indicator
 */
export const getCompletionColor = (percent: number): string => {
  if (percent < 30) return "#E50000"; // Brand destructive color
  if (percent < 70) return "#ffd900"; // Brand accent-200 (yellow)
  return "#77B860"; // brand-500 (green)
};

/**
 * Calculate the completion percentage of a garden's settings using a weighted approach
 * 
 * @param garden Garden object with settings fields or form values
 * @returns Percentage of completed fields (0-100)
 */
export const calculateGardenCompletion = (garden: any): number => {
  // Define weights for each field category
  const FIELD_WEIGHTS: Record<string, number> = {
    // Basic Info - Name is most important
    name: 3,
    nc_regions: 1,
    nc_region_ids: 1,
    usda_zones: 1,
    usda_zone_ids: 1,

    // Environment - All fields are important
    sunlight_conditions: 2,
    sunlight: 2,
    sunlight_ids: 2,
    light_ids: 2,
    soil_textures: 2,
    soil_texture: 2,
    soil_texture_ids: 2,
    soil_ph_ranges: 2,
    soil_ph: 2,
    soil_ph_ids: 2,
    soil_drainage: 2,
    soil_drainage_ids: 2,
    available_space_to_plant: 1,
    available_space: 1,
    available_space_to_plant_ids: 1,

    // Design - Location is most important
    landscape_locations: 2,
    locations: 2,
    landscape_location_ids: 2,
    location_ids: 2,
    garden_themes: 2,
    landscape_theme_ids: 2,
    design_features: 1,
    design_feature_ids: 1,

    // Plants
    plant_types: 2,
    plant_type_ids: 2,
    habit_forms: 1,
    habit_form_ids: 1,
    growth_rate: 1,
    growth_rate_id: 1,
    wildlife_attractions: 1,
    attracts_ids: 1,
    resistance_challenges: 1,
    resistance_to_challenges_ids: 1,
    problems: 1,
    problems_ids: 1,

    // Aesthetics
    flower_colors: 2,
    flower_color_ids: 2,
    flower_bloom_times: 1,
    flower_bloom_time_ids: 1,
    flower_values: 1,
    flower_value_to_gardener_ids: 1,
    leaf_colors: 2,
    leaf_color_ids: 2,
    leaf_feels: 1,
    leaf_feel_ids: 1,
    leaf_values: 1,
    leaf_value_ids: 1,
    fall_colors: 1,
    fall_color_ids: 1,
    texture: 1,
    texture_preference: 1,
    texture_id: 1,
    texture_preference_id: 1,

    // Preferences
    maintenance: 2,
    maintenance_level: 2,
    maintenance_id: 2,
    maintenance_level_id: 2,
    wants_recommendations: 1,
    year_round_interest: 1,
  };

  // Total possible points
  let totalPossiblePoints = 0;
  let totalCompletionPoints = 0;

  // Check each field in the garden or form values object
  for (const [field, value] of Object.entries(garden)) {
    // Skip if field has no weight defined
    if (!(field in FIELD_WEIGHTS)) continue;
    
    const weight = FIELD_WEIGHTS[field];
    totalPossiblePoints += weight;

    // Check if field has a value based on its type
    if (field === "name") {
      // Name field is a string, so check if it has content
      if (value && typeof value === 'string' && value.trim().length > 0) {
        totalCompletionPoints += weight;
      }
    } else if (["wants_recommendations", "year_round_interest"].includes(field)) {
      // Boolean fields - they're considered filled if they have a value
      if (value !== null && value !== undefined) {
        totalCompletionPoints += weight;
      }
    } else if (Array.isArray(value)) {
      // Array fields - check if they have at least one valid selection
      if (value && value.length > 0) {
        totalCompletionPoints += weight;
      }
    } else if (value !== null && value !== undefined && value !== "") {
      // Single value fields - check if they have a value
      totalCompletionPoints += weight;
    }
  }

  // Calculate overall completion percentage
  return totalPossiblePoints > 0
    ? Math.round((totalCompletionPoints / totalPossiblePoints) * 100)
    : 0;
};

/**
 * Get descriptive status text for completion percentage
 * 
 * @param percent Completion percentage (0-100)
 * @returns Text description of completion status
 */
export const getCompletionStatusText = (percent: number): string => {
  if (percent === 100) return "Complete";
  if (percent >= 70) return "Almost complete";
  if (percent >= 30) return "In progress";
  if (percent > 0) return "Just started";
  return "Not started";
};
