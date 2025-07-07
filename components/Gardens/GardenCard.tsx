import { GardenDashboard } from "@/types/garden";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CachedImage from "../CachedImage";
import { Ionicons } from "@expo/vector-icons";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import OverdueTasksModal from "../UI/OverdueTasksModal";
import { Text, TitleText, SubtitleText, BodyText } from "../UI/Text";

/**
 * GardenCard displays summary information about a garden
 * Shows indicators for plants needing care and overdue tasks
 * For gardens with no plants, shows "Add plants"
 * @param garden - The garden data to display
 * @param maxWidth - Optional max width for the status area (for different layouts)
 */
export default function GardenCard({
  garden,
  maxWidth = 120,
}: {
  garden: GardenDashboard;
  maxWidth?: number;
}) {
  const router = useRouter();

  // State to control the visibility of the garden-specific overdue tasks modal
  const [showOverdueModal, setShowOverdueModal] = useState<boolean>(false);

  // Access the overdue tasks notifications hook
  const { hasGardenOverdueTasks, getGardenOverdueTasksCount, notifications } =
    useOverdueTasksNotifications();

  // Check if this garden has overdue tasks
  const hasOverdueTasks = hasGardenOverdueTasks(garden.garden_id);
  const overdueTasksCount = getGardenOverdueTasksCount(garden.garden_id);

  // Get the first available plant image from the garden
  const getFirstPlantImage = () => {
    if (garden.plants && garden.plants.length > 0) {
      for (const plant of garden.plants) {
        if (plant.images && plant.images.length > 0) {
          return plant.images[0];
        }
      }
    }
    return null;
  };

  // Handle the overdue task indicator being pressed
  const handleOverdueIndicatorPress = (event: any) => {
    // Prevent the parent TouchableOpacity from being triggered
    event.stopPropagation();
    setShowOverdueModal(true);
  };

  // Get garden status message based on task situation
  const getGardenStatusMessage = () => {
    if (!garden.total_plants || garden.total_plants === 0) {
      return "Add plants to get started";
    }

    if (garden.plants_with_overdue_tasks > 0) {
      return `${garden.plants_with_overdue_tasks} ${
        garden.plants_with_overdue_tasks === 1 ? "plant needs" : "plants need"
      } care`;
    }

    if (garden.upcoming_tasks_count > 0) {
      return `${garden.upcoming_tasks_count} ${
        garden.upcoming_tasks_count === 1 ? "task" : "tasks"
      } coming up`;
    }

    return "All plants healthy";
  };

  // Get status color based on task situation
  const getStatusColor = () => {
    if (!garden.total_plants || garden.total_plants === 0) {
      return "#9e9a90"; // Neutral gray for no plants
    }

    if (garden.plants_with_overdue_tasks > 0) {
      return "#E50000"; // Red for overdue tasks
    }

    if (garden.upcoming_tasks_count > 0) {
      return "#9e8600"; // Amber for upcoming tasks
    }

    return "#5E994B"; // Green for all good
  };

  // Determine if we're on the gardens page (maxWidth = 120) vs home page (maxWidth = 90)
  const isGardensPage = maxWidth === 120;
  // Get the first plant image if we're on the gardens page
  const firstPlantImage = isGardensPage ? getFirstPlantImage() : null;

  return (
    <>
      <TouchableOpacity
        className="bg-white rounded-xl p-2 max-h-28 mb-2"
        style={{
          height: isGardensPage ? undefined : 90,
        }}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/gardens/[id]",
            params: { id: garden.garden_id },
          })
        }
      >
        <View className="flex-row h-full">
          {/* Plant Image - Only shown on gardens page */}
          {isGardensPage && (
            <View className="mr-2 self-center rounded-md overflow-hidden h-24 w-24 flex-shrink-0">
              {firstPlantImage ? (
                <CachedImage
                  uri={firstPlantImage}
                  style={{
                    height: "100%",
                    borderRadius: 8,
                    aspectRatio: "1/1",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 bg-cream-100 items-center justify-center">
                  <Ionicons name="leaf-outline" size={28} color="#9e9a90" />
                </View>
              )}
            </View>
          )}

          <View className="flex-1 px-2 flex-col justify-between min-w-0">
            {/* Garden Name and Alert Badges */}
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-row items-center flex-1 min-w-0 mr-2">
                  <TitleText
                    className={`${
                      isGardensPage ? "text-lg" : "text-base"
                    } text-foreground flex-1`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {garden.name}
                  </TitleText>
                  {/* Overdue Task Indicator Dot */}
                  {hasOverdueTasks && (
                    <TouchableOpacity
                      onPress={handleOverdueIndicatorPress}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      className="ml-1 flex-shrink-0"
                    >
                      <View className="w-3 h-3 relative">
                        {overdueTasksCount > 0 && (
                          <View className="absolute -top-1 -right-1 bg-destructive w-4 h-4 items-center justify-center rounded-md">
                            <Text className="text-[8px] text-cream-50 font-bold">
                              {overdueTasksCount > 9 ? "9+" : overdueTasksCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
                {/* Plants Needing Care Badge */}
                {garden.plants_with_overdue_tasks > 0 && (
                  <View className="bg-accent-200 rounded-full px-2 py-0.5 flex-shrink-0">
                    <BodyText
                      className={`${
                        isGardensPage ? "text-xs" : "text-[10px]"
                      } text-accent-800 font-medium`}
                    >
                      {garden.plants_with_overdue_tasks} needs care
                    </BodyText>
                  </View>
                )}
              </View>

              {/* Plant Count */}
              <BodyText
                className={`${
                  isGardensPage ? "text-sm" : "text-xs"
                } text-cream-700 ${isGardensPage ? "mb-2" : "mb-1"}`}
              >
                {garden.total_plants === 1
                  ? "1 Plant"
                  : `${garden.total_plants} Plants`}
              </BodyText>
            </View>

            {/* Garden Status Message */}
            <View className="flex-row items-center">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor() }}
                />
                <BodyText
                  className={`${
                    isGardensPage ? "text-sm" : "text-xs"
                  } text-cream-700 flex-1`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: getStatusColor() }}
                >
                  {getGardenStatusMessage()}
                </BodyText>
              </View>
            </View>
          </View>

          {/* Navigation arrow - Only shown on gardens page */}
          {isGardensPage && (
            <View className="justify-center ml-2 flex-shrink-0">
              <Ionicons name="arrow-forward" size={22} color="#9e9a90" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Garden-specific overdue tasks modal */}
      <OverdueTasksModal
        isVisible={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        notifications={notifications}
        gardenId={garden.garden_id}
      />
    </>
  );
}
