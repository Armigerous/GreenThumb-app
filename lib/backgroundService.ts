import { Platform } from "react-native";
import { fetchPlantCards, getPlantDetails } from "./supabaseApi";
import { saveToStorage, STORAGE_KEYS, getPlantDetailKey } from "./storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { prefetchImages } from "./services/imagePrefetcher";

// Constants
const BACKGROUND_FETCH_TASK_ID = "com.greenthumb.plantupdate";
const STORED_PLANT_SLUGS_KEY = "greenthumb_stored_plant_slugs";

// Check if BackgroundFetch is available
let BackgroundFetch: any = null;
try {
  // Use dynamic import to avoid the error when the module is not available
  if (Platform.OS !== "web") {
    // We need to wrap this in a function to avoid immediate execution
    const getBackgroundFetch = () => {
      try {
        return require("react-native-background-fetch");
      } catch (e) {
        console.log("BackgroundFetch module not available:", e);
        return null;
      }
    };

    BackgroundFetch = getBackgroundFetch();
  }
} catch (error) {
  console.log("Error importing BackgroundFetch:", error);
}

/**
 * Configure the background fetch service
 */
export function configureBackgroundFetch(): void {
  // Skip if BackgroundFetch is not available (e.g., in Expo Go)
  if (!BackgroundFetch) {
    console.log("BackgroundFetch not available, skipping configuration");
    return;
  }

  try {
    // Configure background fetch
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Fetch interval in minutes (minimum is 15 minutes)
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      async (taskId: string) => {
        if (taskId === BACKGROUND_FETCH_TASK_ID) {
          await performPlantDataUpdate();
        }

        // Required: Signal completion of your task
        BackgroundFetch.finish(taskId);
      },
      (error: any) => {
        console.error("Background fetch failed to start:", error);
      }
    );

    // Schedule the task to run at night (around 2 AM)
    scheduleNightlyUpdate();
  } catch (error) {
    console.error("Error configuring BackgroundFetch:", error);
  }
}

/**
 * Schedule the background task to run at night
 */
function scheduleNightlyUpdate(): void {
  // Skip if BackgroundFetch is not available
  if (!BackgroundFetch) return;

  try {
    // Calculate time until 2 AM
    const now = new Date();
    const nightTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      2, // 2 AM
      0,
      0
    );

    // If it's already past 2 AM, schedule for the next day
    if (now.getHours() >= 2) {
      nightTime.setDate(nightTime.getDate() + 1);
    }

    const timeUntilNight = nightTime.getTime() - now.getTime();
    const minutesUntilNight = Math.floor(timeUntilNight / (1000 * 60));

    // Schedule the task
    BackgroundFetch.scheduleTask({
      taskId: BACKGROUND_FETCH_TASK_ID,
      delay: minutesUntilNight * 60 * 1000, // Convert minutes to milliseconds
      periodic: true,
      forceAlarmManager: true,
    });
  } catch (error) {
    console.error("Error scheduling nightly update:", error);
  }
}

/**
 * Perform the actual data update
 */
async function performPlantDataUpdate(): Promise<void> {
  try {
    console.log("[Background] Starting plant data update...");

    // 1. Update the general plant catalog (first page)
    const plantCatalog = await fetchPlantCards(1, 28, "", "all", "scientific");
    await saveToStorage(
      `${STORAGE_KEYS.PLANTS_CACHE}_1_28__all_scientific`,
      plantCatalog
    );

    // 2. Prefetch images for faster loading
    if (plantCatalog.results && plantCatalog.results.length > 0) {
      const imageUris = plantCatalog.results
        .filter((plant) => plant && plant.first_image)
        .map((plant) => plant.first_image as string);

      if (imageUris.length > 0) {
        await prefetchImages(imageUris);
      }
    }

    // 3. Update stored plant details
    await updateStoredPlantDetails();

    console.log("[Background] Plant data update completed successfully");
  } catch (error) {
    console.error("[Background] Error updating plant data:", error);
  }
}

/**
 * Update the details of plants that the user has viewed/saved
 */
async function updateStoredPlantDetails(): Promise<void> {
  try {
    // Get the list of plant slugs that the user has viewed/saved
    const storedSlugsJson = await AsyncStorage.getItem(STORED_PLANT_SLUGS_KEY);
    if (!storedSlugsJson) return;

    const storedSlugs = JSON.parse(storedSlugsJson) as string[];
    const plantDetails = [];
    const imageUris = [];

    // Update each plant's details
    for (const slug of storedSlugs) {
      try {
        const plantDetail = await getPlantDetails(slug);
        await saveToStorage(getPlantDetailKey(slug), plantDetail);

        plantDetails.push(plantDetail);

        // Collect image URIs for prefetching
        if (plantDetail.first_image) {
          imageUris.push(plantDetail.first_image);
        }
      } catch (error) {
        console.error(
          `[Background] Error updating plant details for ${slug}:`,
          error
        );
        // Continue with other plants even if one fails
      }
    }

    // Prefetch all collected images
    if (imageUris.length > 0) {
      await prefetchImages(imageUris);
    }
  } catch (error) {
    console.error("[Background] Error updating stored plant details:", error);
  }
}

/**
 * Add a plant slug to the list of stored plants
 */
export async function addPlantToStoredList(slug: string): Promise<void> {
  try {
    // Get current list
    const storedSlugsJson = await AsyncStorage.getItem(STORED_PLANT_SLUGS_KEY);
    const storedSlugs = storedSlugsJson
      ? (JSON.parse(storedSlugsJson) as string[])
      : [];

    // Add slug if not already in the list
    if (!storedSlugs.includes(slug)) {
      storedSlugs.push(slug);
      await AsyncStorage.setItem(
        STORED_PLANT_SLUGS_KEY,
        JSON.stringify(storedSlugs)
      );
    }
  } catch (error) {
    console.error(`Error adding plant ${slug} to stored list:`, error);
  }
}

/**
 * Remove a plant slug from the list of stored plants
 */
export async function removePlantFromStoredList(slug: string): Promise<void> {
  try {
    // Get current list
    const storedSlugsJson = await AsyncStorage.getItem(STORED_PLANT_SLUGS_KEY);
    if (!storedSlugsJson) return;

    const storedSlugs = JSON.parse(storedSlugsJson) as string[];

    // Remove slug if in the list
    const updatedSlugs = storedSlugs.filter((s) => s !== slug);
    await AsyncStorage.setItem(
      STORED_PLANT_SLUGS_KEY,
      JSON.stringify(updatedSlugs)
    );
  } catch (error) {
    console.error(`Error removing plant ${slug} from stored list:`, error);
  }
}
