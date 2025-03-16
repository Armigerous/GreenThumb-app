import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image as RNImage,
  ImageResizeMode,
  Platform,
} from "react-native";
import { Image as ExpoImage, ImageContentFit } from "expo-image";

interface CachedImageProps {
  uri: string;
  fallbackUri?: string;
  style?: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
}

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

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  fallbackUri = "https://theofficialbrandthumb.com/no-plant-image.png",
  style,
  resizeMode = "cover",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUri = hasError || !uri ? fallbackUri : uri;
  const regularImageResizeMode: ImageResizeMode = resizeMode as ImageResizeMode;

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
      <View style={style}>
        <RNImage
          style={StyleSheet.absoluteFill}
          source={{ uri: imageUri }}
          resizeMode={regularImageResizeMode}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {isLoading && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
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
    <View style={style}>
      <ExpoImage
        style={StyleSheet.absoluteFill}
        source={imageUri}
        contentFit={getContentFit()}
        cachePolicy="memory-disk"
        placeholder={{ backgroundColor: "#f3f4f6" }}
        transition={300}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
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
