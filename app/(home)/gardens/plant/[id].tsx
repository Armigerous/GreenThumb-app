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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EditPlantModal from "@/components/Gardens/Plants/EditPlantModal";

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

  // State for edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Fetch plant details using our custom hook
  const {
    data: plantData,
    isLoading,
    error,
    refetch,
  } = useUserPlantDetails(id);

  // State for care form visibility
  const [showCareForm, setShowCareForm] = useState(false);
  const [careType, setCareType] = useState<
    "Watered" | "Fertilized" | "Harvested" | "Other"
  >("Watered");
  const [careNotes, setCareNotes] = useState("");

  // State for task tab navigation
  const [activeTaskTab, setActiveTaskTab] = useState<TaskTimePeriod>("today");

  // Refetch data when screen comes into focus
  useFocusEffect(() => {
    refetch();
  });

  // Handle back navigation
  const handleBack = () => {
    router.push(`/(home)/gardens/${plantData?.garden_id}`);
  };

  // Handle quick care actions
  const handleQuickCare = async (
    type: "Watered" | "Fertilized" | "Harvested" | "Other"
  ) => {
    if (!plantData) return;

    try {
      // Create a new care log entry
      const now = new Date().toISOString();
      const careLog: PlantCareLog = {
        id: Date.now(), // Temporary ID for UI
        user_plant_id: plantData.id,
        care_type: type,
        taken_care_at: now,
        care_notes: `Plant ${type.toLowerCase()} via quick action`,
      };

      // Get existing care logs and add new one
      const existingLogs = plantData.care_logs || [];
      const updatedLogs = [...existingLogs, careLog];

      // Update plant status based on care type
      let newStatus = plantData.status;
      if (type === "Watered" && plantData.status === "Needs Water") {
        newStatus = "Healthy";
      }

      // Update the plant in the database
      const { error } = await supabase
        .from("user_plants")
        .update({
          status: newStatus,
          care_logs: updatedLogs,
          updated_at: now,
        })
        .eq("id", plantData.id);

      if (error) {
        console.error(`Error ${type.toLowerCase()} plant:`, error);
        Alert.alert(
          "Error",
          `Could not update plant ${type.toLowerCase()} status.`
        );
        return;
      }

      // Show success message
      Alert.alert(
        "Success",
        `${plantData.nickname} has been ${type.toLowerCase()}!`
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["userPlantDetails", id],
      });

      // Refetch plant data
      refetch();
    } catch (err) {
      console.error(`${type} plant error:`, err);
      Alert.alert(
        "Error",
        `Failed to ${type.toLowerCase()} plant. Please try again.`
      );
    }
  };

  // Handle adding a new care log with notes
  const handleAddCareLog = async () => {
    if (!plantData || !careNotes.trim()) return;

    try {
      // Create a new care log entry
      const now = new Date().toISOString();
      const careLog: PlantCareLog = {
        id: Date.now(), // Temporary ID for UI
        user_plant_id: plantData.id,
        care_type: careType,
        taken_care_at: now,
        care_notes: careNotes,
      };

      // Get existing care logs and add new one
      const existingLogs = plantData.care_logs || [];
      const updatedLogs = [...existingLogs, careLog];

      // Update plant status based on care type
      let newStatus = plantData.status;
      if (careType === "Watered" && plantData.status === "Needs Water") {
        newStatus = "Healthy";
      }

      // Update the plant in the database
      const { error } = await supabase
        .from("user_plants")
        .update({
          status: newStatus,
          care_logs: updatedLogs,
          updated_at: now,
        })
        .eq("id", plantData.id);

      if (error) {
        console.error("Error adding care log:", error);
        Alert.alert("Error", "Could not add care log.");
        return;
      }

      // Reset form and close it
      setCareNotes("");
      setShowCareForm(false);

      // Show success message
      Alert.alert("Success", "Care log added successfully!");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["userPlantDetails", id],
      });

      // Refetch plant data
      refetch();
    } catch (err) {
      console.error("Add care log error:", err);
      Alert.alert("Error", "Failed to add care log. Please try again.");
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

  // If the active tab doesn't have tasks, switch to the first tab with tasks
  // Prioritize showing missed tasks first
  if (timePeriodsWithTasks.length > 0) {
    if (timePeriodsWithTasks.includes("missed")) {
      setActiveTaskTab("missed");
    } else if (!timePeriodsWithTasks.includes(activeTaskTab)) {
      setActiveTaskTab(timePeriodsWithTasks[0]);
    }
  }

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

  // Status configuration for consistent styling
  const statusConfig = {
    Healthy: {
      bg: "bg-brand-100",
      text: "text-brand-700",
      icon: "checkmark-circle" as const,
      color: "#059669",
      emoji: "🌱",
      description: "Thriving and happy",
    },
    "Needs Water": {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "water" as const,
      color: "#d97706",
      emoji: "💧",
      description: "Time for a drink",
    },
    Wilting: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "alert-circle" as const,
      color: "#dc2626",
      emoji: "🥀",
      description: "Urgent care needed",
    },
    Dormant: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "moon" as const,
      color: "#d97706",
      emoji: "🌙",
      description: "Resting period",
    },
    Dead: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "alert-circle" as const,
      color: "#dc2626",
      emoji: "💀",
      description: "May need replacement",
    },
  } as const;

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading plant details..." />;
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

  // Get status styling
  const status = statusConfig[plantData.status as keyof typeof statusConfig];

  // Get next task and last care log
  const nextTask = nextUpcomingTask;
  const lastCareLog = getLastCareLog();

  return (
    <PageContainer scroll={false} padded={false} safeArea={false}>
      {/* Fixed Header */}
      <View className="bg-white pt-safe border-b border-cream-100">
        <View className="flex-row justify-between items-center px-5 py-4">
          <SubmitButton
            onPress={handleBack}
            color="secondary"
            iconName="arrow-back"
            iconPosition="left"
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
                    className={`rounded-full px-3 py-1.5 flex-row items-center ${status.bg}`}
                  >
                    <Text className="text-lg mr-1">{status.emoji}</Text>
                    <Text className={`text-sm font-medium ${status.text}`}>
                      {plantData.status}
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
                    <Text className="text-cream-600 text-sm">Last Care</Text>
                    <Text className="text-foreground font-medium">
                      {lastCareLog
                        ? `${lastCareLog.care_type} - ${formatDate(
                            lastCareLog.taken_care_at
                          )}`
                        : "No care recorded"}
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

            {/* 2. Quick Actions Card */}
            <View className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">
                Quick Actions
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-brand-100 rounded-xl py-3 px-4 flex-1 mr-2 items-center"
                  onPress={() => {
                    setCareType("Watered");
                    setShowCareForm(true);
                  }}
                >
                  <Ionicons name="water" size={24} color="#059669" />
                  <Text className="text-brand-700 font-medium mt-1">Water</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-brand-100 rounded-xl py-3 px-4 flex-1 mx-2 items-center"
                  onPress={() => {
                    setCareType("Fertilized");
                    setShowCareForm(true);
                  }}
                >
                  <Ionicons name="leaf" size={24} color="#059669" />
                  <Text className="text-brand-700 font-medium mt-1">
                    Fertilize
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-brand-100 rounded-xl py-3 px-4 flex-1 ml-2 items-center"
                  onPress={() => {
                    setCareType("Harvested");
                    setShowCareForm(true);
                  }}
                >
                  <Ionicons name="cut" size={24} color="#059669" />
                  <Text className="text-brand-700 font-medium mt-1">
                    Harvest
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Care Form Modal */}
            {showCareForm && (
              <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <Text className="text-lg font-bold text-foreground mb-3">
                  Log {careType}
                </Text>

                <View className="mb-4">
                  <Text className="text-cream-600 mb-1">Notes</Text>
                  <TextInput
                    className="border border-cream-300 rounded-lg p-3 text-foreground"
                    placeholder="Add notes about this care activity..."
                    placeholderTextColor="#BBBBBB"
                    value={careNotes}
                    onChangeText={setCareNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="bg-cream-200 rounded-lg py-2 px-4 mr-2"
                    onPress={() => setShowCareForm(false)}
                  >
                    <Text className="text-cream-700 font-medium">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-primary rounded-lg py-2 px-4"
                    onPress={handleAddCareLog}
                  >
                    <Text className="text-white font-medium">Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
                    Care History
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
                              {log.care_type === "Watered" && (
                                <Ionicons
                                  name="water"
                                  size={16}
                                  color="#059669"
                                />
                              )}
                              {log.care_type === "Fertilized" && (
                                <Ionicons
                                  name="leaf"
                                  size={16}
                                  color="#059669"
                                />
                              )}
                              {log.care_type === "Harvested" && (
                                <Ionicons
                                  name="cut"
                                  size={16}
                                  color="#059669"
                                />
                              )}
                              {log.care_type === "Other" && (
                                <Ionicons
                                  name="ellipsis-horizontal"
                                  size={16}
                                  color="#059669"
                                />
                              )}
                            </View>

                            <View className="flex-1">
                              <View className="flex-row justify-between items-start">
                                <Text className="text-foreground font-medium">
                                  {log.care_type}
                                </Text>
                                <Text className="text-cream-600 text-sm">
                                  {formatDate(log.taken_care_at)}
                                </Text>
                              </View>

                              {log.care_notes && (
                                <Text className="text-cream-600 mt-1">
                                  {log.care_notes}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                ) : (
                  <View className="py-4 items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={32}
                      color="#9e9a90"
                    />
                    <Text className="text-cream-600 mt-2 text-center">
                      No care history recorded yet
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
