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
    { label: "Sand", value: 1 },
    { label: "Clay", value: 2 },
    { label: "Loam", value: 3 },
    { label: "Rocky", value: 4 },
  ],
  soil_drainage: [
    { label: "Well-drained", value: 1 },
    { label: "Moist", value: 2 },
    { label: "Poorly Drained", value: 3 },
    { label: "Wet", value: 4 },
    { label: "Occasionally Wet", value: 5 },
  ],
  soil_ph: [
    { label: "Acid (less than 6.0)", value: 1 },
    { label: "Neutral (6.0-8.0)", value: 2 },
    { label: "Alkaline (above 8.0)", value: 3 },
  ],
  maintenance: [
    { label: "Low", value: 1 },
    { label: "Medium", value: 2 },
    { label: "High", value: 3 },
  ],
  growth_rate: [
    { label: "Slow", value: 1 },
    { label: "Medium", value: 2 },
    { label: "Fast", value: 3 },
  ],
  available_space_to_plant: [
    { label: "3 feet-6 feet", value: 1 },
    { label: "6 feet-9 feet", value: 2 },
    { label: "Greater than 9 feet", value: 3 },
  ],
  landscape_location: [
    { label: "Coastal", value: 3 },
    { label: "Pool/Hardscape", value: 16 },
  ],
  landscape_theme: [
    { label: "Cottage Garden", value: 1 },
    { label: "Modern", value: 2 },
    { label: "Formal", value: 3 },
    { label: "Japanese", value: 4 },
    { label: "Mediterranean", value: 5 },
    { label: "Woodland", value: 6 },
    { label: "Tropical", value: 7 },
    { label: "Xeriscape", value: 8 },
    { label: "Rain Garden", value: 9 },
    { label: "Edible Garden", value: 10 },
  ],
  attracts: [
    { label: "Bees", value: 1 },
    { label: "Butterflies", value: 2 },
    { label: "Hummingbirds", value: 3 },
    { label: "Birds", value: 4 },
    { label: "Frogs", value: 12 },
  ],
  resistance_to_challenges: [
    { label: "Deer Resistant", value: 1 },
    { label: "Drought Tolerant", value: 2 },
    { label: "Salt Tolerant", value: 3 },
    { label: "Heat Tolerant", value: 4 },
    { label: "Cold Hardy", value: 5 },
    { label: "Compaction", value: 15 },
  ],
  problems: [
    { label: "Invasive Tendency", value: 1 },
    { label: "Thorns/Spines", value: 2 },
    { label: "Toxic to Pets", value: 3 },
    { label: "Toxic to Humans", value: 4 },
    { label: "High Allergen", value: 5 },
    { label: "High Maintenance", value: 6 },
    { label: "Frequent Disease Problems", value: 16 },
  ],
  flower_color: [
    { label: "Gold/Yellow", value: 1 },
    { label: "Orange", value: 2 },
    { label: "Red/Burgundy", value: 3 },
    { label: "Purple/Lavender", value: 4 },
    { label: "Blue", value: 5 },
    { label: "Pink", value: 6 },
    { label: "White", value: 7 },
    { label: "Brown/Copper", value: 8 },
    { label: "Green", value: 9 },
  ],
  leaf_color: [
    { label: "Dark Green", value: 1 },
    { label: "Gold/Yellow", value: 2 },
    { label: "Gray/Silver", value: 3 },
    { label: "White", value: 4 },
    { label: "Red/Burgundy", value: 5 },
    { label: "Purple/Lavender", value: 6 },
    { label: "Green", value: 7 },
    { label: "Variegated", value: 8 },
    { label: "Blue", value: 9 },
  ],
  texture: [
    { label: "Coarse", value: 1 },
    { label: "Fine", value: 2 },
    { label: "Medium", value: 3 },
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
  if (percent < 30) return "#ef4444"; // red-500
  if (percent < 70) return "#f59e0b"; // amber-500
  return "#77B860"; // brand-500
};
