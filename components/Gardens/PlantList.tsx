import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CachedImage from "@/components/CachedImage";
import type { UserPlant } from "@/types/garden";
import { TitleText, BodyText, Text as BrandText } from "@/components/UI/Text";
import SubmitButton from "@/components/UI/SubmitButton";

interface PlantListProps {
  plants: UserPlant[];
  onPlantPress: (plant: UserPlant) => void;
  onAddJournalEntry: (plant: UserPlant) => void; // Handler for journal entry action
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
  onAddJournalEntry,
  onDeletePlant,
  onAddPlant,
}) => {
  // Helper to get care status for a plant
  const getCareStatus = (plant: UserPlant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) {
      return {
        text: "All caught up",
        color: "#77B860", // brand-500
        icon: "checkmark-circle" as const,
      };
    }
    const now = new Date();
    const incompleteTasks = plant.plant_tasks.filter((task) => !task.completed);
    if (incompleteTasks.length === 0) {
      return {
        text: "All caught up",
        color: "#77B860", // brand-500
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
        color: "#E50000", // destructive
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
        color: "#ffd900", // accent-200
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
        className={`bg-cream-50 rounded-2xl shadow-sm shadow-neutral-800/10 ${
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
            <TitleText className="text-lg text-cream-800 mb-0.5">
              {item.nickname}
            </TitleText>
            <View className="flex-row items-center">
              <Ionicons
                name={careStatus.icon}
                size={16}
                color={careStatus.color}
              />
              <BodyText
                className="text-xs font-paragraph-semibold ml-1.5"
                style={{ color: careStatus.color }}
              >
                {careStatus.text}
              </BodyText>
            </View>
          </View>
          {/* Actions: Only Journal and Delete buttons remain. Hit area is at least 44x44px. */}
          <View className="flex-row items-center ml-2.5">
            {/* Journal Button: Soft rectangular (pill) style for better touch and visual comfort */}
            <TouchableOpacity
              onPress={() => onAddJournalEntry(item)}
              accessibilityRole="button"
              accessibilityLabel={`Add journal entry for ${item.nickname}`}
              className="ml-2 rounded-xl bg-brand-50 flex-row items-center justify-center px-4 py-2"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Ionicons name="journal-outline" size={20} color="#5E994B" />
              {/* Optionally, add a text label for clarity: */}
              {/* <BodyText className="ml-2 text-brand-600 text-sm font-paragraph-semibold">Journal</BodyText> */}
            </TouchableOpacity>
            {/* Delete Button: Soft rectangular (pill) style for better touch and visual comfort */}
            <TouchableOpacity
              onPress={() => onDeletePlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.nickname}`}
              className="ml-2 rounded-xl bg-destructive/10 flex-row items-center justify-center px-4 py-2"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Ionicons name="trash-outline" size={20} color="#E50000" />
              {/* Optionally, add a text label for clarity: */}
              {/* <BodyText className="ml-2 text-destructive text-sm font-paragraph-semibold">Delete</BodyText> */}
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
            color="#77B860" // brand-500
            style={{ marginBottom: 12 }}
          />
          <TitleText className="text-2xl text-cream-800 mb-2">
            Your Garden Awaits
          </TitleText>
          <BodyText className="text-base text-cream-600 mb-4 text-center max-w-xs">
            Add your first plant to start your gardening journey. Track growth,
            care schedules, and watch them thrive!
          </BodyText>
          {onAddPlant && (
            <SubmitButton
              onPress={onAddPlant}
              color="primary"
              iconName="add-circle-outline"
              iconPosition="left"
              size="md"
              className="mt-2"
            >
              Plant Something New
            </SubmitButton>
          )}
        </View>
      }
    />
  );
};

export default PlantList;
