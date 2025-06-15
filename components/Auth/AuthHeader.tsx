import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { TitleText, BodyText } from "@/components/UI/Text";

type AuthHeaderProps = {
  backPath: string;
  alternateAuthPath: string;
  alternateAuthText: string;
  alternateAuthIcon: "log-in-outline" | "person-add-outline";
};

export function AuthHeader({
  backPath,
  alternateAuthPath,
  alternateAuthText,
  alternateAuthIcon,
}: AuthHeaderProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const router = useRouter();

  const handleBackPress = () => {
    router.push(backPath);
  };

  const handleAlternateAuthPress = () => {
    router.push(alternateAuthPath);
  };

  return (
    <View
      className={`flex-row justify-between items-center ${
        isSmallDevice ? "px-3" : "px-5"
      }`}
    >
      <TouchableOpacity onPress={handleBackPress}>
        <View className="flex-row items-center">
          <Ionicons
            name="arrow-back-outline"
            size={isSmallDevice ? 18 : 20}
            color="#2e2c29"
          />
          <BodyText
            className={`text-foreground ${
              isSmallDevice ? "text-sm" : "text-base"
            } ml-1`}
          >
            Back
          </BodyText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAlternateAuthPress}>
        <View className="flex-row items-center">
          <BodyText
            className={`text-primary mr-1 ${
              isSmallDevice ? "text-xs" : "text-sm"
            }`}
          >
            {alternateAuthText}
          </BodyText>
          <Ionicons
            name={alternateAuthIcon}
            size={isSmallDevice ? 14 : 16}
            color="#5E994B"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
