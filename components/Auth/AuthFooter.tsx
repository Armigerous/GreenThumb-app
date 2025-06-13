import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { BodyText } from "@/components/UI/Text";

type AuthFooterProps = {
  isSignUp: boolean; // true for sign up screen, false for sign in screen
  linkPath: any; // Using any for path to bypass type checking
};

export function AuthFooter({ isSignUp, linkPath }: AuthFooterProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  return (
    <View className="flex-row justify-center mt-2">
      <BodyText
        className={`text-foreground ${isSmallDevice ? "text-xs" : "text-sm"}`}
      >
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
      </BodyText>
      <Link href={linkPath} asChild>
        <TouchableOpacity className="flex-row items-center">
          <BodyText
            className={`text-primary mr-1 ${
              isSmallDevice ? "text-xs" : "text-sm"
            }`}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </BodyText>
          <Ionicons
            name={isSignUp ? "log-in-outline" : "person-add-outline"}
            size={isSmallDevice ? 14 : 16}
            color="#5E994B"
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
