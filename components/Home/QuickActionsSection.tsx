import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SectionHeader } from "./SectionHeader";
import { StaggeredContent } from "@/components/UI/StaggeredContent";
import { BodyText } from "@/components/UI/Text";
import * as Sentry from "@sentry/react-native";

export function QuickActionsSection() {
  const router = useRouter();

  return (
    <View className="mb-6">
      <StaggeredContent index={6} baseDelay={720} staggerInterval={80}>
        <SectionHeader title="Quick Actions" icon="flash" showSeeAll={false} />
      </StaggeredContent>

      <StaggeredContent index={7} baseDelay={800} staggerInterval={80}>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4"
            onPress={() => router.push("/(tabs)/plants")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="leaf" size={24} color="#5E994B" />
            </View>
            <BodyText className="text-sm font-medium text-foreground">
              Browse Plants
            </BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4"
            onPress={() => router.push("/(tabs)/gardens/new")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="grid" size={24} color="#5E994B" />
            </View>
            <BodyText className="text-sm font-medium text-foreground">
              New Garden
            </BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%]"
            onPress={() => router.push("/(tabs)/calendar")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="calendar" size={24} color="#5E994B" />
            </View>
            <BodyText className="text-sm font-medium text-foreground">
              Calendar of Care
            </BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center justify-center w-[48%]"
            onPress={() => router.push("/(tabs)/gardens")}
          >
            <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mb-2">
              <Ionicons name="eye" size={24} color="#5E994B" />
            </View>
            <BodyText className="text-sm font-medium text-foreground">
              View Gardens
            </BodyText>
          </TouchableOpacity>
        </View>
      </StaggeredContent>
    </View>
  );
}
