import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

// Onboarding slides data
const slides = [
  {
    id: "1",
    image: require("@/assets/images/logo.png"),
    title: "Welcome to The GreenThumb",
    description:
      "Your personal plant care companion that helps you grow and nurture your green friends",
  },
  {
    id: "2",
    image: require("@/assets/images/track-your-plants.png"),
    title: "Track Your Plants",
    description:
      "Keep detailed records of your plants' growth, watering schedules, and care requirements",
  },
  {
    id: "3",
    image: require("@/assets/images/track-your-plants.png"),
    title: "Expert Care Guidance",
    description:
      "Get personalized plant care tips and reminders to keep your plants thriving",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const slidesRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<NodeJS.Timeout>();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollTimer.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;
        scrollTo(nextIndex);
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex, isAutoScrolling]);

  const handleGetStarted = () => {
    setIsAutoScrolling(false);
    router.push("/(auth)/sign-up");
  };

  const scrollTo = (index: number) => {
    slidesRef.current?.scrollToIndex({ index });
  };

  const handleManualScroll = () => {
    setIsAutoScrolling(false);
  };

  const renderSlide = ({ item, index }: any) => {
    return (
      <View className="w-full items-center justify-center" style={{ width }}>
        <View className="w-full h-[300px] justify-center items-center mb-5">
          <Image
            source={item.image}
            className="w-4/5 h-4/5"
            resizeMode="contain"
          />
        </View>

        <View className="items-center px-5">
          <Text className="text-2xl font-bold text-foreground mb-3 text-center">
            {item.title}
          </Text>
          <Text className="text-base text-foreground text-center opacity-80 px-4">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-end items-center px-5 pt-5">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          className="py-2 px-4 rounded-full border border-primary"
        >
          <Text className="text-primary text-base font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onScrollBeginDrag={handleManualScroll}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />

        {/* Progress Dots */}
        <View className="flex-row justify-center space-x-2 mb-8">
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index.toString()}
                className="h-2 rounded-full bg-primary"
                style={{ width: dotWidth, opacity }}
              />
            );
          })}
        </View>

        <View className="px-5 pb-8 gap-6">
          <TouchableOpacity
            className="bg-primary py-4 px-8 rounded-2xl w-full items-center"
            onPress={handleGetStarted}
          >
            <Text className="text-primary-foreground text-base font-bold">
              Get Started
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-foreground opacity-80">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
              <Text className="text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
