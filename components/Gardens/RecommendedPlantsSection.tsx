import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Minimal Plant type for recommendations
interface RecommendedPlant {
  id: string | number;
  name: string;
  imageUrl?: string;
}

interface RecommendedPlantsSectionProps {
  recommendedPlants: RecommendedPlant[];
  onAddRecommended: (plant: RecommendedPlant) => void;
}

/**
 * RecommendedPlantsSection
 * Displays a horizontal scroll of recommended plants with a soft divider and heading.
 * Each card shows plant image, name, and an 'Add' button.
 *
 * // Reason: Prepares for the recommendations feature, encourages plant discovery, and maintains brand immersion.
 */
const RecommendedPlantsSection: React.FC<RecommendedPlantsSectionProps> = ({
  recommendedPlants,
  onAddRecommended,
}) => {
  if (!recommendedPlants || recommendedPlants.length === 0) {
    // Placeholder for empty state
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.divider} />
        <Text style={styles.heading}>Recommended for You</Text>
        <Text style={styles.placeholderText}>
          No recommendations yet. Check back soon!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.divider} />
      <Text style={styles.heading}>Recommended for You</Text>
      <FlatList
        data={recommendedPlants}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="leaf-outline" size={28} color="#9e9a90" />
              </View>
            )}
            <Text style={styles.plantName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onAddRecommended(item)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.name} to your garden`}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#F5F5E6",
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  heading: {
    fontSize: 18,
    fontFamily: "Mali-Bold",
    color: "#2e2c29",
    marginLeft: 20,
    marginBottom: 8,
  },
  placeholderText: {
    color: "#9e9a90",
    fontFamily: "Nunito-Regular",
    fontSize: 15,
    marginLeft: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginRight: 14,
    alignItems: "center",
    width: 120,
    shadowColor: "#333333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  plantName: {
    fontSize: 15,
    fontFamily: "Mali-Bold",
    color: "#2e2c29",
    marginBottom: 6,
    textAlign: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E994B",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
  },
  addBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Nunito-Bold",
    marginLeft: 5,
  },
});

export default RecommendedPlantsSection;
