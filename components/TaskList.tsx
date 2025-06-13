import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
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
  "Your garden's all good today 🌞",
  "Today's a rest day for your plants.",
  "Everything's thriving — no care needed.",
  "Looks like your plants are in chill mode 🌿",
  "No tasks today — your garden's in harmony.",
  "Your plants are soaking up the good vibes ✨",
  "All quiet in the garden — enjoy the peace.",
  "Nothing to do — nature's handling it today.",
  "Your care paid off — everything's happy 🌼",
  "Sun's out, soil's right — all is well.",
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
}

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
  // Simplified state management
  const [displayTasks, setDisplayTasks] = useState<TaskWithDetails[]>(initialTasks);
  const [removingTaskIds, setRemovingTaskIds] = useState<number[]>([]);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"single" | "all">("single");
  
  // Animation references
  const listHeight = useRef(new Animated.Value(0)).current;
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;
  const emptyStateScale = useRef(new Animated.Value(0.95)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  
  // Refs for managing state
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);
  
  const queryClient = useQueryClient();

  // Random empty state message
  const emptyStateMessage = useRef(
    EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)]
  ).current;

  // Initialize display tasks
  useEffect(() => {
    setDisplayTasks(initialTasks);
    
    if (!isInitialized.current) {
      isInitialized.current = true;
      if (initialTasks.length === 0) {
        showEmptyState();
      }
    }
  }, [initialTasks]);

  // Handle task updates from external sources
  useEffect(() => {
    // Update display tasks when props change, but preserve removal animations
    const updatedTasks = initialTasks.filter(task => !removingTaskIds.includes(task.id));
    if (JSON.stringify(updatedTasks) !== JSON.stringify(displayTasks.filter(task => !removingTaskIds.includes(task.id)))) {
      setDisplayTasks(updatedTasks);
    }
  }, [initialTasks, removingTaskIds]);

  // Show empty state animation
  const showEmptyState = useCallback(() => {
    Animated.parallel([
      Animated.timing(emptyStateOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(emptyStateScale, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [emptyStateOpacity, emptyStateScale]);

  // Hide empty state animation
  const hideEmptyState = useCallback(() => {
    Animated.parallel([
      Animated.timing(emptyStateOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emptyStateScale, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [emptyStateOpacity, emptyStateScale]);

  // Show celebration animation
  const showCelebration = useCallback((type: "single" | "all") => {
    setCelebrationType(type);
    setCelebrationVisible(true);
    
    // Reset animation values
    celebrationOpacity.setValue(0);
    celebrationScale.setValue(0.3);
    
    // Animate in
    Animated.parallel([
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Clear existing timer
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
    }

    // Auto-hide celebration
    celebrationTimer.current = setTimeout(() => {
      hideCelebration();
    }, type === "all" ? 2500 : 1500);
  }, [celebrationOpacity, celebrationScale]);

  // Hide celebration animation
  const hideCelebration = useCallback(() => {
    Animated.parallel([
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationScale, {
        toValue: 0.3,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCelebrationVisible(false);
    });
  }, [celebrationOpacity, celebrationScale]);

  // Handle task completion with coordinated animations
  const handleTaskComplete = useCallback((taskId: number, completed: boolean) => {
    if (!completed) return; // Only handle completion, not unchecking
    
    // Add to removing array
    setRemovingTaskIds(prev => [...prev, taskId]);
    
    // Count remaining tasks (excluding the one being removed)
    const remainingTasks = displayTasks.filter((task: TaskWithDetails) => 
      task.id !== taskId && !removingTaskIds.includes(task.id)
    );
    
    // Show appropriate celebration
    if (remainingTasks.length === 0) {
      // This was the last task
      setTimeout(() => showCelebration("all"), 600);
    } else {
      // Regular task completion
      setTimeout(() => showCelebration("single"), 300);
    }
    
    // Notify parent
    onToggleComplete?.(taskId, completed);
    
    // Configure smooth layout animation for list resize
    LayoutAnimation.configureNext({
      duration: 400,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      delete: {
        duration: 400,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, [displayTasks, removingTaskIds, onToggleComplete, showCelebration]);

  // Handle removal animation completion
  const handleRemovalComplete = useCallback((taskId: number) => {
    setRemovingTaskIds((prev: number[]) => prev.filter(id => id !== taskId));
    
    // Update display tasks
    setDisplayTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Check if we should show empty state
    const remainingTasks = displayTasks.filter((task: TaskWithDetails) => 
      task.id !== taskId && !removingTaskIds.includes(task.id)
    );
    
    if (remainingTasks.length === 0) {
      setTimeout(() => showEmptyState(), 200);
    }
  }, [displayTasks, removingTaskIds, showEmptyState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  // Show empty state if no tasks
  if (displayTasks.length === 0 && removingTaskIds.length === 0) {
    return (
      <Animated.View
        className="bg-background p-6 items-center rounded-xl"
        style={{
          opacity: emptyStateOpacity,
          transform: [{ scale: emptyStateScale }],
        }}
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
    const groupedTasks = displayTasks.reduce<Record<string, TaskWithDetails[]>>(
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
                  isRemoving={removingTaskIds.includes(task.id)}
                  onRemovalComplete={handleRemovalComplete}
                />
                {index < gardenTasks.length - 1 && (
                  <View className="h-[1px] bg-cream-200 mx-4" />
                )}
              </React.Fragment>
            ))}
            {gardenTasks.length > (maxTasks || gardenTasks.length) && (
              <Text className="text-sm text-cream-600 font-paragraph p-4">
                +{gardenTasks.length - (maxTasks || 0)} more {gardenTasks.length - (maxTasks || 0) === 1 ? 'task' : 'tasks'}
              </Text>
            )}
          </View>
        ))}
        {renderCelebration()}
      </View>
    );
  }

  // Render regular task list
  const tasksToShow = displayTasks.slice(0, maxTasks);
  
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
            isRemoving={removingTaskIds.includes(task.id)}
            onRemovalComplete={handleRemovalComplete}
          />
          {index < tasksToShow.length - 1 && (
            <View className="h-[1px] bg-cream-200 mx-4" />
          )}
        </React.Fragment>
      ))}
      
      {displayTasks.length > (maxTasks || displayTasks.length) && (
        <Text className="text-sm text-cream-600 font-paragraph p-4">
          +{displayTasks.length - (maxTasks || 0)} more {displayTasks.length - (maxTasks || 0) === 1 ? 'task' : 'tasks'}
        </Text>
      )}
      
      {renderCelebration()}
    </View>
  );

  // Render celebration overlay
  function renderCelebration() {
    if (!celebrationVisible) return null;

    return (
      <Animated.View
        className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center rounded-xl z-50"
        style={{
          opacity: celebrationOpacity,
          transform: [{ scale: celebrationScale }],
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        {celebrationType === "all" ? (
          <View className="items-center px-4 py-6 max-w-[280px]">
            <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-4 shadow-sm">
              <Ionicons name="trophy" size={36} color="#5E994B" />
            </View>
            <Text className="text-xl font-title font-bold text-brand-700 text-center mb-2">
              Amazing work!
            </Text>
            <Text className="text-sm font-paragraph text-brand-600 text-center">
              You've completed all your {isOverdue ? 'overdue ' : ''}tasks
            </Text>
          </View>
        ) : (
          <View className="items-center px-4 py-4 max-w-[280px]">
            <View className="w-14 h-14 rounded-full bg-brand-100 items-center justify-center mb-3 shadow-sm">
              <Ionicons name="checkmark-circle" size={32} color="#5E994B" />
            </View>
            <Text className="text-lg font-title font-bold text-brand-700 text-center mb-1">
              Well done!
            </Text>
            <Text className="text-sm font-paragraph text-brand-600 text-center">
              Keep up the great work
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }
}
