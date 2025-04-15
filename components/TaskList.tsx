import { View, Text } from "react-native";
import { TaskWithDetails } from "@/types/garden";
import { Task } from "./Task";

interface TaskListProps {
  tasks: TaskWithDetails[];
  onToggleComplete?: (id: number) => void;
  showGardenName?: boolean;
  groupByGarden?: boolean;
  maxTasks?: number;
  className?: string;
  queryKey?: string[];
  isOverdue?: boolean;
}

/**
 * A component that displays a list of tasks with consistent styling and behavior.
 * Can optionally group tasks by garden and limit the number of displayed tasks.
 */
export function TaskList({
  tasks,
  onToggleComplete,
  showGardenName = false,
  groupByGarden = false,
  maxTasks,
  className = "",
  queryKey,
  isOverdue = false,
}: TaskListProps) {
  // If no tasks, show empty state
  if (!tasks || tasks.length === 0) {
    return (
      <View className="bg-background p-6 items-center border border-cream-300 rounded-xl">
        <Text className="text-base text-cream-600 text-center">
          No tasks to display
        </Text>
      </View>
    );
  }

  // If grouping by garden, organize tasks
  if (groupByGarden) {
    const groupedTasks = tasks.reduce<Record<string, TaskWithDetails[]>>(
      (acc, task) => {
        const gardenName = task.plant?.garden?.name || "Unknown Garden";
        if (!acc[gardenName]) {
          acc[gardenName] = [];
        }
        acc[gardenName].push(task);
        return acc;
      },
      {}
    );

    return (
      <View className={className}>
        {Object.entries(groupedTasks).map(
          ([gardenName, gardenTasks], groupIndex) => (
            <View
              key={gardenName}
              className="mb-4 bg-white rounded-xl border border-cream-300"
            >
              <Text className="text-sm font-medium text-cream-700 p-4">
                {gardenName}
              </Text>
              {gardenTasks.slice(0, maxTasks).map((task, index) => (
                <View key={task.id}>
                  <Task
                    task={task}
                    onToggleComplete={onToggleComplete}
                    showGardenName={showGardenName}
                    queryKey={queryKey}
                    isOverdue={isOverdue}
                  />
                  {index < gardenTasks.length - 1 && (
                    <View className="h-[1px] bg-cream-200 mx-4" />
                  )}
                </View>
              ))}
              {gardenTasks.length > (maxTasks || gardenTasks.length) && (
                <Text className="text-sm text-cream-600 p-4">
                  +{gardenTasks.length - (maxTasks || gardenTasks.length)} more
                  tasks
                </Text>
              )}
            </View>
          )
        )}
      </View>
    );
  }

  // If not grouping, just show the tasks
  return (
    <View
      className={`${className} bg-white rounded-xl border border-cream-300`}
    >
      {tasks.slice(0, maxTasks).map((task, index) => (
        <View key={task.id}>
          <Task
            task={task}
            onToggleComplete={onToggleComplete}
            showGardenName={showGardenName}
            queryKey={queryKey}
            isOverdue={isOverdue}
          />
          {index < tasks.length - 1 && (
            <View className="h-[1px] bg-cream-200 mx-4" />
          )}
        </View>
      ))}
      {tasks.length > (maxTasks || tasks.length) && (
        <Text className="text-sm text-cream-600 p-4">
          +{tasks.length - (maxTasks || tasks.length)} more tasks
        </Text>
      )}
    </View>
  );
}
