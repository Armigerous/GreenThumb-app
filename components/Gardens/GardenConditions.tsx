import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Garden } from "../../types/garden";
import { formatConditionValues } from "../../lib/gardenHelpers";
import GardenConditionsEditor from "./GardenConditionsEditor";

type GardenConditionsProps = {
  garden: Garden;
  onEditPress: () => void;
  onSettingsUpdate?: (updated: boolean) => void;
};

// Condition card component for better organization
function ConditionCard({
  icon,
  title,
  value,
  bgColor = "bg-amber-50",
  textColor = "text-amber-700",
  valueColor = "text-amber-600",
  iconColor = "#d97706",
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value: string;
  bgColor?: string;
  textColor?: string;
  valueColor?: string;
  iconColor?: string;
}) {
  if (!value) return null;

  return (
    <View className={`${bgColor} p-3 rounded-lg mb-3`}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text className={`${textColor} font-medium ml-2`}>{title}</Text>
      </View>
      <Text className={`${valueColor} text-sm`}>{value}</Text>
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

  const hasConditions = Boolean(
    (garden.sunlight_conditions && garden.sunlight_conditions.length > 0) ||
      (garden.soil_textures && garden.soil_textures.length > 0) ||
      (garden.soil_ph_ranges && garden.soil_ph_ranges.length > 0) ||
      (garden.soil_drainage && garden.soil_drainage.length > 0)
  );

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
    <View className="bg-white p-4 rounded-xl mb-8 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-foreground text-lg font-semibold">
          Growing Conditions
        </Text>
        <TouchableOpacity
          onPress={toggleEditMode}
          className="bg-cream-50 p-2 rounded-full"
        >
          <Ionicons name="create-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {hasConditions ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="space-y-1">
            {/* Environment Section */}
            {(garden.sunlight_conditions?.length > 0 ||
              garden.soil_textures?.length > 0 ||
              garden.soil_ph_ranges?.length > 0 ||
              garden.soil_drainage?.length > 0) && (
              <View className="mb-4">
                <Text className="text-brand-800 font-semibold mb-2 text-sm uppercase tracking-wider">
                  Environment
                </Text>

                <ConditionCard
                  icon="sunny"
                  title="Sunlight"
                  value={formatConditionValues(garden.sunlight_conditions)}
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                  valueColor="text-amber-600"
                  iconColor="#d97706"
                />

                <ConditionCard
                  icon="layers-outline"
                  title="Soil Type"
                  value={formatConditionValues(garden.soil_textures)}
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                  valueColor="text-amber-600"
                  iconColor="#92400e"
                />

                <ConditionCard
                  icon="flask-outline"
                  title="Soil pH Range"
                  value={formatConditionValues(garden.soil_ph_ranges)}
                  bgColor="bg-purple-50"
                  textColor="text-purple-700"
                  valueColor="text-purple-600"
                  iconColor="#6b21a8"
                />

                <ConditionCard
                  icon="water-outline"
                  title="Soil Drainage"
                  value={formatConditionValues(garden.soil_drainage)}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  valueColor="text-blue-600"
                  iconColor="#0284c7"
                />

                <ConditionCard
                  icon="location-outline"
                  title="Locations"
                  value={formatConditionValues(garden.landscape_locations)}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  valueColor="text-blue-600"
                  iconColor="#0284c7"
                />
              </View>
            )}

            {/* Maintenance Section */}
            {(garden.maintenance ||
              garden.growth_rate ||
              garden.available_space_to_plant?.length > 0 ||
              garden.resistance_challenges?.length > 0 ||
              garden.problems?.length > 0) && (
              <View className="mb-4">
                <Text className="text-brand-800 font-semibold mb-2 text-sm uppercase tracking-wider">
                  Maintenance & Growth
                </Text>

                <ConditionCard
                  icon="construct-outline"
                  title="Maintenance Level"
                  value={garden.maintenance || ""}
                  bgColor="bg-brand-50"
                  textColor="text-brand-700"
                  valueColor="text-brand-600"
                  iconColor="#059669"
                />

                <ConditionCard
                  icon="trending-up-outline"
                  title="Growth Rate"
                  value={garden.growth_rate || ""}
                  bgColor="bg-brand-50"
                  textColor="text-brand-700"
                  valueColor="text-brand-600"
                  iconColor="#059669"
                />

                <ConditionCard
                  icon="resize-outline"
                  title="Space Available"
                  value={formatConditionValues(garden.available_space_to_plant)}
                  bgColor="bg-brand-50"
                  textColor="text-brand-700"
                  valueColor="text-brand-600"
                  iconColor="#059669"
                />

                <ConditionCard
                  icon="shield-outline"
                  title="Resistance Challenges"
                  value={formatConditionValues(garden.resistance_challenges)}
                  bgColor="bg-brand-50"
                  textColor="text-brand-700"
                  valueColor="text-brand-600"
                  iconColor="#059669"
                />

                <ConditionCard
                  icon="alert-circle-outline"
                  title="Problems to Exclude"
                  value={formatConditionValues(garden.problems)}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  valueColor="text-red-600"
                  iconColor="#dc2626"
                />
              </View>
            )}

            {/* Aesthetics Section */}
            {(garden.garden_themes?.length > 0 ||
              garden.flower_colors?.length > 0 ||
              garden.leaf_colors?.length > 0 ||
              garden.texture ||
              garden.wildlife_attractions?.length > 0) && (
              <View className="mb-4">
                <Text className="text-brand-800 font-semibold mb-2 text-sm uppercase tracking-wider">
                  Aesthetics & Design
                </Text>

                <ConditionCard
                  icon="color-palette-outline"
                  title="Garden Themes"
                  value={formatConditionValues(garden.garden_themes)}
                  bgColor="bg-purple-50"
                  textColor="text-purple-700"
                  valueColor="text-purple-600"
                  iconColor="#6b21a8"
                />

                <ConditionCard
                  icon="flower-outline"
                  title="Flower Colors"
                  value={formatConditionValues(garden.flower_colors)}
                  bgColor="bg-pink-50"
                  textColor="text-pink-700"
                  valueColor="text-pink-600"
                  iconColor="#be185d"
                />

                <ConditionCard
                  icon="leaf-outline"
                  title="Leaf Colors"
                  value={formatConditionValues(garden.leaf_colors)}
                  bgColor="bg-brand-50"
                  textColor="text-brand-700"
                  valueColor="text-brand-600"
                  iconColor="#059669"
                />

                <ConditionCard
                  icon="diamond-outline"
                  title="Texture Preference"
                  value={garden.texture || ""}
                  bgColor="bg-purple-50"
                  textColor="text-purple-700"
                  valueColor="text-purple-600"
                  iconColor="#6b21a8"
                />

                <ConditionCard
                  icon="paw-outline"
                  title="Wildlife Attractions"
                  value={formatConditionValues(garden.wildlife_attractions)}
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                  valueColor="text-amber-600"
                  iconColor="#d97706"
                />
              </View>
            )}

            {/* Preferences */}
            {(garden.wants_recommendations || garden.year_round_interest) && (
              <View className="mb-4">
                <Text className="text-brand-800 font-semibold mb-2 text-sm uppercase tracking-wider">
                  Preferences
                </Text>

                <View className="bg-cream-50 p-3 rounded-lg mb-3">
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color="#047857"
                    />
                    <Text className="text-brand-700 font-medium ml-2">
                      Settings
                    </Text>
                  </View>

                  {garden.wants_recommendations && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#77B860"
                      />
                      <Text className="text-brand-600 text-sm ml-2">
                        Plant Recommendations Enabled
                      </Text>
                    </View>
                  )}

                  {garden.year_round_interest && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#77B860"
                      />
                      <Text className="text-brand-600 text-sm ml-2">
                        Year-round Interest
                      </Text>
                    </View>
                  )}
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
            onPress={toggleEditMode}
            className="flex-row bg-brand-500 rounded-full items-center px-4 py-2"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-medium ml-2">Set Conditions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
