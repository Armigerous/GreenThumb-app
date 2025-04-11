import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image as RNImage,
  ImageResizeMode,
  Platform,
  NativeSyntheticEvent,
  ImageErrorEventData,
} from "react-native";
import { Image as ExpoImage, ImageContentFit } from "expo-image";
import { supabase } from "@/lib/supabaseClient";

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
  /** Whether to make the image circular (rounded-full) */
  rounded?: boolean;
  /** Optional cache key to ensure consistent caching */
  cacheKey?: string;
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

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  fallbackUri = DEFAULT_FALLBACK_URI,
  style,
  resizeMode = "cover",
  rounded = false,
  cacheKey,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUri, setImageUri] = useState<string>(uri || fallbackUri);
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const processedUriRef = useRef<string | null>(null);

  // Function to get a signed URL for Supabase storage images
  const getSignedUrl = async (path: string): Promise<string | null> => {
    try {
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
    const processUri = async () => {
      if (!uri) {
        setImageUri(fallbackUri);
        return;
      }

      // Check if the URI is valid
      if (!uri.startsWith("http") && !uri.startsWith("file://")) {
        setImageUri(fallbackUri);
        return;
      }

      // Check if we've already processed this URI
      const key = generateCacheKey(uri);
      if (uriCache.has(key)) {
        setImageUri(uriCache.get(key)!);
        setIsLoading(false);
        return;
      }

      // Handle Supabase storage URLs
      if (uri.includes("supabase.co") || uri.includes("plant-images/")) {
        // If the URL already has a token, use it as is
        if (uri.includes("token=")) {
          setImageUri(uri);
          uriCache.set(key, uri);
          return;
        }

        // Extract the path from the Supabase URL or path
        const path = extractSupabasePath(uri);

        if (path) {
          // Get a signed URL
          const signedUrl = await getSignedUrl(path);
          if (signedUrl) {
            setImageUri(signedUrl);
            uriCache.set(key, signedUrl);
            return;
          }
        }
      }

      // For non-Supabase URLs, use as is
      setImageUri(uri);
      uriCache.set(key, uri);
    };

    // Reset loading state when URI changes
    setIsLoading(true);
    processedUriRef.current = uri;

    processUri();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [uri, fallbackUri, cacheKey]);

  // Handle image loading errors
  const handleImageError = (error: any) => {
    if (!isMounted.current) return;

    console.error(`CachedImage: Error loading image: ${imageUri}`, error);

    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);

      // For Supabase URLs, try to get a fresh signed URL
      if (
        imageUri.includes("supabase.co") ||
        imageUri.includes("plant-images/")
      ) {
        const path = extractSupabasePath(imageUri);
        if (path) {
          getSignedUrl(path).then((signedUrl) => {
            if (signedUrl && isMounted.current) {
              setImageUri(signedUrl);
              uriCache.set(generateCacheKey(uri), signedUrl);
            }
          });
        }
      }
    } else {
      setIsLoading(false);
      setHasError(true);
      setImageUri(fallbackUri);
    }
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
      <View
        style={[style, rounded && { borderRadius: 9999, overflow: "hidden" }]}
      >
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
                ...(rounded && { borderRadius: 9999 }),
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
    <View
      style={[style, rounded && { borderRadius: 9999, overflow: "hidden" }]}
    >
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
              ...(rounded && { borderRadius: 9999 }),
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
