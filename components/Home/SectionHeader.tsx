import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SubtitleText, BodyText } from "@/components/UI/Text";

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onSeeAll?: () => void;
  seeAllText?: string;
  showSeeAll?: boolean;
  badge?: { count: number; type: "warning" | "info" } | null;
}

export function SectionHeader({
  title,
  icon,
  onSeeAll,
  seeAllText = "See All",
  showSeeAll = true,
  badge,
}: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-lg bg-brand-100 items-center justify-center">
          <Ionicons name={icon} size={18} color="#5E994B" />
        </View>
        <View className="flex-row items-center">
          <SubtitleText className="text-lg font-semibold text-foreground">
            {title}
          </SubtitleText>

          {/* Show badge if provided */}
          {badge && badge.count > 0 && (
            <View
              className={`ml-2 py-1 px-2 rounded-lg ${
                badge.type === "warning" ? "bg-red-100" : "bg-brand-100"
              }`}
            >
              <BodyText
                className={`text-xs font-medium ${
                  badge.type === "warning" ? "text-destructive" : "text-primary"
                }`}
              >
                {badge.count}
              </BodyText>
            </View>
          )}
        </View>
      </View>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          className="flex-row items-center gap-2"
        >
          <BodyText className="text-sm text-brand-600 font-medium">
            {seeAllText}
          </BodyText>
          <Ionicons name="arrow-forward" size={16} color="#77B860" />
        </TouchableOpacity>
      )}
    </View>
  );
}
