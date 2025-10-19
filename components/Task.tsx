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
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

  const checkboxScale = useSharedValue(1);
  const taskOpacity = useSharedValue(1);
  const taskTranslateX = useSharedValue(0);
  const strikethroughProgress = useSharedValue(isCompleted ? 1 : 0);
  const textOpacity = useSharedValue(isCompleted ? 0.6 : 1);
  const [titleWidth, setTitleWidth] = useState(0);

  const animateCompletion = useCallback(
    (completed: boolean) => {
      checkboxScale.value = withSequence(
        withTiming(0.88, {
          duration: 90,
          easing: Easing.out(Easing.quad),
        }),
        withSpring(1, {
          mass: 0.55,
          stiffness: 420,
          damping: 22,
        })
      );
      strikethroughProgress.value = withTiming(completed ? 1 : 0, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
      textOpacity.value = withTiming(completed ? 0.6 : 1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    },
    [checkboxScale, strikethroughProgress, textOpacity]
  );

  useEffect(() => {
    if (task.completed !== isCompleted && !isProcessing) {
      setIsCompleted(task.completed);
      animateCompletion(task.completed);
    }
  }, [task.completed, isCompleted, isProcessing, animateCompletion]);

  useEffect(() => {
    if (!isRemoving) {
      taskOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      taskTranslateX.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    taskOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.in(Easing.cubic),
    });
    taskTranslateX.value = withTiming(
      16,
      {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished && onRemovalComplete) {
          runOnJS(onRemovalComplete)(task.id);
        }
      }
    );
  }, [isRemoving, onRemovalComplete, task.id, taskOpacity, taskTranslateX]);

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

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taskOpacity.value,
    transform: [{ translateX: taskTranslateX.value }],
  }));

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const strikethroughAnimatedStyle = useAnimatedStyle(() => ({
    width: titleWidth * strikethroughProgress.value,
    opacity: strikethroughProgress.value,
  }));

  const handleToggle = () => {
    if (isProcessing || isRemoving || isCompleted) return;

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
    <Animated.View style={containerAnimatedStyle}>
      <TouchableOpacity
        onPress={handleToggle}
        className="p-4"
        activeOpacity={0.7}
        disabled={isProcessing || isRemoving || isCompleted}
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
            style={checkboxAnimatedStyle}
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
                  <Animated.View style={textAnimatedStyle}>
                    <Text
                      className={`text-base font-paragraph font-medium ${
                        isOverdue && !isCompleted
                          ? "text-red-700"
                          : "text-foreground"
                      }`}
                      onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      if (width !== titleWidth) {
                        setTitleWidth(width);
                      }
                      }}
                    >
                      {TASK_TYPE_META[task.task_type]?.label || task.task_type}{" "}
                      {plantNickname}
                    </Text>
                  </Animated.View>

                  <Animated.View
                    pointerEvents="none"
                    style={[
                      {
                        position: "absolute",
                        height: 1,
                        backgroundColor: isOverdue ? "#ef4444" : "#6b7280",
                        top: "50%",
                        opacity: 0.8,
                        left: 0,
                      },
                      strikethroughAnimatedStyle,
                    ]}
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







