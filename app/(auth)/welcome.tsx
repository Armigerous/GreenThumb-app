import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.navigate("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Text className="text-foreground text-lg font-medium">
          The GreenThumb
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity className="flex-row items-center bg-primary py-2 px-4 rounded-lg">
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
            <Text className="text-primary-foreground ml-2 text-base">
              Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 justify-center items-center p-5">
        <View className="w-full h-[250px] justify-center items-center mb-5">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-4/5 h-4/5"
            resizeMode="contain"
          />
        </View>

        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2 text-center">
            Your North Carolina
          </Text>
          <Text className="text-3xl font-bold text-foreground mb-2 text-center">
            Garden Companion
          </Text>
          <Text className="text-base text-foreground text-center opacity-80 mb-4">
            Access to over 4,500 plants with care advice{"\n"}
            tailored to North Carolina growing conditions
          </Text>

          {/* Feature highlights */}
          <View className="w-full flex flex-row flex-wrap justify-center items-center mb-4">
            {/* Features grid with 2 columns to ensure proper centering */}
            <View className="flex flex-row w-full justify-center">
              <View className="flex-row items-center bg-cream-50 rounded-lg px-3 py-2 m-1">
                <Ionicons name="calendar-outline" size={16} color="#5E994B" />
                <Text className="text-sm text-foreground ml-2">
                  Care Calendar
                </Text>
              </View>

              <View className="flex-row items-center bg-cream-50 rounded-lg px-3 py-2 m-1">
                <Ionicons name="leaf-outline" size={16} color="#5E994B" />
                <Text className="text-sm text-foreground ml-2">
                  Custom Gardens
                </Text>
              </View>
            </View>

            <View className="flex flex-row w-full justify-center">
              <View className="flex-row items-center bg-cream-50 rounded-lg px-3 py-2 m-1">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#5E994B"
                />
                <Text className="text-sm text-foreground ml-2">
                  Expert Care Tips
                </Text>
              </View>
              <View className="flex-row items-center bg-cream-50 rounded-lg px-3 py-2 m-1">
                <Ionicons name="search-outline" size={16} color="#5E994B" />
                <Text className="text-sm text-foreground ml-2">
                  Plant Database
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity className="bg-primary py-4 px-8 rounded-xl w-full items-center flex-row justify-center">
            <Text className="text-primary-foreground text-base font-bold mr-2">
              Start Growing Smarter
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
