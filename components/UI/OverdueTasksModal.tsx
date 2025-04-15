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

// Define the notification data structure
interface OverdueTask {
  task_id: number;
  task_type: string;
  plant_nickname: string;
  due_date: string;
}

interface GardenNotification {
  garden_id: number;
  garden_name: string;
  health_impact: number;
  overdue_tasks_count: number;
  tasks: OverdueTask[];
}

interface OverdueTasksModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: GardenNotification[];
}

export default function OverdueTasksModal({
  isVisible,
  onClose,
  notifications,
}: OverdueTasksModalProps) {
  const router = useRouter();

  // Log when the modal becomes visible or notifications change
  useEffect(() => {
    if (isVisible) {
      console.log("OverdueTasksModal is now visible");
      console.log("Current notifications:", notifications);
    }
  }, [isVisible, notifications]);

  // Handle navigation to a specific garden
  const handleViewGarden = (gardenId: number) => {
    onClose();
    router.push({
      pathname: "/(home)/gardens/[id]",
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

  // If we have no notifications, don't render the modal
  if (!notifications || notifications.length === 0) {
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
              <Text className="text-xl font-bold text-foreground">
                Garden Health Alert
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.map((notification) => (
              <View key={notification.garden_id} className="pb-4">
                <Text className="text-lg font-semibold text-foreground mb-2">
                  {notification.garden_name}
                </Text>

                <View className="flex-row items-center mb-2 bg-red-50 p-3 rounded-lg">
                  <Ionicons name="trending-down" size={20} color="#ef4444" />
                  <Text className="text-red-600 font-medium ml-2">
                    {notification.health_impact}% health impact
                  </Text>
                </View>

                <Text className="text-sm text-cream-700 mb-2">
                  {notification.overdue_tasks_count}{" "}
                  {notification.overdue_tasks_count === 1
                    ? "task has"
                    : "tasks have"}{" "}
                  become overdue:
                </Text>

                {notification.tasks && notification.tasks.length > 0 ? (
                  notification.tasks.map((task) => (
                    <View
                      key={task.task_id}
                      className="flex-row items-center p-2 bg-cream-50 rounded-md mb-2"
                    >
                      <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-2">
                        <Ionicons
                          name={
                            task.task_type === "Water"
                              ? "water"
                              : task.task_type === "Fertilize"
                              ? "leaf"
                              : "checkmark-circle"
                          }
                          size={16}
                          color="#ef4444"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium">
                          {task.task_type} {task.plant_nickname}
                        </Text>
                        <Text className="text-xs text-cream-600">
                          Due: {formatDate(task.due_date)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-cream-600 italic">
                    No task details available
                  </Text>
                )}

                <TouchableOpacity
                  className="bg-primary rounded-lg p-3 mt-2"
                  onPress={() => handleViewGarden(notification.garden_id)}
                >
                  <Text className="text-white text-center font-medium">
                    View Garden
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-cream-700 text-center font-medium">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
