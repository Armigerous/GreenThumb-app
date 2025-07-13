import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TitleText, SubtitleText, BodyText } from "./Text";

// Define the notification data structure
interface OverdueTask {
  task_id: number;
  task_type: string | null;
  plant_nickname: string;
  due_date: string;
}

interface GardenNotification {
  garden_id: number;
  garden_name: string;
  overdue_tasks_count: number;
  tasks: OverdueTask[];
}

interface OverdueTasksModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: GardenNotification[];
  // Optional garden ID to filter and show only one garden's tasks
  gardenId?: number;
}

/**
 * Modal component that displays overdue tasks grouped by garden
 * Can optionally filter to show tasks for only a specific garden
 * @param isVisible - Controls modal visibility
 * @param onClose - Function to close the modal
 * @param notifications - Array of garden notifications with overdue tasks
 * @param gardenId - Optional ID to filter and show only one garden's tasks
 */
export default function OverdueTasksModal({
  isVisible,
  onClose,
  notifications,
  gardenId,
}: OverdueTasksModalProps) {
  const router = useRouter();

  // Debug: Log notifications and filteredNotifications
  // eslint-disable-next-line no-console
  console.log("OverdueTasksModal notifications:", notifications);

  // Filter notifications if a garden ID is provided, and exclude gardens with zero overdue tasks
  const filteredNotifications = (
    gardenId
      ? notifications.filter(
          (notification) => notification.garden_id === gardenId
        )
      : notifications
  ).filter((notification) => notification.overdue_tasks_count > 0);

  // Debug: Log filteredNotifications
  // eslint-disable-next-line no-console
  console.log(
    "OverdueTasksModal filteredNotifications:",
    filteredNotifications
  );

  // Log when the modal becomes visible or notifications change
  useEffect(() => {
    if (isVisible) {
      console.log("OverdueTasksModal is now visible");
      console.log("Current notifications:", notifications);
      if (gardenId) {
        console.log("Filtering for garden ID:", gardenId);
      }
    }
  }, [isVisible, notifications, gardenId]);

  // Handle navigation to a specific garden
  const handleViewGarden = (gardenId: number) => {
    onClose();
    router.push({
      pathname: "/(tabs)/gardens/[id]",
      params: { id: gardenId },
    });
  };

  // Format the date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Error with date";
    }
  };

  // Get task icon based on task type
  const getTaskIcon = (
    taskType: string | null
  ): "water" | "leaf" | "cut" | "basket" | "checkmark-circle" => {
    if (!taskType) return "checkmark-circle";

    switch (taskType.toLowerCase()) {
      case "water":
        return "water";
      case "fertilize":
        return "leaf";
      case "prune":
        return "cut";
      case "harvest":
        return "basket";
      default:
        return "checkmark-circle";
    }
  };

  // Calculate total overdue tasks across all gardens
  const totalOverdueTasks = filteredNotifications.reduce(
    (total, garden) => total + garden.overdue_tasks_count,
    0
  );

  // If we have no notifications, don't render the modal
  if (!filteredNotifications || filteredNotifications.length === 0) {
    console.log("No notifications to display");
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-[90%] max-h-[80%] bg-white rounded-xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
              </View>
              <TitleText className="text-xl text-foreground">
                {gardenId
                  ? filteredNotifications[0]?.garden_name || "Garden"
                  : "Overdue Tasks"}
              </TitleText>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Summary information */}
          <View className="mb-4 bg-yellow-50 p-3 rounded-lg">
            <BodyText className="text-yellow-800 font-medium">
              {totalOverdueTasks} overdue{" "}
              {totalOverdueTasks === 1 ? "task" : "tasks"} need your attention
            </BodyText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredNotifications.map((notification) => (
              <View key={notification.garden_id} className="pb-4">
                <SubtitleText className="text-foreground text-lg mb-2">
                  {notification.garden_name}
                </SubtitleText>

                <BodyText className="text-sm text-cream-700 font-paragraph mb-2">
                  {notification.overdue_tasks_count}{" "}
                  {notification.overdue_tasks_count === 1
                    ? "task has"
                    : "tasks have"}{" "}
                  become overdue:
                </BodyText>

                {notification.tasks && notification.tasks.length > 0 ? (
                  notification.tasks.map((task) => (
                    <View
                      key={task.task_id}
                      className="flex-row items-center p-2 bg-cream-50 rounded-md mb-2"
                    >
                      <View className="w-8 h-8 bg-yellow-100 rounded-lg items-center justify-center mr-2">
                        <Ionicons
                          name={getTaskIcon(task.task_type)}
                          size={16}
                          color="#f59e0b"
                        />
                      </View>
                      <View className="flex-1">
                        <BodyText className="text-foreground font-medium">
                          {task.task_type} {task.plant_nickname}
                        </BodyText>
                        <BodyText className="text-sm text-cream-600">
                          Due: {formatDate(task.due_date)}
                        </BodyText>
                      </View>
                    </View>
                  ))
                ) : (
                  <BodyText className="text-sm text-cream-600 font-paragraph italic">
                    No task details available
                  </BodyText>
                )}

                <TouchableOpacity
                  className="bg-primary rounded-lg p-3 mt-2"
                  onPress={() => handleViewGarden(notification.garden_id)}
                >
                  <BodyText className="text-white text-center font-medium">
                    {gardenId ? "View Tasks" : "View Garden"}
                  </BodyText>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose}>
            <BodyText className="text-cream-700 text-center font-medium">
              Close
            </BodyText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
