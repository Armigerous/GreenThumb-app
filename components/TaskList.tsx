import {
  View,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import { TaskWithDetails } from "@/types/garden";
import { Task } from "./Task";
import { useEffect, useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface TaskListProps {
  tasks: TaskWithDetails[];
  onToggleComplete?: (id: number) => void;
  showGardenName?: boolean;
  groupByGarden?: boolean;
  maxTasks?: number;
  className?: string;
  queryKey?: string[];
  isOverdue?: boolean;
}

/**
 * A component that displays a list of tasks with consistent styling and behavior.
 * Can optionally group tasks by garden and limit the number of displayed tasks.
 */
export function TaskList({
  tasks: initialTasks,
  onToggleComplete,
  showGardenName = false,
  groupByGarden = false,
  maxTasks,
  className = "",
  queryKey,
  isOverdue = false,
}: TaskListProps) {
  // Use local state to manage tasks, preserving their original order
  const [tasks, setTasks] = useState<TaskWithDetails[]>(initialTasks);

  // Track which tasks are completed to avoid unnecessary re-renders
  const completedTaskIds = useRef(new Set<number>()).current;

  // Track tasks being removed to animate them
  const [removingTasks, setRemovingTasks] = useState<
    Record<number, Animated.Value>
  >({});

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;

  // Task processing state
  const processingTaskIds = useRef(new Set<number>()).current;
  const successAnimationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get query client at the component level, not inside the callback
  const queryClient = useQueryClient();

  // Configure smooth layout animations
  const configureLayoutAnimation = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
  }, []);

  // Initialize completedTaskIds on mount
  useEffect(() => {
    initialTasks.forEach((task) => {
      if (task.completed) {
        completedTaskIds.add(task.id);
      }
    });
  }, []);

  // Update tasks when props change, BUT preserve order
  useEffect(() => {
    const currentTaskIds = new Set(tasks.map((t) => t.id));
    const incomingTaskIds = new Set(initialTasks.map((t) => t.id));

    // Check if the task lists have different IDs
    let hasChanges = false;

    // Tasks added or removed
    if (currentTaskIds.size !== incomingTaskIds.size) {
      hasChanges = true;
    } else {
      // Compare task IDs
      for (const id of currentTaskIds) {
        if (!incomingTaskIds.has(id)) {
          hasChanges = true;
          break;
        }
      }
    }

    if (hasChanges) {
      // Check which tasks are being removed
      const tasksBeingRemoved = tasks.filter(
        (task) => !incomingTaskIds.has(task.id)
      );

      // If we have tasks being removed, animate them out
      if (tasksBeingRemoved.length > 0) {
        const newRemovingTasks = { ...removingTasks };

        // Create animation values for each task being removed
        tasksBeingRemoved.forEach((task) => {
          if (!newRemovingTasks[task.id]) {
            // Only add if not already being removed
            newRemovingTasks[task.id] = new Animated.Value(1);

            // Start fadeout animation
            Animated.timing(newRemovingTasks[task.id], {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              // When animation completes, remove from state
              setRemovingTasks((prev) => {
                const updated = { ...prev };
                delete updated[task.id];
                return updated;
              });

              // Also trigger layout animation for smooth adjustment
              configureLayoutAnimation();
            });
          }
        });

        // Update removing tasks state
        setRemovingTasks(newRemovingTasks);
      } else {
        // If no tasks being removed, just update with layout animation
        configureLayoutAnimation();
        setTasks(initialTasks);
      }

      // Reset completed tasks set
      completedTaskIds.clear();
      initialTasks.forEach((task) => {
        if (task.completed) {
          completedTaskIds.add(task.id);
        }
      });
    } else {
      // Just update the details of existing tasks while maintaining order
      setTasks((prevTasks) =>
        prevTasks.map((prevTask) => {
          const updatedTask = initialTasks.find((t) => t.id === prevTask.id);

          // Update our completed task tracking
          if (updatedTask?.completed && !completedTaskIds.has(prevTask.id)) {
            completedTaskIds.add(prevTask.id);
          } else if (
            !updatedTask?.completed &&
            completedTaskIds.has(prevTask.id)
          ) {
            completedTaskIds.delete(prevTask.id);
          }

          // Return the updated task or the original if not found
          return updatedTask || prevTask;
        })
      );
    }
  }, [initialTasks]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (successAnimationTimeout.current) {
        clearTimeout(successAnimationTimeout.current);
      }
    };
  }, []);

  // Handle task completion with animation
  const handleTaskComplete = useCallback(
    (taskId: number) => {
      // If already processing this task, don't do anything
      if (processingTaskIds.has(taskId)) return;

      // Get the task
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Add to processing set
      processingTaskIds.add(taskId);

      // Configure layout animation for smooth transition
      configureLayoutAnimation();

      // Track completed status locally
      if (task.completed) {
        completedTaskIds.delete(taskId);
      } else {
        completedTaskIds.add(taskId);

        // If we're marking a task complete that should disappear, start the removal animation
        // Check task type more generically, as it could be various string values
        if (!isOverdue) {
          const newRemovingTasks = { ...removingTasks };
          newRemovingTasks[taskId] = new Animated.Value(1);
          setRemovingTasks(newRemovingTasks);

          // Start fadeout animation with a delay
          setTimeout(() => {
            Animated.timing(newRemovingTasks[taskId], {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start();
          }, 500); // Delay animation to show check mark first
        }
      }

      // Update local task state
      // IMPORTANT: Maintain the original task order
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );

      // Show success animation only when completing a task (not uncompleting)
      // and only if another success animation isn't already showing
      if (!task.completed && !showSuccess) {
        setShowSuccess(true);

        // Animate in quickly with a scale effect
        Animated.parallel([
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(successScale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();

        // Clear any existing timeout
        if (successAnimationTimeout.current) {
          clearTimeout(successAnimationTimeout.current);
        }

        // Hide the success animation after a delay
        successAnimationTimeout.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(successOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(successScale, {
              toValue: 0.3,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowSuccess(false);
          });

          successAnimationTimeout.current = null;
        }, 1500); // Slightly longer celebration
      }

      // Call the original onToggleComplete handler
      if (onToggleComplete) {
        onToggleComplete(taskId);
      }

      // Invalidate garden dashboard queries to refresh garden health
      queryClient.invalidateQueries({
        queryKey: ["gardenDashboard"],
      });

      // Remove from processing set after a short delay
      setTimeout(() => {
        processingTaskIds.delete(taskId);
      }, 300);
    },
    [
      tasks,
      onToggleComplete,
      successOpacity,
      successScale,
      showSuccess,
      completedTaskIds,
      queryClient,
      configureLayoutAnimation,
      isOverdue,
      removingTasks,
    ]
  );

  // If no tasks, show empty state
  if (
    !tasks ||
    (tasks.length === 0 && Object.keys(removingTasks).length === 0)
  ) {
    return (
      <View className="bg-background p-6 items-center border border-cream-300 rounded-xl">
        <Text className="text-base text-cream-600 text-center">
          No tasks to display
        </Text>
      </View>
    );
  }

  // If grouping by garden, organize tasks
  if (groupByGarden) {
    const groupedTasks = tasks.reduce<Record<string, TaskWithDetails[]>>(
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
      <View className={className}>
        {Object.entries(groupedTasks).map(
          ([gardenName, gardenTasks], groupIndex) => (
            <View
              key={gardenName}
              className="mb-4 bg-white rounded-xl border border-cream-300"
            >
              <Text className="text-sm font-medium text-cream-700 p-4">
                {gardenName}
              </Text>
              {gardenTasks.slice(0, maxTasks).map((task, index) => (
                <View key={task.id}>
                  <Task
                    task={task}
                    onToggleComplete={handleTaskComplete}
                    showGardenName={false} // Garden name already shown in header
                    queryKey={queryKey}
                    isOverdue={isOverdue}
                  />
                  {index < gardenTasks.length - 1 && (
                    <View className="h-[1px] bg-cream-200 mx-4" />
                  )}
                </View>
              ))}
              {gardenTasks.length > (maxTasks || gardenTasks.length) && (
                <Text className="text-sm text-cream-600 p-4">
                  +{gardenTasks.length - (maxTasks || gardenTasks.length)} more
                  tasks
                </Text>
              )}
            </View>
          )
        )}

        {/* Success overlay - covers the entire group list */}
        {showSuccess && (
          <Animated.View
            className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50"
            style={{
              opacity: successOpacity,
              transform: [{ scale: successScale }],
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="w-20 h-20 rounded-full bg-brand-100 items-center justify-center mb-4 shadow-sm">
              <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
            </View>
            <Text className="text-xl font-bold text-brand-700 text-center mb-1">
              Nice work!
            </Text>
            <Text className="text-base text-brand-600 text-center">
              You're making great progress
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // Render tasks being removed with fade-out animation
  const renderRemovingTasks = () => {
    const removingTaskIds = Object.keys(removingTasks).map(Number);
    if (removingTaskIds.length === 0) return null;

    return removingTaskIds.map((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return null;

      return (
        <Animated.View
          key={`removing-${taskId}`}
          style={{ opacity: removingTasks[taskId] }}
        >
          <Task
            task={task}
            onToggleComplete={handleTaskComplete}
            showGardenName={showGardenName}
            queryKey={queryKey}
            isOverdue={isOverdue}
          />
          <View className="h-[1px] bg-cream-200 mx-4" />
        </Animated.View>
      );
    });
  };

  // If not grouping, just show the tasks in their original order
  return (
    <View
      className={`${className} bg-white rounded-xl border border-cream-300 relative`}
    >
      {/* Render tasks from state */}
      {tasks.slice(0, maxTasks).map((task, index) => (
        <View key={task.id}>
          <Task
            task={task}
            onToggleComplete={handleTaskComplete}
            showGardenName={showGardenName}
            queryKey={queryKey}
            isOverdue={isOverdue}
          />
          {index < tasks.length - 1 && (
            <View className="h-[1px] bg-cream-200 mx-4" />
          )}
        </View>
      ))}

      {/* Render tasks being removed */}
      {renderRemovingTasks()}

      {tasks.length > (maxTasks || tasks.length) && (
        <Text className="text-sm text-cream-600 p-4">
          +{tasks.length - (maxTasks || tasks.length)} more tasks
        </Text>
      )}

      {/* Success overlay - fullscreen celebration */}
      {showSuccess && (
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50"
          style={{
            opacity: successOpacity,
            transform: [{ scale: successScale }],
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="w-20 h-20 rounded-full bg-brand-100 items-center justify-center mb-4 shadow-sm">
            <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
          </View>
          <Text className="text-xl font-bold text-brand-700 text-center mb-1">
            Nice work!
          </Text>
          <Text className="text-base text-brand-600 text-center">
            You're making great progress
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
