import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Garden } from "../../types/garden";
import {
  formatConditionValues,
  getCompletionColor,
  calculateGardenCompletion,
  getCompletionStatusText,
} from "../../lib/gardenHelpers";
import GardenConditionsEditor from "./GardenConditionsEditor";

type GardenConditionsProps = {
  garden: Garden;
  onEditPress: () => void;
  onSettingsUpdate?: (updated: boolean) => void;
};

// Enhanced condition card component with improved styling
function ConditionCard({
  icon,
  title,
  value,
  category = "environment", // Determines the color theme
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value: string;
  category?: "environment" | "design" | "aesthetics" | "plants" | "preferences";
}) {
  if (!value) return null;

  // Color schemes based on category
  const colorSchemes = {
    environment: {
      bg: "bg-brand-50",
      border: "border-brand-200",
      icon: "#059669", // Green
      title: "text-brand-800",
    },
    design: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "#3b82f6", // Blue
      title: "text-blue-800",
    },
    aesthetics: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "#8b5cf6", // Purple
      title: "text-purple-800",
    },
    plants: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "#d97706", // Amber
      title: "text-amber-800",
    },
    preferences: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: "#475569", // Slate
      title: "text-slate-800",
    },
  };

  const {
    bg,
    border,
    icon: iconColor,
    title: titleColor,
  } = colorSchemes[category];

  return (
    <View className={`${bg} border ${border} p-3 rounded-lg mb-3`}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text className={`${titleColor} font-medium ml-2`}>{title}</Text>
      </View>
      <Text className="text-gray-700 text-sm">{value}</Text>
    </View>
  );
}

// Section header for better organization
function SectionHeader({
  title,
  icon,
  category = "environment",
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  category?: "environment" | "design" | "aesthetics" | "plants" | "preferences";
}) {
  // Color schemes based on category
  const colorSchemes = {
    environment: {
      bg: "bg-brand-100",
      icon: "#059669", // Green
      text: "text-brand-800",
    },
    design: {
      bg: "bg-blue-100",
      icon: "#3b82f6", // Blue
      text: "text-blue-800",
    },
    aesthetics: {
      bg: "bg-purple-100",
      icon: "#8b5cf6", // Purple
      text: "text-purple-800",
    },
    plants: {
      bg: "bg-amber-100",
      icon: "#d97706", // Amber
      text: "text-amber-800",
    },
    preferences: {
      bg: "bg-slate-100",
      icon: "#475569", // Slate
      text: "text-slate-800",
    },
  };

  const { bg, icon: iconColor, text } = colorSchemes[category];

  return (
    <View className={`flex-row items-center mb-3 ${bg} p-2 rounded-lg`}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text
        className={`${text} font-semibold text-sm uppercase tracking-wider ml-2`}
      >
        {title}
      </Text>
    </View>
  );
}

export default function GardenConditions({
  garden,
  onEditPress,
  onSettingsUpdate,
}: GardenConditionsProps) {
  const [editMode, setEditMode] = useState(false);

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle save from editor
  const handleSave = (updated: boolean) => {
    setEditMode(false);
    if (onSettingsUpdate) onSettingsUpdate(updated);
  };

  // Handle cancel from editor
  const handleCancel = () => {
    setEditMode(false);
  };

  const completionPercentage = calculateGardenCompletion(garden);
  const completionColor = getCompletionColor(completionPercentage);
  const completionStatus = getCompletionStatusText(completionPercentage);

  const hasConditions = Boolean(
    (garden.sunlight && garden.sunlight.length > 0) ||
      (garden.soil_textures && garden.soil_textures.length > 0) ||
      (garden.soil_texture && garden.soil_texture.length > 0) ||
      (garden.soil_ph_ranges && garden.soil_ph_ranges.length > 0) ||
      (garden.soil_ph && garden.soil_ph.length > 0) ||
      (garden.soil_drainage && garden.soil_drainage.length > 0)
  );

  // Calculate if garden is ready to display recommendations
  const isGardenComplete =
    (garden.sunlight && garden.sunlight.length > 0) ||
    (garden.soil_textures && garden.soil_textures.length > 0) ||
    (garden.soil_texture && garden.soil_texture.length > 0) ||
    (garden.soil_drainage && garden.soil_drainage.length > 0) ||
    (garden.soil_ph_ranges && garden.soil_ph_ranges.length > 0) ||
    (garden.soil_ph && garden.soil_ph.length > 0) ||
    (garden.landscape_locations && garden.landscape_locations.length > 0) ||
    (garden.locations && garden.locations.length > 0) ||
    (garden.nc_regions && garden.nc_regions.length > 0) ||
    (garden.usda_zones && garden.usda_zones.length > 0);

  // If in edit mode, render the new editor component
  if (editMode) {
    return (
      <GardenConditionsEditor
        garden={garden}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    );
  }

  // View mode - show garden conditions summary
  return (
    <View className="bg-white p-4 rounded-xl mb-8 border border-cream-200">
      {/* Completion indicator */}
      <View className="mb-5 bg-cream-50 p-3 rounded-lg border border-cream-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-700 font-medium">Settings Completion</Text>
          <Text
            className="text-sm font-medium"
            style={{ color: completionColor }}
          >
            {completionStatus} ({completionPercentage}%)
          </Text>
        </View>
        <View className="h-2 bg-cream-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: completionColor,
            }}
          />
        </View>
      </View>

      {hasConditions ? (
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
          <View className="space-y-4">
            {/* Environment Section */}
            {(garden.sunlight?.length > 0 ||
              garden.soil_textures?.length > 0 ||
              garden.soil_ph_ranges?.length > 0 ||
              garden.soil_drainage?.length > 0 ||
              garden.nc_regions?.length > 0 ||
              garden.usda_zones?.length > 0) && (
              <View>
                <SectionHeader
                  title="Environment"
                  icon="sunny-outline"
                  category="environment"
                />

                <ConditionCard
                  icon="sunny"
                  title="Sunlight"
                  value={formatConditionValues(garden.sunlight)}
                  category="environment"
                />

                <ConditionCard
                  icon="layers-outline"
                  title="Soil Type"
                  value={formatConditionValues(garden.soil_textures)}
                  category="environment"
                />

                <ConditionCard
                  icon="flask-outline"
                  title="Soil pH Range"
                  value={formatConditionValues(garden.soil_ph_ranges)}
                  category="environment"
                />

                <ConditionCard
                  icon="water-outline"
                  title="Soil Drainage"
                  value={formatConditionValues(garden.soil_drainage)}
                  category="environment"
                />

                <ConditionCard
                  icon="thermometer-outline"
                  title="USDA Zones"
                  value={formatConditionValues(garden.usda_zones)}
                  category="environment"
                />

                <ConditionCard
                  icon="map-outline"
                  title="Region"
                  value={formatConditionValues(garden.nc_regions)}
                  category="environment"
                />
              </View>
            )}

            {/* Design Section */}
            {(garden.landscape_locations?.length > 0 ||
              garden.garden_themes?.length > 0 ||
              garden.design_features?.length > 0 ||
              garden.available_space_to_plant?.length > 0) && (
              <View>
                <SectionHeader
                  title="Design"
                  icon="grid-outline"
                  category="design"
                />

                <ConditionCard
                  icon="location-outline"
                  title="Locations"
                  value={formatConditionValues(garden.landscape_locations)}
                  category="design"
                />

                <ConditionCard
                  icon="color-palette-outline"
                  title="Garden Themes"
                  value={formatConditionValues(garden.garden_themes)}
                  category="design"
                />

                <ConditionCard
                  icon="grid-outline"
                  title="Design Features"
                  value={formatConditionValues(garden.design_features)}
                  category="design"
                />

                <ConditionCard
                  icon="resize-outline"
                  title="Space Available"
                  value={formatConditionValues(garden.available_space_to_plant)}
                  category="design"
                />
              </View>
            )}

            {/* Plants Section */}
            {(garden.plant_types?.length > 0 ||
              garden.habit_forms?.length > 0 ||
              garden.growth_rate ||
              garden.wildlife_attractions?.length > 0 ||
              garden.resistance_challenges?.length > 0 ||
              garden.problems?.length > 0) && (
              <View>
                <SectionHeader
                  title="Plants"
                  icon="leaf-outline"
                  category="plants"
                />

                <ConditionCard
                  icon="leaf-outline"
                  title="Plant Types"
                  value={formatConditionValues(garden.plant_types)}
                  category="plants"
                />

                <ConditionCard
                  icon="git-branch-outline"
                  title="Plant Form/Habit"
                  value={formatConditionValues(garden.habit_forms)}
                  category="plants"
                />

                <ConditionCard
                  icon="trending-up-outline"
                  title="Growth Rate"
                  value={garden.growth_rate || ""}
                  category="plants"
                />

                <ConditionCard
                  icon="paw-outline"
                  title="Wildlife Attractions"
                  value={formatConditionValues(garden.wildlife_attractions)}
                  category="plants"
                />

                <ConditionCard
                  icon="shield-outline"
                  title="Resistance Challenges"
                  value={formatConditionValues(garden.resistance_challenges)}
                  category="plants"
                />

                <ConditionCard
                  icon="alert-circle-outline"
                  title="Problems to Exclude"
                  value={formatConditionValues(garden.problems)}
                  category="plants"
                />
              </View>
            )}

            {/* Aesthetics Section */}
            {(garden.flower_colors?.length > 0 ||
              garden.leaf_colors?.length > 0 ||
              garden.flower_bloom_times?.length > 0 ||
              garden.flower_values?.length > 0 ||
              garden.leaf_feels?.length > 0 ||
              garden.leaf_values?.length > 0 ||
              garden.fall_colors?.length > 0 ||
              garden.texture) && (
              <View>
                <SectionHeader
                  title="Aesthetics"
                  icon="color-palette-outline"
                  category="aesthetics"
                />

                <ConditionCard
                  icon="flower-outline"
                  title="Flower Colors"
                  value={formatConditionValues(garden.flower_colors)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="calendar-outline"
                  title="Flower Bloom Times"
                  value={formatConditionValues(garden.flower_bloom_times)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="star-outline"
                  title="Flower Values"
                  value={formatConditionValues(garden.flower_values)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="leaf-outline"
                  title="Leaf Colors"
                  value={formatConditionValues(garden.leaf_colors)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="hand-left-outline"
                  title="Leaf Textures"
                  value={formatConditionValues(garden.leaf_feels)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="apps-outline"
                  title="Leaf Values"
                  value={formatConditionValues(garden.leaf_values)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="leaf-outline"
                  title="Fall Colors"
                  value={formatConditionValues(garden.fall_colors)}
                  category="aesthetics"
                />

                <ConditionCard
                  icon="diamond-outline"
                  title="Texture Preference"
                  value={garden.texture || ""}
                  category="aesthetics"
                />
              </View>
            )}

            {/* Preferences */}
            {(garden.maintenance ||
              garden.wants_recommendations !== null ||
              garden.year_round_interest !== null) && (
              <View>
                <SectionHeader
                  title="Preferences"
                  icon="options-outline"
                  category="preferences"
                />

                <ConditionCard
                  icon="construct-outline"
                  title="Maintenance Level"
                  value={garden.maintenance || ""}
                  category="preferences"
                />

                <View className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-3">
                  <Text className="text-slate-800 font-medium mb-2 flex-row items-center">
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color="#475569"
                      style={{ marginRight: 8 }}
                    />
                    Settings
                  </Text>

                  <View className="space-y-2">
                    {garden.wants_recommendations !== null && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name={
                            garden.wants_recommendations
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={16}
                          color={
                            garden.wants_recommendations ? "#77B860" : "#9ca3af"
                          }
                        />
                        <Text className="text-gray-700 text-sm ml-2">
                          Plant Recommendations:{" "}
                          {garden.wants_recommendations
                            ? "Enabled"
                            : "Disabled"}
                        </Text>
                      </View>
                    )}

                    {garden.year_round_interest !== null && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name={
                            garden.year_round_interest
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={16}
                          color={
                            garden.year_round_interest ? "#77B860" : "#9ca3af"
                          }
                        />
                        <Text className="text-gray-700 text-sm ml-2">
                          Year-round Interest:{" "}
                          {garden.year_round_interest ? "Enabled" : "Disabled"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center py-6">
          <Ionicons
            name="leaf-outline"
            size={40}
            color="#9e9a90"
            className="mb-2"
          />
          <Text className="text-center text-cream-500 mb-4">
            Set your garden conditions to get personalized plant recommendations
          </Text>
          <TouchableOpacity
            onPress={onEditPress}
            className="flex-row bg-brand-500 rounded-lg items-center px-6 py-3"
          >
            <Text className="text-white font-medium">Set Conditions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
