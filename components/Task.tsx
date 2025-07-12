import { supabase } from "@/lib/supabaseClient";
import { TaskWithDetails } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import { TASK_TYPE_META } from "@/constants/taskTypes";

interface TaskProps {
  task: TaskWithDetails;
  onToggleComplete?: (id: number, completed: boolean) => void;
  showGardenName?: boolean;
  queryKey?: string[];
  isOverdue?: boolean;
  isRemoving?: boolean;
  onRemovalComplete?: (id: number) => void;
}

export function Task({
  task,
  onToggleComplete,
  showGardenName = false,
  queryKey,
  isOverdue = false,
  isRemoving = false,
  onRemovalComplete,
}: TaskProps) {
  // Simplified state management - single source of truth
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAnimatedForCurrentToggle, setHasAnimatedForCurrentToggle] =
    useState(false);
  const queryClient = useQueryClient();

  // Animation values - simpler, more reliable
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const taskOpacity = useRef(new Animated.Value(1)).current;
  const taskTranslateX = useRef(new Animated.Value(0)).current;
  const strikethroughWidth = useRef(
    new Animated.Value(isCompleted ? 100 : 0)
  ).current;
  const textOpacity = useRef(new Animated.Value(isCompleted ? 0.6 : 1)).current;

  // Update local state when task prop changes
  useEffect(() => {
    if (task.completed !== isCompleted && !isProcessing) {
      setIsCompleted(task.completed);
      // Update visual state without animation for external changes
      strikethroughWidth.setValue(task.completed ? 100 : 0);
      textOpacity.setValue(task.completed ? 0.6 : 1);
    }
  }, [task.completed, isCompleted, isProcessing]);

  // Handle removal animation
  useEffect(() => {
    if (isRemoving) {
      // Start removal animation
      Animated.sequence([
        // Quick celebration bounce
        Animated.timing(checkboxScale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(checkboxScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        // Then slide out
        Animated.parallel([
          Animated.timing(taskTranslateX, {
            toValue: 300,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(taskOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Notify parent that removal animation is complete
        onRemovalComplete?.(task.id);
      });
    }
  }, [
    isRemoving,
    task.id,
    onRemovalComplete,
    checkboxScale,
    taskTranslateX,
    taskOpacity,
  ]);

  // Simplified task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      const { error } = await supabase
        .from("plant_tasks")
        .update({ completed })
        .eq("id", task.id);

      if (error) throw error;
      return completed;
    },
    onMutate: async (completed: boolean) => {
      setIsProcessing(true);

      // Immediate visual feedback
      setIsCompleted(completed);

      // Only animate if we haven't already animated for this toggle
      if (!hasAnimatedForCurrentToggle) {
        animateCompletion(completed);
      }

      // Optimistic updates if queryKey provided
      if (queryKey) {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old: any) => {
          if (Array.isArray(old)) {
            return old.map((t) => (t.id === task.id ? { ...t, completed } : t));
          } else if (old?.plant_tasks) {
            return {
              ...old,
              plant_tasks: old.plant_tasks.map((t: TaskWithDetails) =>
                t.id === task.id ? { ...t, completed } : t
              ),
            };
          }
          return old;
        });

        return { previousData };
      }
      return { previousData: null };
    },
    onError: (err, completed: boolean, context: any) => {
      // Revert on error
      const revertedState = !completed;
      setIsCompleted(revertedState);
      animateCompletion(revertedState);

      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      console.error("Task update error:", err);
      Alert.alert(
        "Oops!",
        "We couldn't update that task right now. Your plants are patient - please try again in a moment."
      );
    },
    onSuccess: (completed: boolean) => {
      // Notify parent component
      onToggleComplete?.(task.id, completed);

      // Invalidate related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["gardenDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["overdueTasks"] });
    },
    onSettled: () => {
      setIsProcessing(false);
      // Reset animation flag for next toggle
      setHasAnimatedForCurrentToggle(false);
    },
  });

  // Smooth completion animation
  const animateCompletion = (completed: boolean) => {
    // Checkbox feedback animation
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        friction: 8,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Text and strikethrough animation
    Animated.parallel([
      Animated.timing(strikethroughWidth, {
        toValue: completed ? 100 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: completed ? 0.6 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleToggle = () => {
    if (isProcessing || isRemoving) return;

    const newCompletedState = !isCompleted;

    // If parent provides onToggleComplete, use that instead of direct mutation
    if (onToggleComplete) {
      // Set flag to prevent duplicate animation in mutation
      setHasAnimatedForCurrentToggle(true);

      // Immediate visual feedback
      setIsCompleted(newCompletedState);
      animateCompletion(newCompletedState);

      // Let parent handle the actual mutation
      onToggleComplete(task.id, newCompletedState);
    } else {
      // Fallback to direct mutation if no parent handler
      toggleTaskMutation.mutate(newCompletedState);
    }
  };

  // Helper functions for display
  const getRelativeTime = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");

    const nextWeekStart = new Date();
    nextWeekStart.setDate(
      nextWeekStart.getDate() + ((8 - nextWeekStart.getDay()) % 7)
    );
    nextWeekStart.setHours(0, 0, 0, 0);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);

    if (isAfter(date, nextWeekStart) && isBefore(date, nextWeekEnd)) {
      return `Next ${format(date, "EEEE")}`;
    }

    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();

    if (dateYear === currentYear) {
      return format(date, "MMM d");
    }

    return format(date, "MMM d, yyyy");
  };

  const dueDate = new Date(task.due_date);
  const plantNickname = task.plant?.nickname || "Unknown Plant";
  const gardenName = task.plant?.garden?.name || "Unknown Garden";

  return (
    <Animated.View
      style={{
        opacity: taskOpacity,
        transform: [{ translateX: taskTranslateX }],
      }}
    >
      <TouchableOpacity
        onPress={handleToggle}
        className="p-4"
        activeOpacity={0.7}
        disabled={isProcessing || isRemoving}
      >
        <View className="flex-row items-center">
          {/* Checkbox */}
          <Animated.View
            className={`w-6 h-6 rounded-lg mr-3 items-center justify-center ${
              isCompleted
                ? "bg-brand-600"
                : isOverdue
                ? "bg-red-100 border border-red-300"
                : "bg-white border border-cream-300"
            }`}
            style={{ transform: [{ scale: checkboxScale }] }}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </Animated.View>

          {/* Task Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name={
                    TASK_TYPE_META[task.task_type]?.icon || "checkmark-circle"
                  }
                  size={18}
                  color={
                    isOverdue && !isCompleted
                      ? "#ef4444"
                      : TASK_TYPE_META[task.task_type]?.color || "#636059"
                  }
                  style={{ marginRight: 6 }}
                />

                {/* Text with animated strikethrough */}
                <View style={{ position: "relative", flex: 1 }}>
                  <Animated.Text
                    className={`text-base font-paragraph font-medium ${
                      isOverdue && !isCompleted
                        ? "text-red-700"
                        : "text-foreground"
                    }`}
                    style={{ opacity: textOpacity }}
                  >
                    {/* Use label for clarity and future i18n */}
                    {TASK_TYPE_META[task.task_type]?.label ||
                      task.task_type}{" "}
                    {plantNickname}
                  </Animated.Text>

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
                      opacity: strikethroughWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 0.8],
                      }),
                    }}
                  />
                </View>
              </View>

              {/* Due date badge */}
              <View
                className={`px-2 py-1 rounded-lg ml-2 ${
                  isOverdue && !isCompleted
                    ? "bg-red-100"
                    : isCompleted
                    ? "bg-brand-100"
                    : "bg-cream-100"
                }`}
              >
                <Text
                  className={`text-xs font-paragraph font-medium ${
                    isOverdue && !isCompleted
                      ? "text-red-700"
                      : isCompleted
                      ? "text-brand-700"
                      : "text-cream-700"
                  }`}
                >
                  {isOverdue && !isCompleted
                    ? "Overdue"
                    : getRelativeTime(dueDate)}
                </Text>
              </View>
            </View>

            {/* Garden Info */}
            {showGardenName && gardenName && (
              <Text className="text-sm text-cream-600 font-paragraph mt-1">
                in {gardenName}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
