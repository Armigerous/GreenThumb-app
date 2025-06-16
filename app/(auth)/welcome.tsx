import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text as RNText,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, SubtitleText, BodyText, Text } from "@/components/UI/Text";
import RAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

// Onboarding slides data
const slides = [
  {
    id: "1",
    image: require("@/assets/images/logo-transparent.png"),
    title: "Welcome to GreenThumb",
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
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Animation values for buttons
  const startButtonOpacity = useSharedValue(0);
  const startButtonTranslateY = useSharedValue(20);
  const startButtonScale = useSharedValue(1);

  // Trigger animations when component mounts
  useEffect(() => {
    startButtonOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    startButtonTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 300 })
    );
  }, []);

  // Animated styles for buttons
  const startButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: startButtonOpacity.value,
      transform: [
        { translateY: startButtonTranslateY.value },
        { scale: startButtonScale.value },
      ],
    };
  });

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
    // Create a button press animation
    startButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setTimeout(() => {
      router.push("/(auth)/auth"); // Use new unified auth flow
    }, 150);
  };

  const scrollTo = (index: number) => {
    slidesRef.current?.scrollToIndex({ index });
  };

  const handleManualScroll = () => {
    setIsAutoScrolling(false);
  };

  const renderSlide = ({ item, index }: any) => {
    if (item.isFeatureSlide) {
      return (
        <View className="w-full items-center justify-center" style={{ width }}>
          <View className="w-full items-center px-5">
            <TitleText className="text-5xl text-foreground mb-2 text-center">
              {item.title}
            </TitleText>
            <BodyText className="text-xl text-foreground text-center opacity-80 px-4 mb-3">
              {item.description}
            </BodyText>

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
                {features.map((feature, idx) => (
                  <FeatureItem
                    key={idx}
                    icon={feature.icon}
                    text={feature.text}
                    index={idx}
                    isActive={currentIndex === 3}
                  />
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
          <TitleText className="text-5xl text-foreground mb-3 text-center">
            {item.title}
          </TitleText>
          <BodyText className="text-xl text-foreground text-center opacity-80 px-4 mb-3">
            {item.description}
          </BodyText>
        </View>
      </View>
    );
  };

  return (
    <PageContainer scroll={false} padded={false}>
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
        <View className="flex-row justify-center space-x-3 mb-3">
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
              outputRange: [16, 32, 16],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                className="h-4 rounded-full bg-primary"
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
          <RAnimated.View style={[startButtonAnimatedStyle, { width: "100%" }]}>
            <TouchableOpacity
              onPress={handleGetStarted}
              className="w-full bg-primary py-6 rounded-xl"
              activeOpacity={0.8}
            >
              <TitleText className="text-center text-primary-foreground text-3xl font-extrabold">
                Get Started
              </TitleText>
            </TouchableOpacity>
          </RAnimated.View>
        </View>
      </View>
    </PageContainer>
  );
}

// Feature item component with staggered animation
const FeatureItem = ({
  icon,
  text,
  index,
  isActive,
}: {
  icon: any;
  text: string;
  index: number;
  isActive: boolean;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(
        100 + index * 100,
        withTiming(1, { duration: 500 })
      );
      translateY.value = withDelay(
        100 + index * 100,
        withTiming(0, { duration: 500 })
      );
    } else {
      opacity.value = 0;
      translateY.value = 20;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <RAnimated.View
      style={animatedStyle}
      className="flex-row items-center bg-white rounded-lg px-4 py-2 m-2 w-[45%]"
    >
      <Ionicons name={icon} size={22} color="#5E994B" />
      <Text className="font-paragraph-semibold text-base text-foreground ml-2">
        {text}
      </Text>
    </RAnimated.View>
  );
};
