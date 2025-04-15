import { supabase } from "@/lib/supabaseClient";
import { Image as ExpoImage, ImageContentFit } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageResizeMode,
  Platform,
  Image as RNImage,
  StyleSheet,
  View,
} from "react-native";

// Define the possible resize modes for the image
type ResizeMode = "cover" | "contain" | "stretch" | "center";

// Props interface for the CachedImage component
interface CachedImageProps {
  /** The URI of the image to display */
  uri: string;
  /** Optional fallback URI if the main image fails to load */
  fallbackUri?: string;
  /** Optional style object for the image container */
  style?: View["props"]["style"];
  /** Optional resize mode for the image */
  resizeMode?: ResizeMode;
  /** Whether to make the image rounded (rounded-lg) */
  rounded?: boolean;
  /** Optional cache key to ensure consistent caching */
  cacheKey?: string;
  /** Prevent URL transformation (use exactly as provided) */
  preventTransform?: boolean;
}

// Default fallback image URL
const DEFAULT_FALLBACK_URI =
  "https://theofficialgreenthumb.com/no-plant-image.png";

// Maximum number of retry attempts for loading the image
const MAX_RETRIES = 3;

// Global cache for processed URIs to avoid redundant processing
const uriCache = new Map<string, string>();

// Check if we're in a development build where expo-image is available
const isExpoImageAvailable = (): boolean => {
  if (Platform.OS === "web") return false;
  try {
    return !!ExpoImage;
  } catch (error) {
    return false;
  }
};

// Function to handle unsupported image formats
const isSupportedImageFormat = (uri: string): boolean => {
  if (!uri) return false;

  // Check if the image is an MPO file (unsupported format)
  if (uri.toLowerCase().endsWith(".mpo")) {
    return false;
  }

  return true;
};

// Try different image formats and strategies
const tryAlternativeFormats = (uri: string, attempt: number = 0): string => {
  const formats = [".jpg", ".jpeg", ".png", ".webp"];
  const baseUri = uri.replace(/\.[^.]+$/, ""); // Remove extension

  if (attempt < formats.length) {
    // Try different extensions
    return baseUri + formats[attempt];
  } else if (attempt === formats.length) {
    // Try without extension as last resort
    return baseUri;
  } else if (attempt === formats.length + 1) {
    // Try lowercase plant name with jpg
    // Extract the filename from the URL path
    const urlParts = uri.split("/");
    const filename = urlParts[urlParts.length - 1];

    // Try to extract plant name (typically before first underscore)
    const plantNameMatch = filename.match(/^([^_]+)/);
    if (plantNameMatch && plantNameMatch[1]) {
      const plantName = plantNameMatch[1];

      // Replace the original plant name with lowercase version
      const lowercasePlantName = plantName.toLowerCase();
      const newFilename = filename.replace(plantName, lowercasePlantName);

      // Replace the filename in the URL
      urlParts[urlParts.length - 1] = newFilename.replace(/\.[^.]+$/, ".jpg");
      return urlParts.join("/");
    }
  }

  // Fallback to original
  return uri;
};

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  fallbackUri = DEFAULT_FALLBACK_URI,
  style,
  resizeMode = "cover",
  rounded = false,
  cacheKey,
  preventTransform = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUri, setImageUri] = useState<string>(
    isSupportedImageFormat(uri) ? uri : fallbackUri
  );
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const originalUri = useRef<string>(uri);
  const isProcessing = useRef<boolean>(false);

  // Function to get a signed URL for Supabase storage images
  const getSignedUrl = async (path: string): Promise<string | null> => {
    try {
      // Only create a new signed URL if the path doesn't already have a token
      if (path.includes("token=")) {
        console.log("URL already has a token, skipping signed URL creation");
        return path;
      }

      // Extract the path from the Supabase URL or path
      const cleanPath = path.replace(/^user-uploads\//, "");

      const { data, error } = await supabase.storage
        .from("user-uploads")
        .createSignedUrl(cleanPath, 315360000); // 10 years in seconds

      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return null;
    }
  };

  // Function to extract the correct path from a Supabase URL or path
  const extractSupabasePath = (input: string): string | null => {
    try {
      // If it's a full Supabase URL
      if (input.includes("supabase.co")) {
        // Skip extraction if URL already has a token
        if (input.includes("token=")) {
          return input;
        }

        const urlObj = new URL(input);
        // Extract the path after /storage/v1/object/public/user-uploads/
        const pathParts = urlObj.pathname.split("/");
        const userUploadsIndex = pathParts.indexOf("user-uploads");

        if (
          userUploadsIndex !== -1 &&
          userUploadsIndex + 1 < pathParts.length
        ) {
          // Get everything after "user-uploads/"
          return pathParts.slice(userUploadsIndex + 1).join("/");
        }

        // Fallback to the old method if the above doesn't work
        return pathParts.slice(3).join("/");
      }
      // If it's already a path (e.g., "plant-images/user123/image.jpg")
      else if (input.includes("plant-images/")) {
        return input;
      }

      return null;
    } catch (error) {
      console.error("Error extracting Supabase path:", error);
      return null;
    }
  };

  // Generate a cache key for the image
  const generateCacheKey = (uri: string): string => {
    if (cacheKey) return cacheKey;

    // For Supabase URLs, use the path as the cache key
    if (uri.includes("supabase.co") || uri.includes("plant-images/")) {
      const path = extractSupabasePath(uri);
      if (path) return `supabase-${path}`;
    }

    // For other URLs, use the URI itself
    return uri;
  };

  // Validate and process the URI when it changes
  useEffect(() => {
    // Skip processing if the URI hasn't changed
    if (originalUri.current === uri && imageUri !== fallbackUri) {
      return;
    }

    originalUri.current = uri;

    // Prevent concurrent processing
    if (isProcessing.current) {
      console.log("Already processing a URI, skipping");
      return;
    }

    const processUri = async () => {
      isProcessing.current = true;

      // Skip unsupported image formats entirely
      if (!uri || !isSupportedImageFormat(uri)) {
        console.log("Skipping unsupported image format:", uri);
        setImageUri(fallbackUri);
        setIsLoading(false);
        isProcessing.current = false;
        return;
      }

      // If preventTransform is true, use the URI directly
      if (preventTransform) {
        setImageUri(uri);
        setIsLoading(false);
        isProcessing.current = false;
        return;
      }

      // Check if the URI is valid
      if (!uri.startsWith("http") && !uri.startsWith("file://")) {
        setImageUri(fallbackUri);
        isProcessing.current = false;
        return;
      }

      // Check if we've already processed this URI
      const key = generateCacheKey(uri);
      if (uriCache.has(key)) {
        console.log(`Using cached URI for ${key}`);
        setImageUri(uriCache.get(key)!);
        setIsLoading(false);
        isProcessing.current = false;
        return;
      }

      // Skip signed URL creation for URIs that already have tokens
      if (uri.includes("token=")) {
        console.log("URI already has a token, using as is");
        setImageUri(uri);
        uriCache.set(key, uri);
        isProcessing.current = false;
        return;
      }

      // Handle Supabase storage URLs
      if (uri.includes("supabase.co") || uri.includes("plant-images/")) {
        // Extract the path from the Supabase URL or path
        const path = extractSupabasePath(uri);

        if (path) {
          if (path === uri) {
            // If the path is the same as the URI, it's already a signed URL
            setImageUri(uri);
            uriCache.set(key, uri);
          } else {
            // Get a signed URL
            const signedUrl = await getSignedUrl(path);
            if (signedUrl) {
              setImageUri(signedUrl);
              uriCache.set(key, signedUrl);
            } else {
              // Fall back to the original URI
              setImageUri(uri);
              uriCache.set(key, uri);
            }
          }
        } else {
          // If path extraction failed, use the URI as is
          setImageUri(uri);
          uriCache.set(key, uri);
        }
      } else {
        // For non-Supabase URLs, use as is
        setImageUri(uri);
        uriCache.set(key, uri);
      }

      isProcessing.current = false;
    };

    // Reset loading state when URI changes
    setIsLoading(true);
    setHasError(false);

    processUri();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [uri, fallbackUri, cacheKey, preventTransform]);

  // Handle image loading errors
  const handleImageError = (error: any) => {
    if (!isMounted.current) return;

    console.error(`CachedImage: Error loading image: ${imageUri}`, error);
    setIsLoading(false);
    setHasError(true);
    setImageUri(fallbackUri);
  };

  // Handle successful image load
  const handleImageLoad = () => {
    if (!isMounted.current) return;
    setIsLoading(false);
  };

  // Map React Native resize modes to Expo Image content fit
  const getContentFit = (): ImageContentFit => {
    switch (resizeMode) {
      case "cover":
        return "cover";
      case "contain":
        return "contain";
      case "stretch":
        return "fill";
      case "center":
        return "none";
      default:
        return "cover";
    }
  };

  // Use React Native's Image as a fallback
  if (!isExpoImageAvailable()) {
    return (
      <View style={[style, rounded && { borderRadius: 8, overflow: "hidden" }]}>
        <RNImage
          style={StyleSheet.absoluteFill}
          source={{ uri: imageUri }}
          resizeMode={resizeMode as ImageResizeMode}
          onLoadStart={() => setIsLoading(true)}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {isLoading && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                ...(rounded && { borderRadius: 8 }),
              },
            ]}
          >
            <ActivityIndicator color="#047857" />
          </View>
        )}
      </View>
    );
  }

  // Use Expo Image for better caching in development builds
  return (
    <View style={[style, rounded && { borderRadius: 8, overflow: "hidden" }]}>
      <ExpoImage
        style={StyleSheet.absoluteFill}
        source={imageUri}
        contentFit={getContentFit()}
        cachePolicy="memory-disk"
        placeholder={{ backgroundColor: "#f3f4f6" }}
        transition={300}
        onLoadStart={() => setIsLoading(true)}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              ...(rounded && { borderRadius: 8 }),
            },
          ]}
        >
          <ActivityIndicator color="#047857" />
        </View>
      )}
    </View>
  );
};

export default CachedImage;
