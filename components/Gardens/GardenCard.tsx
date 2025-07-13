import { GardenDashboard } from "@/types/garden";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CachedImage from "../CachedImage";
import { Ionicons } from "@expo/vector-icons";
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

  // Get the first available plant image from the garden
  const getFirstPlantImage = () => {
    if (garden.plants && (garden.plants as unknown as Array<any>).length > 0) {
      for (const plant of garden.plants as unknown as Array<any>) {
        // Reason: Ensure plant.images is an array before checking length
        if (Array.isArray(plant.images) && plant.images.length > 0) {
          return plant.images[0];
        }
      }
    }
    return null;
  };

  // Get garden status message based on actionable dashboard fields
  const getGardenStatusMessage = () => {
    // 1. No plants
    if (!garden.total_plants || garden.total_plants === 0) {
      return "Add plants to get started";
    }
    // 2. Overdue tasks
    if ((garden.plants_with_overdue_tasks ?? 0) > 0) {
      return (
        `${garden.plants_with_overdue_tasks} ` +
        ((garden.plants_with_overdue_tasks ?? 0) === 1
          ? "plant needs"
          : "plants need") +
        " care"
      );
    }
    // 3. Urgent tasks (due today or next 2 days, not overdue)
    if ((garden.plants_with_urgent_tasks ?? 0) > 0) {
      return (
        `${garden.plants_with_urgent_tasks} ` +
        ((garden.plants_with_urgent_tasks ?? 0) === 1
          ? "plant needs"
          : "plants need") +
        " attention soon"
      );
    }
    // 4. Otherwise, if there are upcoming tasks, show the next one
    // Reason: This gives a gentle heads-up without overwhelming the user
    if (
      (garden.upcoming_tasks_count ?? 0) > 0 &&
      Array.isArray(garden.upcoming_tasks) &&
      garden.upcoming_tasks.length > 0
    ) {
      const nextTask = garden.upcoming_tasks[0];
      // Type guard: ensure nextTask is an object with due_date and task_type
      if (
        nextTask &&
        typeof nextTask === "object" &&
        "due_date" in nextTask &&
        "task_type" in nextTask &&
        typeof nextTask.due_date === "string" &&
        typeof nextTask.task_type === "string"
      ) {
        const dueDate = new Date(nextTask.due_date);
        const formattedDate = dueDate.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        });
        return `Next: ${nextTask.task_type} on ${formattedDate}`;
      }
    }
    // 5. No actionable or upcoming tasks: show nothing
    return "";
  };

  // Only show the status dot if there is a status message
  const showStatusDot = !!getGardenStatusMessage();

  // Get status color based on task situation
  const getStatusColor = () => {
    // Reason: Only show red for overdue, green for healthy, neutral for no plants
    if (!(garden.total_plants ?? 0) || (garden.total_plants ?? 0) === 0) {
      return "#9e9a90"; // Neutral gray for no plants
    }
    if ((garden.plants_with_overdue_tasks ?? 0) > 0) {
      return "#E50000"; // Red for overdue tasks
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
            {/* Garden Name (no overdue dot) */}
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
                </View>
              </View>

              {/* Plant Count */}
              <BodyText
                className={`${
                  isGardensPage ? "text-sm" : "text-xs"
                } text-cream-700 ${isGardensPage ? "mb-2" : "mb-1"}`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {(garden.total_plants ?? 0) === 1
                  ? "1 Plant"
                  : `${garden.total_plants ?? 0} Plants`}
              </BodyText>
              {/* Garden Status Message and Dot */}
              <View className="flex-row items-center flex-1">
                {showStatusDot && (
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor() }}
                  />
                )}
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
        </View>
      </TouchableOpacity>
    </>
  );
}
