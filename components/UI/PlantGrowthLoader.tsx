import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PlantGrowthLoaderProps {
  message?: string;
  color?: string;
  backgroundColor?: string;
}

/**
 * PlantGrowthLoader component showing a plant growth animation from seed to flower
 */
export function PlantGrowthLoader({
  message = "Growing...",
  color = "#047857", // Brand green color
  backgroundColor = "bg-transparent", // Cream 50
}: PlantGrowthLoaderProps) {
  // Animation values
  const seedSize = useRef(new Animated.Value(0)).current;
  const sproutSize = useRef(new Animated.Value(0)).current;
  const plantSize = useRef(new Animated.Value(0)).current;
  const flowerSize = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Set up animation sequence
  useEffect(() => {
    const animateGrowth = () => {
      // Reset all animations
      seedSize.setValue(0);
      sproutSize.setValue(0);
      plantSize.setValue(0);
      flowerSize.setValue(0);
      rotation.setValue(0);

      // Create animation sequence
      Animated.sequence([
        // First show the seed
        Animated.timing(seedSize, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        // Then start growing the sprout while seed fades
        Animated.parallel([
          Animated.timing(seedSize, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(sproutSize, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        // Then grow the plant while sprout fades
        Animated.parallel([
          Animated.timing(sproutSize, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(plantSize, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        // Finally, show the flower while adding a gentle sway
        Animated.parallel([
          Animated.timing(plantSize, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(flowerSize, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
        // Hold the flower for a moment
        Animated.delay(500),
        // Reset to start the animation again
        Animated.parallel([
          Animated.timing(flowerSize, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
      ]).start(() => {
        // Restart the animation when complete
        animateGrowth();
      });
    };

    // Start the animation
    animateGrowth();

    // Clean up
    return () => {
      seedSize.stopAnimation();
      sproutSize.stopAnimation();
      plantSize.stopAnimation();
      flowerSize.stopAnimation();
      rotation.stopAnimation();
    };
  }, [seedSize, sproutSize, plantSize, flowerSize, rotation]);

  // Create rotation interpolation for the gentle sway
  const swayRotation = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-5deg", "5deg", "-5deg"],
  });

  return (
    <View className={`flex-1 justify-center items-center ${backgroundColor}`}>
      <View className="h-24 w-24 items-center justify-center">
        {/* Seed */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: seedSize,
            transform: [{ scale: seedSize }, { translateY: 20 }],
          }}
        >
          <MaterialCommunityIcons name="seed-outline" size={32} color={color} />
        </Animated.View>

        {/* Sprout */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: sproutSize,
            transform: [{ scale: sproutSize }, { translateY: 10 }],
          }}
        >
          <MaterialCommunityIcons
            name="sprout-outline"
            size={40}
            color={color}
          />
        </Animated.View>

        {/* Plant */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: plantSize,
            transform: [{ scale: plantSize }],
          }}
        >
          <MaterialCommunityIcons name="leaf" size={48} color={color} />
        </Animated.View>

        {/* Flower */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: flowerSize,
            transform: [{ scale: flowerSize }, { rotate: swayRotation }],
          }}
        >
          <MaterialCommunityIcons name="flower-tulip" size={56} color={color} />
        </Animated.View>
      </View>

      <Text className="mt-3 text-base text-cream-700">{message}</Text>
    </View>
  );
}

/**
 * Compact version of the PlantGrowthLoader for inline use
 */
interface CompactPlantLoaderProps {
  size?: number;
  color?: string;
}

export function CompactPlantLoader({
  size = 24,
  color = "#047857", // Brand green color
}: CompactPlantLoaderProps) {
  // Animation values
  const seedSize = useRef(new Animated.Value(0)).current;
  const sproutSize = useRef(new Animated.Value(0)).current;
  const plantSize = useRef(new Animated.Value(0)).current;
  const flowerSize = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Set up animation sequence
  useEffect(() => {
    const animateGrowth = () => {
      // Reset all animations
      seedSize.setValue(0);
      sproutSize.setValue(0);
      plantSize.setValue(0);
      flowerSize.setValue(0);
      rotation.setValue(0);

      // Create animation sequence with shorter durations for compact version
      Animated.sequence([
        Animated.timing(seedSize, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.parallel([
          Animated.timing(seedSize, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(sproutSize, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        Animated.parallel([
          Animated.timing(sproutSize, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(plantSize, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]),
        Animated.parallel([
          Animated.timing(plantSize, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(flowerSize, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(flowerSize, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
      ]).start(() => {
        animateGrowth();
      });
    };

    animateGrowth();

    return () => {
      seedSize.stopAnimation();
      sproutSize.stopAnimation();
      plantSize.stopAnimation();
      flowerSize.stopAnimation();
      rotation.stopAnimation();
    };
  }, [seedSize, sproutSize, plantSize, flowerSize, rotation]);

  const swayRotation = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-3deg", "3deg", "-3deg"],
  });

  const iconSize = Math.round(size * 0.8);

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Seed */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: seedSize,
          transform: [{ scale: seedSize }, { translateY: size * 0.1 }],
        }}
      >
        <MaterialCommunityIcons
          name="seed-outline"
          size={iconSize}
          color={color}
        />
      </Animated.View>

      {/* Sprout */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: sproutSize,
          transform: [{ scale: sproutSize }, { translateY: size * 0.05 }],
        }}
      >
        <MaterialCommunityIcons
          name="sprout-outline"
          size={iconSize + 2}
          color={color}
        />
      </Animated.View>

      {/* Plant */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: plantSize,
          transform: [{ scale: plantSize }],
        }}
      >
        <MaterialCommunityIcons name="leaf" size={iconSize + 4} color={color} />
      </Animated.View>

      {/* Flower */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: flowerSize,
          transform: [{ scale: flowerSize }, { rotate: swayRotation }],
        }}
      >
        <MaterialCommunityIcons
          name="flower-tulip"
          size={iconSize + 6}
          color={color}
        />
      </Animated.View>
    </View>
  );
}
