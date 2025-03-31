import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect } from "react";
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

export default function CalendarScreen() {
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const queryClient = useQueryClient();

  // Use the hook to fetch tasks for the selected date
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useTasksForDate(selectedDay, user?.id);

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

  // Refetch tasks when the selected day changes or when user changes
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [selectedDay, user?.id, refetch]);

  // Generate days for the week view
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStartDate, i));
    }
    return days;
  }, [weekStartDate]);

  // Navigation functions
  const goToPreviousWeek = () => setWeekStartDate(subWeeks(weekStartDate, 1));
  const goToNextWeek = () => setWeekStartDate(addWeeks(weekStartDate, 1));
  const goToToday = () => {
    const today = new Date();
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
    const newDate = setMonth(selectedDay, monthIndex);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
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

        <TouchableOpacity onPress={goToNextWeek} className="p-2">
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      <View className="px-5">
        <View className="flex-row justify-between mb-6">
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              className={`items-center justify-center w-12 h-16 rounded-lg ${
                isSameDay(day, selectedDay)
                  ? "bg-brand-500 border border-brand-600"
                  : isSameDay(day, new Date())
                  ? "bg-brand-100 border border-brand-200"
                  : "bg-cream-50 border border-cream-300"
              }`}
              onPress={() => setSelectedDay(day)}
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
          ))}
        </View>
      </View>

      {/* Tasks Section */}
      <View className="px-5 mb-4">
        <Text className="text-lg font-semibold text-foreground">
          Care Tasks
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <LoadingSpinner message="Loading tasks..." />
          </View>
        ) : isError ? (
          <View className="bg-red-50 rounded-xl p-8 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-red-500 mt-4 text-center">
              Error loading tasks. Please try again.
            </Text>
          </View>
        ) : !tasks?.length ? (
          <View className="bg-cream-50 border border-cream-300 rounded-xl p-8 items-center justify-center">
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text className="text-base text-cream-500 mt-4 text-center">
              No care tasks for this day
            </Text>
          </View>
        ) : (
          Object.entries(groupedTasks).map(([gardenName, gardenTasks]) => (
            <View key={gardenName} className="mb-6">
              <Text className="text-sm font-medium text-cream-600 mb-2">
                {gardenName}
              </Text>
              <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                {gardenTasks.map((task, index) => (
                  <View
                    key={task.id}
                    className={
                      index < gardenTasks.length - 1
                        ? "border-b border-cream-100"
                        : ""
                    }
                  >
                    <Task
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      showGardenName={false}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))
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
    </SafeAreaView>
  );
}
