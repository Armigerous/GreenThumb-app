import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

interface OptimizedImageProps {
  uri: string;
  fallbackUri?: string;
  width: number | string;
  height: number | string;
  style?: any;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  fallbackUri = "https://theofficialbrandthumb.com/no-plant-image.png",
  width,
  height,
  style,
  contentFit = "cover",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imageSource = hasError || !uri ? fallbackUri : uri;

  return (
    <View style={{ width, height, ...style }}>
      <Image
        source={imageSource}
        style={{ width: "100%", height: "100%" }}
        onLoad={handleLoad}
        onError={handleError}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        {...props}
      />

      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
          }}
        >
          <ActivityIndicator color="#047857" />
        </View>
      )}
    </View>
  );
};

export default OptimizedImage;
