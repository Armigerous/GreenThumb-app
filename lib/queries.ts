import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlantCards, searchPlants, getPlantDetails } from "./supabaseApi";
import type { ApiResponse, PlantCardData, PlantData } from "@/types/plant";
import type { Garden } from "@/types/garden";
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

// Garden queries
export function useUserGardens(userId?: string) {
  const queryClient = useQueryClient();

  return useQuery<Garden[], Error>({
    queryKey: ["userGardens", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      console.log("Fetching gardens for user:", userId);

      const { data, error } = await supabase
        .from("user_gardens_full_data")
        .select(`*`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching gardens:", error);
        throw new Error(error.message);
      }

      console.log("Fetched gardens:", data);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useGardenDetails(gardenId: number) {
  const queryClient = useQueryClient();

  return useQuery<Garden, Error>({
    queryKey: ["garden", gardenId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_gardens_full_data")
        .select(`*`)
        .eq("id", gardenId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!gardenId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
