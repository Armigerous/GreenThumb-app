import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CachedImage from "@/components/CachedImage";
import type { UserPlant } from "@/types/garden";

interface PlantListProps {
  plants: UserPlant[];
  onPlantPress: (plant: UserPlant) => void;
  onEditPlant: (plant: UserPlant) => void;
  onWaterPlant: (plant: UserPlant) => void;
  onDeletePlant: (plant: UserPlant) => void;
  onAddPlant?: () => void; // Optional handler for empty state add button
}

/**
 * PlantList
 * Displays the user's plants in a visually unified, soft-card list.
 * Each card shows plant image, nickname, care status, and actions.
 *
 * // Reason: Reduces dashboard feel, creates a cohesive garden space, and supports contextual actions.
 */
const PlantList: React.FC<PlantListProps> = ({
  plants,
  onPlantPress,
  onEditPlant,
  onWaterPlant,
  onDeletePlant,
  onAddPlant,
}) => {
  // Helper to get care status for a plant
  const getCareStatus = (plant: UserPlant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) {
      return {
        text: "All caught up",
        color: "#77B860",
        icon: "checkmark-circle" as const,
      };
    }
    const now = new Date();
    const incompleteTasks = plant.plant_tasks.filter((task) => !task.completed);
    if (incompleteTasks.length === 0) {
      return {
        text: "All caught up",
        color: "#77B860",
        icon: "checkmark-circle" as const,
      };
    }
    const mostUrgent = incompleteTasks.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];
    const dueDate = new Date(mostUrgent.due_date);
    if (dueDate < now) {
      return {
        text: `${mostUrgent.task_type} overdue`,
        color: "#dc2626",
        icon:
          mostUrgent.task_type === "Water"
            ? ("water" as const)
            : mostUrgent.task_type === "Fertilize"
            ? ("leaf" as const)
            : ("cut" as const),
      };
    } else {
      return {
        text: `${mostUrgent.task_type} due soon`,
        color: "#d97706",
        icon:
          mostUrgent.task_type === "Water"
            ? ("water" as const)
            : mostUrgent.task_type === "Fertilize"
            ? ("leaf" as const)
            : ("cut" as const),
      };
    }
  };

  // Render a single plant card
  const renderPlant = ({ item, index }: { item: UserPlant; index: number }) => {
    const careStatus = getCareStatus(item);
    return (
      <View
        className={`bg-white rounded-2xl shadow-sm shadow-neutral-800/10 ${
          index === 0 ? "mt-0" : "mt-3"
        } opacity-95`}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.nickname}`}
      >
        <TouchableOpacity
          className="flex-row items-center p-4"
          onPress={() => onPlantPress(item)}
        >
          {/* Plant Image */}
          {item.images?.[0] ? (
            <CachedImage
              uri={item.images[0]}
              // Reason: CachedImage does not accept className, so we use style for Tailwind-like sizing
              style={{ width: 48, height: 48, borderRadius: 24 }}
              resizeMode="cover"
              rounded={true}
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-brand-50 items-center justify-center">
              <Ionicons name="leaf-outline" size={24} color="#9e9a90" />
            </View>
          )}
          {/* Plant Info */}
          <View className="flex-1 ml-3.5">
            <Text className="text-lg text-neutral-900 font-mali-bold mb-0.5">
              {item.nickname}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={careStatus.icon}
                size={16}
                color={careStatus.color}
              />
              <Text
                className="text-xs font-nunito-semibold ml-1.5"
                style={{ color: careStatus.color }}
              >
                {careStatus.text}
              </Text>
            </View>
          </View>
          {/* Actions */}
          <View className="flex-row items-center ml-2.5">
            <TouchableOpacity
              onPress={() => onEditPlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.nickname}`}
              className="ml-2 p-1.5 rounded-full bg-brand-50"
            >
              <Ionicons name="create-outline" size={18} color="#5E994B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onWaterPlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Water ${item.nickname}`}
              className="ml-2 p-1.5 rounded-full bg-brand-50"
            >
              <Ionicons name="water" size={18} color="#3F6933" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDeletePlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.nickname}`}
              className="ml-2 p-1.5 rounded-full bg-destructive-50"
            >
              <Ionicons name="trash-outline" size={18} color="#E50000" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={plants}
      className="pb-4 flex-1"
      renderItem={renderPlant}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View className="items-center mt-8 mb-6">
          <Ionicons
            name="leaf-outline"
            size={64}
            color="#77B860"
            style={{ marginBottom: 12 }}
          />
          <Text className="text-2xl text-neutral-900 font-mali-bold mb-2">
            Your Garden Awaits
          </Text>
          <Text className="text-base text-neutral-400 font-nunito-regular mb-4 text-center max-w-xs">
            Add your first plant to start your gardening journey. Track growth,
            care schedules, and watch them thrive!
          </Text>
          {onAddPlant && (
            <TouchableOpacity
              onPress={onAddPlant}
              className="flex-row items-center bg-brand-600 rounded-full py-2.5 px-5"
              accessibilityRole="button"
              accessibilityLabel="Plant Something New"
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-nunito-bold text-base">
                Plant Something New
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
};

export default PlantList;
