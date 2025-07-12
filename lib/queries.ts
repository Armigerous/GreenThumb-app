import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlantCards, searchPlants, getPlantDetails } from "./supabaseApi";
import type { ApiResponse, PlantCardData, PlantFullDataUI } from "@/types/plant";
import type { Garden, GardenDashboard, PlantTask, TaskWithDetails, GardenTaskSummary, PlantCareLog } from "@/types/garden";
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
      const cachedData = await getFromStorage<PlantFullDataUI>(
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

  return useQuery<PlantFullDataUI, Error>({
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
      const cachedData = await getFromStorage<PlantFullDataUI>(
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
          plants_with_overdue_tasks,
          plants_with_urgent_tasks,
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
          .from("user_gardens")  // Use the user_gardens table directly instead of the secure view
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
    staleTime: 1000 * 30, // Reduced to 30 seconds (from 5 minutes)
    refetchOnMount: "always", // Always refetch when component mounts
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// User Plant Details query hook
export function useUserPlantDetails(userPlantId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["userPlantDetails", userPlantId],
    queryFn: async () => {
      if (!userPlantId) throw new Error("User plant ID is required");

      const debugInfo: Record<string, { status: string; error: string | null }> = {};

      // Fetch the user plant data
      let userPlant = null;
      let userPlantError = null;
      try {
        const res = await supabase
          .from("user_plants")
          .select(`
            id,
            garden_id,
            plant_id,
            nickname,
            images,
            created_at,
            updated_at
          `)
          .eq("id", userPlantId)
          .single();
        userPlant = res.data;
        userPlantError = res.error;
        if (userPlantError) throw userPlantError;
        debugInfo.userPlant = { status: "success", error: null };
        console.log("[DEBUG] userPlant fetched:", userPlant);
      } catch (err: any) {
        debugInfo.userPlant = { status: "error", error: err?.message || String(err) };
        console.error("[DEBUG] Error fetching userPlant:", err);
      }

      if (!userPlant) {
        throw new Error("Plant not found");
      }

      // Fetch care logs from the plant_care_logs table
      let careLogs: PlantCareLog[] = [];
      try {
        const res = await supabase
          .from("plant_care_logs")
          .select(`
            id,
            user_plant_id,
            image,
            care_notes,
            taken_care_at
          `)
          .eq("user_plant_id", userPlantId)
          .order("taken_care_at", { ascending: false });
        careLogs = res.data || [];
        if (res.error) throw res.error;
        debugInfo.careLogs = { status: "success", error: null };
        console.log("[DEBUG] careLogs fetched:", careLogs);
      } catch (err: any) {
        debugInfo.careLogs = { status: "error", error: err?.message || String(err) };
        console.error("[DEBUG] Error fetching careLogs:", err);
      }

      // Fetch tasks from the plant_tasks table (user-specific)
      let plantTasks: PlantTask[] = [];
      try {
        const res = await supabase
          .from("plant_tasks")
          .select(`
            id,
            user_plant_id,
            task_type,
            due_date,
            completed
          `)
          .eq("user_plant_id", userPlantId)
          .order("due_date", { ascending: true });
        plantTasks = res.data || [];
        if (res.error) throw res.error;
        debugInfo.plantTasks = { status: "success", error: null };
        console.log("[DEBUG] plantTasks fetched:", plantTasks);
      } catch (err: any) {
        debugInfo.plantTasks = { status: "error", error: err?.message || String(err) };
        console.error("[DEBUG] Error fetching plantTasks:", err);
      }

      // Get the garden information for this plant
      let garden = null;
      try {
        const res = await supabase
          .from("user_gardens")
          .select("name")
          .eq("id", userPlant.garden_id)
          .single();
        garden = res.data;
        if (res.error) throw res.error;
        debugInfo.garden = { status: "success", error: null };
        console.log("[DEBUG] garden fetched:", garden);
      } catch (err: any) {
        debugInfo.garden = { status: "error", error: err?.message || String(err) };
        console.error("[DEBUG] Error fetching garden:", err);
      }

      // Get general plant information
      let plantInfo = null;
      try {
        const res = await supabase
          .from("plant_full_data")
          .select(`
            scientific_name,
            common_names,
            light_requirements,
            soil_drainage,
            soil_texture,
            usda_zones
          `)
          .eq("id", userPlant.plant_id)
          .single();
        plantInfo = res.data;
        if (res.error) throw res.error;
        debugInfo.plantInfo = { status: "success", error: null };
        console.log("[DEBUG] plantInfo fetched:", plantInfo);
      } catch (err: any) {
        debugInfo.plantInfo = { status: "error", error: err?.message || String(err) };
        console.error("[DEBUG] Error fetching plantInfo:", err);
      }

      // Merge all data into a single object for the UI
      return {
        ...userPlant,
        plant_tasks: plantTasks,
        care_logs: careLogs,
        // Merge in plantInfo and garden fields for direct access in the UI
        scientific_name: plantInfo?.scientific_name ?? "",
        garden_name: garden?.name ?? "",
        // Optionally, add more plantInfo fields if needed
        common_names: plantInfo?.common_names ?? [],
        light_requirements: plantInfo?.light_requirements ?? [],
        soil_drainage: plantInfo?.soil_drainage ?? [],
        soil_texture: plantInfo?.soil_texture ?? [],
        usda_zones: plantInfo?.usda_zones ?? [],
        debugInfo,
      };
    },
    enabled: !!userPlantId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Fetch plant data by ID
export function usePlantDataById(plantId?: string) {
  const queryClient = useQueryClient();

  return useQuery<PlantFullDataUI, Error>({
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

// Tasks query hook
export async function getTasksForDate(date: Date, userId?: string) {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date provided:', date);
      return [];
    }

    if (!userId) {
      console.error('User ID is required for fetching tasks');
      return [];
    }
    
    // Format the date as YYYY-MM-DD - make sure timezone doesn't affect the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`Fetching tasks for date: ${formattedDate} for user: ${userId}`);

    // Try using the RPC function directly with the user ID
    // The updated function will filter tasks by user ID
    const { data, error } = await supabase
      .rpc('get_tasks_for_date', { 
        target_date: formattedDate,
        requesting_user_id: userId  // Pass the Clerk user ID to filter tasks
      });

    if (error) {
      console.error(`Error fetching tasks for ${formattedDate}:`, error);
      
      // Fall back to direct query with user ID filter
      console.log('Falling back to direct query with user ID filter');
      const { data: directData, error: directError } = await supabase
        .from('plant_tasks')
        .select(`
          id,
          user_plant_id,
          task_type,
          due_date,
          completed,
          user_plant:user_plants!inner(
            nickname,
            garden:user_gardens!inner(
              name,
              user_id
            )
          )
        `)
        .eq('due_date::date', formattedDate)
        .eq('user_plant.garden.user_id', userId);
      
      if (directError) {
        console.error('Direct query error:', directError);
        throw new Error(`Error fetching tasks: ${directError.message}`);
      }
      
      if (!directData || directData.length === 0) {
        console.log(`No tasks found for ${formattedDate} for user ${userId}`);
        return [];
      }
      
      // Format the direct query results to match our TaskWithDetails structure
      const formattedTasks = directData.map(task => {
        // Type assertion to help TypeScript understand the structure
        const userPlant = task.user_plant as any; 
        
        return {
          id: task.id,
          user_plant_id: task.user_plant_id,
          task_type: task.task_type,
          due_date: task.due_date,
          completed: task.completed,
          plant: {
            nickname: userPlant?.nickname || 'Unknown Plant',
            garden: {
              name: userPlant?.garden?.name || 'Unknown Garden'
            }
          }
        };
      });
      
      console.log(`Found ${formattedTasks.length} tasks via direct query for ${formattedDate}`);
      return formattedTasks as TaskWithDetails[];
    }

    if (!data || data.length === 0) {
      console.log(`No tasks found for ${formattedDate} for user ${userId}`);
      return [];
    }

    console.log(`Found ${data.length} tasks via RPC for ${formattedDate}`);
    return data as TaskWithDetails[];
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    throw error;
  }
}

// Hook to use tasks for a date
export function useTasksForDate(date: Date, userId?: string) {
  // Use the same date formatting logic as getTasksForDate
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  return useQuery<TaskWithDetails[], Error>({
    queryKey: ['tasks', formattedDate, userId],
    queryFn: () => getTasksForDate(date, userId),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours (was cacheTime in older versions)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when internet reconnects
    enabled: !!userId, // Only run the query if we have a user ID
  });
}

/**
 * Fetches garden tasks summary for a specific garden
 * @param gardenId The ID of the garden to fetch tasks for
 * @returns A promise that resolves to an array of GardenTaskSummary objects
 */
export async function getGardenTasksSummary(gardenId: number): Promise<GardenTaskSummary[]> {
  try {
    const { data, error } = await supabase
      .from('garden_tasks_summary')
      .select('*')
      .eq('garden_id', gardenId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching garden tasks summary:', error);
      throw new Error(`Error fetching garden tasks summary: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching garden tasks summary:', error);
    throw error;
  }
}

/**
 * Hook to fetch and use garden tasks summary data
 * @param gardenId The ID of the garden to fetch tasks for
 * @returns A query result containing the garden tasks summary data
 */
export function useGardenTasksSummary(gardenId: number) {
  return useQuery<GardenTaskSummary[], Error>({
    queryKey: ['gardenTasksSummary', gardenId],
    queryFn: () => getGardenTasksSummary(gardenId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!gardenId, // Only run the query if we have a garden ID
  });
}

/**
 * Fetches the number of missed tasks for a garden
 * A missed task is defined as a task that is overdue (due date is in the past) and not completed
 * 
 * @param gardenId The ID of the garden to check for missed tasks
 * @returns A promise that resolves to the number of missed tasks
 */
export async function getGardenMissedTasksCount(gardenId: number): Promise<number> {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('garden_tasks_summary')
      .select('task_id')
      .eq('garden_id', gardenId)
      .eq('completed', false)
      .lt('due_date', formattedDate);
    
    if (error) {
      console.error('Error fetching missed tasks:', error);
      throw new Error(`Error fetching missed tasks: ${error.message}`);
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('Unexpected error fetching missed tasks:', error);
    throw error;
  }
}

/**
 * Hook to get the count of missed tasks for a garden
 * 
 * @param gardenId The ID of the garden to check for missed tasks
 * @returns A query result containing the count of missed tasks
 */
export function useGardenMissedTasksCount(gardenId: number) {
  return useQuery<number, Error>({
    queryKey: ['gardenMissedTasks', gardenId],
    queryFn: () => getGardenMissedTasksCount(gardenId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!gardenId, // Only run the query if we have a garden ID
  });
}
