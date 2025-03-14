import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Text className="text-foreground text-base">Welcome</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
          <Text className="text-foreground text-base">Sign In</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center p-5">
        <View className="w-full h-[300px] justify-center items-center mb-5">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-4/5 h-4/5"
            resizeMode="contain"
          />
        </View>

        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">
            The GreenThumb
          </Text>
          <Text className="text-base text-foreground text-center opacity-80">
            Discover and care{"\n"}for plants
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary py-4 px-8 rounded-3xl w-full items-center"
          onPress={handleGetStarted}
        >
          <Text className="text-primary-foreground text-base font-bold">
            Get started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
