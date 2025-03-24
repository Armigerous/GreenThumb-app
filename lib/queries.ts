import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlantCards, searchPlants, getPlantDetails } from "./supabaseApi";
import type { ApiResponse, PlantCardData, PlantData } from "@/types/plant";
import type { Garden, GardenDashboard } from "@/types/garden";
import { useEffect } from "react";
import {
  shouldUpdateCache,
  saveToStorage,
  getFromStorage,
  STORAGE_KEYS,
  getPlantDetailKey,
} from "./storage";
import { supabase } from "./supabaseClient";

// Constants for caching
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Plant cards query hook
export function usePlantCards(
  page: number = 1,
  limit: number = 28,
  query: string = "",
  filters: string = "",
  nameType: string = "scientific"
) {
  const queryClient = useQueryClient();

  // Effect to check for daily updates
  useEffect(() => {
    const checkAndUpdateCache = async () => {
      const storageKey = `${STORAGE_KEYS.PLANTS_CACHE}_${page}_${limit}_${query}_${filters}_${nameType}`;
      const cachedData = await getFromStorage<ApiResponse>(
        storageKey,
        ONE_DAY_MS
      );

      if (!cachedData) {
        // No valid cache, will trigger a fetch
        queryClient.invalidateQueries({
          queryKey: ["plants", { page, limit, query, filters, nameType }],
        });
      } else {
        // Set the cached data to avoid a network request
        queryClient.setQueryData(
          ["plants", { page, limit, query, filters, nameType }],
          cachedData.data
        );
      }
    };

    checkAndUpdateCache();
  }, [queryClient, page, limit, query, filters, nameType]);

  return useQuery<ApiResponse, Error>({
    queryKey: ["plants", { page, limit, query, filters, nameType }],
    queryFn: async () => {
      const result = await fetchPlantCards(
        page,
        limit,
        query,
        filters,
        nameType
      );

      // Save to persistent storage
      const storageKey = `${STORAGE_KEYS.PLANTS_CACHE}_${page}_${limit}_${query}_${filters}_${nameType}`;
      await saveToStorage(storageKey, result);

      return result;
    },
    staleTime: ONE_DAY_MS, // Cache for a full day
    gcTime: ONE_DAY_MS * 7, // Keep in cache for a week
  });
}

// Plant search query hook
export function usePlantSearch(
  query: string = "",
  nameType: string = "scientific",
  limit: number = 7
) {
  const queryClient = useQueryClient();

  // Effect to check for daily updates
  useEffect(() => {
    if (query.length === 0) return;

    const checkAndUpdateCache = async () => {
      const storageKey = `${STORAGE_KEYS.PLANTS_CACHE}_search_${query}_${nameType}_${limit}`;
      const cachedData = await getFromStorage<PlantCardData[]>(
        storageKey,
        ONE_DAY_MS
      );

      if (!cachedData) {
        // No valid cache, will trigger a fetch
        queryClient.invalidateQueries({
          queryKey: ["plantSearch", { query, nameType, limit }],
        });
      } else {
        // Set the cached data to avoid a network request
        queryClient.setQueryData(
          ["plantSearch", { query, nameType, limit }],
          cachedData.data
        );
      }
    };

    checkAndUpdateCache();
  }, [queryClient, query, nameType, limit]);

  return useQuery<PlantCardData[], Error>({
    queryKey: ["plantSearch", { query, nameType, limit }],
    queryFn: async () => {
      const result = await searchPlants(query, nameType, limit);

      // Save to persistent storage if there's a query
      if (query.length > 0) {
        const storageKey = `${STORAGE_KEYS.PLANTS_CACHE}_search_${query}_${nameType}_${limit}`;
        await saveToStorage(storageKey, result);
      }

      return result;
    },
    enabled: query.length > 0, // Only run query if search term exists
    staleTime: ONE_DAY_MS, // Cache for a full day
    gcTime: ONE_DAY_MS * 7, // Keep in cache for a week
  });
}

// Plant details query hook
export function usePlantDetails(slug: string) {
  const queryClient = useQueryClient();

  // Effect to check for daily updates
  useEffect(() => {
    if (!slug) return;

    const checkAndUpdateCache = async () => {
      const storageKey = getPlantDetailKey(slug);
      const cachedData = await getFromStorage<PlantData>(
        storageKey,
        ONE_DAY_MS
      );

      if (!cachedData) {
        // No valid cache, will trigger a fetch
        queryClient.invalidateQueries({ queryKey: ["plantDetails", slug] });
      } else {
        // Set the cached data to avoid a network request
        queryClient.setQueryData(["plantDetails", slug], cachedData.data);
      }
    };

    checkAndUpdateCache();
  }, [queryClient, slug]);

  return useQuery<PlantData, Error>({
    queryKey: ["plantDetails", slug],
    queryFn: async () => {
      const result = await getPlantDetails(slug);

      // Save to persistent storage
      if (slug) {
        const storageKey = getPlantDetailKey(slug);
        await saveToStorage(storageKey, result);
      }

      return result;
    },
    staleTime: ONE_DAY_MS, // Cache for a full day
    gcTime: ONE_DAY_MS * 7, // Keep in cache for a week
    enabled: !!slug, // Only run if slug is provided
  });
}

// Prefetch plant details (for hover or anticipated navigation)
export function usePrefetchPlantDetails() {
  const queryClient = useQueryClient();

  return async (slug: string) => {
    if (slug) {
      // First check if we have it in persistent storage
      const storageKey = getPlantDetailKey(slug);
      const cachedData = await getFromStorage<PlantData>(
        storageKey,
        ONE_DAY_MS
      );

      if (cachedData) {
        // Use cached data if available
        queryClient.setQueryData(["plantDetails", slug], cachedData.data);
      } else {
        // Otherwise prefetch from API
        queryClient.prefetchQuery({
          queryKey: ["plantDetails", slug],
          queryFn: async () => {
            const result = await getPlantDetails(slug);
            await saveToStorage(storageKey, result);
            return result;
          },
          staleTime: ONE_DAY_MS, // Cache for a full day
        });
      }
    }
  };
}

// Garden Dashboard query
export function useGardenDashboard(userId?: string) {
  const queryClient = useQueryClient();

  return useQuery<GardenDashboard[], Error>({
    queryKey: ["gardenDashboard", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      // Fetch from the dashboard materialized view
      const { data: dashboards, error } = await supabase
        .from("user_gardens_dashboard")
        .select(
          `
          garden_id,
          user_id,
          name,
          updated_at,
          total_plants,
          healthy_plants,
          plants_needing_care,
          health_percentage,
          upcoming_tasks,
          upcoming_tasks_count,
          plants
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching garden dashboard:", error);
        throw new Error(error.message);
      }

      return dashboards || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Update existing garden queries to use proper types
export function useUserGardens(userId?: string) {
  const queryClient = useQueryClient();

  return useQuery<Garden[], Error>({
    queryKey: ["userGardens", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data: gardens, error } = await supabase
        .from("user_gardens_full_data")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching gardens:", error);
        throw new Error(error.message);
      }

      return gardens || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useGardenDetails(gardenId: number) {
  const queryClient = useQueryClient();

  return useQuery<Garden & { dashboard?: GardenDashboard }, Error>({
    queryKey: ["gardenDetails", gardenId],
    queryFn: async () => {
      if (!gardenId) throw new Error("Garden ID is required");

      // Fetch both full data and dashboard data
      const [
        { data: garden, error: gardenError },
        { data: dashboard, error: dashboardError },
      ] = await Promise.all([
        supabase
          .from("user_gardens_full_data")
          .select("*")
          .eq("id", gardenId)
          .single(),
        supabase
          .from("user_gardens_dashboard")
          .select("*")
          .eq("garden_id", gardenId)
          .single(),
      ]);

      if (gardenError) {
        console.error("Supabase error fetching garden details:", gardenError);
        throw new Error(gardenError.message);
      }

      // Combine the data
      return {
        ...garden,
        dashboard: dashboard || undefined,
      };
    },
    enabled: !!gardenId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Fetch plant data by ID
export function usePlantDataById(plantId?: string) {
  const queryClient = useQueryClient();

  return useQuery<PlantData, Error>({
    queryKey: ["plantData", plantId],
    queryFn: async () => {
      if (!plantId) throw new Error("Plant ID is required");

      const { data, error } = await supabase
        .from("plant_full_data")
        .select("*")
        .eq("id", plantId)
        .single();

      if (error) {
        console.error("Supabase error fetching plant data:", error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!plantId,
    staleTime: ONE_DAY_MS, // Cache for a full day
    gcTime: ONE_DAY_MS * 7, // Keep in cache for a week
  });
}
