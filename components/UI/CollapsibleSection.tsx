import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IconName } from "@/types/icon";

type CollapsibleSectionProps = {
  title: string;
  icon: IconName;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
};

export default function CollapsibleSection({
  title,
  icon,
  children,
  initiallyExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <View className="bg-cream-50 border border-cream-300 rounded-lg mb-4 overflow-hidden shadow-sm">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-row items-center">
          <Ionicons name={icon} size={20} color="#059669" />
          <Text className="text-foreground font-medium ml-2.5 text-base">
            {title}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#4b5563"
        />
      </TouchableOpacity>

      {isExpanded && <View className="px-4 pb-4 pt-1">{children}</View>}
    </View>
  );
}
