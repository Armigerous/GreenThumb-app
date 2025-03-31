import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { TaskWithDetails } from "@/types/garden";
import { useRef } from "react";

interface TaskProps {
  task: TaskWithDetails;
  onToggleComplete: (id: number) => void;
  showGardenName?: boolean;
}

export function Task({
  task,
  onToggleComplete,
  showGardenName = false,
}: TaskProps) {
  // Add animation reference for this specific task
  const checkboxAnimationValue = useRef(new Animated.Value(1)).current;

  // Function to handle marking a task as complete
  const handleToggleComplete = async () => {
    // Create animation sequence
    Animated.sequence([
      Animated.timing(checkboxAnimationValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxAnimationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Execute the toggle callback
    onToggleComplete(task.id);
  };

  return (
    <TouchableOpacity
      onPress={handleToggleComplete}
      activeOpacity={0.7}
      className="p-4 flex-row items-center justify-between bg-cream-50 rounded-xl border border-cream-300"
    >
      <View className="flex-row items-center flex-1">
        <View className="min-w-[48px] min-h-[48px] items-center justify-center">
          <Animated.View
            style={{
              transform: [{ scale: checkboxAnimationValue }],
            }}
            className={`w-7 h-7 rounded-lg border-2 items-center justify-center ${
              task.completed
                ? "bg-brand-500 border-brand-500"
                : "border-cream-300"
            }`}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </Animated.View>
        </View>
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${
              task.completed ? "text-cream-400 line-through" : "text-foreground"
            }`}
          >
            {task.task_type} {task.plant?.nickname}
          </Text>
          <Text className="text-xs text-cream-500">
            {showGardenName && `${task.plant?.garden?.name} • `}
            {format(new Date(task.due_date), "h:mm a")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
