import { Image as RNImage, Platform } from "react-native";
import { Image as ExpoImage } from "expo-image";

// Cache to keep track of prefetched images
const prefetchedImages = new Set<string>();

// Check if we're in a development build where expo-image is available
const isExpoImageAvailable = () => {
  // In Expo Go, we need to use React Native's Image
  if (Platform.OS === "web") return false;

  try {
    // This is a simple check to see if ExpoImage is properly imported
    return !!ExpoImage;
  } catch (error) {
    return false;
  }
};

/**
 * Prefetch a single image
 */
export async function prefetchImage(uri: string): Promise<boolean> {
  if (!uri || prefetchedImages.has(uri)) {
    return false;
  }

  try {
    if (isExpoImageAvailable()) {
      // Use Expo Image for better caching in development builds
      await ExpoImage.prefetch(uri, {
        cachePolicy: "memory-disk",
      });
    } else {
      // Fallback to React Native's Image
      await RNImage.prefetch(uri);
    }

    prefetchedImages.add(uri);
    return true;
  } catch (error) {
    console.error("Failed to prefetch image:", uri, error);
    return false;
  }
}

/**
 * Prefetch multiple images with priority
 */
export async function prefetchImages(uris: string[]): Promise<void> {
  if (!uris || uris.length === 0) return;

  // Filter out empty URIs
  const validUris = uris.filter((uri) => uri && uri.trim() !== "");

  if (validUris.length === 0) return;

  try {
    // Log the prefetch operation
    console.log(`Prefetching ${validUris.length} images...`);

    // Prefetch all images in parallel
    await Promise.all(validUris.map((uri) => prefetchImage(uri)));

    console.log(`Successfully prefetched ${validUris.length} images`);
  } catch (error) {
    console.error("Error prefetching images:", error);
  }
}

/**
 * Clear prefetched images from memory
 */
export function clearPrefetchedImages(): void {
  prefetchedImages.clear();
}
