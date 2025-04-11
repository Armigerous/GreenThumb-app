import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  addWeeks,
  isAfter,
  isBefore,
  differenceInHours,
} from "date-fns";
import { TaskWithDetails } from "@/types/garden";
import { useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

interface TaskProps {
  task: TaskWithDetails;
  onToggleComplete?: (id: number) => void; // Make this optional
  showGardenName?: boolean;
  queryKey?: string[]; // Add queryKey for cache invalidation
}

export function Task({
  task,
  onToggleComplete,
  showGardenName = false,
  queryKey,
}: TaskProps) {
  // Add animation reference for this specific task
  const checkboxAnimationValue = useRef(new Animated.Value(1)).current;
  const queryClient = useQueryClient();

  // Toggle task completion mutation with optimistic updates
  const toggleTaskMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: number;
      completed: boolean;
    }) => {
      const { error } = await supabase
        .from("plant_tasks")
        .update({ completed })
        .eq("id", id);

      if (error) throw error;
      return { id, completed };
    },
    onMutate: async ({ id, completed }) => {
      // If a custom onToggleComplete is provided, use that instead
      if (onToggleComplete) {
        onToggleComplete(id);
        return;
      }

      // Otherwise, handle the update with optimistic updates
      if (queryKey) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey,
        });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update to the new value
        queryClient.setQueryData(queryKey, (old: any) => {
          // Handle both array and nested object structures
          if (Array.isArray(old)) {
            // Flat array structure (calendar view)
            return old.map((task) =>
              task.id === id ? { ...task, completed } : task
            );
          } else if (old?.plant_tasks) {
            // Nested structure (plant detail view)
            return {
              ...old,
              plant_tasks: old.plant_tasks.map((task: TaskWithDetails) =>
                task.id === id ? { ...task, completed } : task
              ),
            };
          }
          return old;
        });

        // Return a context object with the snapshotted value
        return { previousData };
      }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error("Error updating task:", err);
      Alert.alert("Error", "Could not update task status.");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey,
        });
      }
    },
  });

  // Function to handle marking a task as complete
  const handleToggleComplete = async () => {
    // Create animation sequence
    Animated.sequence([
      Animated.timing(checkboxAnimationValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxAnimationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Execute the mutation with optimistic updates
    toggleTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  // Check if plant data exists before accessing to avoid errors
  const plantNickname = task.plant?.nickname || "Unknown Plant";
  const gardenName = task.plant?.garden?.name || "Unknown Garden";

  // Format the due date for display
  const dueDate = new Date(task.due_date);

  // Determine the relative time for the task
  const getRelativeTime = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE"); // Day of week

    // Custom check for next week
    const nextWeekStart = addWeeks(new Date(), 1);
    const nextWeekEnd = addWeeks(nextWeekStart, 1);
    if (isAfter(date, nextWeekStart) && isBefore(date, nextWeekEnd)) {
      return `Next ${format(date, "EEEE")}`;
    }

    if (isThisMonth(date)) return format(date, "MMM d");
    return format(date, "MMM d, yyyy");
  };

  // Get the appropriate icon based on task type
  const getTaskIcon = (taskType: string): keyof typeof Ionicons.glyphMap => {
    switch (taskType) {
      case "Water":
        return "water";
      case "Fertilize":
        return "leaf";
      case "Harvest":
        return "cut";
      default:
        return "checkmark-circle";
    }
  };

  // Get the appropriate color based on task type
  const getTaskColor = (taskType: string): string => {
    switch (taskType) {
      case "Water":
        return "#3b82f6"; // blue-500
      case "Fertilize":
        return "#10b981"; // emerald-500
      case "Harvest":
        return "#8b5cf6"; // violet-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Determine task urgency based on due date
  const getTaskUrgency = (date: Date): { color: string; label: string } => {
    const now = new Date();
    const hoursUntilDue = differenceInHours(date, now);

    if (hoursUntilDue < 0) {
      return { color: "#ef4444", label: "Overdue" }; // red-500
    } else if (hoursUntilDue < 24) {
      return { color: "#f97316", label: "Urgent" }; // orange-500
    } else if (hoursUntilDue < 72) {
      return { color: "#eab308", label: "Soon" }; // yellow-500
    } else {
      return { color: "#10b981", label: "Upcoming" }; // emerald-500
    }
  };

  // Get urgency information for this task
  const urgency = getTaskUrgency(dueDate);

  return (
    <TouchableOpacity
      onPress={handleToggleComplete}
      activeOpacity={0.7}
      className="p-4 flex-row items-center justify-between bg-cream-50 rounded-xl border border-cream-300"
    >
      <View className="flex-row items-center flex-1">
        <View className="min-w-[48px] min-h-[48px] items-center justify-center">
          <Animated.View
            style={{
              transform: [{ scale: checkboxAnimationValue }],
            }}
            className={`w-7 h-7 rounded-lg border-2 items-center justify-center ${
              task.completed ? "bg-brand-500" : "border-cream-300"
            }`}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </Animated.View>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Ionicons
              name={getTaskIcon(task.task_type)}
              size={16}
              color={getTaskColor(task.task_type)}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-base font-medium ${
                task.completed
                  ? "text-cream-400 line-through"
                  : "text-foreground"
              }`}
            >
              {task.task_type} {plantNickname}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-cream-500">
              {showGardenName && `${gardenName} • `}
              {getRelativeTime(dueDate)} at {format(dueDate, "h:mm a")}
            </Text>
            {!task.completed && (
              <View
                className="ml-2 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${urgency.color}20` }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: urgency.color }}
                >
                  {urgency.label}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
