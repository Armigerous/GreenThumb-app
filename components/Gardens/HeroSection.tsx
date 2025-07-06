import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Types for props
interface HeroSectionProps {
  gardenName: string;
  gardenMessage: string;
  stats: {
    plantsNeedingCare: number;
  };
}

/**
 * HeroSection
 * Shows garden name, a personalized message, and a 'Need Care' pill if needed.
 *
 * // Reason: Focuses on actionable and welcoming overview. Omits health percentage and total plants for clarity.
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  gardenName,
  gardenMessage,
  stats,
}) => {
  return (
    <LinearGradient
      colors={["#3F6933", "#77B860"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.headerRow}>
        <Text style={styles.gardenName} accessibilityRole="header">
          Welcome to {gardenName}
        </Text>
      </View>
      <Text style={styles.gardenMessage}>{gardenMessage}</Text>
      {/* Show 'Need Care' pill only if there are plants needing care */}
      {stats.plantsNeedingCare > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="water" size={18} color="#d97706" />
            <Text style={styles.statText}>
              {stats.plantsNeedingCare} Need Care
            </Text>
          </View>
        </View>
      )}
      {/* Reason: Omit health percentage and total plants for a cleaner, more actionable overview. */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 24,
    shadowColor: "#333333",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gardenName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Mali-Bold",
  },
  gardenMessage: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  statText: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 6,
    fontFamily: "Nunito-SemiBold",
  },
});

export default HeroSection;
