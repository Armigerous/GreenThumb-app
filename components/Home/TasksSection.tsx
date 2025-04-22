import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { TaskWithDetails } from "@/types/garden";
import { SectionHeader } from "./SectionHeader";
import { AnimatedSection } from "./AnimatedSection";
import { TaskList } from "@/components/TaskList";

interface TasksSectionProps {
  allOverdueTasks: TaskWithDetails[];
  todaysTasks: TaskWithDetails[] | undefined;
  handleCompleteTask: (taskId: number) => void;
  upcomingTasksCount: number;
  userId: string | undefined | null;
  justCompletedAllOverdueTasks: boolean;
  hasError: boolean;
  isOverdueTasksLoading?: boolean;
  isTasksLoading?: boolean;
}

export function TasksSection({
  allOverdueTasks,
  todaysTasks,
  handleCompleteTask,
  upcomingTasksCount,
  userId,
  justCompletedAllOverdueTasks,
  hasError,
  isOverdueTasksLoading = false,
  isTasksLoading = false,
}: TasksSectionProps) {
  const router = useRouter();
  const today = new Date();

  // Combined loading state
  const isLoading = isOverdueTasksLoading || isTasksLoading;

  // Helper function to determine task badges
  const getTasksBadge = () => {
    const overdueCount = allOverdueTasks.length;
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
    if (allOverdueTasks.length > 0) {
      return {
        icon: "alert-circle-outline" as const,
        color: "#ef4444",
        text: `You have ${allOverdueTasks.length} overdue ${
          allOverdueTasks.length === 1 ? "task" : "tasks"
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

  // Get personalized suggestions for when all tasks are done
  const getPersonalizedSuggestion = () => {
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

  return (
    <View className="mb-6">
      <SectionHeader
        title={
          isLoading
            ? "Tasks"
            : allOverdueTasks.length > 0
            ? "Missed Tasks"
            : "Today's Tasks"
        }
        icon={
          isLoading
            ? "hourglass-outline"
            : allOverdueTasks.length > 0
            ? "alert-circle"
            : "calendar"
        }
        onSeeAll={() => router.push("/(home)/calendar")}
        badge={!isLoading ? getTasksBadge() : null}
      />

      {isLoading ? (
        <View className="bg-gray-100 rounded-xl p-4 mb-4 h-32 animate-pulse" />
      ) : hasError ? (
        <View className="bg-red-50 rounded-xl p-4 items-center">
          <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text className="text-destructive mt-2 text-center">
            Error loading tasks
          </Text>
        </View>
      ) : allOverdueTasks.length > 0 ? (
        <AnimatedSection delay={200}>
          <View className="bg-red-50 rounded-xl p-4 mb-4">
            <Text className="text-destructive font-bold mb-2">
              You have {allOverdueTasks.length} missed{" "}
              {allOverdueTasks.length === 1 ? "task" : "tasks"}!
            </Text>
            <Text className="text-destructive text-sm">
              These tasks were due yesterday or earlier and still need to be
              completed.
            </Text>
          </View>
          <TaskList
            tasks={allOverdueTasks}
            onToggleComplete={handleCompleteTask}
            showGardenName={true}
            maxTasks={3}
            isOverdue={true}
            queryKey={[
              "tasks",
              format(today, "yyyy-MM-dd"),
              userId || "anonymous",
            ]}
          />
          {allOverdueTasks.length > 3 && (
            <TouchableOpacity
              className="p-3 bg-white items-center mt-2 rounded-xl border border-red-200 shadow-sm"
              onPress={() => router.push("/(home)/calendar")}
            >
              <Text className="text-red-600 font-medium">
                {allOverdueTasks.length == 4
                  ? "+" + (allOverdueTasks.length - 3) + " more missed task"
                  : "+" + (allOverdueTasks.length - 3) + " more missed tasks"}
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
            queryKey={[
              "tasks",
              format(today, "yyyy-MM-dd"),
              userId || "anonymous",
            ]}
          />
          {todaysTasks.length > 3 && (
            <TouchableOpacity
              className="p-3 bg-white items-center mt-2 rounded-xl border border-brand-100 shadow-sm"
              onPress={() => router.push("/(home)/calendar")}
            >
              <Text className="text-brand-600 font-medium">
                {todaysTasks.length == 4
                  ? "+" + (todaysTasks.length - 3) + " more task"
                  : "+" + (todaysTasks.length - 3) + " more tasks"}
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
                  className="px-4 py-2 bg-white rounded-lg border border-red-300"
                  style={{
                    borderColor: getNoTasksSummary()!.color,
                  }}
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

                {/* Personalized call-to-action */}
                <Text className="text-sm text-cream-600 text-center mb-3">
                  {getPersonalizedSuggestion().text}
                </Text>

                <TouchableOpacity
                  className="px-4 py-2 bg-brand-50 rounded-lg border border-brand-200"
                  onPress={() => router.push(getPersonalizedSuggestion().route)}
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
  );
}
