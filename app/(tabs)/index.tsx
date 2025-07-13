import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useGardenDashboard, useTasksForDate } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useNavigationReady } from "@/lib/hooks/useNavigationReady";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskWithDetails } from "@/types/garden";

import { PageContainer } from "@/components/UI/PageContainer";
import { TaskCompletionCelebration } from "@/components/UI/TaskCompletionCelebration";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import type { OverdueTask } from "@/lib/hooks/useOverdueTasksNotifications";
import { useCurrentSeason } from "@/lib/hooks/useCurrentSeason";
import {
  HomeHeader,
  TasksSection,
  GardensSection,
  QuickActionsSection,
} from "@/components/Home";
import { BodyText } from "@/components/UI/Text";
import { useUsageSummary } from "@/lib/usageLimits";
import { PaywallBanner } from "@/components/subscription/PaywallPrompt";
import { SmartSubscriptionPrompt } from "@/components/subscription/SmartSubscriptionPrompt";
import { WelcomeSubscriptionBanner } from "@/components/subscription/WelcomeSubscriptionBanner";
import type { TaskType } from "@/types/garden";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Add this after imports and before the component
const CELEBRATION_DURATION = 4000; // 4 seconds

// Helper to map string to TaskType
const allowedTaskTypes: TaskType[] = [
  "Water",
  "Fertilize",
  "Prune",
  "Inspect",
  "Mulch",
  "Weed",
  "Propagate",
  "Transplant",
  "Log",
  "Winterize",
];
function toTaskType(taskType: string | null): TaskType {
  if (!taskType) return "Log";
  const normalized =
    taskType.charAt(0).toUpperCase() + taskType.slice(1).toLowerCase();
  if (allowedTaskTypes.includes(normalized as TaskType)) {
    return normalized as TaskType;
  }
  return "Log";
}

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use the new navigation readiness hook
  const navigationReady = useNavigationReady();

  // Usage tracking for subscription limits
  const usageSummary = useUsageSummary(user?.id);

  // Get current season for the seasonal illustration
  const currentSeason = useCurrentSeason();

  // State for task completion celebration
  const [showTaskCelebration, setShowTaskCelebration] = useState(false);
  const prevOverdueTaskCount = useRef<number | null>(null);

  // State to track if we just completed all overdue tasks
  const [justCompletedAllOverdueTasks, setJustCompletedAllOverdueTasks] =
    useState(false);
  const celebrationTimer = useRef<NodeJS.Timeout | null>(null);

  // Add a state to track if overdue tasks are still loading
  const [overdueTasksLoading, setOverdueTasksLoading] = useState(true);

  // State for welcome banner (shows for new users only)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Initialize Supabase with Clerk token
  useSupabaseAuth();

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

  // Use the same hook as our notification system for overdue tasks
  const [allOverdueTasks, setAllOverdueTasks] = useState<TaskWithDetails[]>([]);
  const {
    notifications,
    checkNotifications,
    loading: notificationsLoading,
    showModal,
    setShowModal,
  } = useOverdueTasksNotifications();
  const hasCheckedNotificationsRef = useRef(false);

  // Process all overdue tasks from notifications on mount and when notifications change
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Extract and flatten all tasks from all gardens
      const overdueTasksFromNotifications: TaskWithDetails[] = [];

      notifications.forEach((garden) => {
        if (garden.tasks && garden.tasks.length > 0) {
          garden.tasks.forEach((task: OverdueTask) => {
            // Map OverdueTask (from Supabase) to TaskWithDetails for UI compatibility
            overdueTasksFromNotifications.push({
              id: task.task_id, // Supabase returns task_id
              user_plant_id: "", // Not available in notification, set as empty string
              task_type: toTaskType(task.task_type),
              due_date: task.due_date,
              completed: false, // All tasks in notifications are uncompleted
              plant: {
                nickname: task.plant_nickname, // Directly from Supabase
                garden: {
                  name: garden.garden_name, // From parent garden notification
                },
              },
            });
          });
        }
      });

      setAllOverdueTasks(overdueTasksFromNotifications);
    } else {
      setAllOverdueTasks([]);
    }

    // Set overdue tasks as done loading when notifications change
    setOverdueTasksLoading(false);
  }, [notifications]);

  // Only fetch overdue tasks on initial mount, never again on this screen
  // User will need to navigate away and back to refresh data
  useEffect(() => {
    if (user?.id && !hasCheckedNotificationsRef.current) {
      setOverdueTasksLoading(true);
      checkNotifications();
      hasCheckedNotificationsRef.current = true;
    }
  }, [user?.id, checkNotifications]);

  // Check if user is new and should see welcome banner
  useEffect(() => {
    const checkNewUser = async () => {
      if (!user?.id) return;

      // Only show if user is not premium and has minimal gardens/usage
      if (!usageSummary.isPremium && usageSummary.gardens.current <= 1) {
        // Check if user signed up in the last 7 days
        const signupDate = user.createdAt;
        if (signupDate) {
          const signupTime =
            typeof signupDate === "number"
              ? signupDate
              : new Date(signupDate).getTime();
          const daysSinceSignup =
            (Date.now() - signupTime) / (1000 * 60 * 60 * 24);
          if (daysSinceSignup <= 7) {
            setShowWelcomeBanner(true);
          }
        }
      }
    };

    checkNewUser();
  }, [user, usageSummary.isPremium, usageSummary.gardens.current]);

  // Count of upcoming tasks for badges
  const upcomingTasksCount = useMemo(() => {
    return tomorrowTasks?.length || 0;
  }, [tomorrowTasks]);

  // Watch for when overdue tasks go from some to zero
  useEffect(() => {
    // If we had overdue tasks before, but now we don't, show celebration
    if (
      prevOverdueTaskCount.current !== null &&
      prevOverdueTaskCount.current > 0 &&
      allOverdueTasks.length === 0
    ) {
      setShowTaskCelebration(true);
      setJustCompletedAllOverdueTasks(true);

      // Clear any existing timer
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }

      // Automatically hide celebration after delay
      celebrationTimer.current = setTimeout(() => {
        setShowTaskCelebration(false);

        // Keep the "just completed" state for a bit longer to show special message
        setTimeout(() => {
          setJustCompletedAllOverdueTasks(false);
        }, 1000);
      }, CELEBRATION_DURATION);

      return () => {
        if (celebrationTimer.current) {
          clearTimeout(celebrationTimer.current);
        }
      };
    }

    // Update previous count
    prevOverdueTaskCount.current = allOverdueTasks.length;
  }, [allOverdueTasks.length]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  // Refresh tasks when the component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      // Invalidate task queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      refetchTasks();
    }
  }, [refetchTasks, queryClient, user?.id]);

  // Configure layout animation for task completion with smooth size transitions
  const configureLayoutAnimation = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 400,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
        duration: 300,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.85,
        initialVelocity: 0.1,
        property: LayoutAnimation.Properties.scaleXY,
        duration: 400,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
        duration: 250,
      },
    });
  }, []);

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
      // Configure layout animation before state updates
      configureLayoutAnimation();

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
      // Configure layout animation before state updates
      configureLayoutAnimation();

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
      // Configure layout animation before state updates
      configureLayoutAnimation();

      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({
        queryKey: ["tasks", format(today, "yyyy-MM-dd"), user?.id],
      });

      // Invalidate garden dashboard queries to refresh garden health
      queryClient.invalidateQueries({
        queryKey: ["gardenDashboard"],
      });
    },
  });

  // Function to handle marking a task as complete
  const handleCompleteTask = useCallback(
    (taskId: number, completed: boolean) => {
      // Only handle task completion, not unchecking
      if (!completed) return;

      // Check if this is an overdue task
      const isOverdueTask = allOverdueTasks.some((task) => task.id === taskId);
      const taskToUpdate = isOverdueTask
        ? allOverdueTasks.find((task) => task.id === taskId)
        : todaysTasks?.find((task) => task.id === taskId);

      if (!taskToUpdate) return;

      // Configure layout animation before state changes
      configureLayoutAnimation();

      // Store the current count before updating
      const currentOverdueCount = allOverdueTasks.length;

      // Immediately update the overdue tasks state for real-time UI updates
      if (isOverdueTask) {
        setAllOverdueTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskId)
        );
      }

      // Check if this is the last overdue task being completed
      if (
        isOverdueTask &&
        currentOverdueCount === 1 &&
        !taskToUpdate.completed
      ) {
        // Clear any existing timer
        if (celebrationTimer.current) {
          clearTimeout(celebrationTimer.current);
        }

        // Schedule the celebration to show after the task animation completes
        setTimeout(() => {
          setShowTaskCelebration(true);
          setJustCompletedAllOverdueTasks(true);

          // Hide celebration after delay
          celebrationTimer.current = setTimeout(() => {
            setShowTaskCelebration(false);

            // Keep the "just completed" state for a bit longer
            setTimeout(() => {
              setJustCompletedAllOverdueTasks(false);
            }, 1000);
          }, CELEBRATION_DURATION);
        }, 600); // Reduced delay for better timing
      }

      // Execute the mutation with optimistic updates
      toggleTaskMutation.mutate({
        id: taskId,
        completed: true, // Always true since we only handle completion
      });
    },
    [todaysTasks, allOverdueTasks, toggleTaskMutation, configureLayoutAnimation]
  );

  const isLoading = gardensLoading || tasksLoading || overdueTasksLoading;
  const hasError = gardensError || tasksError;

  // Only show full-page loading if navigation is not ready
  if (!navigationReady) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading your garden..." />
      </PageContainer>
    );
  }

  // Only show full-page loading if we have no data at all
  if (
    gardensLoading &&
    !gardens &&
    tasksLoading &&
    !todaysTasks &&
    overdueTasksLoading
  ) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading your garden..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer scroll={false} padded={false}>
      <SignedIn>
        <ScrollView className="flex-1">
          {/* Smart subscription prompts (context-aware, non-intrusive) - only show when navigation is ready */}
          <SmartSubscriptionPrompt />

          {/* Welcome banner for new users (first week only) - only show when navigation is ready */}
          {/* Use variant="banner" for inline banner or variant="modal" for fullscreen modal */}
          {showWelcomeBanner && (
            <WelcomeSubscriptionBanner
              onDismiss={() => setShowWelcomeBanner(false)}
              showUpgrade={usageSummary.gardens.current > 0} // Only show upgrade if they've started using the app
              variant="modal" // Change to "modal" for fullscreen modal experience
            />
          )}

          {/* Usage limit banners for free users - only show when navigation is ready */}
          {!usageSummary.isPremium && (
            <>
              {/* Show garden limit banner if close to limit */}
              {usageSummary.gardens.percentage >= 50 && (
                <PaywallBanner
                  feature="gardens"
                  currentUsage={usageSummary.gardens.current}
                  limit={usageSummary.gardens.limit}
                  onUpgrade={() => router.push("/pricing")}
                />
              )}

              {/* Show task limit banner if close to limit */}
              {usageSummary.tasks.percentage >= 80 && (
                <PaywallBanner
                  feature="tasks_per_month"
                  currentUsage={usageSummary.tasks.current}
                  limit={usageSummary.tasks.limit}
                  onUpgrade={() => router.push("/pricing")}
                />
              )}
            </>
          )}

          <View className="px-5 pt-5">
            {/* Header Component */}
            {overdueTasksLoading ? (
              <View className="h-48 bg-gray-100 rounded-lg mb-4 animate-pulse" />
            ) : (
              <HomeHeader
                userName={user?.firstName || null}
                justCompletedAllOverdueTasks={justCompletedAllOverdueTasks}
                hasOverdueTasks={allOverdueTasks.length > 0}
                currentSeason={currentSeason}
              />
            )}

            {/* TODAY'S TASKS SECTION */}
            <TasksSection
              allOverdueTasks={overdueTasksLoading ? [] : allOverdueTasks}
              todaysTasks={todaysTasks}
              handleCompleteTask={handleCompleteTask}
              upcomingTasksCount={upcomingTasksCount}
              userId={user?.id}
              justCompletedAllOverdueTasks={justCompletedAllOverdueTasks}
              hasError={!!hasError}
              isOverdueTasksLoading={overdueTasksLoading}
              isTasksLoading={tasksLoading}
              onNavigate={(route) => router.push(route as any)}
            />

            {/* GARDEN STATS SECTION */}
            <GardensSection
              gardens={gardens}
              isLoading={gardensLoading}
              onNavigate={(route) => router.push(route as any)}
            />
          </View>

          {/* QUICK ACTIONS SECTION */}
          <View className="px-5 mb-6">
            <QuickActionsSection
              onNavigate={(route) => router.push(route as any)}
            />
          </View>
        </ScrollView>

        {/* Task completion celebration overlay */}
        <TaskCompletionCelebration
          visible={showTaskCelebration}
          type="overdueComplete"
          onClose={() => setShowTaskCelebration(false)}
        />
      </SignedIn>

      <SignedOut>
        <View className="flex-1 justify-center items-center p-5">
          <BodyText className="text-base text-foreground opacity-80 text-center mb-8">
            You need to sign in to access this page
          </BodyText>
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
              <BodyText className="text-primary-foreground font-bold text-base">
                Sign in
              </BodyText>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-transparent border border-primary py-4 rounded-lg items-center"
              onPress={() => router.replace("/(auth)/sign-up")}
            >
              <BodyText className="text-primary font-bold text-base">
                Sign up
              </BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </SignedOut>
    </PageContainer>
  );
}
