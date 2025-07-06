import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CachedImage from "@/components/CachedImage";
import type { UserPlant } from "@/types/garden";

interface PlantListProps {
  plants: UserPlant[];
  onPlantPress: (plant: UserPlant) => void;
  onEditPlant: (plant: UserPlant) => void;
  onWaterPlant: (plant: UserPlant) => void;
  onDeletePlant: (plant: UserPlant) => void;
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
        style={[
          styles.card,
          { opacity: 0.95, marginTop: index === 0 ? 0 : 12 },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.nickname}`}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => onPlantPress(item)}
        >
          {/* Plant Image */}
          {item.images?.[0] ? (
            <CachedImage
              uri={item.images[0]}
              style={styles.image}
              resizeMode="cover"
              rounded={true}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf-outline" size={24} color="#9e9a90" />
            </View>
          )}
          {/* Plant Info */}
          <View style={styles.infoSection}>
            <Text style={styles.nickname}>{item.nickname}</Text>
            <View style={styles.careRow}>
              <Ionicons
                name={careStatus.icon}
                size={16}
                color={careStatus.color}
              />
              <Text style={[styles.careText, { color: careStatus.color }]}>
                {careStatus.text}
              </Text>
            </View>
          </View>
          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEditPlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.nickname}`}
              style={styles.actionBtn}
            >
              <Ionicons name="create-outline" size={18} color="#5E994B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onWaterPlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Water ${item.nickname}`}
              style={styles.actionBtn}
            >
              <Ionicons name="water" size={18} color="#3F6933" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDeletePlant(item)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.nickname}`}
              style={styles.actionBtn}
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
      renderItem={renderPlant}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    shadowColor: "#333333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5E6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    flex: 1,
    marginLeft: 14,
  },
  nickname: {
    fontSize: 17,
    color: "#2e2c29",
    fontFamily: "Mali-Bold",
    marginBottom: 2,
  },
  careRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  careText: {
    fontSize: 13,
    fontFamily: "Nunito-SemiBold",
    marginLeft: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  actionBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F5F5E6",
  },
});

export default PlantList;
