import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGardenDashboard, useTasksForDate } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();

  // Initialize Supabase with Clerk token
  useSupabaseAuth();

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get personalized message based on garden stats
  const getPersonalizedMessage = () => {
    if (!gardens || gardens.length === 0)
      return "Let's start your plant journey today!";

    if (gardenStats.plantsNeedingCare > 0)
      return `You have ${gardenStats.plantsNeedingCare} plants that could use your attention today.`;

    if (todaysTasks && todaysTasks.length > 0)
      return `You have ${todaysTasks.length} tasks planned for today.`;

    return "Your garden is looking great today!";
  };

  // Format today's date in a nice way
  const formattedDate = format(new Date(), "EEEE, MMMM d");

  // Fetch garden dashboard data
  const {
    data: gardens,
    isLoading: gardensLoading,
    error: gardensError,
  } = useGardenDashboard(user?.id);

  // Fetch today's tasks
  const today = new Date();
  const {
    data: todaysTasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasksForDate(today, user?.id);

  // Calculate garden stats from actual data
  const gardenStats = useMemo(() => {
    if (!gardens || gardens.length === 0)
      return {
        totalGardens: 0,
        totalPlants: 0,
        plantsNeedingCare: 0,
        healthPercentage: 0,
      };

    let totalPlants = 0;
    let plantsNeedingCare = 0;

    gardens.forEach((garden) => {
      totalPlants += garden.total_plants || 0;
      plantsNeedingCare += garden.plants_needing_care || 0;
    });

    return {
      totalGardens: gardens.length,
      totalPlants,
      plantsNeedingCare,
      healthPercentage:
        totalPlants > 0
          ? Math.round(((totalPlants - plantsNeedingCare) / totalPlants) * 100)
          : 0,
    };
  }, [gardens]);

  // Function to handle marking a task as complete
  const handleCompleteTask = useCallback(
    async (taskId: number) => {
      try {
        const taskToUpdate = todaysTasks?.find((task) => task.id === taskId);
        if (!taskToUpdate) return;

        const { error } = await supabase
          .from("plant_tasks")
          .update({ completed: !taskToUpdate.completed })
          .eq("id", taskId);

        if (error) throw error;

        // Refetch tasks to update UI
        refetchTasks();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    [todaysTasks, refetchTasks]
  );

  const isLoading = gardensLoading || tasksLoading;
  const hasError = gardensError || tasksError;

  // Get a random tip from the collection
  const tips = [
    {
      title: "Watering Basics",
      content:
        "Most houseplants need to be watered when the top inch of soil feels dry to the touch.",
    },
    {
      title: "Light Requirements",
      content:
        "Pay attention to your plant's light needs. Most plants prefer bright, indirect light.",
    },
    {
      title: "Seasonal Care",
      content:
        "Remember to adjust your care routine seasonally. Plants typically need less water in winter.",
    },
    {
      title: "Repotting",
      content:
        "Most plants benefit from repotting every 12-18 months with fresh soil to replenish nutrients.",
    },
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  if (isLoading && !gardens && !todaysTasks) {
    return <LoadingSpinner message="Loading your garden..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ScrollView className="flex-1">
          <View className="px-5 pt-5">
            <Text className="text-2xl font-bold text-foreground mb-2">
              {getTimeOfDay()}, {user?.firstName}
            </Text>
            <Text className="text-base text-foreground opacity-70 mb-1">
              Welcome to The GreenThumb!
            </Text>
            <Text className="text-sm text-brand-600 mb-4">{formattedDate}</Text>
            <View className="mb-4 bg-brand-50 p-3 rounded-lg border border-brand-100">
              <Text className="text-sm text-brand-700">
                {getPersonalizedMessage()}
              </Text>
            </View>

            {/* Garden Stats */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <Text className="text-sm font-medium text-cream-600 mb-3">
                Gardens Overview
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-brand-600">
                    {gardenStats.totalGardens}
                  </Text>
                  <Text className="text-xs text-cream-500">Gardens</Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-brand-600">
                    {gardenStats.totalPlants}
                  </Text>
                  <Text className="text-xs text-cream-500">Plants</Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-destructive">
                    {gardenStats.plantsNeedingCare}
                  </Text>
                  <Text className="text-xs text-cream-500">Need Care</Text>
                </View>

                <View className="items-center">
                  <Text
                    className={`text-2xl font-bold ${
                      gardenStats.healthPercentage >= 80
                        ? "text-brand-600"
                        : gardenStats.healthPercentage >= 50
                        ? "text-accent-600"
                        : "text-destructive"
                    }`}
                  >
                    {gardenStats.healthPercentage}%
                  </Text>
                  <Text className="text-xs text-cream-500">Health</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reminders Section */}
          <View className="px-5 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Today's Tasks
              </Text>
              <TouchableOpacity onPress={() => router.push("/(home)/calendar")}>
                <Text className="text-sm text-brand-600 font-medium">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {hasError ? (
              <View className="bg-red-50 rounded-xl p-4 items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#ef4444"
                />
                <Text className="text-red-500 mt-2 text-center">
                  Error loading tasks
                </Text>
              </View>
            ) : todaysTasks && todaysTasks.length > 0 ? (
              <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                {todaysTasks.slice(0, 3).map((task, index) => (
                  <View
                    key={task.id}
                    className={`p-4 flex-row items-center justify-between ${
                      index < Math.min(todaysTasks.length - 1, 2)
                        ? "border-b border-cream-100"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <TouchableOpacity
                        className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center ${
                          task.completed
                            ? "bg-brand-500 border-brand-500"
                            : "border-cream-300"
                        }`}
                        onPress={() => handleCompleteTask(task.id)}
                      >
                        {task.completed && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </TouchableOpacity>
                      <View className="flex-1">
                        <Text
                          className={`text-base font-medium ${
                            task.completed
                              ? "text-cream-400 line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.task_type} {task.plant?.nickname}
                        </Text>
                        <Text className="text-xs text-cream-500">
                          {task.plant?.garden?.name} •{" "}
                          {format(new Date(task.due_date), "h:mm a")}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                {todaysTasks.length > 3 && (
                  <TouchableOpacity
                    className="p-3 bg-cream-50 items-center"
                    onPress={() => router.push("/(home)/calendar")}
                  >
                    <Text className="text-brand-600 font-medium">
                      +{todaysTasks.length - 3} more tasks
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="bg-cream-50 rounded-xl p-6 items-center border border-brand-100">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="#77B860"
                />
                <Text className="text-base text-cream-600 mt-2 text-center">
                  All done for today!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="px-5 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <TouchableOpacity
                className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4 shadow-sm border border-brand-100"
                onPress={() => router.push("/(home)/plants")}
              >
                <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center mb-2">
                  <Ionicons name="leaf-outline" size={24} color="#5E994B" />
                </View>
                <Text className="text-sm font-medium text-foreground">
                  Browse Plants
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4 shadow-sm border border-blue-100"
                onPress={() => router.push("/(home)/gardens/new")}
              >
                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                  <Ionicons name="grid-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="text-sm font-medium text-foreground">
                  New Garden
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-xl p-4 items-center justify-center w-[48%] shadow-sm border border-amber-100"
                onPress={() => router.push("/(home)/calendar")}
              >
                <View className="w-12 h-12 rounded-full bg-amber-50 items-center justify-center mb-2">
                  <Ionicons name="calendar-outline" size={24} color="#d97706" />
                </View>
                <Text className="text-sm font-medium text-foreground">
                  Calendar of Care
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-xl p-4 items-center justify-center w-[48%] shadow-sm border border-purple-100"
                onPress={() => router.push("/(home)/gardens")}
              >
                <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-2">
                  <Ionicons name="eye-outline" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-sm font-medium text-foreground">
                  View Gardens
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plant Care Tip */}
          <View className="px-5 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Plant Care Tip
              </Text>
            </View>
            <View className="bg-cream-50 rounded-xl p-5">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="bulb-outline"
                  size={20}
                  color="#059669"
                  className="mr-2"
                />
                <Text className="text-base font-medium text-foreground ml-1">
                  {randomTip.title}
                </Text>
              </View>
              <Text className="text-sm text-foreground opacity-70">
                {randomTip.content}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-foreground opacity-80 text-center mb-8">
            You need to sign in to access this page
          </Text>
          <View className="w-full gap-4">
            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center"
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              <Text className="text-primary-foreground font-bold text-base">
                Sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-transparent border border-primary py-4 rounded-lg items-center"
              onPress={() => router.replace("/(auth)/sign-up")}
            >
              <Text className="text-primary font-bold text-base">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}
