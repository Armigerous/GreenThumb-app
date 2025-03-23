import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isTomorrow } from "date-fns";

type Task = {
  task_id: number;
  plant_id: string;
  plant_nickname: string;
  task_type: "Water" | "Fertilize" | "Harvest";
  due_date: string;
  completed: boolean;
};

type PlantTasksListProps = {
  tasks?: Task[];
  showPlantName?: boolean;
  onCompleteTask?: (taskId: number) => void;
  onTaskPress?: (taskId: number) => void;
};

export default function PlantTasksList({
  tasks,
  showPlantName = true,
  onCompleteTask,
  onTaskPress,
}: PlantTasksListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <View className="bg-cream-50 p-4 rounded-lg">
        <Text className="text-center text-cream-600">No tasks due</Text>
      </View>
    );
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getTaskIcon = (taskType: Task["task_type"]) => {
    switch (taskType) {
      case "Water":
        return { name: "water-outline" as const, color: "#0891b2" };
      case "Fertilize":
        return { name: "leaf-outline" as const, color: "#059669" };
      case "Harvest":
        return { name: "cut-outline" as const, color: "#d97706" };
      default:
        return { name: "calendar-outline" as const, color: "#6b7280" };
    }
  };

  return (
    <View className="space-y-2">
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.task_id}
          className="flex-row bg-white border border-cream-100 p-3 rounded-lg items-center"
          onPress={() => onTaskPress?.(task.task_id)}
        >
          <View
            className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${
              task.task_type === "Water"
                ? "bg-blue-50"
                : task.task_type === "Fertilize"
                ? "bg-brand-50"
                : "bg-accent-50"
            }`}
          >
            <Ionicons
              name={getTaskIcon(task.task_type).name}
              size={16}
              color={getTaskIcon(task.task_type).color}
            />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium">
              {task.task_type} {showPlantName && task.plant_nickname}
            </Text>
            <Text className="text-cream-500 text-sm">
              Due {formatDueDate(task.due_date)}
            </Text>
          </View>
          {onCompleteTask && (
            <TouchableOpacity
              className="bg-brand-50 p-2 rounded-full"
              onPress={() => onCompleteTask(task.task_id)}
            >
              <Ionicons name="checkmark" size={16} color="#059669" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
