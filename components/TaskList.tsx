import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TaskWithDetails } from "@/types/garden";
import { Task } from "./Task";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Friendly messages for empty state
const EMPTY_STATE_MESSAGES: string[] = [
  "Your garden is doing great today - everything feels balanced.",
  "Today is a gentle rest day for your plants.",
  "Everything is thriving, so no extra care is needed right now.",
  "Looks like your plants are in cozy chill mode.",
  "No tasks today - your garden is in harmony.",
  "Your plants are soaking up the good vibes you've set.",
  "All quiet in the garden - enjoy the peace.",
  "Nothing on the list - nature is handling it today.",
  "Your care paid off and every plant is content.",
  "Sun is out, soil is right - everything is humming along.",
];

interface TaskListProps {
  tasks: TaskWithDetails[];
  onToggleComplete?: (id: number, completed: boolean) => void;
  showGardenName?: boolean;
  groupByGarden?: boolean;
  maxTasks?: number;
  className?: string;
  queryKey?: string[];
  isOverdue?: boolean;
  removeOnComplete?: boolean;
}

export function TaskList({
  tasks,
  onToggleComplete,
  showGardenName = false,
  groupByGarden = false,
  maxTasks,
  className = "",
  queryKey,
  isOverdue = false,
  removeOnComplete = true,
}: TaskListProps) {
  // Simplified state management - only track removing tasks for UI feedback
  const [removingTaskIds, setRemovingTaskIds] = useState<Set<number>>(
    new Set()
  );
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"single" | "all">(
    "single"
  );

  const emptyStateOpacity = useSharedValue(0);
  const emptyStateScale = useSharedValue(0.95);
  const celebrationOpacity = useSharedValue(0);
  const celebrationScale = useSharedValue(0.3);

  // Refs for managing state
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRemovals = useRef<Set<number>>(new Set());

  const queryClient = useQueryClient();

  // Random empty state message
  const emptyStateMessage = useRef(
    EMPTY_STATE_MESSAGES[
      Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)
    ]
  ).current;

  const showEmptyState = useCallback(() => {
    emptyStateOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    emptyStateScale.value = withSpring(1, {
      damping: 16,
      stiffness: 360,
    });
  }, [emptyStateOpacity, emptyStateScale]);

  const hideEmptyState = useCallback(() => {
    emptyStateOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });
    emptyStateScale.value = withTiming(0.95, {
      duration: 180,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [emptyStateOpacity, emptyStateScale]);

  const hideCelebration = useCallback(() => {
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
      celebrationTimer.current = null;
    }

    celebrationOpacity.value = withTiming(
      0,
      { duration: 200, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setCelebrationVisible)(false);
        }
      }
    );
    celebrationScale.value = withTiming(0.3, {
      duration: 200,
      easing: Easing.in(Easing.cubic),
    });
  }, [celebrationOpacity, celebrationScale]);

  const showCelebration = useCallback(
    (type: "single" | "all") => {
      setCelebrationType(type);
      setCelebrationVisible(true);

      celebrationOpacity.value = 0;
      celebrationScale.value = 0.3;

      celebrationOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      celebrationScale.value = withSpring(1, {
        stiffness: 340,
        damping: 18,
        mass: 0.72,
      });

      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }

      celebrationTimer.current = setTimeout(() => {
        hideCelebration();
      }, type === "all" ? 2600 : 1800);
    }, [celebrationOpacity, celebrationScale, hideCelebration]);

  const emptyStateAnimatedStyle = useAnimatedStyle(() => ({
    opacity: emptyStateOpacity.value,
    transform: [{ scale: emptyStateScale.value }],
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
    transform: [{ scale: celebrationScale.value }],
  }));


  // Handle task completion with proper state management
  const handleTaskComplete = useCallback(
    (taskId: number, completed: boolean) => {
      if (!completed) return; // Only handle completion, not unchecking

      if (!removeOnComplete) {
        onToggleComplete?.(taskId, completed);
        showCelebration("single");
        return;
      }

      if (pendingRemovals.current.has(taskId)) {
        return;
      }

      pendingRemovals.current.add(taskId);
      setRemovingTaskIds((prev) => new Set([...prev, taskId]));

      const remainingTasks = tasks.filter(
        (task: TaskWithDetails) =>
          task.id !== taskId &&
          !removingTaskIds.has(task.id) &&
          !pendingRemovals.current.has(task.id)
      );

      if (remainingTasks.length === 0) {
        setTimeout(() => showCelebration("all"), 320);
      } else {
        setTimeout(() => showCelebration("single"), 200);
      }

      onToggleComplete?.(taskId, completed);

      LayoutAnimation.configureNext({
        duration: 360,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
          duration: 260,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.84,
          initialVelocity: 0.1,
          property: LayoutAnimation.Properties.scaleXY,
          duration: 360,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
          duration: 220,
        },
      });

      setTimeout(() => {
        setRemovingTaskIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        pendingRemovals.current.delete(taskId);
      }, 360);
    },
    [removeOnComplete, tasks, removingTaskIds, onToggleComplete, showCelebration]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  // Filter out tasks that are being removed for display
  const visibleTasks = tasks.filter((task) => !removingTaskIds.has(task.id));

  useEffect(() => {
    if (visibleTasks.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
  }, [visibleTasks.length, showEmptyState, hideEmptyState]);

  // Show animated empty state when no tasks remain
  if (visibleTasks.length === 0) {
    return (
      <Animated.View
        className="bg-background p-6 items-center rounded-xl"
        style={emptyStateAnimatedStyle}
      >
        <Image
          source={require("@/assets/images/no-tasks.png")}
          className="h-60 mb-4 rounded-lg overflow-hidden"
          resizeMode="contain"
          style={{ aspectRatio: 3 / 2 }}
        />
        <Text className="text-lg text-foreground font-paragraph font-medium text-center leading-tight">
          {emptyStateMessage}
        </Text>
      </Animated.View>
    );
  }

  // Render grouped tasks
  if (groupByGarden) {
    const groupedTasks = visibleTasks.reduce<Record<string, TaskWithDetails[]>>(
      (acc, task) => {
        const gardenName = task.plant?.garden?.name || "Unknown Garden";
        if (!acc[gardenName]) {
          acc[gardenName] = [];
        }
        acc[gardenName].push(task);
        return acc;
      },
      {}
    );

    return (
      <View className={`${className} relative`}>
        {Object.entries(groupedTasks).map(([gardenName, gardenTasks]) => (
          <View key={gardenName} className="mb-4 bg-white rounded-xl">
            <Text className="text-sm font-paragraph font-medium text-cream-700 p-4">
              {gardenName}
            </Text>
            {gardenTasks.slice(0, maxTasks).map((task, index) => (
              <React.Fragment key={task.id}>
                <Task
                  task={task}
                  onToggleComplete={handleTaskComplete}
                  showGardenName={false}
                  queryKey={queryKey}
                  isOverdue={isOverdue}
                  isRemoving={removeOnComplete && removingTaskIds.has(task.id)}
                  onRemovalComplete={() => {}} // No longer needed
                />
                {index < gardenTasks.length - 1 && (
                  <View className="h-[1px] bg-cream-200 mx-4" />
                )}
              </React.Fragment>
            ))}
            {gardenTasks.length > (maxTasks || gardenTasks.length) && (
              <Text className="text-sm text-cream-600 font-paragraph p-4">
                +{gardenTasks.length - (maxTasks || 0)} more{" "}
                {gardenTasks.length - (maxTasks || 0) === 1 ? "task" : "tasks"}
              </Text>
            )}
          </View>
        ))}
        {renderCelebration()}
      </View>
    );
  }

  // Render regular task list
  const tasksToShow = visibleTasks.slice(0, maxTasks);

  return (
    <View className={`${className} bg-white rounded-xl relative`}>
      {tasksToShow.map((task, index) => (
        <React.Fragment key={task.id}>
          <Task
            task={task}
            onToggleComplete={handleTaskComplete}
            showGardenName={showGardenName}
            queryKey={queryKey}
            isOverdue={isOverdue}
            isRemoving={removeOnComplete && removingTaskIds.has(task.id)}
            onRemovalComplete={() => {}} // No longer needed
          />
          {index < tasksToShow.length - 1 && (
            <View className="h-[1px] bg-cream-200 mx-4" />
          )}
        </React.Fragment>
      ))}

      {visibleTasks.length > (maxTasks || visibleTasks.length) && (
        <Text className="text-sm text-cream-600 font-paragraph p-4">
          +{visibleTasks.length - (maxTasks || 0)} more{" "}
          {visibleTasks.length - (maxTasks || 0) === 1 ? "task" : "tasks"}
        </Text>
      )}

      {renderCelebration()}
    </View>
  );

  // Render celebration overlay with adaptive sizing for different container sizes
  function renderCelebration() {
    if (!celebrationVisible) return null;

    // Calculate adaptive sizing based on remaining tasks (smaller celebration for smaller containers)
    const remainingTaskCount = tasks.filter(
      (task) => !removingTaskIds.has(task.id)
    ).length;
    const isSmallContainer = remainingTaskCount <= 1;

    return (
      <Animated.View
        className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50"
        style={[celebrationAnimatedStyle, {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          minHeight: isSmallContainer ? 80 : 100, // Even smaller for single task containers
        }]}
      >
        {celebrationType === "all" ? (
          <View
            className={`items-center ${
              isSmallContainer ? "px-2 py-2" : "px-3 py-4"
            } max-w-[240px]`}
          >
            <View
              className={`${
                isSmallContainer ? "w-8 h-8" : "w-10 h-10"
              } rounded-full bg-brand-100 items-center justify-center ${
                isSmallContainer ? "mb-1" : "mb-2"
              } shadow-sm`}
            >
              <Ionicons
                name="trophy"
                size={isSmallContainer ? 16 : 20}
                color="#5E994B"
              />
            </View>
            <Text
              className={`${
                isSmallContainer ? "text-sm" : "text-base"
              } font-title font-bold text-brand-700 text-center mb-1`}
            >
              Amazing work!
            </Text>
            <Text className="text-xs font-paragraph text-brand-600 text-center">
              You&apos;ve completed all your {isOverdue ? "overdue " : ""}tasks
            </Text>
          </View>
        ) : (
          <View
            className={`items-center ${
              isSmallContainer ? "px-2 py-2" : "px-3 py-3"
            } max-w-[200px]`}
          >
            <View
              className={`${
                isSmallContainer ? "w-6 h-6" : "w-8 h-8"
              } rounded-full bg-brand-100 items-center justify-center mb-1 shadow-sm`}
            >
              <Ionicons
                name="checkmark-circle"
                size={isSmallContainer ? 12 : 16}
                color="#5E994B"
              />
            </View>
            <Text
              className={`${
                isSmallContainer ? "text-xs" : "text-sm"
              } font-title font-bold text-brand-700 text-center mb-1`}
            >
              Well done!
            </Text>
            <Text className="text-xs font-paragraph text-brand-600 text-center">
              Keep up the great work
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }
}
































