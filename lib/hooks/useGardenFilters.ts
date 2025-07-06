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
        .from("user_gardens_full_data")
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

    if (garden.soil_drainage && garden.soil_drainage.length > 0) {
      garden.soil_drainage.forEach(drainage => {
        filters.push(`soil-drainage|${drainage}`);
      });
    }

    if (garden.soil_ph_ranges && garden.soil_ph_ranges.length > 0) {
      garden.soil_ph_ranges.forEach(ph => {
        filters.push(`soil-ph|${ph}`);
      });
    }

    // Plant preferences
    if (garden.plant_types && garden.plant_types.length > 0) {
      garden.plant_types.forEach(type => {
        filters.push(`plant-type|${type}`);
      });
    }

    if (garden.habit_forms && garden.habit_forms.length > 0) {
      garden.habit_forms.forEach(form => {
        filters.push(`habit-form|${form}`);
      });
    }

    // Garden themes
    if (garden.garden_themes && garden.garden_themes.length > 0) {
      garden.garden_themes.forEach(theme => {
        filters.push(`landscape-theme|${theme}`);
      });
    }

    // Wildlife attractions
    if (garden.wildlife_attractions && garden.wildlife_attractions.length > 0) {
      garden.wildlife_attractions.forEach(attraction => {
        filters.push(`attracts|${attraction}`);
      });
    }

    // Resistance challenges
    if (garden.resistance_challenges && garden.resistance_challenges.length > 0) {
      garden.resistance_challenges.forEach(challenge => {
        filters.push(`resistance-to-challenges|${challenge}`);
      });
    }

    // Location preferences
    if (garden.landscape_locations && garden.landscape_locations.length > 0) {
      garden.landscape_locations.forEach(location => {
        filters.push(`landscape-location|${location}`);
      });
    }

    // Growth rate
    if (garden.growth_rates && garden.growth_rates.length > 0) {
      garden.growth_rates.forEach(rate => {
        filters.push(`growth-rate|${rate}`);
      });
    }

    // Maintenance level
    if (garden.maintenance || garden.maintenance_level) {
      const maintenanceLevel = garden.maintenance || garden.maintenance_level;
      filters.push(`maintenance|${maintenanceLevel}`);
    }

    // Available space
    if (garden.available_space) {
      filters.push(`available-space-to-plant|${garden.available_space}`);
    }

    // NC regions
    if (garden.nc_regions && garden.nc_regions.length > 0) {
      garden.nc_regions.forEach(region => {
        filters.push(`nc-regions|${region}`);
      });
    }

    // USDA zones
    if (garden.usda_zones && garden.usda_zones.length > 0) {
      garden.usda_zones.forEach(zone => {
        filters.push(`usda-zones|${zone}`);
      });
    }

    // Flower characteristics
    if (garden.flower_colors && garden.flower_colors.length > 0) {
      garden.flower_colors.forEach(color => {
        filters.push(`flower-color|${color}`);
      });
    }

    if (garden.flower_bloom_times && garden.flower_bloom_times.length > 0) {
      garden.flower_bloom_times.forEach(time => {
        filters.push(`flower-bloom-time|${time}`);
      });
    }

    // Leaf characteristics
    if (garden.leaf_colors && garden.leaf_colors.length > 0) {
      garden.leaf_colors.forEach(color => {
        filters.push(`leaf-color|${color}`);
      });
    }

    if (garden.fall_colors && garden.fall_colors.length > 0) {
      garden.fall_colors.forEach(color => {
        filters.push(`fall-color|${color}`);
      });
    }

    // Exclude problems
    if (garden.problems && garden.problems.length > 0) {
      garden.problems.forEach(problem => {
        filters.push(`problems|${problem}`);
      });
    }

    return filters;
  };

  // Generate garden filter options
  const gardenFilterOptions: GardenFilterOption[] = gardens?.map((garden: Garden, index: number) => ({
    id: `garden-${garden.id}`,
    name: garden.name,
    gardenId: garden.id,
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