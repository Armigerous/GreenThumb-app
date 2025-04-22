import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/icons";
import Animated, { AnimatedStyleProp } from "react-native-reanimated";

type AuthSocialOptionsProps = {
  onGooglePress: () => void;
  onApplePress: () => void;
  onFacebookPress: () => void;
  isLoading: boolean;
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
  title?: string;
};

export function AuthSocialOptions({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  isLoading,
  animatedStyle,
  title = "Or sign in with",
}: AuthSocialOptionsProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const iconSize = isSmallDevice ? 20 : 24;
  const buttonHeight = isSmallDevice ? 10 : 12;

  const content = (
    <>
      <View className="flex-row items-center w-full mb-4">
        <View className="flex-1 h-[1px] bg-cream-300" />
        <Text className="text-foreground text-sm mx-4">{title}</Text>
        <View className="flex-1 h-[1px] bg-cream-300" />
      </View>
      <View
        className={`flex-row justify-between w-full ${
          isSmallDevice ? "gap-2" : "gap-4"
        }`}
      >
        <TouchableOpacity
          className={`bg-cream-50 ${
            isSmallDevice ? "p-2" : "p-3"
          } rounded-lg shadow-sm border border-cream-300 flex-1 h-${buttonHeight} items-center justify-center`}
          onPress={onGooglePress}
          disabled={isLoading}
        >
          <GoogleIcon size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-cream-50 ${
            isSmallDevice ? "p-2" : "p-3"
          } rounded-lg shadow-sm border border-cream-300 flex-1 h-${buttonHeight} items-center justify-center`}
          onPress={onApplePress}
          disabled={isLoading}
        >
          <AppleIcon size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-cream-50 ${
            isSmallDevice ? "p-2" : "p-3"
          } rounded-lg shadow-sm border border-cream-300 flex-1 h-${buttonHeight} items-center justify-center`}
          onPress={onFacebookPress}
          disabled={isLoading}
        >
          <FacebookIcon size={iconSize} />
        </TouchableOpacity>
      </View>
    </>
  );

  // If animatedStyle is provided, use Animated.View
  if (animatedStyle) {
    return (
      <Animated.View
        className={`items-center ${isSmallDevice ? "my-1" : "my-2"}`}
        style={animatedStyle}
      >
        {content}
      </Animated.View>
    );
  }

  // Otherwise use regular View
  return (
    <View className={`items-center ${isSmallDevice ? "my-1" : "my-2"}`}>
      {content}
    </View>
  );
}
