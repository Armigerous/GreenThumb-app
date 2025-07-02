import CachedImage from "@/components/CachedImage";
import { TaskList } from "@/components/TaskList";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import SubmitButton from "@/components/UI/SubmitButton";
import { useUserPlantDetails } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import {
  PlantCareLog,
  PlantTask,
  TaskWithDetails,
  UserPlant,
} from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { differenceInDays, format, isValid, parseISO } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EditPlantModal from "@/components/Gardens/Plants/EditPlantModal";
import AddJournalEntryModal from "@/components/Gardens/Plants/AddCareLogModal";
import { useUser } from "@clerk/clerk-expo";

// Define task time period types for better type safety
type TaskTimePeriod =
  | "missed"
  | "today"
  | "tomorrow"
  | "this_week"
  | "next_week"
  | "this_month"
  | "later";

/**
 * Individual Plant Page for a user's garden
 *
 * This page displays detailed information about a specific plant in the user's garden,
 * including its identity, care history, tasks, and environmental requirements.
 */
export default function UserPlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // State for edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  // State for journal entry modal
  const [isJournalModalVisible, setIsJournalModalVisible] = useState(false);

  // Fetch plant details using our custom hook
  const {
    data: plantData,
    isLoading,
    error,
    refetch,
  } = useUserPlantDetails(id);

  // State for task tab navigation
  const [activeTaskTab, setActiveTaskTab] = useState<TaskTimePeriod>("today");

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/(tabs)/gardens/${plantData?.garden_id}`);
  };

  // Handle adding a new care log with notes
  const handleAddCareLog = async (notes: string, imageUrl: string | null) => {
    if (!plantData || !notes.trim() || !user) return;

    try {
      const now = new Date().toISOString();

      // First, insert into plant_care_logs table to get a proper ID
      const { data: careLogData, error: careLogError } = await supabase
        .from("plant_care_logs")
        .insert({
          user_plant_id: plantData.id,
          image: imageUrl || "",
          care_notes: notes,
          taken_care_at: now,
        })
        .select()
        .single();

      if (careLogError) {
        console.error("Error inserting care log:", careLogError);
        Alert.alert("Error", "Could not add journal entry.");
        return;
      }

      // Get the inserted care log
      const newCareLog = careLogData as PlantCareLog;

      // Update user_plants to track the new image if one was provided
      if (imageUrl) {
        // Get existing images
        const existingImages = plantData.images || [];
        const updatedImages = [...existingImages, imageUrl];

        // Update the plant with the new image
        const { error: updateError } = await supabase
          .from("user_plants")
          .update({
            images: updatedImages,
            updated_at: now,
          })
          .eq("id", plantData.id);

        if (updateError) {
          console.error("Error updating plant images:", updateError);
          // Continue anyway since the care log was saved
        }
      }

      // Show success message
      Alert.alert("Success", "Journal entry added successfully!");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["userPlantDetails", id],
      });

      // Refetch plant data
      refetch();
    } catch (err) {
      console.error("Add care log error:", err);
      Alert.alert("Error", "Failed to add journal entry. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Unknown date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const daysDifference = differenceInDays(taskDate, today);

    // Handle future dates
    if (daysDifference > 0) {
      if (daysDifference === 1) return "Tomorrow";
      if (daysDifference < 7) return `in ${daysDifference} days`;
      return format(date, "MMM d, yyyy");
    }

    // Handle past dates
    if (daysDifference === 0) return "Today";
    if (daysDifference === -1) return "Yesterday";
    if (daysDifference > -7) return `${Math.abs(daysDifference)} days ago`;
    return format(date, "MMM d, yyyy");
  };

  // Handle image press
  const handleImagePress = (imageUrl: string) => {
    // TODO: Implement image preview functionality
    console.log("Image pressed:", imageUrl);
  };

  // Get tasks for this plant and convert to TaskWithDetails
  const plantTasks = (plantData as UserPlant)?.plant_tasks || [];
  const tasksWithDetails = plantTasks.map(
    (task: PlantTask): TaskWithDetails => ({
      ...task,
      plant: {
        nickname: plantData?.nickname || "",
        garden: {
          name: plantData?.garden_name || "",
        },
      },
    })
  );

  // Group tasks by time period
  const groupTasksByTime = (tasks: TaskWithDetails[]) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);

    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const thisMonth = new Date(now);
    thisMonth.setMonth(thisMonth.getMonth() + 1);
    thisMonth.setHours(0, 0, 0, 0);

    // Initialize all groups with empty arrays
    const groups: Record<TaskTimePeriod, TaskWithDetails[]> = {
      missed: [],
      today: [],
      tomorrow: [],
      this_week: [],
      next_week: [],
      this_month: [],
      later: [],
    };

    return tasks.reduce(
      (
        groups: Record<TaskTimePeriod, TaskWithDetails[]>,
        task: TaskWithDetails
      ) => {
        const dueDate = new Date(task.due_date);
        let group: TaskTimePeriod = "later";

        // Check if task is missed (due date is before today and not completed)
        if (dueDate < now && !task.completed) {
          group = "missed";
        } else if (dueDate <= now) {
          group = "today";
        } else if (dueDate <= tomorrow) {
          group = "tomorrow";
        } else if (dueDate <= nextWeek) {
          group = "this_week";
        } else if (dueDate <= nextWeekEnd) {
          group = "next_week";
        } else if (dueDate <= thisMonth) {
          group = "this_month";
        }

        groups[group].push(task);
        return groups;
      },
      groups
    );
  };

  // Group all tasks by time period
  const groupedTasks = groupTasksByTime(tasksWithDetails);

  // Get all time periods that have tasks
  const timePeriodsWithTasks = Object.entries(groupedTasks)
    .filter(([_, tasks]) => tasks.length > 0)
    .map(([period]) => period as TaskTimePeriod);

  // Use useEffect to handle tab selection logic
  useEffect(() => {
    // Only set default tab on initial load or when tasks change, not when user manually selects a tab
    if (
      timePeriodsWithTasks.length > 0 &&
      !timePeriodsWithTasks.includes(activeTaskTab)
    ) {
      // If there are missed tasks, default to that tab
      if (timePeriodsWithTasks.includes("missed")) {
        setActiveTaskTab("missed");
      } else {
        // Otherwise default to the first available tab
        setActiveTaskTab(timePeriodsWithTasks[0]);
      }
    }
  }, [timePeriodsWithTasks]);

  // Find the next upcoming task
  const nextUpcomingTask = tasksWithDetails
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .find((task) => {
      // Get today's date at midnight (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get task due date at midnight (start of day)
      const taskDueDate = new Date(task.due_date);
      taskDueDate.setHours(0, 0, 0, 0);

      // Include tasks due today or in the future
      return taskDueDate >= today;
    });

  // Get the last care log
  const getLastCareLog = () => {
    const typedPlantData = plantData as UserPlant;
    if (!typedPlantData?.care_logs || typedPlantData.care_logs.length === 0) {
      return null;
    }

    // Sort care logs by date (newest first)
    const sortedLogs = [...typedPlantData.care_logs].sort(
      (a: PlantCareLog, b: PlantCareLog) =>
        new Date(b.taken_care_at).getTime() -
        new Date(a.taken_care_at).getTime()
    );

    return sortedLogs[0];
  };

  // Get next task and last care log
  const nextTask = nextUpcomingTask;
  const lastCareLog = getLastCareLog();

  // Get current care status based on tasks, not user status
  const getCurrentCareStatus = () => {
    if (!plantData.plant_tasks || plantData.plant_tasks.length === 0) {
      return {
        text: "No tasks",
        color: "#77B860",
        bg: "bg-brand-100",
        emoji: "✅",
        description: "All good",
      };
    }

    const now = new Date();
    const incompleteTasks = plantData.plant_tasks.filter(
      (task: PlantTask) => !task.completed
    );

    if (incompleteTasks.length === 0) {
      return {
        text: "All caught up",
        color: "#77B860",
        bg: "bg-brand-100",
        emoji: "✅",
        description: "No pending tasks",
      };
    }

    // Sort by due date to get most urgent
    const sortedTasks = incompleteTasks.sort(
      (a: PlantTask, b: PlantTask) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    const urgentTask = sortedTasks[0];
    const taskDate = new Date(urgentTask.due_date);

    if (taskDate < now) {
      return {
        text: `${urgentTask.task_type} overdue`,
        color: "#dc2626",
        bg: "bg-red-100",
        emoji: "🚨",
        description: "Needs immediate care",
      };
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (taskDate <= tomorrow) {
        return {
          text: `${urgentTask.task_type} due soon`,
          color: "#d97706",
          bg: "bg-yellow-100",
          emoji: "⚠️",
          description: "Care needed soon",
        };
      } else {
        return {
          text: `${urgentTask.task_type} scheduled`,
          color: "#77B860",
          bg: "bg-brand-100",
          emoji: "📅",
          description: "Care scheduled",
        };
      }
    }
  };

  const careStatus = getCurrentCareStatus();

  // Loading state
  if (isLoading) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading plant details..." />
      </PageContainer>
    );
  }

  // Error state
  if (error || !plantData) {
    return (
      <PageContainer>
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading plant details. Please try again.
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer scroll={false} padded={false} safeArea={false}>
      {/* Fixed Header */}
      <View className="pt-safe">
        <View className="flex-row justify-between items-center px-5">
          <SubmitButton
            onPress={handleBack}
            iconName="arrow-back"
            iconPosition="left"
            type="outline"
            color="secondary"
          >
            Back
          </SubmitButton>

          <SubmitButton
            onPress={() => setIsEditModalVisible(true)}
            iconName="create-outline"
            iconPosition="left"
          >
            Edit
          </SubmitButton>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-4">
            {/* 1. Plant Identity Card */}
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              {/* Plant Image */}
              <View className="w-full h-[250px]">
                {plantData?.images && plantData.images.length > 0 ? (
                  <CachedImage
                    uri={plantData.images[0]}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-cream-100 items-center justify-center">
                    <Ionicons name="leaf-outline" size={64} color="#9e9a90" />
                  </View>
                )}
              </View>

              {/* Plant Info */}
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-foreground">
                      {plantData.nickname}
                    </Text>
                    <Text className="text-cream-600 text-base mt-1">
                      {plantData.scientific_name}
                    </Text>
                  </View>

                  {/* Health Status */}
                  <View
                    className={`rounded-full px-3 py-1.5 flex-row items-center ${careStatus.bg}`}
                  >
                    <Text className="text-lg mr-1">{careStatus.emoji}</Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: careStatus.color }}
                    >
                      {careStatus.text}
                    </Text>
                  </View>
                </View>

                {/* Garden Context */}
                <View className="flex-row items-center mb-4">
                  <Ionicons name="flower-outline" size={18} color="#5E994B" />
                  <Text className="text-foreground ml-2">
                    In {plantData.garden_name}
                  </Text>
                </View>

                {/* Last Care & Next Task */}
                <View className="flex-row justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-cream-600 text-sm">Last Entry</Text>
                    <Text className="text-foreground font-medium">
                      {lastCareLog
                        ? `${formatDate(lastCareLog.taken_care_at)}`
                        : "No entries yet"}
                    </Text>
                  </View>

                  {nextTask && (
                    <View className="flex-1 ml-2">
                      <Text className="text-cream-600 text-sm">Next Task</Text>
                      <Text className="text-foreground font-medium">
                        {nextTask.task_type} {formatDate(nextTask.due_date)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Add Entry Button */}
            <View className="mb-6">
              <TouchableOpacity
                className="bg-primary rounded-xl py-3 px-4 items-center flex-row justify-center"
                onPress={() => setIsJournalModalVisible(true)}
              >
                <Ionicons name="journal-outline" size={20} color="#ffffff" />
                <Text className="text-white font-medium ml-2">
                  Add Journal Entry
                </Text>
              </TouchableOpacity>
            </View>

            {/* Journal Entry Modal */}
            <AddJournalEntryModal
              isVisible={isJournalModalVisible}
              onClose={() => setIsJournalModalVisible(false)}
              onSubmit={handleAddCareLog}
            />

            {/* 3. Tasks Section */}
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <View className="p-5 border-b border-cream-100">
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#059669"
                  />
                  <Text className="text-foreground font-medium ml-2.5 text-base">
                    Tasks
                  </Text>
                </View>
              </View>

              <View className="p-5">
                {/* Task Summary */}
                {tasksWithDetails.length > 0 && (
                  <View className="mb-4 bg-cream-50 rounded-xl p-4">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Task Summary
                    </Text>
                    <View className="flex-row flex-wrap">
                      {Object.entries(groupedTasks).map(([period, tasks]) => {
                        if (tasks.length === 0) return null;

                        // Get the appropriate icon for each period
                        const getPeriodIcon = (
                          period: string
                        ): keyof typeof Ionicons.glyphMap => {
                          switch (period) {
                            case "missed":
                              return "alert-circle";
                            case "today":
                              return "today";
                            case "tomorrow":
                              return "calendar";
                            case "this_week":
                              return "calendar-outline";
                            case "next_week":
                              return "calendar-number";
                            case "this_month":
                              return "calendar-number-outline";
                            default:
                              return "time";
                          }
                        };

                        // Get the appropriate color for each period
                        const getPeriodColor = (period: string): string => {
                          switch (period) {
                            case "missed":
                              return "#ef4444"; // red-500
                            case "today":
                              return "#f97316"; // orange-500
                            case "tomorrow":
                              return "#f97316"; // orange-500
                            case "this_week":
                              return "#eab308"; // yellow-500
                            case "next_week":
                              return "#10b981"; // emerald-500
                            case "this_month":
                              return "#3b82f6"; // blue-500
                            default:
                              return "#6b7280"; // gray-500
                          }
                        };

                        return (
                          <View
                            key={period}
                            className="w-1/2 mb-2 flex-row items-center"
                          >
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center mr-2"
                              style={{
                                backgroundColor: `${getPeriodColor(period)}20`,
                              }}
                            >
                              <Ionicons
                                name={getPeriodIcon(period)}
                                size={14}
                                color={getPeriodColor(period)}
                              />
                            </View>
                            <Text className="text-sm text-cream-700">
                              {period === "missed" && "Missed: "}
                              {period === "today" && "Today: "}
                              {period === "tomorrow" && "Tomorrow: "}
                              {period === "this_week" && "This Week: "}
                              {period === "next_week" && "Next Week: "}
                              {period === "this_month" && "This Month: "}
                              {period === "later" && "Later: "}
                              <Text className="font-medium ml-1">
                                {tasks.length}
                              </Text>
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Task Tab Navigation */}
                {timePeriodsWithTasks.length > 0 && (
                  <View className="mb-4">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-row"
                    >
                      {timePeriodsWithTasks.map((period) => (
                        <TouchableOpacity
                          key={period}
                          onPress={() => setActiveTaskTab(period)}
                          className={`mr-2 px-4 py-2 rounded-full ${
                            activeTaskTab === period
                              ? period === "missed"
                                ? "bg-red-500"
                                : "bg-brand-500"
                              : "bg-cream-100"
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              activeTaskTab === period
                                ? "text-white"
                                : "text-cream-700"
                            }`}
                          >
                            {period === "missed" && "Missed"}
                            {period === "today" && "Today"}
                            {period === "tomorrow" && "Tomorrow"}
                            {period === "this_week" && "This Week"}
                            {period === "next_week" && "Next Week"}
                            {period === "this_month" && "This Month"}
                            {period === "later" && "Later"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Task List for Active Tab */}
                <View className="space-y-6">
                  {tasksWithDetails.length === 0 ? (
                    <View className="py-6 items-center">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={32}
                        color="#9e9a90"
                      />
                      <Text className="text-cream-600 mt-2 text-center">
                        No tasks for this plant
                      </Text>
                    </View>
                  ) : groupedTasks[activeTaskTab]?.length > 0 ? (
                    <TaskList
                      tasks={groupedTasks[activeTaskTab]}
                      showGardenName={false}
                      queryKey={["userPlantDetails", id]}
                    />
                  ) : (
                    <View className="py-6 items-center">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={32}
                        color="#9e9a90"
                      />
                      <Text className="text-cream-600 mt-2 text-center">
                        No tasks for this period
                      </Text>
                    </View>
                  )}

                  {/* All Tasks Completed Message */}
                  {plantTasks.length > 0 &&
                    plantTasks.every((task) => task.completed) && (
                      <View className="py-6 items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          color="#059669"
                        />
                        <Text className="text-cream-600 mt-2 text-center">
                          All tasks completed! Great job!
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            </View>

            {/* 4. Care History Timeline */}
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <View className="p-5 border-b border-cream-100">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#059669" />
                  <Text className="text-foreground font-medium ml-2.5 text-base">
                    Plant Journal
                  </Text>
                </View>
              </View>

              <View className="p-5">
                {plantData?.care_logs && plantData.care_logs.length > 0 ? (
                  <View>
                    {plantData.care_logs
                      .sort(
                        (a: PlantCareLog, b: PlantCareLog) =>
                          new Date(b.taken_care_at).getTime() -
                          new Date(a.taken_care_at).getTime()
                      )
                      .map((log: PlantCareLog, index: number) => (
                        <View
                          key={log.id || index}
                          className="mb-4 pb-4 border-b border-cream-100"
                        >
                          <View className="flex-row items-start">
                            <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center mr-3 mt-1">
                              <Ionicons
                                name="journal-outline"
                                size={16}
                                color="#059669"
                              />
                            </View>

                            <View className="flex-1">
                              <View className="flex-row justify-between items-start">
                                <Text className="text-cream-600 text-sm">
                                  {formatDate(log.taken_care_at)}
                                </Text>
                              </View>

                              {log.care_notes && (
                                <Text className="text-foreground mt-1">
                                  {log.care_notes}
                                </Text>
                              )}

                              {log.image && log.image.length > 0 && (
                                <View className="mt-3 rounded-lg overflow-hidden">
                                  <CachedImage
                                    uri={log.image}
                                    style={{ width: "100%", height: 150 }}
                                    resizeMode="cover"
                                  />
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                ) : (
                  <View className="py-4 items-center">
                    <Ionicons
                      name="journal-outline"
                      size={32}
                      color="#9e9a90"
                    />
                    <Text className="text-cream-600 mt-2 text-center">
                      No journal entries yet
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 5. Progress Photos */}
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <View className="p-5 border-b border-cream-100">
                <View className="flex-row items-center">
                  <Ionicons name="images-outline" size={20} color="#059669" />
                  <Text className="text-foreground font-medium ml-2.5 text-base">
                    Progress Photos
                  </Text>
                </View>
              </View>

              <View className="p-5">
                {plantData?.images && plantData.images.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {plantData.images.map(
                      (
                        image: { url: string; created_at: string },
                        index: number
                      ) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleImagePress(image.url)}
                          className="w-[calc(50%-4px)] aspect-square rounded-lg overflow-hidden"
                        >
                          <CachedImage
                            uri={image.url}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                ) : (
                  <Text className="text-gray-500 italic">
                    No progress photos yet
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Edit Plant Modal */}
        {plantData && (
          <EditPlantModal
            plant={plantData}
            isVisible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
          />
        )}
      </View>
    </PageContainer>
  );
}
