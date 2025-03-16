import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  PLANTS_CACHE: "greenthumb_plants_cache",
  PLANTS_LAST_UPDATED: "greenthumb_plants_last_updated",
  PLANT_DETAILS_PREFIX: "greenthumb_plant_details_",
};

// Types
interface StorageTimestamp {
  timestamp: number;
}

/**
 * Save data to persistent storage with a timestamp
 */
export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    const storageData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(storageData));
  } catch (error) {
    console.error(`Error saving data to storage (${key}):`, error);
  }
}

/**
 * Get data from persistent storage with timestamp validation
 * @returns The data if valid, null if expired or not found
 */
export async function getFromStorage<T>(
  key: string,
  maxAge: number = 24 * 60 * 60 * 1000 // Default: 1 day
): Promise<{ data: T; timestamp: number } | null> {
  try {
    const storedData = await AsyncStorage.getItem(key);

    if (!storedData) return null;

    const parsedData = JSON.parse(storedData) as { data: T; timestamp: number };
    const now = Date.now();

    // Check if data is expired
    if (now - parsedData.timestamp > maxAge) {
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error(`Error retrieving data from storage (${key}):`, error);
    return null;
  }
}

/**
 * Check if we need to update the cache based on the last update timestamp
 */
export function shouldUpdateCache(lastUpdated: number | null): boolean {
  if (!lastUpdated) return true;

  const now = new Date();
  const lastUpdate = new Date(lastUpdated);

  // Check if it's a new day (past midnight) since the last update
  return (
    now.getDate() !== lastUpdate.getDate() ||
    now.getMonth() !== lastUpdate.getMonth() ||
    now.getFullYear() !== lastUpdate.getFullYear()
  );
}

/**
 * Get the last updated timestamp for plants data
 */
export async function getPlantsLastUpdated(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLANTS_LAST_UPDATED);
    if (!data) return null;

    const parsed = JSON.parse(data) as StorageTimestamp;
    return parsed.timestamp;
  } catch (error) {
    console.error("Error getting plants last updated timestamp:", error);
    return null;
  }
}

/**
 * Set the last updated timestamp for plants data
 */
export async function setPlantsLastUpdated(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLANTS_LAST_UPDATED,
      JSON.stringify({ timestamp: Date.now() })
    );
  } catch (error) {
    console.error("Error setting plants last updated timestamp:", error);
  }
}

/**
 * Get the storage key for a specific plant detail
 */
export function getPlantDetailKey(slug: string): string {
  return `${STORAGE_KEYS.PLANT_DETAILS_PREFIX}${slug}`;
}

export { STORAGE_KEYS };
