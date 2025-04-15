import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  format,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  getMonth,
  getYear,
  setMonth,
} from "date-fns";
import { TaskWithDetails } from "@/types/garden";
import { useTasksForDate } from "@/lib/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { Task } from "@/components/Task";
import { useFocusEffect } from "expo-router";
import { TaskList } from "@/components/TaskList";
import { PageContainer } from "@/components/UI/PageContainer";
import AnimatedTransition from "@/components/UI/AnimatedTransition";

export default function CalendarScreen() {
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const queryClient = useQueryClient();

  // Animation values
  const weekSlideAnim = useRef(new Animated.Value(0)).current;
  const todayBounceAnim = useRef(new Animated.Value(1)).current;
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [previousDayIndex, setPreviousDayIndex] = useState<number | null>(null);
  const dayScaleAnims = useRef(
    Array(7)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;
  const tasksOpacity = useRef(new Animated.Value(0)).current;

  // Use the hook to fetch tasks for the selected date
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useTasksForDate(selectedDay, user?.id);

  // Add a state to track day change loading separately
  const [isDayChanging, setIsDayChanging] = useState(false);

  // Animate tasks loading
  useEffect(() => {
    if (!isLoading && tasks) {
      // Reset day changing state when data loads
      setIsDayChanging(false);

      Animated.timing(tasksOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      tasksOpacity.setValue(0);
    }
  }, [isLoading, tasks, tasksOpacity]);

  // Function to safely change the selected day with proper animation
  const handleDayChange = (day: Date, index: number) => {
    // Don't do anything if it's the same day
    if (isSameDay(day, selectedDay)) return;

    // Set day changing state to true
    setIsDayChanging(true);

    // Immediately fade out tasks when changing days
    tasksOpacity.setValue(0);

    // Only after tasks are hidden, change the day and animate the selection
    setSelectedDay(day);
    animateDaySelection(index);
  };

  // Refetch tasks when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        // Invalidate task queries to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
        refetch();
      }
    }, [refetch, queryClient, user?.id])
  );

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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["tasks", format(selectedDay, "yyyy-MM-dd"), user?.id],
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData([
        "tasks",
        format(selectedDay, "yyyy-MM-dd"),
        user?.id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["tasks", format(selectedDay, "yyyy-MM-dd"), user?.id],
        (old: TaskWithDetails[] | undefined) =>
          old?.map((task) => (task.id === id ? { ...task, completed } : task))
      );

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", format(selectedDay, "yyyy-MM-dd"), user?.id],
          context.previousTasks
        );
      }
      console.error("Error updating task:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({
        queryKey: ["tasks", format(selectedDay, "yyyy-MM-dd"), user?.id],
      });
    },
  });

  // Function to handle marking a task as complete
  const handleToggleComplete = async (id: number) => {
    const taskToUpdate = tasks?.find((task) => task.id === id);
    if (!taskToUpdate) return;

    // Execute the mutation with optimistic updates
    toggleTaskMutation.mutate({
      id,
      completed: !taskToUpdate.completed,
    });
  };

  // Generate days for the week view
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStartDate, i));
    }
    return days;
  }, [weekStartDate]);

  // Animation for week navigation
  const animateWeekChange = (direction: "left" | "right") => {
    // Set direction for slide animation
    setSlideDirection(direction);

    // Start with the slide in the appropriate direction
    weekSlideAnim.setValue(direction === "left" ? -1 : 1);

    // Animate sliding in from the direction
    Animated.timing(weekSlideAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Fade out tasks while changing week
    Animated.timing(tasksOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  // Function to animate day selection
  const animateDaySelection = (index: number) => {
    // Scale down all day buttons first
    dayScaleAnims.forEach((anim, i) => {
      if (i !== index) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
    });

    // Then bounce the selected day
    Animated.sequence([
      Animated.timing(dayScaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(dayScaleAnims[index], {
        toValue: 1.1,
        duration: 150,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(dayScaleAnims[index], {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Store current index for next animation
    setPreviousDayIndex(index);
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    // Fade out tasks immediately when changing weeks
    tasksOpacity.setValue(0);

    animateWeekChange("right");
    setWeekStartDate(subWeeks(weekStartDate, 1));
  };

  const goToNextWeek = () => {
    // Fade out tasks immediately when changing weeks
    tasksOpacity.setValue(0);

    animateWeekChange("left");
    setWeekStartDate(addWeeks(weekStartDate, 1));
  };

  const goToToday = () => {
    const today = new Date();

    // Fade out tasks immediately
    tasksOpacity.setValue(0);

    // Find direction to animate
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });
    const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 });

    // Determine animation direction based on target date
    if (todayWeekStart > currentWeekStart) {
      animateWeekChange("left");
    } else if (todayWeekStart < currentWeekStart) {
      animateWeekChange("right");
    }

    // Apply bounce animation to today button
    Animated.sequence([
      Animated.timing(todayBounceAnim, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(todayBounceAnim, {
        toValue: 1.1,
        duration: 150,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(todayBounceAnim, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(todayBounceAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedDay(today);
    setWeekStartDate(startOfWeek(today, { weekStartsOn: 0 }));
  };

  // Month selection
  const months = useMemo(() => {
    const currentYear = getYear(selectedDay);
    return Array.from({ length: 12 }, (_, i) => ({
      label: format(new Date(currentYear, i), "MMMM yyyy"),
      value: i,
    }));
  }, [selectedDay]);

  const selectMonth = (monthIndex: number) => {
    // Fade out tasks immediately
    tasksOpacity.setValue(0);

    const newDate = setMonth(selectedDay, monthIndex);

    // Determine animation direction based on selected month
    if (monthIndex > getMonth(selectedDay)) {
      animateWeekChange("left");
    } else if (monthIndex < getMonth(selectedDay)) {
      animateWeekChange("right");
    }

    setSelectedDay(newDate);
    setWeekStartDate(startOfWeek(newDate, { weekStartsOn: 0 }));
    setIsMonthPickerVisible(false);
  };

  // Group tasks by garden
  const groupedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return {};

    return tasks.reduce<Record<string, TaskWithDetails[]>>((acc, task) => {
      const gardenName = task.plant?.garden?.name || "Unknown Garden";
      if (!acc[gardenName]) {
        acc[gardenName] = [];
      }
      acc[gardenName].push(task);
      return acc;
    }, {});
  }, [tasks]);

  // Handle initial animation
  useEffect(() => {
    if (isFirstLoad) {
      weekSlideAnim.setValue(0); // Start at 0 for no initial animation
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, weekSlideAnim]);

  return (
    <PageContainer scroll={false} padded={false}>
      {/* Header */}
      <View className="px-5 pt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-foreground">
            Calendar of Care
          </Text>
          <TouchableOpacity
            onPress={() => setIsMonthPickerVisible(true)}
            className="flex-row items-center bg-brand-50 px-3 py-1 rounded-lg border border-brand-100"
          >
            <Text className="text-brand-600 font-medium mr-1">
              {format(selectedDay, "MMMM yyyy")}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Navigation */}
      <View className="px-5 flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={goToPreviousWeek} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: todayBounceAnim }] }}>
          <TouchableOpacity
            onPress={goToToday}
            className="flex-row items-center px-3 py-1 rounded-lg bg-brand-50 border border-brand-100"
          >
            <Ionicons
              name="calendar"
              size={16}
              color="#059669"
              className="mr-1"
            />
            <Text className="text-brand-600 font-medium">Today</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={goToNextWeek} className="p-2">
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      <View className="px-5">
        <Animated.View
          className="flex-row justify-between mb-6"
          style={{
            transform: [
              {
                translateX: weekSlideAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ["-5%", "0%", "5%"],
                }),
              },
            ],
            opacity: weekSlideAnim.interpolate({
              inputRange: [-1, -0.8, 0, 0.8, 1],
              outputRange: [0, 1, 1, 1, 0],
            }),
          }}
        >
          {weekDays.map((day, index) => (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale: dayScaleAnims[index] }],
              }}
            >
              <TouchableOpacity
                className={`items-center justify-center w-12 h-16 rounded-lg ${
                  isSameDay(day, selectedDay)
                    ? "bg-brand-500 border border-brand-600"
                    : isSameDay(day, new Date())
                    ? "bg-brand-100 border border-brand-200"
                    : "bg-cream-50 border border-cream-300"
                }`}
                onPress={() => handleDayChange(day, index)}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSameDay(day, selectedDay)
                      ? "text-white"
                      : isSameDay(day, new Date())
                      ? "text-brand-600"
                      : "text-cream-500"
                  }`}
                >
                  {format(day, "EEE")}
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    isSameDay(day, selectedDay)
                      ? "text-white"
                      : isSameDay(day, new Date())
                      ? "text-brand-600"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Tasks Section */}
      <View className="px-5 mb-4">
        <Text className="text-lg font-semibold text-foreground">
          Care Tasks
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {isLoading || isDayChanging ? (
          <View className="flex-1 items-center justify-center">
            <AnimatedTransition initialY={5} duration={300}>
              <LoadingSpinner message="Loading tasks..." />
            </AnimatedTransition>
          </View>
        ) : isError ? (
          <View className="bg-red-50 rounded-xl p-8 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-red-500 mt-4 text-center">
              Error loading tasks. Please try again.
            </Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: tasksOpacity }}>
            <TaskList
              key={format(selectedDay, "yyyy-MM-dd")} // Force remount when day changes
              tasks={tasks || []}
              onToggleComplete={handleToggleComplete}
              showGardenName={false}
              groupByGarden={true}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={isMonthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMonthPickerVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsMonthPickerVisible(false)}
        >
          <View className="flex-1 justify-center px-5">
            <View className="bg-cream-50 border border-cream-300 rounded-xl p-4">
              <Text className="text-lg font-semibold text-foreground border-b border-cream-300 pb-4">
                Select Month
              </Text>
              <ScrollView className="max-h-80">
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`py-3 px-4 rounded-lg ${
                      getMonth(selectedDay) === month.value
                        ? "bg-brand-50"
                        : "bg-transparent"
                    }`}
                    onPress={() => selectMonth(month.value)}
                  >
                    <Text
                      className={`${
                        getMonth(selectedDay) === month.value
                          ? "text-brand-600 font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </PageContainer>
  );
}
