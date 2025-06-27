import {
  getCompletionColor,
  getIdsFromNames,
  LOOKUP_TABLES,
} from "@/lib/gardenHelpers";
import { supabase } from "@/lib/supabaseClient";
import type { Garden } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type GardenConditionsEditorProps = {
  garden: Garden;
  onCancel: () => void;
  onSave: (updated: boolean) => void;
};

// Define the type for lookup table items
type LookupItem = {
  label: string;
  value: number;
};

// Define allowed icon names type for safety
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Collapsible section component to better organize form
function CollapsibleSection({
  title,
  icon,
  children,
  initiallyExpanded = false,
}: {
  title: string;
  icon: IconName;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View className="mb-4 border border-cream-300 rounded-lg overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row justify-between items-center p-3 bg-cream-50"
      >
        <View className="flex-row items-center">
          <Ionicons name={icon} size={18} color="#059669" className="mr-2" />
          <Text className="text-foreground font-semibold ml-2">{title}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6b7280"
        />
      </TouchableOpacity>

      {expanded && <View className="p-3 bg-cream-50">{children}</View>}
    </View>
  );
}

// Enhanced SelectionItem component for our custom selector
function SelectionItem({
  label,
  isSelected,
  onToggle,
  multiple = true,
}: {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  multiple?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-3 border-b border-cream-300 ${
        isSelected ? "bg-cream-100" : "bg-cream-50"
      }`}
      onPress={onToggle}
    >
      <Ionicons
        name={
          multiple
            ? isSelected
              ? "checkbox"
              : "square-outline"
            : isSelected
            ? "radio-button-on"
            : "radio-button-off"
        }
        size={22}
        color={isSelected ? "#77B860" : "#9ca3af"}
        className="mr-2"
      />
      <Text
        className={`ml-2 text-base ${
          isSelected ? "text-brand-800 font-medium" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Mobile-friendly selection modal instead of dropdown
function SelectionModal<T extends boolean = true>({
  visible,
  onClose,
  title,
  items,
  selectedValues,
  onSelectionChange,
  multiple = true as T,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: { label: string; value: number }[];
  selectedValues: T extends true ? number[] : number | null;
  onSelectionChange: (
    values: T extends true ? number[] : number | null
  ) => void;
  multiple?: T;
}) {
  const flatListRef = useRef<FlatList>(null);

  // Get initial selected item index to scroll to it
  const firstSelectedIndex = items.findIndex((item) =>
    multiple
      ? (selectedValues as number[])?.includes(item.value)
      : selectedValues === item.value
  );

  const handleItemToggle = (value: number) => {
    if (multiple) {
      const currentSelected = selectedValues as number[];
      const newValues = currentSelected.includes(value)
        ? currentSelected.filter((v) => v !== value)
        : [...currentSelected, value];
      onSelectionChange(newValues as any);
    } else {
      onSelectionChange(value as any);
    }
  };

  const handleDone = () => {
    onClose();
  };

  // Clear all selections
  const handleClear = () => {
    if (multiple) {
      onSelectionChange([] as any);
    } else {
      onSelectionChange(null as any);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-end">
        <View className="bg-cream-50 rounded-t-xl h-[70%] w-full">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-cream-300">
            <TouchableOpacity onPress={handleClear}>
              <Text className="text-red-500 font-medium">Clear</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-center">{title}</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text className="text-brand-600 font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          {/* List of options */}
          <FlatList
            ref={flatListRef}
            data={items}
            initialScrollIndex={
              firstSelectedIndex > -1 ? firstSelectedIndex : 0
            }
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <SelectionItem
                label={item.label}
                isSelected={
                  multiple
                    ? (selectedValues as number[])?.includes(item.value)
                    : selectedValues === item.value
                }
                onToggle={() => handleItemToggle(item.value)}
                multiple={multiple}
              />
            )}
            className="flex-1"
            showsVerticalScrollIndicator={true}
            onScrollToIndexFailed={() => {}}
          />
        </View>
      </View>
    </Modal>
  );
}

// Custom selector component that uses a modal for selection
function BetterSelector<T extends boolean = true>({
  label,
  placeholder,
  items,
  value,
  onChange,
  multiple = true as T,
}: {
  label: string;
  placeholder: string;
  items: { label: string; value: number }[];
  value: T extends true ? number[] : number | null;
  onChange: (value: T extends true ? number[] : number | null) => void;
  multiple?: T;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Display selected values as a comma-separated list
  const getDisplayValue = () => {
    if (multiple) {
      if (!(value as number[])?.length) return "";

      return items
        .filter((item) => (value as number[]).includes(item.value))
        .map((item) => item.label)
        .join(", ");
    } else {
      if (!value) return "";

      const selectedItem = items.find((item) => item.value === value);
      return selectedItem ? selectedItem.label : "";
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-foreground font-medium mb-2">{label}</Text>

      <TouchableOpacity
        className="border border-cream-300 rounded-lg p-3 bg-cream-50 min-h-[45px] flex-row justify-between items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className={getDisplayValue() ? "text-gray-800" : "text-gray-400"}>
          {getDisplayValue() || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </TouchableOpacity>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label}
        items={items}
        selectedValues={value}
        onSelectionChange={onChange}
        multiple={multiple}
      />
    </View>
  );
}

export default function GardenConditionsEditor({
  garden,
  onCancel,
  onSave,
}: GardenConditionsEditorProps) {
  const [activeTab, setActiveTab] = useState("environment");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // State for form values
  const [formValues, setFormValues] = useState({
    name: garden.name || "",
    // Environment settings
    light_ids: getIdsFromNames(garden.sunlight, LOOKUP_TABLES.light),
    soil_texture_ids: getIdsFromNames(
      garden.soil_textures || garden.soil_texture,
      LOOKUP_TABLES.soil_texture
    ),
    soil_drainage_ids: getIdsFromNames(
      garden.soil_drainage,
      LOOKUP_TABLES.soil_drainage
    ),
    soil_ph_ids: getIdsFromNames(
      garden.soil_ph_ranges || garden.soil_ph,
      LOOKUP_TABLES.soil_ph
    ),
    landscape_location_ids:
      getIdsFromNames(
        garden.landscape_locations || garden.locations,
        LOOKUP_TABLES.landscape_location
      ) || [],
    nc_region_ids: LOOKUP_TABLES.nc_regions
      ? getIdsFromNames(garden.nc_regions, LOOKUP_TABLES.nc_regions) || []
      : [],
    usda_zone_ids: LOOKUP_TABLES.usda_zone
      ? getIdsFromNames(garden.usda_zones, LOOKUP_TABLES.usda_zone) || []
      : [],

    // Maintenance and preferences
    maintenance_id: garden.maintenance_level
      ? LOOKUP_TABLES.maintenance.find(
          (option: LookupItem) => option.label === garden.maintenance_level
        )?.value || null
      : garden.maintenance
      ? LOOKUP_TABLES.maintenance.find(
          (option: LookupItem) => option.label === garden.maintenance
        )?.value || null
      : null,
    growth_rate_id: garden.growth_rate
      ? LOOKUP_TABLES.growth_rate.find(
          (option: LookupItem) => option.label === garden.growth_rate
        )?.value || null
      : null,
    available_space_to_plant_ids: getIdsFromNames(
      garden.available_space_to_plant || garden.available_space,
      LOOKUP_TABLES.available_space_to_plant
    ),
    texture_id: garden.texture_preference
      ? LOOKUP_TABLES.texture.find(
          (option: LookupItem) => option.label === garden.texture_preference
        )?.value || null
      : garden.texture
      ? LOOKUP_TABLES.texture.find(
          (option: LookupItem) => option.label === garden.texture
        )?.value || null
      : null,

    // Garden design
    landscape_theme_ids:
      getIdsFromNames(garden.garden_themes, LOOKUP_TABLES.landscape_theme) ||
      [],
    attracts_ids:
      getIdsFromNames(garden.wildlife_attractions, LOOKUP_TABLES.attracts) ||
      [],
    resistance_to_challenges_ids:
      getIdsFromNames(
        garden.resistance_challenges,
        LOOKUP_TABLES.resistance_to_challenges
      ) || [],
    problems_ids:
      getIdsFromNames(garden.problems, LOOKUP_TABLES.problems) || [],
    design_feature_ids: LOOKUP_TABLES.design_feature
      ? getIdsFromNames(garden.design_features, LOOKUP_TABLES.design_feature) ||
        []
      : [],
    plant_type_ids: LOOKUP_TABLES.plant_type
      ? getIdsFromNames(garden.plant_types, LOOKUP_TABLES.plant_type) || []
      : [],
    habit_form_ids: LOOKUP_TABLES.habit_form
      ? getIdsFromNames(garden.habit_forms, LOOKUP_TABLES.habit_form) || []
      : [],

    // Plant aesthetics
    flower_color_ids:
      getIdsFromNames(garden.flower_colors, LOOKUP_TABLES.flower_color) || [],
    leaf_color_ids:
      getIdsFromNames(garden.leaf_colors, LOOKUP_TABLES.leaf_color) || [],
    flower_bloom_time_ids: LOOKUP_TABLES.flower_bloom_time
      ? getIdsFromNames(
          garden.flower_bloom_times,
          LOOKUP_TABLES.flower_bloom_time
        ) || []
      : [],
    flower_value_to_gardener_ids: LOOKUP_TABLES.flower_value_to_gardener
      ? getIdsFromNames(
          garden.flower_values,
          LOOKUP_TABLES.flower_value_to_gardener
        ) || []
      : [],
    leaf_feel_ids: LOOKUP_TABLES.leaf_feel
      ? getIdsFromNames(garden.leaf_feels, LOOKUP_TABLES.leaf_feel) || []
      : [],
    leaf_value_ids: LOOKUP_TABLES.leaf_value
      ? getIdsFromNames(garden.leaf_values, LOOKUP_TABLES.leaf_value) || []
      : [],
    fall_color_ids: LOOKUP_TABLES.fall_color
      ? getIdsFromNames(garden.fall_colors, LOOKUP_TABLES.fall_color) || []
      : [],

    // Preferences
    wants_recommendations: garden.wants_recommendations || false,
    year_round_interest: garden.year_round_interest || false,
  });

  // Handle form field changes
  const updateFormValues = useCallback((field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Save changes to database
  const saveChanges = async () => {
    setIsSaving(true);

    try {
      // Only include fields that we're explicitly setting in the form
      // This prevents overwriting fields that might have been changed elsewhere
      const gardenDbUpdate = {
        name: formValues.name,
        light_ids: formValues.light_ids,
        soil_texture_ids: formValues.soil_texture_ids,
        soil_drainage_ids: formValues.soil_drainage_ids,
        soil_ph_ids: formValues.soil_ph_ids,
        maintenance_id: formValues.maintenance_id,
        growth_rate_id: formValues.growth_rate_id,
        available_space_to_plant_ids: formValues.available_space_to_plant_ids,
        wants_recommendations: formValues.wants_recommendations,
        year_round_interest: formValues.year_round_interest,
        landscape_location_ids: formValues.landscape_location_ids,
        landscape_theme_ids: formValues.landscape_theme_ids,
        attracts_ids: formValues.attracts_ids,
        resistance_to_challenges_ids: formValues.resistance_to_challenges_ids,
        problems_ids: formValues.problems_ids,
        flower_color_ids: formValues.flower_color_ids,
        leaf_color_ids: formValues.leaf_color_ids,
        texture_id: formValues.texture_id,
        nc_region_ids: formValues.nc_region_ids,
        usda_zone_ids: formValues.usda_zone_ids,
        flower_bloom_time_ids: formValues.flower_bloom_time_ids,
        flower_value_to_gardener_ids: formValues.flower_value_to_gardener_ids,
        leaf_feel_ids: formValues.leaf_feel_ids,
        leaf_value_ids: formValues.leaf_value_ids,
        fall_color_ids: formValues.fall_color_ids,
        design_feature_ids: formValues.design_feature_ids,
        plant_type_ids: formValues.plant_type_ids,
        habit_form_ids: formValues.habit_form_ids,
        // Set updated_at timestamp
        updated_at: new Date().toISOString(),
      };

      console.log("Updating garden with ID:", garden.id);
      console.log(
        "Garden update data:",
        JSON.stringify(gardenDbUpdate, null, 2)
      );

      // Update garden in database
      const { error, data } = await supabase
        .from("user_gardens")
        .update(gardenDbUpdate)
        .eq("id", garden.id)
        .select();

      console.log("Supabase response data:", data);

      if (error) {
        // Check if this is a permissions error with the materialized view
        if (
          error.code === "42501" &&
          error.message?.includes("user_gardens_dashboard")
        ) {
          console.warn(
            "Permission issue with materialized view update. Garden data was likely saved but the dashboard view couldn't refresh."
          );
          // The garden data was likely updated, but the trigger to refresh the materialized view failed
          // We can still consider this a success from the user's perspective

          // Force invalidate the query cache to ensure fresh data is fetched next time
          queryClient.invalidateQueries({
            queryKey: ["gardenDetails", garden.id],
          });

          setTimeout(() => onSave(true), 500); // Short delay to allow UI to update
          return;
        }

        // Handle other errors
        console.error("Supabase error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        throw error;
      }

      // Force invalidate the query cache to ensure fresh data is fetched next time
      queryClient.invalidateQueries({
        queryKey: ["gardenDetails", garden.id],
      });

      console.log("Garden updated successfully!");

      // Add a small delay before exiting edit mode to give the materialized view time to refresh
      setTimeout(() => {
        // Exit edit mode and notify parent
        onSave(true);
      }, 500);
    } catch (error) {
      console.error("Error updating garden:", error);
      onSave(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate completion percentage for progress bar
  const calculateCompletion = () => {
    // Track categories with at least one selection
    const filledCategories = {
      // Environment
      sunlight: formValues.light_ids.length > 0,
      soilTexture: formValues.soil_texture_ids.length > 0,
      soilPh: formValues.soil_ph_ids.length > 0,
      soilDrainage: formValues.soil_drainage_ids.length > 0,
      location: formValues.landscape_location_ids.length > 0,
      region: formValues.nc_region_ids.length > 0,
      zone: formValues.usda_zone_ids.length > 0,

      // Aesthetics
      gardenTheme: formValues.landscape_theme_ids.length > 0,
      flowerColor: formValues.flower_color_ids.length > 0,
      leafColor: formValues.leaf_color_ids.length > 0,
      flowerBloomTime: formValues.flower_bloom_time_ids.length > 0,
      flowerValue: formValues.flower_value_to_gardener_ids.length > 0,
      leafFeel: formValues.leaf_feel_ids.length > 0,
      leafValue: formValues.leaf_value_ids.length > 0,
      fallColor: formValues.fall_color_ids.length > 0,
      texturePreference: !!formValues.texture_id,

      // Maintenance
      maintenanceLevel: !!formValues.maintenance_id,
      growthRate: !!formValues.growth_rate_id,
      spaceAvailable: formValues.available_space_to_plant_ids.length > 0,
      wildlifeAttraction: formValues.attracts_ids.length > 0,
      resistanceChallenge: formValues.resistance_to_challenges_ids.length > 0,
      problemsToExclude: formValues.problems_ids.length > 0,
      habitForm: formValues.habit_form_ids.length > 0,
      plantType: formValues.plant_type_ids.length > 0,
      designFeature: formValues.design_feature_ids.length > 0,
    };

    // Count filled categories
    const filledCount = Object.values(filledCategories).filter(Boolean).length;
    const totalCategories = Object.keys(filledCategories).length;

    // Calculate percentage
    return (filledCount / totalCategories) * 100;
  };

  const completionPercent = calculateCompletion();
  const completionColor = getCompletionColor(completionPercent);

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "environment":
        return (
          <>
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">
                Garden Name
              </Text>
              <TextInput
                value={formValues.name}
                onChangeText={(text) => updateFormValues("name", text)}
                className="border border-cream-300 rounded-lg p-3 bg-cream-50"
                placeholder="Garden Name"
                placeholderTextColor="#BBBBBB"
              />
            </View>

            <CollapsibleSection
              title="Sunlight Conditions"
              icon="sunny"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Select the amount of sunlight your garden receives"
                placeholder="Select sunlight conditions"
                items={LOOKUP_TABLES.light}
                value={formValues.light_ids}
                onChange={(value) => updateFormValues("light_ids", value)}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Soil Properties"
              icon="layers-outline"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Soil Texture"
                placeholder="Select soil texture"
                items={LOOKUP_TABLES.soil_texture}
                value={formValues.soil_texture_ids}
                onChange={(value) =>
                  updateFormValues("soil_texture_ids", value)
                }
              />

              <BetterSelector
                label="Soil pH"
                placeholder="Select soil pH"
                items={LOOKUP_TABLES.soil_ph}
                value={formValues.soil_ph_ids}
                onChange={(value) => updateFormValues("soil_ph_ids", value)}
              />

              <BetterSelector
                label="Soil Drainage"
                placeholder="Select soil drainage"
                items={LOOKUP_TABLES.soil_drainage}
                value={formValues.soil_drainage_ids}
                onChange={(value) =>
                  updateFormValues("soil_drainage_ids", value)
                }
              />
            </CollapsibleSection>

            <CollapsibleSection title="Location" icon="location-outline">
              <BetterSelector
                label="Landscape Location"
                placeholder="Select locations"
                items={LOOKUP_TABLES.landscape_location}
                value={formValues.landscape_location_ids}
                onChange={(value) =>
                  updateFormValues("landscape_location_ids", value)
                }
              />

              {LOOKUP_TABLES.nc_regions && (
                <BetterSelector
                  label="Region"
                  placeholder="Select region"
                  items={LOOKUP_TABLES.nc_regions}
                  value={formValues.nc_region_ids}
                  onChange={(value) => updateFormValues("nc_region_ids", value)}
                />
              )}

              {LOOKUP_TABLES.usda_zone && (
                <BetterSelector
                  label="USDA Zone"
                  placeholder="Select USDA zone"
                  items={LOOKUP_TABLES.usda_zone}
                  value={formValues.usda_zone_ids}
                  onChange={(value) => updateFormValues("usda_zone_ids", value)}
                />
              )}
            </CollapsibleSection>
          </>
        );
      case "aesthetics":
        return (
          <>
            <CollapsibleSection
              title="Garden Design"
              icon="color-palette-outline"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Garden Theme"
                placeholder="Select garden themes"
                items={LOOKUP_TABLES.landscape_theme}
                value={formValues.landscape_theme_ids}
                onChange={(value) =>
                  updateFormValues("landscape_theme_ids", value)
                }
              />

              <BetterSelector
                label="Wildlife Attraction"
                placeholder="Select wildlife attractions"
                items={LOOKUP_TABLES.attracts}
                value={formValues.attracts_ids}
                onChange={(value) => updateFormValues("attracts_ids", value)}
              />

              {LOOKUP_TABLES.design_feature && (
                <BetterSelector
                  label="Design Features"
                  placeholder="Select design features"
                  items={LOOKUP_TABLES.design_feature}
                  value={formValues.design_feature_ids}
                  onChange={(value) =>
                    updateFormValues("design_feature_ids", value)
                  }
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Plant Aesthetics"
              icon="flower-outline"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Flower Colors"
                placeholder="Select flower colors"
                items={LOOKUP_TABLES.flower_color}
                value={formValues.flower_color_ids}
                onChange={(value) =>
                  updateFormValues("flower_color_ids", value)
                }
              />

              {LOOKUP_TABLES.flower_bloom_time && (
                <BetterSelector
                  label="Flower Bloom Times"
                  placeholder="Select flower bloom times"
                  items={LOOKUP_TABLES.flower_bloom_time}
                  value={formValues.flower_bloom_time_ids}
                  onChange={(value) =>
                    updateFormValues("flower_bloom_time_ids", value)
                  }
                />
              )}

              {LOOKUP_TABLES.flower_value_to_gardener && (
                <BetterSelector
                  label="Flower Values"
                  placeholder="Select flower values"
                  items={LOOKUP_TABLES.flower_value_to_gardener}
                  value={formValues.flower_value_to_gardener_ids}
                  onChange={(value) =>
                    updateFormValues("flower_value_to_gardener_ids", value)
                  }
                />
              )}

              <BetterSelector
                label="Leaf Colors"
                placeholder="Select leaf colors"
                items={LOOKUP_TABLES.leaf_color}
                value={formValues.leaf_color_ids}
                onChange={(value) => updateFormValues("leaf_color_ids", value)}
              />

              {LOOKUP_TABLES.leaf_feel && (
                <BetterSelector
                  label="Leaf Textures"
                  placeholder="Select leaf textures"
                  items={LOOKUP_TABLES.leaf_feel}
                  value={formValues.leaf_feel_ids}
                  onChange={(value) => updateFormValues("leaf_feel_ids", value)}
                />
              )}

              {LOOKUP_TABLES.leaf_value && (
                <BetterSelector
                  label="Leaf Values"
                  placeholder="Select leaf values"
                  items={LOOKUP_TABLES.leaf_value}
                  value={formValues.leaf_value_ids}
                  onChange={(value) =>
                    updateFormValues("leaf_value_ids", value)
                  }
                />
              )}

              {LOOKUP_TABLES.fall_color && (
                <BetterSelector
                  label="Fall Colors"
                  placeholder="Select fall colors"
                  items={LOOKUP_TABLES.fall_color}
                  value={formValues.fall_color_ids}
                  onChange={(value) =>
                    updateFormValues("fall_color_ids", value)
                  }
                />
              )}

              <BetterSelector
                label="Texture Preference"
                placeholder="Select texture preference"
                items={LOOKUP_TABLES.texture}
                value={formValues.texture_id}
                onChange={(value) => updateFormValues("texture_id", value)}
                multiple={false}
              />
            </CollapsibleSection>
          </>
        );
      case "maintenance":
        return (
          <>
            <CollapsibleSection
              title="Space & Growth"
              icon="resize-outline"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Available Space"
                placeholder="Select available space"
                items={LOOKUP_TABLES.available_space_to_plant}
                value={formValues.available_space_to_plant_ids}
                onChange={(value) =>
                  updateFormValues("available_space_to_plant_ids", value)
                }
              />

              <BetterSelector
                label="Growth Rate"
                placeholder="Select growth rate preference"
                items={LOOKUP_TABLES.growth_rate}
                value={formValues.growth_rate_id}
                onChange={(value) => updateFormValues("growth_rate_id", value)}
                multiple={false}
              />

              {LOOKUP_TABLES.habit_form && (
                <BetterSelector
                  label="Plant Form/Habit"
                  placeholder="Select plant forms"
                  items={LOOKUP_TABLES.habit_form}
                  value={formValues.habit_form_ids}
                  onChange={(value) =>
                    updateFormValues("habit_form_ids", value)
                  }
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Requirements"
              icon="construct-outline"
              initiallyExpanded={true}
            >
              <BetterSelector
                label="Maintenance Level"
                placeholder="Select maintenance level"
                items={LOOKUP_TABLES.maintenance}
                value={formValues.maintenance_id}
                onChange={(value) => updateFormValues("maintenance_id", value)}
                multiple={false}
              />

              <BetterSelector
                label="Resistance Challenges"
                placeholder="Select resistance challenges"
                items={LOOKUP_TABLES.resistance_to_challenges}
                value={formValues.resistance_to_challenges_ids}
                onChange={(value) =>
                  updateFormValues("resistance_to_challenges_ids", value)
                }
              />

              <BetterSelector
                label="Problems to Exclude"
                placeholder="Select problems to exclude"
                items={LOOKUP_TABLES.problems}
                value={formValues.problems_ids}
                onChange={(value) => updateFormValues("problems_ids", value)}
              />
            </CollapsibleSection>

            {LOOKUP_TABLES.plant_type && (
              <CollapsibleSection title="Plant Types" icon="leaf-outline">
                <BetterSelector
                  label="Plant Types"
                  placeholder="Select plant types"
                  items={LOOKUP_TABLES.plant_type}
                  value={formValues.plant_type_ids}
                  onChange={(value) =>
                    updateFormValues("plant_type_ids", value)
                  }
                />
              </CollapsibleSection>
            )}

            <CollapsibleSection title="Preferences" icon="options-outline">
              <View className="p-3 bg-cream-50 border border-cream-300 rounded-lg">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-foreground font-medium">
                      Plant Recommendations
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Get personalized plant suggestions
                    </Text>
                  </View>
                  <Switch
                    value={formValues.wants_recommendations}
                    onValueChange={(val) =>
                      updateFormValues("wants_recommendations", val)
                    }
                    trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
                    thumbColor={
                      formValues.wants_recommendations ? "#77B860" : "#f4f4f5"
                    }
                  />
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-4">
                    <Text className="text-foreground font-medium">
                      Year-round Interest
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Plants that look good all seasons
                    </Text>
                  </View>
                  <Switch
                    value={formValues.year_round_interest}
                    onValueChange={(val) =>
                      updateFormValues("year_round_interest", val)
                    }
                    trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
                    thumbColor={
                      formValues.year_round_interest ? "#77B860" : "#f4f4f5"
                    }
                  />
                </View>
              </View>
            </CollapsibleSection>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View className="bg-cream-50 p-4 rounded-xl mb-8">
      {/* Header with title and action buttons */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-foreground text-lg font-semibold">
          Edit Garden Settings
        </Text>
        <View className="flex-row gap-x-4">
          <TouchableOpacity
            onPress={onCancel}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            <Text className="text-gray-700 font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveChanges}
            disabled={isSaving}
            className="bg-brand-500 px-4 py-2 rounded-lg"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress indicator */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-600">Profile Completion</Text>
          <Text
            className="text-sm font-medium"
            style={{ color: completionColor }}
          >
            {Math.round(completionPercent)}%
          </Text>
        </View>
        <View className="h-2 bg-cream-100 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${completionPercent}%`,
              backgroundColor: completionColor,
            }}
          />
        </View>
      </View>

      {/* Tabs Navigation */}
      <View className="flex-row border-b border-cream-100 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "environment" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("environment")}
        >
          <View className="flex-row justify-center items-center">
            <Ionicons
              name="leaf-outline"
              size={16}
              color={activeTab === "environment" ? "#047857" : "#9ca3af"}
              style={{ marginRight: 4 }}
            />
            <Text
              className={`text-center font-medium ${
                activeTab === "environment" ? "text-brand-700" : "text-gray-500"
              }`}
            >
              Environment
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "aesthetics" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("aesthetics")}
        >
          <View className="flex-row justify-center items-center">
            <Ionicons
              name="color-palette-outline"
              size={16}
              color={activeTab === "aesthetics" ? "#047857" : "#9ca3af"}
              style={{ marginRight: 4 }}
            />
            <Text
              className={`text-center font-medium ${
                activeTab === "aesthetics" ? "text-brand-700" : "text-gray-500"
              }`}
            >
              Aesthetics
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${
            activeTab === "maintenance" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("maintenance")}
        >
          <View className="flex-row justify-center items-center">
            <Ionicons
              name="construct-outline"
              size={16}
              color={activeTab === "maintenance" ? "#047857" : "#9ca3af"}
              style={{ marginRight: 4 }}
            />
            <Text
              className={`text-center font-medium ${
                activeTab === "maintenance" ? "text-brand-700" : "text-gray-500"
              }`}
            >
              Maintenance
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <ScrollView className="max-h-[450px]" showsVerticalScrollIndicator={true}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
