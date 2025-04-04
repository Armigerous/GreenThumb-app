import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlantCards, searchPlants, getPlantDetails } from "./supabaseApi";
import type { ApiResponse, PlantCardData, PlantData } from "@/types/plant";
import type { Garden, GardenDashboard, PlantTask, TaskWithDetails } from "@/types/garden";
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
        .from("secure_user_gardens_view")
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
          .from("secure_user_gardens_view")  // Use the secure view instead of the materialized view directly
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

      // First fetch the user plant data
      const { data: userPlant, error: userPlantError } = await supabase
        .from("user_plants")
        .select(`
          id,
          garden_id,
          plant_id,
          nickname,
          status,
          images,
          care_logs,
          created_at,
          updated_at
        `)
        .eq("id", userPlantId)
        .single();

      if (userPlantError) {
        console.error("Error fetching user plant:", userPlantError);
        throw new Error(userPlantError.message);
      }

      if (!userPlant) {
        throw new Error("Plant not found");
      }

      // Now get the garden information for this plant
      const { data: garden, error: gardenError } = await supabase
        .from("user_gardens")
        .select("name")
        .eq("id", userPlant.garden_id)
        .single();

      if (gardenError) {
        console.error("Error fetching garden:", gardenError);
      }

      // Get general plant information
      const { data: plantInfo, error: plantInfoError } = await supabase
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

      if (plantInfoError) {
        console.error("Error fetching plant info:", plantInfoError);
      }

      // Combine and transform the data
      return {
        ...userPlant,
        garden_name: garden?.name || 'Unknown Garden',
        scientific_name: plantInfo?.scientific_name || 'Unknown Species',
        common_names: plantInfo?.common_names || [],
        added_date: userPlant.created_at,
        water_requirements: "Water when the top inch of soil is dry.",
        light_requirements: plantInfo?.light_requirements || "Needs adequate light",
        soil_requirements: [
          ...(plantInfo?.soil_texture || []),
          ...(plantInfo?.soil_drainage || [])
        ].join(", ") || "Well-draining soil mix",
        temperature_requirements: plantInfo?.usda_zones?.join(", ") || "Check plant hardiness zone"
      };
    },
    enabled: !!userPlantId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to avoid showing outdated information
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!userId, // Only run the query if we have a user ID
  });
}
