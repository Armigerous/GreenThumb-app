import { TaskList } from "@/components/TaskList";
import AnimatedTransition from "@/components/UI/AnimatedTransition";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, SubtitleText, BodyText, Text } from "@/components/UI/Text";
import { useTasksForDate, getTasksForDate } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { TaskWithDetails } from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addWeeks,
  format,
  getMonth,
  getYear,
  isSameDay,
  setMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function CalendarScreen() {
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  // Generate days for the week view - moved up to avoid reference before declaration
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStartDate, i));
    }
    return days;
  }, [weekStartDate]);

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

  // Helper function to prefetch tasks for a specific date
  const prefetchTasksForDate = useCallback(
    (date: Date) => {
      if (!user?.id) return;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Only prefetch if not already in cache or if data is not fresh
      const existingQuery = queryClient.getQueryState([
        "tasks",
        formattedDate,
        user.id,
      ]);

      if (
        !existingQuery ||
        existingQuery.status === "error" ||
        existingQuery.fetchStatus === "idle"
      ) {
        queryClient.prefetchQuery({
          queryKey: ["tasks", formattedDate, user.id],
          queryFn: () => getTasksForDate(date, user.id),
          staleTime: 1000 * 60 * 30, // Match the staleTime from useTasksForDate
        });
      }
    },
    [queryClient, user?.id]
  );

  // Helper function to prefetch tasks for a full week
  const prefetchWeekTasks = useCallback(
    (startDate: Date) => {
      if (!user?.id) return;

      // Prefetch entire week at once
      for (let i = 0; i < 7; i++) {
        const day = addDays(startDate, i);
        prefetchTasksForDate(day);
      }

      // Also prefetch the same day in adjacent weeks for smoother navigation
      const nextWeekDay = addWeeks(startDate, 1);
      const prevWeekDay = subWeeks(startDate, 1);

      prefetchTasksForDate(nextWeekDay);
      prefetchTasksForDate(prevWeekDay);
    },
    [user?.id, prefetchTasksForDate]
  );

  // Prefetch initial data when component mounts
  useEffect(() => {
    if (user?.id) {
      // Prefetch current week
      prefetchWeekTasks(weekStartDate);

      // Prefetch next and previous weeks
      prefetchWeekTasks(addWeeks(weekStartDate, 1));
      prefetchWeekTasks(subWeeks(weekStartDate, 1));
    }
  }, [user?.id, prefetchWeekTasks, weekStartDate]);

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

    // Check if we already have data for this day before invalidating
    const formattedDate = format(day, "yyyy-MM-dd");
    const existingQuery = queryClient.getQueryState([
      "tasks",
      formattedDate,
      user?.id,
    ]);

    // Only invalidate cache if no valid data exists
    if (!existingQuery || existingQuery.status === "error") {
      queryClient.invalidateQueries({
        queryKey: ["tasks", formattedDate, user?.id],
      });
    }

    // Always refetch to ensure we have the latest data
    refetch();
  };

  // Initial animation setup
  useEffect(() => {
    if (isFirstLoad) {
      weekSlideAnim.setValue(0); // Start at 0 for no initial animation

      // Ensure empty state is smooth on first load too
      if (tasks && tasks.length === 0) {
        // Already have data and it's empty, fade in the empty state
        tasksOpacity.setValue(0);
        setTimeout(() => {
          Animated.timing(tasksOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start();
        }, 300);
      }

      setIsFirstLoad(false);
    }
  }, [isFirstLoad, weekSlideAnim, tasks, tasksOpacity]);

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
      // Create formatted date string for consistent cache keys
      const formattedDate = format(selectedDay, "yyyy-MM-dd");
      const queryKey = ["tasks", formattedDate, user?.id];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: TaskWithDetails[] | undefined) =>
        old?.map((task) => (task.id === id ? { ...task, completed } : task))
      );

      // Return a context object with the snapshotted value
      return { previousTasks, queryKey };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }
      console.error("Error updating task:", err);
    },
    onSuccess: (data, variables, context) => {
      // On success, don't invalidate - our optimistic update is already correct
      // Just update the UI to show task completed successfully

      // If this is the last task in the date, make sure to refresh to properly show "no tasks" UI
      if (context?.queryKey && tasks && tasks.length === 1) {
        // Only refetch if this was the last task
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
        });
      }
    },
    onSettled: (data, error, variables, context) => {
      // Only do a background refetch after a delay to ensure data is consistent
      if (context?.queryKey) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: context.queryKey,
            refetchType: "all",
          });
        }, 1000);
      }
    },
  });

  // Function to handle marking a task as complete
  const handleToggleComplete = async (id: number, completed: boolean) => {
    const taskToUpdate = tasks?.find((task) => task.id === id);
    if (!taskToUpdate) return;

    // Execute the mutation with optimistic updates
    toggleTaskMutation.mutate({
      id,
      completed,
    });
  };

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
    // Set day changing state to true
    setIsDayChanging(true);

    // Fade out tasks immediately when changing weeks
    tasksOpacity.setValue(0);

    animateWeekChange("right");

    // Update both the week start date and the selected day
    const newWeekStartDate = subWeeks(weekStartDate, 1);
    const newSelectedDay = subWeeks(selectedDay, 1);

    setWeekStartDate(newWeekStartDate);
    setSelectedDay(newSelectedDay);

    // Prefetch the previous week of tasks for smoother navigation
    prefetchWeekTasks(subWeeks(newWeekStartDate, 1));

    // No need to invalidate if we have the data already - just refetch
    const formattedDate = format(newSelectedDay, "yyyy-MM-dd");
    const existingQuery = queryClient.getQueryState([
      "tasks",
      formattedDate,
      user?.id,
    ]);

    // Only invalidate if we don't have valid data
    if (!existingQuery || existingQuery.status === "error") {
      queryClient.invalidateQueries({
        queryKey: ["tasks", formattedDate, user?.id],
      });
    }

    // Always refetch to ensure we have the latest data
    refetch();
  };

  const goToNextWeek = () => {
    // Set day changing state to true
    setIsDayChanging(true);

    // Fade out tasks immediately when changing weeks
    tasksOpacity.setValue(0);

    animateWeekChange("left");

    // Update both the week start date and the selected day
    const newWeekStartDate = addWeeks(weekStartDate, 1);
    const newSelectedDay = addWeeks(selectedDay, 1);

    setWeekStartDate(newWeekStartDate);
    setSelectedDay(newSelectedDay);

    // Prefetch the next week of tasks for smoother navigation
    prefetchWeekTasks(addWeeks(newWeekStartDate, 1));

    // No need to invalidate if we have the data already - just refetch
    const formattedDate = format(newSelectedDay, "yyyy-MM-dd");
    const existingQuery = queryClient.getQueryState([
      "tasks",
      formattedDate,
      user?.id,
    ]);

    // Only invalidate if we don't have valid data
    if (!existingQuery || existingQuery.status === "error") {
      queryClient.invalidateQueries({
        queryKey: ["tasks", formattedDate, user?.id],
      });
    }

    // Always refetch to ensure we have the latest data
    refetch();
  };

  const goToToday = () => {
    const today = new Date();
    const todayWeekStart = startOfWeek(today, { weekStartsOn: 0 });

    // Check if we're already viewing today - if so, don't do anything
    if (isSameDay(today, selectedDay)) {
      return;
    }

    // Set day changing state to true
    setIsDayChanging(true);

    // Fade out tasks immediately
    tasksOpacity.setValue(0);

    // Find direction to animate
    const currentWeekStart = startOfWeek(weekStartDate, { weekStartsOn: 0 });

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
    setWeekStartDate(todayWeekStart);

    // Prefetch adjacent weeks for today
    prefetchWeekTasks(addWeeks(todayWeekStart, 1));
    prefetchWeekTasks(subWeeks(todayWeekStart, 1));

    // Always invalidate today's data to ensure it's fresh
    // For today specifically, we want the latest data
    const formattedDate = format(today, "yyyy-MM-dd");
    queryClient.invalidateQueries({
      queryKey: ["tasks", formattedDate, user?.id],
    });
    refetch();
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
    // Set day changing state to true
    setIsDayChanging(true);

    // Fade out tasks immediately
    tasksOpacity.setValue(0);

    const newDate = setMonth(selectedDay, monthIndex);
    const newWeekStart = startOfWeek(newDate, { weekStartsOn: 0 });

    // Determine animation direction based on selected month
    if (monthIndex > getMonth(selectedDay)) {
      animateWeekChange("left");
    } else if (monthIndex < getMonth(selectedDay)) {
      animateWeekChange("right");
    }

    setSelectedDay(newDate);
    setWeekStartDate(newWeekStart);
    setIsMonthPickerVisible(false);

    // Prefetch this week and adjacent weeks for the new month
    prefetchWeekTasks(newWeekStart);
    prefetchWeekTasks(addWeeks(newWeekStart, 1));
    prefetchWeekTasks(subWeeks(newWeekStart, 1));

    // No need to invalidate if we have the data already - just refetch
    const formattedDate = format(newDate, "yyyy-MM-dd");
    const existingQuery = queryClient.getQueryState([
      "tasks",
      formattedDate,
      user?.id,
    ]);

    // Only invalidate if we don't have valid data
    if (!existingQuery || existingQuery.status === "error") {
      queryClient.invalidateQueries({
        queryKey: ["tasks", formattedDate, user?.id],
      });
    }

    // Always refetch to ensure we have the latest data
    refetch();
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

  return (
    <PageContainer scroll={false} padded={false}>
      {/* Header */}
      <View className="px-5 pt-5">
        <View className="flex-row justify-between items-center mb-4">
          <TitleText className="text-2xl text-foreground">
            Calendar of Care
          </TitleText>
          <TouchableOpacity
            onPress={() => setIsMonthPickerVisible(true)}
            className="flex-row items-center bg-brand-50 px-3 py-1 rounded-lg border border-brand-100"
          >
            <BodyText className="text-brand-600 mr-1">
              {format(selectedDay, "MMMM yyyy")}
            </BodyText>
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
            <BodyText className="text-brand-600">Today</BodyText>
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
                  className={`text-xs ${
                    isSameDay(day, selectedDay)
                      ? "text-white"
                      : isSameDay(day, new Date())
                      ? "text-brand-600"
                      : "text-cream-500"
                  }`}
                >
                  {format(day, "EEE")}
                </Text>
                <BodyText
                  className={`text-lg ${
                    isSameDay(day, selectedDay)
                      ? "text-white"
                      : isSameDay(day, new Date())
                      ? "text-brand-600"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </BodyText>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Tasks Section */}
      <View className="px-5 mb-4">
        <SubtitleText className="text-lg text-foreground">
          Care Tasks
        </SubtitleText>
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
            <BodyText className="text-red-500 mt-4 text-center">
              Error loading tasks. Please try again.
            </BodyText>
          </View>
        ) : (
          <Animated.View style={{ opacity: tasksOpacity }} className="flex-1">
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
              <SubtitleText className="text-lg text-foreground border-b border-cream-300 pb-4">
                Select Month
              </SubtitleText>
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
                    <BodyText
                      className={`${
                        getMonth(selectedDay) === month.value
                          ? "text-brand-600"
                          : "text-foreground"
                      }`}
                    >
                      {month.label}
                    </BodyText>
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
