import { View, Text } from "react-native";
import { TaskWithDetails } from "@/types/garden";
import { Task } from "./Task";

interface TaskListProps {
  tasks: TaskWithDetails[];
  onToggleComplete: (id: number) => void;
  showGardenName?: boolean;
  groupByGarden?: boolean;
  maxTasks?: number;
  className?: string;
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
}: TaskListProps) {
  // If no tasks, show empty state
  if (!tasks || tasks.length === 0) {
    return (
      <View className="bg-background rounded-xl p-6 items-center border border-cream-300">
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
      <View className={`space-y-6 ${className}`}>
        {Object.entries(groupedTasks).map(([gardenName, gardenTasks]) => (
          <View key={gardenName}>
            <Text className="text-sm font-medium text-foreground mb-2">
              {gardenName}
            </Text>
            <View className="bg-background rounded-xl shadow-sm overflow-hidden">
              {gardenTasks.map((task, index) => (
                <View
                  key={task.id}
                  className={
                    index < gardenTasks.length - 1
                      ? "border-b border-cream-100 py-1"
                      : "py-1"
                  }
                >
                  <Task
                    task={task}
                    onToggleComplete={onToggleComplete}
                    showGardenName={false}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // For non-grouped tasks, apply maxTasks limit if specified
  const displayTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks;

  return (
    <View
      className={`bg-background rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {displayTasks.map((task, index) => (
        <View
          key={task.id}
          className={
            index < displayTasks.length - 1
              ? "border-b border-cream-100 py-1"
              : "py-1"
          }
        >
          <Task
            task={task}
            onToggleComplete={onToggleComplete}
            showGardenName={showGardenName}
          />
        </View>
      ))}
    </View>
  );
}
