import React, { ReactNode, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  SectionListData,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import type { UserPlant } from "@/types/garden";
import CachedImage from "@/components/CachedImage";

type PlantSection = {
  title: string;
  data: UserPlant[];
  icon: "alert-circle" | "time" | "checkmark-circle";
  color: string;
  description: string;
};

/**
 * Props for the GardenPlantsList component
 *
 * This type defines the properties that can be passed to the GardenPlantsList
 * component for rendering a list of plants in a garden.
 */
type GardenPlantsListProps = {
  /** Array of plants to display in the list */
  plants?: UserPlant[];
  /** Callback function for when the user wants to add a new plant */
  onAddPlant: () => void;
  /** Callback function for when a plant is pressed, receives the plant data */
  onPlantPress: (plant: UserPlant) => void;
  /** Callback function for when a plant is watered, receives the plant data */
  onWaterPlant?: (plant: UserPlant) => void;
  /** Callback function for when a plant is edited, receives the plant data */
  onEditPlant?: (plant: UserPlant) => void;
  /** Optional component to render at the top of the list */
  HeaderComponent?: ReactNode;
  /** Optional component to render at the bottom of the list */
  FooterComponent?: ReactNode;
};

export default function GardenPlantsList({
  plants,
  onAddPlant,
  onPlantPress,
  onWaterPlant,
  onEditPlant,
  HeaderComponent,
  FooterComponent,
}: GardenPlantsListProps) {
  // Group plants by their care needs based on task urgency, not just existence of tasks
  const getGroupedPlants = () => {
    if (!plants || plants.length === 0) return [];

    const plantsWithOverdueTasks: UserPlant[] = [];
    const plantsWithUrgentTasks: UserPlant[] = []; // Due today or tomorrow
    const plantsWithRegularTasks: UserPlant[] = []; // Due later

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

    plants.forEach((plant) => {
      if (!plant.plant_tasks || plant.plant_tasks.length === 0) {
        plantsWithRegularTasks.push(plant);
        return;
      }

      const incompleteTasks = plant.plant_tasks.filter(
        (task) => !task.completed
      );
      if (incompleteTasks.length === 0) {
        plantsWithRegularTasks.push(plant);
        return;
      }

      // Sort tasks by due date to get the most urgent
      const sortedTasks = incompleteTasks.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
      const nextTask = sortedTasks[0];
      const taskDueDate = new Date(nextTask.due_date);

      if (taskDueDate < now) {
        // Task is overdue
        plantsWithOverdueTasks.push(plant);
      } else if (taskDueDate <= tomorrow) {
        // Task is due today or tomorrow
        plantsWithUrgentTasks.push(plant);
      } else {
        // Task is due later
        plantsWithRegularTasks.push(plant);
      }
    });

    const sections = [];

    if (plantsWithOverdueTasks.length > 0) {
      sections.push({
        title: "Needs Immediate Care",
        data: plantsWithOverdueTasks,
        icon: "alert-circle" as const,
        color: "#dc2626", // red-600
        description: "These plants have overdue care tasks",
      });
    }

    if (plantsWithUrgentTasks.length > 0) {
      sections.push({
        title: "Due Today/Tomorrow",
        data: plantsWithUrgentTasks,
        icon: "time" as const,
        color: "#d97706", // yellow-600
        description: "These plants need care within the next day",
      });
    }

    if (plantsWithRegularTasks.length > 0) {
      sections.push({
        title: "All Good",
        data: plantsWithRegularTasks,
        icon: "checkmark-circle" as const,
        color: "#77B860", // brand-600
        description: "These plants have care scheduled for later",
      });
    }

    return sections;
  };

  const groupedPlants = getGroupedPlants();

  // Helper to format date if valid
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    const date = parseISO(dateString);
    if (!isValid(date)) return null;

    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    return format(date, "MMM d");
  };

  const getLastWateringDate = (plant: UserPlant) => {
    if (!plant.care_logs || plant.care_logs.length === 0) return null;
    const lastLog = plant.care_logs[plant.care_logs.length - 1];
    return formatDate(lastLog.taken_care_at);
  };

  // Get the most urgent task for a plant
  const getMostUrgentTask = (plant: UserPlant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) return null;

    const now = new Date();
    const incompleteTasks = plant.plant_tasks.filter((task) => !task.completed);

    if (incompleteTasks.length === 0) return null;

    // Sort by due date and get the most urgent
    const sortedTasks = incompleteTasks.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    return sortedTasks[0];
  };

  const renderPlantCard = ({ item }: { item: UserPlant }) => {
    const lastWatered = getLastWateringDate(item);
    const urgentTask = getMostUrgentTask(item);

    // Determine care status based on tasks, not user status
    const getCareStatus = () => {
      if (!urgentTask)
        return { text: "No tasks", color: "#77B860", bg: "bg-brand-100" };

      const now = new Date();
      const dueDate = new Date(urgentTask.due_date);
      const isOverdue = dueDate < now;

      if (isOverdue) {
        const daysOverdue = differenceInDays(now, dueDate);
        return {
          text: `${urgentTask.task_type} overdue`,
          color: "#dc2626",
          bg: "bg-red-100",
          detail: daysOverdue === 0 ? "Today" : `${daysOverdue}d ago`,
        };
      } else {
        const daysUntilDue = differenceInDays(dueDate, now);
        return {
          text: `${urgentTask.task_type} due`,
          color: "#d97706",
          bg: "bg-yellow-100",
          detail: daysUntilDue === 0 ? "Today" : `in ${daysUntilDue}d`,
        };
      }
    };

    const careStatus = getCareStatus();

    return (
      <TouchableOpacity
        className="bg-white border border-cream-100 px-4 py-3.5 rounded-lg mb-3.5 mx-4"
        onPress={() => onPlantPress(item)}
      >
        <View className="flex-row items-start mb-3">
          {item.images?.[0] && (
            <CachedImage
              uri={item.images[0]}
              style={{ height: 72, width: 72, borderRadius: 8 }}
              resizeMode="cover"
              cacheKey={`garden-plant-${item.id}-image`}
            />
          )}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-3">
                <Text className="text-base text-foreground font-medium">
                  {item.nickname}
                </Text>
              </View>
              <View
                className={`rounded-full px-3.5 py-1.5 flex-row items-center ${careStatus.bg}`}
              >
                <Ionicons
                  name={
                    urgentTask
                      ? urgentTask.task_type === "Water"
                        ? "water"
                        : urgentTask.task_type === "Fertilize"
                        ? "leaf"
                        : "cut"
                      : "checkmark-circle"
                  }
                  size={16}
                  color={careStatus.color}
                />
                <Text
                  className="text-xs font-medium ml-1.5"
                  style={{ color: careStatus.color }}
                >
                  {careStatus.text}
                </Text>
                {careStatus.detail && (
                  <Text
                    className="text-xs ml-1"
                    style={{ color: careStatus.color, opacity: 0.7 }}
                  >
                    ({careStatus.detail})
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center mt-2.5">
              {lastWatered && (
                <View className="flex-row items-center mr-4">
                  <Ionicons name="water-outline" size={16} color="#0891b2" />
                  <Text className="text-blue-600 text-xs ml-1.5">
                    Watered {lastWatered}
                  </Text>
                </View>
              )}
              {item.care_logs && item.care_logs.length > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                  <Text className="text-cream-500 text-xs ml-1.5">
                    {item.care_logs.length} Care{" "}
                    {item.care_logs.length === 1 ? "Log" : "Logs"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="flex-row border-cream-100 border-t justify-end pt-3">
          {onWaterPlant && (
            <TouchableOpacity
              className="flex-row bg-blue-50 rounded-full items-center mr-3 px-4 py-2"
              onPress={() => onWaterPlant(item)}
            >
              <Ionicons name="water" size={16} color="#0891b2" />
              <Text className="text-blue-600 text-xs font-medium ml-1.5">
                Water
              </Text>
            </TouchableOpacity>
          )}
          {onEditPlant && (
            <TouchableOpacity
              className="flex-row bg-cream-50 rounded-full items-center px-4 py-2"
              onPress={() => onEditPlant(item)}
            >
              <Ionicons name="create-outline" size={16} color="#6b7280" />
              <Text className="text-cream-600 text-xs font-medium ml-1.5">
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<UserPlant, PlantSection>;
  }) => (
    <View className="mb-3 mt-5 mx-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name={section.icon} size={22} color={section.color} />
        <Text className="text-foreground text-lg font-semibold ml-2.5">
          {section.title}
        </Text>
        <Text className="text-cream-500 ml-2.5">({section.data.length})</Text>
      </View>
      <Text className="text-xs text-cream-600 ml-8">{section.description}</Text>
    </View>
  );

  const ListHeader = () => {
    return (
      <>
        <View className="flex-row justify-between items-center mb-5 mx-4 mt-2">
          <Text className="text-foreground text-xl font-semibold">
            My Plants
          </Text>
          <TouchableOpacity
            className="flex-row bg-brand-500 rounded-full items-center px-4 py-2.5"
            onPress={onAddPlant}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1.5">Add Plant</Text>
          </TouchableOpacity>
        </View>
        {HeaderComponent}
      </>
    );
  };

  if (!plants || plants.length === 0) {
    return (
      <View className="flex-1">
        {HeaderComponent}
        <View className="mb-5 mx-4">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-foreground text-xl font-semibold">
              My Plants
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-4 py-2.5"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-1.5">Add Plant</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm items-center px-5 py-12">
            <Ionicons
              name="leaf-outline"
              size={56}
              color="#9e9a90"
              className="mb-3"
            />
            <Text className="text-center text-foreground text-lg font-medium mb-3">
              No plants added yet
            </Text>
            <Text className="text-center text-cream-500 mb-7 px-5">
              Add your first plant to start tracking its care
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-5 py-3"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-2 text-base">
                Add First Plant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {FooterComponent}
      </View>
    );
  }

  return (
    <SectionList<UserPlant, PlantSection>
      sections={groupedPlants}
      renderItem={renderPlantCard}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={<ListHeader />}
      ListFooterComponent={
        FooterComponent ? () => <>{FooterComponent}</> : undefined
      }
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
