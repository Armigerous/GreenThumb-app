import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import type { PlantCareLog } from "@/types/garden";

type PlantCareHistoryProps = {
  careLogs?: PlantCareLog[];
};

export default function PlantCareHistory({ careLogs }: PlantCareHistoryProps) {
  if (!careLogs || careLogs.length === 0) {
    return (
      <View className="bg-cream-50 p-4 rounded-lg">
        <Text className="text-center text-cream-600">No care history yet</Text>
      </View>
    );
  }

  const getCareIcon = (careType: PlantCareLog["care_type"]) => {
    switch (careType) {
      case "Watered":
        return { name: "water-outline" as const, color: "#0891b2" };
      case "Fertilized":
        return { name: "leaf-outline" as const, color: "#059669" };
      case "Pruned":
        return { name: "cut-outline" as const, color: "#d97706" };
      case "Repotted":
        return { name: "flower-outline" as const, color: "#8b5cf6" };
      case "Pesticide":
        return { name: "shield-outline" as const, color: "#dc2626" };
      default:
        return { name: "calendar-outline" as const, color: "#6b7280" };
    }
  };

  return (
    <View className="space-y-3">
      {careLogs.map((log) => (
        <View
          key={log.id}
          className="bg-white border border-cream-100 p-3 rounded-lg"
        >
          <View className="flex-row items-center mb-2">
            <View
              className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
                log.care_type === "Watered"
                  ? "bg-blue-50"
                  : log.care_type === "Fertilized"
                  ? "bg-brand-50"
                  : log.care_type === "Harvested"
                  ? "bg-accent-50"
                  : log.care_type === "Other"
                  ? "bg-purple-50"
                  : "bg-cream-50"
              }`}
            >
              <Ionicons
                name={getCareIcon(log.care_type).name}
                size={16}
                color={getCareIcon(log.care_type).color}
              />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium">
                {log.care_type}
              </Text>
              <Text className="text-cream-500 text-sm">
                {format(new Date(log.taken_care_at), "MMM d, yyyy")}
              </Text>
            </View>
          </View>
          {log.care_notes && (
            <Text className="text-cream-600 text-sm ml-11">
              {log.care_notes}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
