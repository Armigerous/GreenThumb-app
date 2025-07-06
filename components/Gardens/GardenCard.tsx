import { GardenDashboard } from "@/types/garden";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";
import CachedImage from "../CachedImage";
import { Ionicons } from "@expo/vector-icons";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import OverdueTasksModal from "../UI/OverdueTasksModal";
import { Text, TitleText, SubtitleText, BodyText } from "../UI/Text";

/**
 * GardenCard displays summary information about a garden
 * Uses color-coding to indicate the health status of plants
 * Shows indicators for plants needing care and overdue tasks
 * For gardens with no plants, shows "Add plants" instead of health percentage
 * @param garden - The garden data to display
 * @param maxWidth - Optional max width for the health bar (for different layouts)
 */
export default function GardenCard({
  garden,
  maxWidth = 120,
}: {
  garden: GardenDashboard;
  maxWidth?: number;
}) {
  const router = useRouter();

  // State to control when to start the health bar animation
  const [startHealthAnimation, setStartHealthAnimation] =
    useState<boolean>(false);

  // State to control the visibility of the garden-specific overdue tasks modal
  const [showOverdueModal, setShowOverdueModal] = useState<boolean>(false);

  // Access the overdue tasks notifications hook
  const { hasGardenOverdueTasks, getGardenOverdueTasksCount, notifications } =
    useOverdueTasksNotifications();

  // Check if this garden has overdue tasks
  const hasOverdueTasks = hasGardenOverdueTasks(garden.garden_id);
  const overdueTasksCount = getGardenOverdueTasksCount(garden.garden_id);

  // Start health bar animation after the card is fully visible
  useEffect(() => {
    // Delay to ensure card animations are complete
    const animationTimer = setTimeout(() => {
      setStartHealthAnimation(true);
    }, 600); // 600ms delay to ensure card animations (fade/move) are complete

    return () => clearTimeout(animationTimer);
  }, []);

  // Reset and restart health animation when garden data changes
  useEffect(() => {
    setStartHealthAnimation(false);

    // Small delay to ensure the animation reset is visible
    const resetTimer = setTimeout(() => {
      setStartHealthAnimation(true);
    }, 50);

    return () => clearTimeout(resetTimer);
  }, [garden.health_percentage]);

  // Determine the garden health status color
  const getHealthStatusColor = () => {
    // If no plants, show neutral gray
    if (!garden.total_plants || garden.health_percentage === null) {
      return "#484540"; // Darker gray for better contrast
    }
    const healthPercentage = Number(garden.health_percentage);
    if (healthPercentage >= 80) return "#5E994B"; // Darker green for better contrast - brand-600
    if (healthPercentage >= 50) return "#9e8600"; // Darker amber for better contrast - accent-500
    return "#E50000"; // Red for critical (already high contrast)
  };

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

            {/* Health Progress Bar and Percentage Side by Side */}
            <View className="flex-row items-center">
              <View style={{ width: maxWidth }} className="flex-shrink-0">
                <AnimatedProgressBar
                  percentage={
                    startHealthAnimation && garden.health_percentage !== null
                      ? garden.health_percentage
                      : 0
                  }
                  color={getHealthStatusColor()}
                  height={8}
                  duration={600}
                />
              </View>
              <BodyText
                className={`$${
                  isGardensPage
                    ? "text-sm ml-2 flex-shrink-0"
                    : "text-xs ml-1 flex-shrink"
                } text-cream-700`}
                {...(!isGardensPage && {
                  numberOfLines: 1,
                  ellipsizeMode: "tail",
                })}
              >
                {garden.health_percentage !== null
                  ? `${garden.health_percentage}%`
                  : "No plants yet"}
              </BodyText>
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
