import { Platform } from "react-native";
import { fetchPlantCards, getPlantDetails } from "./supabaseApi";
import { saveToStorage, STORAGE_KEYS, getPlantDetailKey } from "./storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { prefetchImages } from "./services/imagePrefetcher";

// Constants
const STORED_PLANT_SLUGS_KEY = "greenthumb_stored_plant_slugs";

/**
 * Configure the background fetch service
 * This is now a stub function that does nothing but is kept for compatibility
 */
export function configureBackgroundFetch(): void {
  // This function is now a no-op (does nothing)
  console.log("Background fetch functionality has been removed");
  return;
}

/**
 * Perform the actual data update
 * Can be called manually when needed
 */
export async function performPlantDataUpdate(): Promise<void> {
  try {
    console.log("Starting plant data update...");

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

    console.log("Plant data update completed successfully");
  } catch (error) {
    console.error("Error updating plant data:", error);
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
          `Error updating plant details for ${slug}:`,
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
    console.error("Error updating stored plant details:", error);
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
