import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "../supabaseClient";
import { Garden } from "@/types/garden";

export interface GardenFilterOption {
  id: string;
  name: string;
  gardenId: number;
  filters: string[];
  isDefault: boolean;
}

// GreenThumb Filter System Note:
// This filter system does NOT require a user_gardens_for_filters join table.
// Filters are derived directly from each garden's properties (e.g., sunlight, soil, plant types, etc.).
// The Supabase view/table (user_gardens_full_data) must contain all necessary fields for filter construction.
// If you change the garden schema, update the filter mapping logic below accordingly.
// Reason: Simpler, more maintainable, and avoids unnecessary indirection.

/**
 * Custom hook to manage garden-based filtering for the plant database
 * Automatically applies the first garden's conditions as default filters
 */
export const useGardenFilters = () => {
  const { user } = useUser();

  // Fetch user's gardens with full condition data
  const { data: gardens, isLoading } = useQuery<Garden[], Error>({
    queryKey: ["userGardensForFilters", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("user_gardens_flat")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }); // Order by creation date, first garden first

      if (error) {
        console.error("Error fetching gardens for filters:", error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Convert garden conditions to plant database filter format
  const convertGardenToFilters = (garden: Garden): string[] => {
    const filters: string[] = [];

    // Light conditions
    if (garden.sunlight) {
      filters.push(`light|${garden.sunlight}`);
    }

    // Soil conditions
    if (garden.soil_texture) {
      filters.push(`soil-texture|${garden.soil_texture}`);
    }

    // Reason: Defensive check for array-like fields from Supabase (Json | null)
    if (Array.isArray(garden.soil_drainage) && garden.soil_drainage.length > 0) {
      (garden.soil_drainage as string[]).forEach((drainage: string) => {
        filters.push(`soil-drainage|${drainage}`);
      });
    }

    if (Array.isArray(garden.soil_ph) && garden.soil_ph.length > 0) {
      (garden.soil_ph as string[]).forEach((ph: string) => {
        filters.push(`soil-ph|${ph}`);
      });
    }

    // Plant preferences
    if (Array.isArray(garden.plant_types) && garden.plant_types.length > 0) {
      (garden.plant_types as string[]).forEach((type: string) => {
        filters.push(`plant-type|${type}`);
      });
    }

    if (Array.isArray(garden.habit_forms) && garden.habit_forms.length > 0) {
      (garden.habit_forms as string[]).forEach((form: string) => {
        filters.push(`habit-form|${form}`);
      });
    }

    // Garden themes
    if (Array.isArray(garden.garden_themes) && garden.garden_themes.length > 0) {
      (garden.garden_themes as string[]).forEach((theme: string) => {
        filters.push(`landscape-theme|${theme}`);
      });
    }

    // Wildlife attractions
    if (Array.isArray(garden.wildlife_attractions) && garden.wildlife_attractions.length > 0) {
      (garden.wildlife_attractions as string[]).forEach((attraction: string) => {
        filters.push(`attracts|${attraction}`);
      });
    }

    // Resistance challenges
    if (Array.isArray(garden.resistance_challenges) && garden.resistance_challenges.length > 0) {
      (garden.resistance_challenges as string[]).forEach((challenge: string) => {
        filters.push(`resistance-to-challenges|${challenge}`);
      });
    }

    // Location preferences
    if (Array.isArray(garden.nc_regions) && garden.nc_regions.length > 0) {
      (garden.nc_regions as string[]).forEach((region: string) => {
        filters.push(`nc-regions|${region}`);
      });
    }

    if (Array.isArray(garden.usda_zones) && garden.usda_zones.length > 0) {
      (garden.usda_zones as string[]).forEach((zone: string) => {
        filters.push(`usda-zones|${zone}`);
      });
    }

    // Growth rate
    if (Array.isArray(garden.growth_rates) && garden.growth_rates.length > 0) {
      (garden.growth_rates as string[]).forEach((rate: string) => {
        filters.push(`growth-rate|${rate}`);
      });
    }

    // Maintenance level
    if (garden.maintenance_level) {
      filters.push(`maintenance|${garden.maintenance_level}`);
    }

    // Available space
    if (garden.available_space) {
      filters.push(`available-space-to-plant|${garden.available_space}`);
    }

    // Flower characteristics
    if (Array.isArray(garden.flower_colors) && garden.flower_colors.length > 0) {
      (garden.flower_colors as string[]).forEach((color: string) => {
        filters.push(`flower-color|${color}`);
      });
    }
    if (Array.isArray(garden.flower_bloom_times) && garden.flower_bloom_times.length > 0) {
      (garden.flower_bloom_times as string[]).forEach((time: string) => {
        filters.push(`flower-bloom-time|${time}`);
      });
    }

    // Leaf characteristics
    if (Array.isArray(garden.leaf_colors) && garden.leaf_colors.length > 0) {
      (garden.leaf_colors as string[]).forEach((color: string) => {
        filters.push(`leaf-color|${color}`);
      });
    }
    if (Array.isArray(garden.fall_colors) && garden.fall_colors.length > 0) {
      (garden.fall_colors as string[]).forEach((color: string) => {
        filters.push(`fall-color|${color}`);
      });
    }

    // Exclude problems
    if (Array.isArray(garden.problems) && garden.problems.length > 0) {
      (garden.problems as string[]).forEach((problem: string) => {
        filters.push(`problems|${problem}`);
      });
    }

    return filters;
  };

  // Generate garden filter options
  const gardenFilterOptions: GardenFilterOption[] = gardens?.map((garden: Garden, index: number) => ({
    id: `garden-${garden.id}`,
    // Reason: name is string | null in DB, but must be string for UI. Fallback to empty string if null.
    name: garden.name ?? "",
    // Reason: id is number | null in DB, but must be number for UI. Fallback to -1 if null.
    gardenId: garden.id ?? -1,
    filters: convertGardenToFilters(garden),
    isDefault: index === 0, // First garden (oldest) is default
  })) || [];

  // Get default filters (from the first garden)
  const defaultFilters = gardenFilterOptions.length > 0 
    ? gardenFilterOptions[0].filters.join(",")
    : "";

  // Check if user has any gardens
  const hasGardens = gardens && gardens.length > 0;

  return {
    gardens,
    gardenFilterOptions,
    defaultFilters,
    hasGardens,
    isLoading,
  };
};