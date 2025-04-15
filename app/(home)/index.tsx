import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGardenDashboard, useTasksForDate } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  format,
  isAfter,
  isBefore,
  isTomorrow,
  startOfDay,
  isToday,
  subDays,
} from "date-fns";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskWithDetails } from "@/types/garden";
import { Task } from "@/components/Task";
import { useFocusEffect } from "expo-router";
import { TaskList } from "@/components/TaskList";
import { LinearGradient } from "expo-linear-gradient";
import { PageContainer } from "@/components/UI/PageContainer";
import AnimatedProgressBar from "../../components/UI/AnimatedProgressBar";
import GardenCard from "../../components/Gardens/GardenCard";

// Create a reusable section header component with icon
function SectionHeader({
  title,
  icon,
  onSeeAll,
  seeAllText = "See All",
  showSeeAll = true,
  badge,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onSeeAll?: () => void;
  seeAllText?: string;
  showSeeAll?: boolean;
  badge?: { count: number; type: "warning" | "info" } | null;
}) {
  // Create a subtle animation when the component mounts
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      className="flex-row justify-between items-center mb-4"
      style={{ opacity: fadeAnim }}
    >
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center">
          <Ionicons name={icon} size={18} color="#5E994B" />
        </View>
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>

          {/* Show badge if provided */}
          {badge && badge.count > 0 && (
            <View
              className={`ml-2 py-1 px-2 rounded-full ${
                badge.type === "warning" ? "bg-orange-100" : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  badge.type === "warning" ? "text-orange-600" : "text-blue-600"
                }`}
              >
                {badge.count}
              </Text>
            </View>
          )}
        </View>
      </View>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          className="flex-row items-center gap-2"
        >
          <Text className="text-sm text-brand-600 font-medium">
            {seeAllText}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#77B860" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// AnimatedSection component to replace MotiView
function AnimatedSection({
  children,
  delay = 200,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const translateY = useRef(new Animated.Value(10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Animation references
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Initialize Supabase with Clerk token
  useSupabaseAuth();

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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

  // Fetch tomorrow's tasks
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  const { data: tomorrowTasks } = useTasksForDate(tomorrow, user?.id);

  // Check for overdue tasks (tasks from yesterday or earlier that aren't completed)
  const yesterday = useMemo(() => subDays(startOfDay(new Date()), 1), []);
  const { data: yesterdayTasks } = useTasksForDate(yesterday, user?.id);

  // Count of overdue and upcoming tasks for badges
  const overdueTasks = useMemo(() => {
    return yesterdayTasks?.filter((task) => !task.completed) || [];
  }, [yesterdayTasks]);

  const upcomingTasksCount = useMemo(() => {
    return tomorrowTasks?.length || 0;
  }, [tomorrowTasks]);

  // Trigger header animation when data is loaded
  useEffect(() => {
    if (!gardensLoading && !tasksLoading) {
      Animated.parallel([
        Animated.timing(headerScaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gardensLoading, tasksLoading, headerScaleAnim, headerOpacityAnim]);

  // Refresh tasks when the home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        // Invalidate task queries to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
        refetchTasks();
      }
    }, [refetchTasks, queryClient, user?.id])
  );

  // Get personalized message based on garden stats
  const getPersonalizedMessage = () => {
    if (!gardens || gardens.length === 0)
      return "Let's start your plant journey today!";

    // Overdue tasks take priority in messaging
    if (overdueTasks.length > 0)
      return `You have ${overdueTasks.length} overdue ${
        overdueTasks.length === 1 ? "task" : "tasks"
      } that need attention.`;

    // Plants
    if (gardenStats.plantsNeedingCare === 1)
      return `You have ${gardenStats.plantsNeedingCare} plant that could use your attention today.`;
    if (gardenStats.plantsNeedingCare > 1)
      return `You have ${gardenStats.plantsNeedingCare} plants that could use your attention today.`;

    // Tasks
    if (todaysTasks && todaysTasks.length === 1)
      return `You have ${todaysTasks.length} task planned for today.`;
    if (todaysTasks && todaysTasks.length > 1)
      return `You have ${todaysTasks.length} tasks planned for today.`;

    return "Your garden is looking great today!";
  };

  // Format today's date in a nice way
  const formattedDate = format(new Date(), "EEEE, MMMM d");

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
        queryKey: ["tasks", format(today, "yyyy-MM-dd"), user?.id],
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData([
        "tasks",
        format(today, "yyyy-MM-dd"),
        user?.id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["tasks", format(today, "yyyy-MM-dd"), user?.id],
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
          ["tasks", format(today, "yyyy-MM-dd"), user?.id],
          context.previousTasks
        );
      }
      console.error("Error updating task:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({
        queryKey: ["tasks", format(today, "yyyy-MM-dd"), user?.id],
      });
    },
  });

  // Function to handle marking a task as complete
  const handleCompleteTask = useCallback(
    async (taskId: number) => {
      const taskToUpdate = todaysTasks?.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      // Execute the mutation with optimistic updates
      toggleTaskMutation.mutate({
        id: taskId,
        completed: !taskToUpdate.completed,
      });
    },
    [todaysTasks, toggleTaskMutation]
  );

  const isLoading = gardensLoading || tasksLoading;
  const hasError = gardensError || tasksError;

  if (isLoading && !gardens && !todaysTasks) {
    return <LoadingSpinner message="Loading your garden..." />;
  }

  // Get personalized suggestions for when all tasks are done
  const getPersonalizedSuggestion = () => {
    if (!gardens || gardens.length === 0) {
      return {
        text: "Start your gardening journey by creating your first garden!",
        action: "Create Garden",
        route: "/(home)/gardens/new" as const,
      };
    }

    if (gardenStats.totalPlants === 0) {
      return {
        text: "Add your first plant to start tracking its care",
        action: "Add Plants",
        route: "/(home)/plants" as const,
      };
    }

    const suggestions = [
      {
        text: "Browse the plant database for new additions to your garden",
        action: "Browse Plants",
        route: "/(home)/plants" as const,
      },
      {
        text: "Explore your garden's performance over time",
        action: "View Gardens",
        route: "/(home)/gardens" as const,
      },
      {
        text: "Check your upcoming care schedule",
        action: "View Calendar",
        route: "/(home)/calendar" as const,
      },
    ] as const;

    // Randomly select a suggestion
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // Helper function to determine task badges
  const getTasksBadge = () => {
    const overdueCount = overdueTasks.length;
    if (overdueCount > 0) {
      return { count: overdueCount, type: "warning" as const };
    }
    if (upcomingTasksCount > 0) {
      return { count: upcomingTasksCount, type: "info" as const };
    }
    return null;
  };

  // Get summary for when there are no tasks today
  const getNoTasksSummary = () => {
    if (overdueTasks.length > 0) {
      return {
        icon: "alert-circle-outline" as const,
        color: "#ef4444",
        text: `You have ${overdueTasks.length} overdue ${
          overdueTasks.length === 1 ? "task" : "tasks"
        }`,
        action: "View Overdue",
        actionColor: "#ef4444",
      };
    }

    if (upcomingTasksCount > 0) {
      return {
        icon: "calendar-outline" as const,
        color: "#3b82f6",
        text: `${upcomingTasksCount} ${
          upcomingTasksCount === 1 ? "task" : "tasks"
        } coming up tomorrow`,
        action: "View Upcoming",
        actionColor: "#3b82f6",
      };
    }

    return null;
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <SignedIn>
        <ScrollView className="flex-1">
          <View className="px-5 pt-5">
            {/* Header with Gradient */}
            <Animated.View
              className="mb-6 rounded-xl overflow-hidden shadow-md"
              style={{
                opacity: headerOpacityAnim,
                transform: [{ scale: headerScaleAnim }],
                shadowColor: "#333333",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={
                  overdueTasks.length > 0
                    ? ["#ef4444", "#f87171"]
                    : ["#3F6933", "#77B860"]
                } // Red gradient for overdue tasks
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 24, borderRadius: 12 }}
              >
                <Text className="text-3xl font-bold text-primary-foreground mb-2">
                  {getTimeOfDay()}, {user?.firstName}
                </Text>
                <Text className="text-lg text-primary-foreground mb-3">
                  {getPersonalizedMessage()}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar" size={16} color="#fffefa" />
                  <Text className="text-sm text-primary-foreground">
                    {formattedDate}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* TODAY'S TASKS SECTION (Now first) */}
            <View className="mb-6">
              <SectionHeader
                title={
                  overdueTasks.length > 0 ? "Missed Tasks" : "Today's Tasks"
                }
                icon={overdueTasks.length > 0 ? "alert-circle" : "calendar"}
                onSeeAll={() => router.push("/(home)/calendar")}
                badge={getTasksBadge()}
              />

              {hasError ? (
                <View className="bg-red-50 rounded-xl p-4 items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color="#ef4444"
                  />
                  <Text className="text-destructive mt-2 text-center">
                    Error loading tasks
                  </Text>
                </View>
              ) : overdueTasks.length > 0 ? (
                <AnimatedSection delay={200}>
                  <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
                    <Text className="text-red-700 font-medium mb-2">
                      You have {overdueTasks.length} missed{" "}
                      {overdueTasks.length === 1 ? "task" : "tasks"}!
                    </Text>
                    <Text className="text-red-600 text-sm">
                      These tasks were due yesterday or earlier and still need
                      to be completed.
                    </Text>
                  </View>
                  <TaskList
                    tasks={overdueTasks}
                    onToggleComplete={handleCompleteTask}
                    showGardenName={true}
                    maxTasks={3}
                    isOverdue={true}
                  />
                  {overdueTasks.length > 3 && (
                    <TouchableOpacity
                      className="p-3 bg-white items-center mt-2 rounded-xl border border-red-200 shadow-sm"
                      onPress={() => router.push("/(home)/calendar")}
                    >
                      <Text className="text-red-600 font-medium">
                        +{overdueTasks.length - 3} more missed tasks
                      </Text>
                    </TouchableOpacity>
                  )}
                </AnimatedSection>
              ) : todaysTasks && todaysTasks.length > 0 ? (
                <AnimatedSection delay={200}>
                  <TaskList
                    tasks={todaysTasks}
                    onToggleComplete={handleCompleteTask}
                    showGardenName={true}
                    maxTasks={3}
                  />
                  {todaysTasks.length > 3 && (
                    <TouchableOpacity
                      className="p-3 bg-white items-center mt-2 rounded-xl border border-brand-100 shadow-sm"
                      onPress={() => router.push("/(home)/calendar")}
                    >
                      <Text className="text-brand-600 font-medium">
                        +{todaysTasks.length - 3} more tasks
                      </Text>
                    </TouchableOpacity>
                  )}
                </AnimatedSection>
              ) : (
                <AnimatedSection delay={200}>
                  <View className="bg-white rounded-xl p-6 items-center border border-brand-100 shadow-sm">
                    {getNoTasksSummary() ? (
                      <>
                        <Ionicons
                          name={getNoTasksSummary()!.icon}
                          size={32}
                          color={getNoTasksSummary()!.color}
                        />
                        <Text className="text-base text-cream-700 mt-2 text-center mb-2">
                          No tasks for today
                        </Text>
                        <Text className="text-sm text-cream-600 text-center mb-3">
                          {getNoTasksSummary()!.text}
                        </Text>
                        <TouchableOpacity
                          className={`px-4 py-2 bg-white rounded-lg border border-${
                            getNoTasksSummary()!.color
                          }`}
                          onPress={() => router.push("/(home)/calendar")}
                        >
                          <Text
                            style={{
                              color: getNoTasksSummary()!.actionColor,
                            }}
                            className="font-medium"
                          >
                            {getNoTasksSummary()!.action}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={32}
                          color="#5E994B"
                        />
                        <Text className="text-base text-cream-700 mt-2 text-center mb-2">
                          All done for today!
                        </Text>

                        {/* Added personalized call-to-action */}
                        <Text className="text-sm text-cream-600 text-center mb-3">
                          {getPersonalizedSuggestion().text}
                        </Text>

                        <TouchableOpacity
                          className="px-4 py-2 bg-brand-50 rounded-lg border border-brand-200"
                          onPress={() =>
                            router.push(getPersonalizedSuggestion().route)
                          }
                        >
                          <Text className="text-brand-600 font-medium">
                            {getPersonalizedSuggestion().action}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </AnimatedSection>
              )}
            </View>

            {/* GARDEN STATS SECTION (Now second) */}
            <View className="mb-6">
              <SectionHeader
                title="Your Gardens"
                icon="leaf"
                onSeeAll={() => router.push("/(home)/gardens")}
              />

              <AnimatedSection delay={300}>
                <View className="flex-row flex-wrap gap-4">
                  {gardens && gardens.length > 0 ? (
                    <>
                      {gardens.slice(0, 2).map((garden) => (
                        <View
                          key={garden.garden_id}
                          className="flex-1 min-w-[45%] mb-4"
                        >
                          <GardenCard garden={garden} maxWidth={90} />
                        </View>
                      ))}

                      {/* New Garden Card */}
                      <View className="flex-1 min-w-[45%] mb-4">
                        <TouchableOpacity
                          className="flex-1 h-full border border-dashed border-primary rounded-xl p-4 items-center justify-center shadow-sm"
                          style={{
                            shadowColor: "#77B860",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                          onPress={() => router.push("/(home)/gardens/new")}
                        >
                          <View className="items-center">
                            <View className="w-10 h-10 items-center justify-center mb-2">
                              <Ionicons name="add" size={24} color="#5E994B" />
                            </View>
                            <Text className="text-primary font-medium">
                              New Garden
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      className="w-full border border-dashed border-cream-300 rounded-xl p-6 items-center shadow-sm"
                      style={{
                        shadowColor: "#77B860",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                      onPress={() => router.push("/(home)/gardens/new")}
                    >
                      <View className="items-center">
                        <View className="w-12 h-12 items-center justify-center mb-3">
                          <Ionicons name="add" size={28} color="#5E994B" />
                        </View>
                        <Text className="text-brand-600 font-medium mb-1">
                          Create Your First Garden
                        </Text>
                        <Text className="text-sm text-cream-700 text-center">
                          Start your plant journey today
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </AnimatedSection>
            </View>
          </View>

          {/* QUICK ACTIONS SECTION (Now last) */}
          <View className="px-5 mb-6">
            <SectionHeader
              title="Quick Actions"
              icon="flash"
              showSeeAll={false}
            />

            <AnimatedSection delay={400}>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4 shadow-sm border border-cream-300"
                  style={{
                    shadowColor: "#77B860",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/(home)/plants")}
                >
                  <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center mb-2">
                    <Ionicons name="leaf" size={24} color="#5E994B" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    Browse Plants
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white rounded-xl p-4 items-center justify-center w-[48%] mb-4 shadow-sm border border-cream-300"
                  style={{
                    shadowColor: "#77B860",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/(home)/gardens/new")}
                >
                  <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center mb-2">
                    <Ionicons name="grid" size={24} color="#5E994B" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    New Garden
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white rounded-xl p-4 items-center justify-center w-[48%] shadow-sm border border-cream-300"
                  style={{
                    shadowColor: "#77B860",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/(home)/calendar")}
                >
                  <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center mb-2">
                    <Ionicons name="calendar" size={24} color="#5E994B" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    Calendar of Care
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white rounded-xl p-4 items-center justify-center w-[48%] shadow-sm border border-cream-300"
                  style={{
                    shadowColor: "#77B860",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/(home)/gardens")}
                >
                  <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center mb-2">
                    <Ionicons name="eye" size={24} color="#5E994B" />
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    View Gardens
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedSection>
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
              className="bg-primary py-4 rounded-lg items-center shadow-sm"
              style={{
                shadowColor: "#77B860",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 2,
              }}
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
    </PageContainer>
  );
}
