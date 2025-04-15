import { supabase } from "@/lib/supabaseClient";
import { TaskWithDetails } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addWeeks,
  format,
  isAfter,
  isBefore,
  isThisMonth,
  isThisWeek,
  isToday,
  isTomorrow,
} from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Text, TouchableOpacity, View } from "react-native";

interface TaskProps {
  task: TaskWithDetails;
  onToggleComplete?: (id: number) => void; // Make this optional
  showGardenName?: boolean;
  queryKey?: string[]; // Add queryKey for cache invalidation
  isOverdue?: boolean; // Simple boolean flag
}

export function Task({
  task,
  onToggleComplete,
  showGardenName = false,
  queryKey,
  isOverdue = false,
}: TaskProps) {
  // Add state for local UI updates - initialize from the task prop
  const [localCompleted, setLocalCompleted] = useState(task.completed);

  // Track if we're currently animating to prevent double taps
  const isAnimating = useRef(false);
  const initialRender = useRef(true);

  // Add animation references for this specific task
  const checkboxAnimationValue = useRef(new Animated.Value(1)).current;
  const textOpacityValue = useRef(
    new Animated.Value(localCompleted ? 0.6 : 0)
  ).current;
  const strikethroughWidth = useRef(
    new Animated.Value(localCompleted ? 100 : 0)
  ).current;
  const queryClient = useQueryClient();

  // Update local state when task prop changes (e.g., from server)
  useEffect(() => {
    // Skip the effect on the first render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Only update if we're not in the middle of an animation
    if (task.completed !== localCompleted && !isAnimating.current) {
      setLocalCompleted(task.completed);

      // Immediately update visual state without animation
      textOpacityValue.setValue(task.completed ? 0.6 : 0);
      strikethroughWidth.setValue(task.completed ? 100 : 0);
    }
  }, [task.completed]);

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
        return { previousData: null };
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

      return { previousData: null };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Revert the local state as well
      setLocalCompleted(!variables.completed);

      // Run animations in reverse
      animateTaskCompletion(!variables.completed);

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

      // Invalidate garden dashboard queries to refresh garden health
      queryClient.invalidateQueries({
        queryKey: ["gardenDashboard"],
      });

      // End animation state after a short delay to ensure smooth transition
      setTimeout(() => {
        isAnimating.current = false;
      }, 200);
    },
  });

  // Animate task completion with checkbox and text effects
  const animateTaskCompletion = (completed: boolean) => {
    // Mark as animating to prevent double taps
    isAnimating.current = true;

    // Checkbox animation - immediate visual feedback
    Animated.sequence([
      Animated.timing(checkboxAnimationValue, {
        toValue: 0.95,
        duration: 30, // Very quick
        useNativeDriver: true,
      }),
      Animated.spring(checkboxAnimationValue, {
        toValue: 1,
        friction: 8, // Higher friction for faster stabilization
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Text strikethrough animation - faster but still visible
    Animated.parallel([
      Animated.timing(strikethroughWidth, {
        toValue: completed ? 100 : 0,
        duration: 120, // Faster
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityValue, {
        toValue: completed ? 0.6 : 0,
        duration: 120, // Keep in sync with strikethrough
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Function to handle marking a task as complete
  const handleToggleComplete = () => {
    // Prevent multiple rapid clicks
    if (isAnimating.current) return;

    // Update local state immediately for a responsive feel
    const newCompletedState = !localCompleted;
    setLocalCompleted(newCompletedState);

    // Trigger animations immediately
    animateTaskCompletion(newCompletedState);

    // Execute the mutation with optimistic updates (immediately)
    toggleTaskMutation.mutate({
      id: task.id,
      completed: newCompletedState,
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

    // Fix the next week logic
    const nextWeekStart = new Date();
    // Move to the beginning of next week (next Monday)
    nextWeekStart.setDate(
      nextWeekStart.getDate() + ((8 - nextWeekStart.getDay()) % 7)
    );
    nextWeekStart.setHours(0, 0, 0, 0);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6); // End of next week (Sunday)
    nextWeekEnd.setHours(23, 59, 59, 999);

    if (isAfter(date, nextWeekStart) && isBefore(date, nextWeekEnd)) {
      return `Next ${format(date, "EEEE")}`;
    }

    // Standardize date formats for consistency
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();

    // If in the current year, don't show the year
    if (dateYear === currentYear) {
      return format(date, "MMM d"); // Apr 27
    }

    // If in a different year, include the year
    return format(date, "MMM d, yyyy"); // Apr 27, 2026
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

  // Get task urgency based on due date
  const getTaskUrgency = (date: Date): { color: string; label: string } => {
    // If task is overdue, show it as urgent
    if (isOverdue) {
      return { color: "#ef4444", label: "Overdue" }; // red-500
    }

    // If task is due today, show it as urgent
    if (isToday(date)) {
      return { color: "#f97316", label: "Today" }; // orange-500
    }

    // If task is due tomorrow, show it as upcoming
    if (isTomorrow(date)) {
      return { color: "#eab308", label: "Tomorrow" }; // yellow-500
    }

    // If task is due this week, show it as upcoming
    if (isThisWeek(date)) {
      return { color: "#10b981", label: "This Week" }; // emerald-500
    }

    // If task is due this month, show it as upcoming
    if (isThisMonth(date)) {
      return { color: "#3b82f6", label: "This Month" }; // blue-500
    }

    // If task is due later, show it as upcoming
    return { color: "#6b7280", label: "Later" }; // gray-500
  };

  // Get urgency information for this task
  const urgency = getTaskUrgency(dueDate);

  return (
    <TouchableOpacity
      onPress={handleToggleComplete}
      className="p-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Checkbox */}
        <Animated.View
          className={`w-6 h-6 rounded-lg mr-3 items-center justify-center ${
            localCompleted
              ? "bg-brand-500"
              : isOverdue
              ? "bg-red-100"
              : "bg-white border border-cream-300"
          }`}
          style={{
            transform: [{ scale: checkboxAnimationValue }],
          }}
        >
          {localCompleted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </Animated.View>

        {/* Task Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-row items-center">
              <Ionicons
                name={getTaskIcon(task.task_type)}
                size={18}
                color={isOverdue ? "#ef4444" : getTaskColor(task.task_type)}
                style={{ marginRight: 4 }}
              />

              {/* Text with animated strikethrough */}
              <View style={{ position: "relative" }}>
                <Text
                  className={`text-base font-medium ${
                    isOverdue && !localCompleted
                      ? "text-red-700"
                      : "text-foreground"
                  }`}
                  style={{
                    opacity: localCompleted ? 0.6 : 1,
                  }}
                >
                  {task.task_type} {task.plant?.nickname || "Unknown Plant"}
                </Text>

                {/* Animated strikethrough line */}
                <Animated.View
                  style={{
                    position: "absolute",
                    width: strikethroughWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    height: 1,
                    backgroundColor: isOverdue ? "#ef4444" : "#6b7280",
                    top: "50%",
                    opacity: textOpacityValue,
                  }}
                />
              </View>
            </View>
            <View
              className={`px-2 py-1 rounded-lg ${
                isOverdue
                  ? "bg-red-100"
                  : localCompleted
                  ? "bg-brand-100"
                  : "bg-cream-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isOverdue
                    ? "text-red-700"
                    : localCompleted
                    ? "text-brand-700"
                    : "text-cream-700"
                }`}
              >
                {isOverdue
                  ? "Overdue"
                  : getRelativeTime(new Date(task.due_date))}
              </Text>
            </View>
          </View>

          {/* Garden Info - only show if requested */}
          {showGardenName && task.plant?.garden?.name && (
            <Text className="text-sm text-cream-600 mt-1">
              in {task.plant.garden.name}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
