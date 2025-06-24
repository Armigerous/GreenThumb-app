import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { TaskWithDetails } from "@/types/garden";
import { SectionHeader } from "./SectionHeader";
import { StaggeredContent } from "@/components/UI/StaggeredContent";
import { TaskList } from "@/components/TaskList";
import { SubtitleText, BodyText } from "@/components/UI/Text";

interface TasksSectionProps {
  allOverdueTasks: TaskWithDetails[];
  todaysTasks: TaskWithDetails[] | undefined;
  handleCompleteTask: (taskId: number, completed: boolean) => void;
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

  // Safe navigation function that handles potential navigation errors
  const safeNavigate = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

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
        route: "/(tabs)/plants" as const,
      },
      {
        text: "Explore your garden's performance over time",
        action: "View Gardens",
        route: "/(tabs)/gardens" as const,
      },
      {
        text: "Check your upcoming care schedule",
        action: "View Calendar",
        route: "/(tabs)/calendar" as const,
      },
    ] as const;

    // Randomly select a suggestion
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  return (
    <View className="mb-6">
      <StaggeredContent index={2} baseDelay={400} staggerInterval={80}>
        <SectionHeader
          title={
            isLoading
              ? "Tasks"
              : allOverdueTasks.length > 0
              ? "Missed Tasks"
              : justCompletedAllOverdueTasks
              ? "Tasks Complete!"
              : "Today's Tasks"
          }
          icon={
            isLoading
              ? "hourglass-outline"
              : allOverdueTasks.length > 0
              ? "alert-circle"
              : justCompletedAllOverdueTasks
              ? "checkmark-circle"
              : "calendar"
          }
          onSeeAll={
            // Only show "See All" if there are tasks to see or if not in completed state
            !justCompletedAllOverdueTasks &&
            (allOverdueTasks.length > 0 ||
              (todaysTasks && todaysTasks.length > 0) ||
              upcomingTasksCount > 0)
              ? () => safeNavigate("/(tabs)/calendar")
              : undefined
          }
          badge={!isLoading ? getTasksBadge() : null}
        />
      </StaggeredContent>

      {isLoading ? (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
          <View className="bg-gray-100 rounded-xl p-4 mb-4 h-32 animate-pulse" />
        </StaggeredContent>
      ) : hasError ? (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
          <View className="bg-red-50 rounded-xl p-4 items-center">
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            <BodyText className="text-destructive font-paragraph mt-2 text-center">
              Error loading tasks
            </BodyText>
          </View>
        </StaggeredContent>
      ) : justCompletedAllOverdueTasks ? (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
          <View className="bg-brand-50 rounded-xl p-6 items-center border border-brand-200">
            <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-4">
              <Ionicons name="trophy" size={32} color="#5E994B" />
            </View>
            <SubtitleText className="text-brand-700 font-title font-bold mb-2 text-center">
              🌱 Amazing work!
            </SubtitleText>
            <BodyText className="text-brand-600 font-paragraph text-sm text-center mb-4">
              You&apos;ve caught up on all your overdue tasks. Your plants are
              going to love the attention!
            </BodyText>
            {/* Only show View Your Progress button if there are any tasks to view */}
            {(upcomingTasksCount > 0 ||
              (todaysTasks && todaysTasks.length > 0)) && (
              <TouchableOpacity
                className="px-4 py-2 bg-brand-600 rounded-lg"
                onPress={() => safeNavigate("/(tabs)/calendar")}
              >
                <BodyText className="text-white font-paragraph font-medium">
                  View Your Progress
                </BodyText>
              </TouchableOpacity>
            )}
          </View>
        </StaggeredContent>
      ) : allOverdueTasks.length > 0 ? (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
          <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
            <SubtitleText className="text-destructive font-title font-bold mb-2">
              You have {allOverdueTasks.length} missed{" "}
              {allOverdueTasks.length === 1 ? "task" : "tasks"}!
            </SubtitleText>
            <BodyText className="text-destructive font-paragraph text-sm mb-3">
              These tasks were due yesterday or earlier. Don&apos;t worry - your
              plants are resilient! Let&apos;s get them the care they need.
            </BodyText>
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
              onPress={() => safeNavigate("/(tabs)/calendar")}
            >
              <BodyText className="text-red-600 font-paragraph font-medium">
                +{allOverdueTasks.length - 3} more missed{" "}
                {allOverdueTasks.length - 3 === 1 ? "task" : "tasks"}
              </BodyText>
            </TouchableOpacity>
          )}
        </StaggeredContent>
      ) : todaysTasks && todaysTasks.length > 0 ? (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
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
              onPress={() => safeNavigate("/(tabs)/calendar")}
            >
              <BodyText className="text-brand-600 font-paragraph font-medium">
                +{todaysTasks.length - 3} more{" "}
                {todaysTasks.length - 3 === 1 ? "task" : "tasks"}
              </BodyText>
            </TouchableOpacity>
          )}
        </StaggeredContent>
      ) : (
        <StaggeredContent index={3} baseDelay={480} staggerInterval={80}>
          <View className="bg-white rounded-xl p-6 items-center border border-brand-100 shadow-sm">
            {getNoTasksSummary() ? (
              <>
                <Ionicons
                  name={getNoTasksSummary()!.icon}
                  size={32}
                  color={getNoTasksSummary()!.color}
                />
                <BodyText className="text-base font-paragraph text-cream-700 mt-2 text-center mb-2">
                  No tasks for today
                </BodyText>
                <BodyText className="text-sm font-paragraph text-cream-600 text-center mb-3">
                  {getNoTasksSummary()!.text}
                </BodyText>
                <TouchableOpacity
                  className="px-4 py-2 bg-white rounded-lg border border-red-300"
                  style={{
                    borderColor: getNoTasksSummary()!.color,
                  }}
                  onPress={() => safeNavigate("/(tabs)/calendar")}
                >
                  <BodyText
                    style={{
                      color: getNoTasksSummary()!.actionColor,
                    }}
                    className="font-paragraph font-medium"
                  >
                    {getNoTasksSummary()!.action}
                  </BodyText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="#5E994B"
                />
                <BodyText className="text-base font-paragraph text-cream-700 mt-2 text-center mb-2">
                  All done for today!
                </BodyText>

                {/* Personalized call-to-action */}
                {(() => {
                  const suggestion = getPersonalizedSuggestion();
                  return (
                    <>
                      <BodyText className="text-sm font-paragraph text-cream-600 text-center mb-3">
                        {suggestion.text}
                      </BodyText>
                      <TouchableOpacity
                        className="px-4 py-2 bg-brand-600 rounded-lg"
                        onPress={() => safeNavigate(suggestion.route)}
                      >
                        <BodyText className="text-white font-paragraph font-medium">
                          {suggestion.action}
                        </BodyText>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </>
            )}
          </View>
        </StaggeredContent>
      )}
    </View>
  );
}
