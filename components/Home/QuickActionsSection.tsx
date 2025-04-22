import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { AnimatedSection } from "./AnimatedSection";

export function QuickActionsSection() {
  const router = useRouter();

  return (
    <View className="mb-6">
      <SectionHeader title="Quick Actions" icon="flash" showSeeAll={false} />

      <AnimatedSection delay={400}>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4"
            onPress={() => router.push("/(home)/plants")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="leaf" size={24} color="#5E994B" />
            </View>
            <Text className="text-sm font-medium text-foreground">
              Browse Plants
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4"
            onPress={() => router.push("/(home)/gardens/new")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="grid" size={24} color="#5E994B" />
            </View>
            <Text className="text-sm font-medium text-foreground">
              New Garden
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%]"
            onPress={() => router.push("/(home)/calendar")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="calendar" size={24} color="#5E994B" />
            </View>
            <Text className="text-sm font-medium text-foreground">
              Calendar of Care
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%]"
            onPress={() => router.push("/(home)/gardens")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="eye" size={24} color="#5E994B" />
            </View>
            <Text className="text-sm font-medium text-foreground">
              View Gardens
            </Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>
    </View>
  );
}
