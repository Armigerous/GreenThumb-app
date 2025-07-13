import CachedImage from "@/components/CachedImage";
import AddCareLogModal from "@/components/Gardens/Plants/AddCareLogModal";
import EditPlantModal from "@/components/Gardens/Plants/EditPlantModal";
import PlantHeader from "@/components/Gardens/Plants/PlantHeader";
import PlantIdentityCard from "@/components/Gardens/Plants/PlantIdentityCard";
import TaskSummaryGrid from "@/components/Gardens/Plants/TaskSummaryGrid";
import { TaskList } from "@/components/TaskList";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { BodyText, TitleText } from "@/components/UI/Text";
import { useUserPlantDetails } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import {
  PlantCareLog,
  PlantTask,
  TaskWithDetails,
  UserPlant,
} from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  differenceInDays,
  format,
  isValid,
  parseISO,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
} from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

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
    data: plantDataRaw,
    isLoading,
    error,
    refetch,
  } = useUserPlantDetails(id);

  // Type: UserPlant merged with global/garden fields
  type UserPlantWithExtras = UserPlant & {
    scientific_name?: string;
    garden_name?: string;
    common_names?: string[];
    light_requirements?: string[];
    soil_drainage?: string[];
    soil_texture?: string[];
    usda_zones?: string[];
    // Add any other merged fields here
    [key: string]: any;
  };

  // Cast plantData to merged type for clarity
  const plantData = plantDataRaw as UserPlantWithExtras;

  // State for task tab navigation
  const [activeTaskTab, setActiveTaskTab] = useState<TaskTimePeriod>("today");

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Get tasks for this plant and convert to TaskWithDetails
  const plantTasks =
    plantData && Array.isArray(plantData.plant_tasks)
      ? plantData.plant_tasks
      : [];
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
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = endOfDay(addDays(now, 1));
    const thisWeekEnd = endOfDay(addWeeks(todayStart, 1));
    const nextWeekEnd = endOfDay(addWeeks(todayStart, 2));
    const thisMonthEnd = endOfDay(addMonths(todayStart, 1));

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

        if (dueDate < todayStart && !task.completed) {
          group = "missed";
        } else if (dueDate >= todayStart && dueDate <= todayEnd) {
          group = "today";
        } else if (dueDate >= tomorrowStart && dueDate <= tomorrowEnd) {
          group = "tomorrow";
        } else if (dueDate > todayEnd && dueDate <= thisWeekEnd) {
          group = "this_week";
        } else if (dueDate > thisWeekEnd && dueDate <= nextWeekEnd) {
          group = "next_week";
        } else if (dueDate > nextWeekEnd && dueDate <= thisMonthEnd) {
          group = "this_month";
        }
        groups[group].push(task);
        return groups;
      },
      groups
    );
  };

  // Default empty groupedTasks object
  const defaultGroupedTasks: Record<TaskTimePeriod, TaskWithDetails[]> = {
    missed: [],
    today: [],
    tomorrow: [],
    this_week: [],
    next_week: [],
    this_month: [],
    later: [],
  };

  const groupedTasks = plantData
    ? groupTasksByTime(tasksWithDetails)
    : defaultGroupedTasks;
  const timePeriodsWithTasks = plantData
    ? Object.entries(groupedTasks)
        .filter(([_, tasks]) => tasks.length > 0)
        .map(([period]) => period as TaskTimePeriod)
    : [];

  // Always call hooks at the top level
  useEffect(() => {
    if (
      timePeriodsWithTasks.length > 0 &&
      !timePeriodsWithTasks.includes(activeTaskTab)
    ) {
      if (timePeriodsWithTasks.includes("missed")) {
        setActiveTaskTab("missed");
      } else {
        setActiveTaskTab(timePeriodsWithTasks[0]);
      }
    }
  }, [timePeriodsWithTasks]);

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
    // Show debug info if available
    const debugInfo = plantData?.debugInfo || {};
    return (
      <PageContainer>
        <View className="pt-5 px-5">
          <BodyText className="text-destructive text-lg">
            Error loading plant details. Please try again.
          </BodyText>
          {debugInfo && (
            <View className="mt-4 bg-cream-100 p-3 rounded">
              <BodyText className="text-foreground font-bold mb-2">
                Debug Info:
              </BodyText>
              <BodyText className="text-xs text-foreground">
                {JSON.stringify(debugInfo, null, 2)}
              </BodyText>
            </View>
          )}
        </View>
      </PageContainer>
    );
  }

  // All code below this point is guaranteed to have plantData defined!
  // Find the next upcoming task
  const nextUpcomingTask = tasksWithDetails
    .sort(
      (a: TaskWithDetails, b: TaskWithDetails) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .find((task: TaskWithDetails) => {
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
    const careLogs = Array.isArray(plantData?.care_logs)
      ? plantData.care_logs
      : [];
    if (careLogs.length === 0) {
      return null;
    }
    // Sort care logs by date (newest first)
    const sortedLogs = [...careLogs].sort(
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

  return (
    <PageContainer scroll={false} padded={false} safeArea={false}>
      {/* Fixed Header */}
      {/* Use PlantHeader component for navigation and edit actions */}
      <PlantHeader
        onBack={handleBack}
        onEdit={() => setIsEditModalVisible(true)}
      />

      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-3">
            {/* 1. Plant Identity Card */}
            {/* Use PlantIdentityCard for main plant info */}
            <PlantIdentityCard
              plantData={plantData}
              careStatus={careStatus}
              lastCareLog={lastCareLog}
              nextTask={nextTask}
              formatDate={formatDate}
            />

            {/* Add Entry Button */}
            <View className="mb-6">
              <TouchableOpacity
                className="bg-brand-600 rounded-xl py-3 px-4 items-center flex-row justify-center"
                onPress={() => setIsJournalModalVisible(true)}
                accessibilityLabel="Add Journal Entry"
              >
                <Ionicons name="journal-outline" size={20} color="#fffefa" />
                <BodyText className="text-primary-foreground font-paragraph-semibold ml-2">
                  Add Journal Entry
                </BodyText>
              </TouchableOpacity>
            </View>

            {/* AddCareLogModal is the canonical modal for journal/care log entries */}
            <AddCareLogModal
              isVisible={isJournalModalVisible}
              onClose={() => setIsJournalModalVisible(false)}
              onSubmit={handleAddCareLog}
            />

            {/* 3. Tasks Section */}
            <View className="bg-cream-50 rounded-2xl shadow-sm overflow-hidden p-4">
              <View className="p-4 border-b border-cream-300">
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    className="text-brand-600"
                  />
                  <TitleText className="text-foreground ml-2.5 text-base">
                    Tasks
                  </TitleText>
                </View>
              </View>

              <View className="px-4">
                {/* Task Summary & Navigation (now interactive grid) */}
                {tasksWithDetails.length > 0 && (
                  <View className="mb-4 bg-cream-50 rounded-xl p-3">
                    {/*
                      Reason: Use TaskSummaryGrid for a responsive, branded, interactive summary.
                      Each pill is a button that sets the active period.
                    */}
                    <TaskSummaryGrid
                      groupedTasks={groupedTasks}
                      activePeriod={activeTaskTab}
                      onSelectPeriod={setActiveTaskTab}
                    />
                  </View>
                )}

                {/* Task List for Active Tab */}
                <View className="space-y-6">
                  {tasksWithDetails.length === 0 ? (
                    <View className="py-6 items-center min-h-[44px]">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={32}
                        className="text-cream-400"
                      />
                      <BodyText className="text-cream-600 mt-2 text-center">
                        No tasks for this plant yet – you’re all caught up!
                      </BodyText>
                    </View>
                  ) : groupedTasks[activeTaskTab]?.length > 0 ? (
                    <TaskList
                      tasks={groupedTasks[activeTaskTab].map(
                        (task: TaskWithDetails) => task
                      )}
                      showGardenName={false}
                      queryKey={["userPlantDetails", id]}
                    />
                  ) : (
                    <View className="py-6 items-center min-h-[44px]">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={32}
                        className="text-cream-400"
                      />
                      <BodyText className="text-cream-600 mt-2 text-center">
                        No tasks for this period – enjoy a little break!
                      </BodyText>
                    </View>
                  )}

                  {/* All Tasks Completed Message */}
                  {plantTasks.length > 0 &&
                    plantTasks.every((task: PlantTask) => task.completed) && (
                      <View className="py-6 items-center min-h-[44px]">
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          className="text-brand-600"
                        />
                        <BodyText className="text-cream-600 mt-2 text-center">
                          All tasks completed! Your plant is thriving!
                        </BodyText>
                      </View>
                    )}
                </View>
              </View>
            </View>

            {/* 4. Care History Timeline */}
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-4 mt-6">
              <View className="p-4 border-b border-cream-100">
                <View className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={20}
                    className="text-brand-600"
                  />
                  <TitleText className="text-foreground ml-2.5 text-base">
                    Plant Journal
                  </TitleText>
                </View>
              </View>

              <View className="p-4">
                {Array.isArray(plantData?.care_logs) &&
                plantData.care_logs.length > 0 ? (
                  <View>
                    {(plantData.care_logs as PlantCareLog[])
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
                                color="#5E994B"
                              />
                            </View>

                            <View className="flex-1">
                              <View className="flex-row justify-between items-start">
                                <BodyText className="text-cream-600 text-sm">
                                  {formatDate(log.taken_care_at)}
                                </BodyText>
                              </View>

                              {log.care_notes && (
                                <BodyText className="text-foreground mt-1">
                                  {log.care_notes}
                                </BodyText>
                              )}

                              {log.image && log.image.length > 0 && (
                                <View className="mt-3 rounded-lg overflow-hidden">
                                  <CachedImage
                                    uri={log.image}
                                    style={{ width: "100%", height: 150 }}
                                    resizeMode="cover"
                                    accessibilityLabel="Journal entry photo"
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
                    <BodyText className="text-cream-600 mt-2 text-center">
                      No journal entries yet – your plant’s story starts here!
                    </BodyText>
                  </View>
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
