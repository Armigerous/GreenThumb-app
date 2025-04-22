import React from "react";
import { View, Image } from "react-native";
import { Season } from "@/types/weather";

// Import the seasonal illustration images
const IMAGES = {
  spring: {
    calm: require("@/assets/images/spring-calm.png"),
    chaotic: require("@/assets/images/spring-chaotic.png"),
  },
  summer: {
    calm: require("@/assets/images/summer-calm.png"),
    chaotic: require("@/assets/images/summer-chaotic.png"),
  },
  fall: {
    calm: require("@/assets/images/fall-calm.png"),
    chaotic: require("@/assets/images/fall-chaotic.png"),
  },
  winter: {
    calm: require("@/assets/images/winter-calm.png"),
    chaotic: require("@/assets/images/winter-chaotic.png"),
  },
};

type SeasonalIllustrationProps = {
  season: Season;
  hasOverdueTasks: boolean;
  className?: string;
};

/**
 * SeasonalIllustration component displays season and task-state appropriate illustrations
 * - Shows calm versions when no overdue tasks exist
 * - Shows chaotic versions when there are overdue tasks
 * - Automatically selects the correct image for the current season
 */
export function SeasonalIllustration({
  season,
  hasOverdueTasks,
  className,
}: SeasonalIllustrationProps) {
  const imageState = hasOverdueTasks ? "chaotic" : "calm";

  return (
    <View
      className={`rounded-lg overflow-hidden w-full h-72 ${className || ""}`}
    >
      <Image
        source={IMAGES[season][imageState]}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: 3 / 2, // Maintain the 3:2 aspect ratio
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default SeasonalIllustration;
