import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type GardenConditionsProps = {
  garden: {
    // Environmental factors
    soil_texture?: string[];
    soil_ph?: string[];
    soil_drainage?: string[];
    sunlight?: string[];
    nc_regions?: string[];
    usda_zones?: string[];

    // Plant characteristics
    growth_rate?: string;
    maintenance_level?: string;
    texture_preference?: string;

    // Plant preferences
    resistance_challenges?: string[];
    problems_to_exclude?: string[];

    // Garden design
    garden_themes?: string[];
    wildlife_attractions?: string[];
    locations?: string[];
    available_space?: string[];
    year_round_interest?: boolean;

    // Visual attributes
    flower_colors?: string[];
    flower_bloom_times?: string[];
    flower_values?: string[];
    leaf_colors?: string[];
    leaf_feels?: string[];
    leaf_values?: string[];
    fall_colors?: string[];
    habit_forms?: string[];
    plant_types?: string[];
    design_features?: string[];
  };
  onEditPress?: () => void;
};

export default function GardenConditions({
  garden,
  onEditPress,
}: GardenConditionsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  // Format setting values into readable text
  const formatSettingValues = (values?: string | string[] | boolean) => {
    if (values === undefined || values === null) return "Not set";

    if (typeof values === "boolean") {
      return values ? "Yes" : "No";
    }

    if (Array.isArray(values)) {
      if (values.length === 0) return "Not set";
      if (values.length === 1) return values[0];
      return `${values[0]} +${values.length - 1} more`;
    }

    return values;
  };

  // Setting category renderers
  const renderEnvironmentalFactors = () => (
    <View className="mt-3 space-y-3">
      <SettingItem
        label="Sunlight"
        value={garden.sunlight}
        icon="sunny"
        color="#f59e0b"
      />
      <SettingItem
        label="Soil Texture"
        value={garden.soil_texture}
        icon="layers"
        color="#78350f"
      />
      <SettingItem
        label="Soil pH"
        value={garden.soil_ph}
        icon="flask"
        color="#7c3aed"
      />
      <SettingItem
        label="Soil Drainage"
        value={garden.soil_drainage}
        icon="water"
        color="#0ea5e9"
      />
      <SettingItem
        label="NC Region"
        value={garden.nc_regions}
        icon="location"
        color="#059669"
      />
      <SettingItem
        label="USDA Zones"
        value={garden.usda_zones}
        icon="thermometer"
        color="#4f46e5"
      />
    </View>
  );

  const renderPlantCharacteristics = () => (
    <View className="mt-3 space-y-3">
      <SettingItem
        label="Growth Rate"
        value={garden.growth_rate}
        icon="trending-up"
        color="#059669"
      />
      <SettingItem
        label="Maintenance Level"
        value={garden.maintenance_level}
        icon="construct"
        color="#d97706"
      />
      <SettingItem
        label="Texture Preference"
        value={garden.texture_preference}
        icon="hand-left"
        color="#7c3aed"
      />
      <SettingItem
        label="Plant Types"
        value={garden.plant_types}
        icon="leaf"
        color="#16a34a"
      />
      <SettingItem
        label="Habit Forms"
        value={garden.habit_forms}
        icon="body"
        color="#6366f1"
      />
    </View>
  );

  const renderGardenDesign = () => (
    <View className="mt-3 space-y-3">
      <SettingItem
        label="Garden Themes"
        value={garden.garden_themes}
        icon="flower"
        color="#ec4899"
      />
      <SettingItem
        label="Wildlife Attractions"
        value={garden.wildlife_attractions}
        icon="bug"
        color="#ca8a04"
      />
      <SettingItem
        label="Locations"
        value={garden.locations}
        icon="navigate"
        color="#059669"
      />
      <SettingItem
        label="Available Space"
        value={garden.available_space}
        icon="resize"
        color="#6366f1"
      />
      <SettingItem
        label="Year-Round Interest"
        value={garden.year_round_interest}
        icon="calendar"
        color="#0284c7"
      />
      <SettingItem
        label="Design Features"
        value={garden.design_features}
        icon="color-palette"
        color="#ec4899"
      />
    </View>
  );

  const renderVisualAttributes = () => (
    <View className="mt-3 space-y-3">
      <SettingItem
        label="Flower Colors"
        value={garden.flower_colors}
        icon="color-palette"
        color="#ec4899"
      />
      <SettingItem
        label="Flower Bloom Times"
        value={garden.flower_bloom_times}
        icon="calendar"
        color="#0284c7"
      />
      <SettingItem
        label="Flower Values"
        value={garden.flower_values}
        icon="pricetag"
        color="#4f46e5"
      />
      <SettingItem
        label="Leaf Colors"
        value={garden.leaf_colors}
        icon="color-palette"
        color="#16a34a"
      />
      <SettingItem
        label="Leaf Textures"
        value={garden.leaf_feels}
        icon="hand-left"
        color="#65a30d"
      />
      <SettingItem
        label="Leaf Values"
        value={garden.leaf_values}
        icon="pricetag"
        color="#16a34a"
      />
      <SettingItem
        label="Fall Colors"
        value={garden.fall_colors}
        icon="color-palette"
        color="#b45309"
      />
    </View>
  );

  const renderPlantPreferences = () => (
    <View className="mt-3 space-y-3">
      <SettingItem
        label="Resistance Challenges"
        value={garden.resistance_challenges}
        icon="shield"
        color="#059669"
      />
      <SettingItem
        label="Problems to Exclude"
        value={garden.problems_to_exclude}
        icon="close-circle"
        color="#dc2626"
      />
    </View>
  );

  // Individual setting item component
  const SettingItem = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value?: string | string[] | boolean;
    icon: string;
    color: string;
  }) => (
    <View className="flex-row items-center">
      <View className="w-10 items-center">
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-cream-600 text-xs font-medium mb-1">{label}</Text>
        <Text className="text-foreground text-sm">
          {formatSettingValues(value)}
        </Text>
      </View>
    </View>
  );

  // Category component
  const CategorySection = ({
    title,
    icon,
    color,
    category,
    contentRenderer,
  }: {
    title: string;
    icon: string;
    color: string;
    category: string;
    contentRenderer: () => JSX.Element;
  }) => (
    <View className="mb-3">
      <TouchableOpacity
        className="flex-row justify-between items-center py-2"
        onPress={() => toggleCategory(category)}
      >
        <View className="flex-row items-center">
          <View className="bg-cream-100 h-8 justify-center rounded-full w-8 items-center mr-2">
            <Ionicons name={icon as any} size={18} color={color} />
          </View>
          <Text className="text-foreground font-medium">{title}</Text>
        </View>
        <Ionicons
          name={expandedCategory === category ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9e9a90"
        />
      </TouchableOpacity>

      {expandedCategory === category && contentRenderer()}
    </View>
  );

  return (
    <View className="bg-white p-4 rounded-xl shadow mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons name="settings-outline" size={20} color="#5E994B" />
          <Text className="text-foreground text-lg font-semibold ml-2">
            Garden Settings
          </Text>
        </View>

        {onEditPress && (
          <TouchableOpacity
            className="bg-cream-100 p-2 rounded-full"
            onPress={onEditPress}
          >
            <Ionicons name="pencil" size={16} color="#5E994B" />
          </TouchableOpacity>
        )}
      </View>

      <CategorySection
        title="Environmental Factors"
        icon="earth"
        color="#0ea5e9"
        category="environmental"
        contentRenderer={renderEnvironmentalFactors}
      />

      <CategorySection
        title="Plant Characteristics"
        icon="leaf"
        color="#16a34a"
        category="characteristics"
        contentRenderer={renderPlantCharacteristics}
      />

      <CategorySection
        title="Garden Design"
        icon="color-palette"
        color="#ec4899"
        category="design"
        contentRenderer={renderGardenDesign}
      />

      <CategorySection
        title="Visual Attributes"
        icon="eye"
        color="#7c3aed"
        category="visual"
        contentRenderer={renderVisualAttributes}
      />

      <CategorySection
        title="Plant Preferences"
        icon="options"
        color="#d97706"
        category="preferences"
        contentRenderer={renderPlantPreferences}
      />
    </View>
  );
}
