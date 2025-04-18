import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";

// Onboarding slides data
const slides = [
  {
    id: "1",
    image: require("@/assets/images/logo-transparent.png"),
    title: "Welcome to The GreenThumb",
    description:
      "Your personal plant care companion that helps you grow and nurture your green friends",
  },
  {
    id: "2",
    image: require("@/assets/images/track-your-plants-replace.png"),
    title: "Track Your Plants",
    description:
      "Keep detailed records of your plants' growth, watering schedules, and care requirements",
  },
  {
    id: "3",
    image: require("@/assets/images/expert-care-replace.png"),
    title: "Expert Care Guidance",
    description:
      "Get personalized plant care tips and reminders to keep your plants thriving",
  },
  {
    id: "4",
    image: require("@/assets/images/key-features-replace.png"),
    title: "Key Features",
    description: "Everything you need to be a successful plant parent",
    isFeatureSlide: true,
  },
];

// Feature highlights separately defined
const features = [
  { icon: "calendar-outline" as const, text: "Calendar of Care" },
  { icon: "leaf-outline" as const, text: "Custom Gardens" },
  { icon: "information-circle-outline" as const, text: "Expert Care Tips" },
  { icon: "search-outline" as const, text: "Plant Database" },
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

  const renderSlide = ({ item }: any) => {
    if (item.isFeatureSlide) {
      return (
        <View className="w-full items-center justify-center" style={{ width }}>
          <View className="w-full items-center px-5">
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              {item.title}
            </Text>
            <Text className="text-base text-foreground text-center opacity-80 px-4 mb-3">
              {item.description}
            </Text>

            {/* Feature icons with illustration background */}
            <View className="relative w-full justify-center items-center mb-4">
              {/* Background illustration */}
              <Image
                source={item.image}
                className="h-[350px] rounded-2xl overflow-hidden mb-6"
                resizeMode="contain"
                style={{ aspectRatio: 1 }}
              />

              {/* Features overlaid in a grid */}
              <View className="flex-row flex-wrap justify-center">
                {features.map((feature, index) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-white rounded-lg px-4 py-2 m-2 w-[45%]"
                  >
                    <Ionicons name={feature.icon} size={22} color="#5E994B" />
                    <Text className="text-sm text-foreground ml-2 font-medium">
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="w-full items-center justify-center" style={{ width }}>
        <View className="w-full h-[350px] justify-center items-center mb-4">
          <Image
            source={item.image}
            className="w-full h-full rounded-2xl"
            resizeMode="contain"
            style={{ aspectRatio: 1 }}
          />
        </View>

        <View className="items-center px-5">
          <Text className="text-2xl font-bold text-foreground mb-3 text-center">
            {item.title}
          </Text>
          <Text className="text-base text-foreground text-center opacity-80 px-4 mb-3">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <View className="flex-row justify-end items-center px-5 pt-2">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          className="py-2 px-4 rounded-full border border-primary"
        >
          <Text className="text-primary text-base font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {/* Slides */}
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
        <View className="flex-row justify-center space-x-2 mb-3">
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                className="h-2.5 rounded-full bg-primary"
                style={{
                  width: dotWidth,
                  opacity: dotOpacity,
                }}
              />
            );
          })}
        </View>

        {/* Get Started Button */}
        <View className="items-center mb-8 px-6">
          <TouchableOpacity
            onPress={handleGetStarted}
            className="w-full bg-primary py-4 rounded-xl"
          >
            <Text className="text-center text-primary-foreground font-bold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
