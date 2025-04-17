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
    Record<
      number,
      {
        opacity: Animated.Value;
        height: Animated.Value;
        translateX: Animated.Value;
        marginBottom: Animated.Value;
        paddingVertical: Animated.Value;
      }
    >
  >({});

  // Track empty state animation
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;
  const emptyStateScale = useRef(new Animated.Value(0.95)).current;
  const [showEmptyState, setShowEmptyState] = useState(
    initialTasks.length === 0
  );

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;
  const [celebrationType, setCelebrationType] = useState<
    "single" | "all" | "final"
  >("single");

  // Task processing state
  const processingTaskIds = useRef(new Set<number>()).current;
  const successAnimationTimeout = useRef<NodeJS.Timeout | null>(null);
  const taskHeights = useRef<Map<number, number>>(new Map()).current;

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

  // Configure enhanced, smoother layout animations for Android
  const configureEnhancedLayoutAnimation = useCallback(() => {
    if (Platform.OS === "android") {
      // Custom configuration for smoother height transitions on Android
      LayoutAnimation.configureNext({
        duration: 350,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY,
        },
        delete: {
          duration: 250,
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    } else {
      // iOS uses standard easeInEaseOut
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
    }
  }, []);

  // Initialize completedTaskIds on mount and setup empty state if needed
  useEffect(() => {
    initialTasks.forEach((task) => {
      if (task.completed) {
        completedTaskIds.add(task.id);
      }
    });

    // Show empty state immediately if there are no tasks
    if (initialTasks.length === 0) {
      setShowEmptyState(true);
      // Animate in the empty state
      Animated.parallel([
        Animated.timing(emptyStateOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(emptyStateScale, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Make sure empty state is hidden if we have tasks
      setShowEmptyState(false);
      emptyStateOpacity.setValue(0);
    }
  }, []);

  // Reset state when tasks prop changes completely (like when switching dates)
  useEffect(() => {
    // Reset the tasks state with initialTasks
    setTasks(initialTasks);

    // Reset completed tasks tracking
    completedTaskIds.clear();
    initialTasks.forEach((task) => {
      if (task.completed) {
        completedTaskIds.add(task.id);
      }
    });

    // Clear removing tasks animations
    setRemovingTasks({});

    // Handle empty states properly:
    // If there are no tasks at all, show empty state immediately
    if (initialTasks.length === 0) {
      setShowEmptyState(true);
      // Animate in the empty state
      Animated.parallel([
        Animated.timing(emptyStateOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(emptyStateScale, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide empty state when new tasks arrive
      setShowEmptyState(false);
      Animated.timing(emptyStateOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [initialTasks]); // This will run when initialTasks reference changes completely

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
            const taskHeight = taskHeights.get(task.id) || 0;

            newRemovingTasks[task.id] = {
              opacity: new Animated.Value(1),
              height: new Animated.Value(taskHeight),
              translateX: new Animated.Value(0),
              marginBottom: new Animated.Value(8), // Initial margin if any
              paddingVertical: new Animated.Value(12), // Initial padding if any
            };

            // Start multi-stage exit animation
            Animated.sequence([
              // First slight slide right
              Animated.timing(newRemovingTasks[task.id].translateX, {
                toValue: 10,
                duration: 150,
                useNativeDriver: true,
              }),
              // Then slide left and fade out
              Animated.parallel([
                Animated.timing(newRemovingTasks[task.id].translateX, {
                  toValue: -100,
                  duration: 350,
                  useNativeDriver: true,
                }),
                Animated.timing(newRemovingTasks[task.id].opacity, {
                  toValue: 0,
                  duration: 350,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              // After slide and fade, collapse height with a coordinated animation
              Animated.parallel([
                Animated.timing(newRemovingTasks[task.id].height, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false, // Height can't use native driver
                }),
                Animated.timing(newRemovingTasks[task.id].marginBottom, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(newRemovingTasks[task.id].paddingVertical, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
              ]).start(() => {
                // When all animations complete, remove from state
                setRemovingTasks((prev) => {
                  const updated = { ...prev };
                  delete updated[task.id];
                  return updated;
                });

                // Show empty state if this was the last task
                if (incomingTaskIds.size === 0) {
                  animateToEmptyState();
                } else {
                  // Trigger layout animation for smooth adjustment
                  configureEnhancedLayoutAnimation();
                }
              });
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

  // Function to measure and store task heights
  const measureTaskHeight = useCallback(
    (taskId: number, height: number) => {
      if (height > 0) {
        // Always update the height in case it changed
        taskHeights.set(taskId, height);
      }
    },
    [taskHeights]
  );

  // Animate transition to empty state
  const animateToEmptyState = useCallback(() => {
    setShowEmptyState(true);

    // Reset values before animating in
    emptyStateOpacity.setValue(0);
    emptyStateScale.setValue(0.95);

    // Animate in the empty state
    Animated.parallel([
      Animated.timing(emptyStateOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(emptyStateScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [emptyStateOpacity, emptyStateScale]);

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

        // If we're marking a task complete, start the removal animation
        // for both normal and overdue tasks
        if (isOverdue || !isOverdue) {
          const taskHeight = taskHeights.get(taskId) || 0;
          const newRemovingTasks = { ...removingTasks };

          newRemovingTasks[taskId] = {
            opacity: new Animated.Value(1),
            height: new Animated.Value(taskHeight),
            translateX: new Animated.Value(0),
            marginBottom: new Animated.Value(8), // Initial margin
            paddingVertical: new Animated.Value(12), // Initial padding
          };

          setRemovingTasks(newRemovingTasks);

          // Start multi-part animation with a delay to show the checkmark first
          setTimeout(() => {
            Animated.sequence([
              // First slight slide right with checkmark
              Animated.timing(newRemovingTasks[taskId].translateX, {
                toValue: 15,
                duration: 200,
                useNativeDriver: true,
              }),
              // Then slide left and fade out
              Animated.parallel([
                Animated.timing(newRemovingTasks[taskId].translateX, {
                  toValue: -100,
                  duration: 350,
                  useNativeDriver: true,
                }),
                Animated.timing(newRemovingTasks[taskId].opacity, {
                  toValue: 0,
                  duration: 350,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              // After slide and fade, collapse height with coordinated animations
              Animated.parallel([
                Animated.timing(newRemovingTasks[taskId].height, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(newRemovingTasks[taskId].marginBottom, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(newRemovingTasks[taskId].paddingVertical, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
              ]).start(() => {
                // When all animations complete, remove from state
                setRemovingTasks((prev) => {
                  const updated = { ...prev };
                  delete updated[task.id];
                  return updated;
                });

                // Check if this was the last task
                const remainingTasks = tasks.filter(
                  (t) => t.id !== taskId && !completedTaskIds.has(t.id)
                );

                if (remainingTasks.length === 0) {
                  animateToEmptyState();
                } else {
                  // Trigger layout animation for smooth adjustment
                  configureEnhancedLayoutAnimation();
                }
              });
            });
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
        // Check remaining tasks after this completion
        const remainingTasks = tasks.filter(
          (t) => !t.completed && t.id !== taskId
        ).length;

        // Choose celebration type based on how many tasks remain
        let celebType: "single" | "all" | "final" = "single";
        if (remainingTasks === 0) {
          celebType = "all"; // No tasks left
        } else if (remainingTasks === 1) {
          celebType = "final"; // One task remaining
        }

        setCelebrationType(celebType);
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
        successAnimationTimeout.current = setTimeout(
          () => {
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
          },
          celebType === "all" ? 2000 : 1500
        ); // Longer celebration for completing all tasks
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
      taskHeights,
      animateToEmptyState,
    ]
  );

  // If no tasks or all tasks are being removed, show empty state
  if (
    !tasks ||
    tasks.length === 0 ||
    (Object.keys(removingTasks).length > 0 &&
      Object.keys(removingTasks).length === tasks.length) ||
    showEmptyState
  ) {
    return (
      <Animated.View
        className="bg-background p-6 items-center border border-cream-300 rounded-xl"
        style={{
          opacity: emptyStateOpacity,
          transform: [{ scale: emptyStateScale }],
        }}
      >
        <Text className="text-base text-cream-600 text-center">
          No tasks to display
        </Text>
      </Animated.View>
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
                <View
                  key={task.id}
                  onLayout={(e) =>
                    measureTaskHeight(task.id, e.nativeEvent.layout.height)
                  }
                >
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
                  {gardenTasks.length == 4
                    ? "+" + (gardenTasks.length - 3) + " more task"
                    : "+" + (gardenTasks.length - 3) + " more tasks"}
                </Text>
              )}
            </View>
          )
        )}

        {/* Success overlay - covers the entire group list */}
        {showSuccess && (
          <Animated.View
            className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50 overflow-hidden"
            style={{
              opacity: successOpacity,
              transform: [{ scale: successScale }],
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {celebrationType === "all" ? (
              // All tasks completed celebration
              <View className="items-center px-4 py-3 max-w-[280px]">
                <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-3 shadow-sm">
                  <Ionicons name="trophy" size={32} color="#16a34a" />
                </View>
                <Text className="text-lg font-bold text-brand-700 text-center mb-1">
                  All done!
                </Text>
                <Text className="text-sm text-brand-600 text-center">
                  You've completed all your tasks
                </Text>
              </View>
            ) : celebrationType === "final" ? (
              // One task left celebration (compact design)
              <View className="flex-row items-center px-4 py-3 max-w-[280px]">
                <View className="w-12 h-12 rounded-full bg-brand-100 items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-brand-700 mb-0.5">
                    Almost there!
                  </Text>
                  <Text className="text-xs text-brand-600">
                    Just one more task to go
                  </Text>
                </View>
              </View>
            ) : (
              // Regular single task completion
              <View className="items-center px-4 py-3 max-w-[280px]">
                <View className="w-14 h-14 rounded-full bg-brand-100 items-center justify-center mb-2 shadow-sm">
                  <Ionicons name="checkmark-circle" size={28} color="#16a34a" />
                </View>
                <Text className="text-base font-bold text-brand-700 text-center mb-0.5">
                  Nice work!
                </Text>
                <Text className="text-xs text-brand-600 text-center">
                  You're making great progress
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>
    );
  }

  // Render tasks being removed with animations
  const renderRemovingTasks = () => {
    const removingTaskIds = Object.keys(removingTasks).map(Number);
    if (removingTaskIds.length === 0) return null;

    return removingTaskIds.map((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return null;

      return (
        <Animated.View
          key={`removing-${taskId}`}
          style={{
            opacity: removingTasks[taskId].opacity,
            transform: [{ translateX: removingTasks[taskId].translateX }],
            height: removingTasks[taskId].height,
            marginBottom: removingTasks[taskId].marginBottom,
            paddingVertical: removingTasks[taskId].paddingVertical,
            overflow: "hidden",
          }}
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
      {tasks.slice(0, maxTasks).map((task, index) => {
        // Skip tasks that are being animated out
        if (removingTasks[task.id]) return null;

        return (
          <View
            key={task.id}
            onLayout={(e) =>
              measureTaskHeight(task.id, e.nativeEvent.layout.height)
            }
          >
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
        );
      })}

      {/* Render tasks being removed */}
      {renderRemovingTasks()}

      {tasks.length > (maxTasks || tasks.length) && (
        <Text className="text-sm text-cream-600 p-4">
          {tasks.length == 4
            ? "+" + (tasks.length - 3) + " more task"
            : "+" + (tasks.length - 3) + " more tasks"}
        </Text>
      )}

      {/* Success overlay - fullscreen celebration */}
      {showSuccess && (
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50 overflow-hidden"
          style={{
            opacity: successOpacity,
            transform: [{ scale: successScale }],
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {celebrationType === "all" ? (
            // All tasks completed celebration
            <View className="items-center px-4 py-3 max-w-[280px]">
              <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-3 shadow-sm">
                <Ionicons name="trophy" size={32} color="#16a34a" />
              </View>
              <Text className="text-lg font-bold text-brand-700 text-center mb-1">
                All done!
              </Text>
              <Text className="text-sm text-brand-600 text-center">
                You've completed all your tasks
              </Text>
            </View>
          ) : celebrationType === "final" ? (
            // One task left celebration (compact design)
            <View className="flex-row items-center px-4 py-3 max-w-[280px]">
              <View className="w-12 h-12 rounded-full bg-brand-100 items-center justify-center mr-3 shadow-sm">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-brand-700 mb-0.5">
                  Almost there!
                </Text>
                <Text className="text-xs text-brand-600">
                  Just one more task to go
                </Text>
              </View>
            </View>
          ) : (
            // Regular single task completion
            <View className="items-center px-4 py-3 max-w-[280px]">
              <View className="w-14 h-14 rounded-full bg-brand-100 items-center justify-center mb-2 shadow-sm">
                <Ionicons name="checkmark-circle" size={28} color="#16a34a" />
              </View>
              <Text className="text-base font-bold text-brand-700 text-center mb-0.5">
                Nice work!
              </Text>
              <Text className="text-xs text-brand-600 text-center">
                You're making great progress
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}
