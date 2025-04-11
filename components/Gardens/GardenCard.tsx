import { GardenDashboard } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";

/**
 * GardenCard displays summary information about a garden
 * Uses color-coding to indicate the health status of plants
 */
export default function GardenCard({ garden }: { garden: GardenDashboard }) {
  const router = useRouter();

  // Determine the garden health status color
  const getHealthStatusColor = () => {
    if (!garden.total_plants) return "#484540"; // Darker gray for better contrast
    const healthPercentage = Number(garden.health_percentage);
    if (healthPercentage >= 80) return "#5E994B"; // Darker green for better contrast - brand-600
    if (healthPercentage >= 50) return "#9e8600"; // Darker amber for better contrast - accent-500
    return "#E50000"; // Red for critical (already high contrast)
  };

  return (
    <TouchableOpacity
      className="bg-white border border-cream-300 rounded-xl p-4 mb-4"
      onPress={() =>
        router.push({
          pathname: "/(home)/gardens/[id]",
          params: { id: garden.garden_id },
        })
      }
    >
      <View>
        {/* Garden Name and Alert Badge */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-foreground flex-1 mr-2">
            {garden.name}
          </Text>
          {garden.plants_needing_care > 0 && (
            <View className="bg-accent-200 rounded-full px-2.5 py-1">
              <Text className="text-xs text-accent-800 font-medium">
                {garden.plants_needing_care} needs care
              </Text>
            </View>
          )}
        </View>

        {/* Plant Count */}
        <Text className="text-sm text-cream-700 mb-3">
          {garden.total_plants || 0} Plants
        </Text>

        {/* Health Progress Bar */}
        <AnimatedProgressBar
          percentage={garden.health_percentage}
          color={getHealthStatusColor()}
          height={8}
          duration={500}
        />
        <Text className="text-xs text-cream-700 mt-1">
          {garden.health_percentage}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}
