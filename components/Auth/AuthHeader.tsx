import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type AuthHeaderProps = {
  backPath: any; // Using any for path to bypass type checking
  alternateAuthPath: any; // Using any for path to bypass type checking
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

  return (
    <View
      className={`flex-row justify-between items-center ${
        isSmallDevice ? "px-3" : "px-5"
      }`}
    >
      <Link href={backPath} asChild>
        <TouchableOpacity>
          <View className="flex-row items-center">
            <Ionicons
              name="arrow-back-outline"
              size={isSmallDevice ? 18 : 20}
              color="#2e2c29"
            />
            <Text
              className={`text-foreground ${
                isSmallDevice ? "text-sm" : "text-base"
              } ml-1`}
            >
              Back
            </Text>
          </View>
        </TouchableOpacity>
      </Link>

      <Link href={alternateAuthPath} asChild>
        <TouchableOpacity>
          <View className="flex-row items-center">
            <Text
              className={`text-primary mr-1 ${
                isSmallDevice ? "text-xs" : "text-sm"
              }`}
            >
              {alternateAuthText}
            </Text>
            <Ionicons
              name={alternateAuthIcon}
              size={isSmallDevice ? 14 : 16}
              color="#5E994B"
            />
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
