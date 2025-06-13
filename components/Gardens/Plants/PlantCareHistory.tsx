import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import type { PlantCareLog } from "@/types/garden";
import { TitleText, BodyText } from "@/components/UI/Text";

type PlantCareHistoryProps = {
  careLogs?: PlantCareLog[];
};

export default function PlantCareHistory({ careLogs }: PlantCareHistoryProps) {
  const getCareIcon = (careLog: PlantCareLog) => {
    return "leaf-outline" as const;
  };

  if (!careLogs || careLogs.length === 0) {
    return (
      <View className="bg-cream-50 p-4 rounded-lg">
        <TitleText className="text-lg text-foreground mb-4">
          Care History
        </TitleText>
        <BodyText className="text-cream-600 italic text-center">
          No care history found for this plant.
        </BodyText>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <TitleText className="text-lg text-foreground mb-2">
        Care History
      </TitleText>

      {careLogs.map((log) => (
        <View key={log.id} className="bg-cream-50 p-3 rounded-lg">
          <View className="flex-row items-center mb-2">
            <View className="w-9 h-9 rounded-full bg-brand-100 items-center justify-center">
              <Ionicons name={getCareIcon(log)} size={18} color="#047857" />
            </View>
            <View className="flex-1 ml-2">
              <BodyText className="text-sm text-brand-700 font-medium">
                Care Log Entry
              </BodyText>
              <BodyText className="text-sm text-foreground">
                {format(new Date(log.taken_care_at), "MMM d, yyyy 'at' h:mm a")}
              </BodyText>
            </View>
          </View>
          {log.care_notes && (
            <BodyText className="text-cream-700 ml-11">
              {log.care_notes}
            </BodyText>
          )}
        </View>
      ))}
    </View>
  );
}
