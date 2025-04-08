import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import BetterSelector from "@/components/UI/BetterSelector";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import { useQueryClient } from "@tanstack/react-query";

type NewGardenFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

// Define the steps in our wizard
const STEPS = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Let's start with the basics of your garden",
  },
  {
    id: "environment",
    title: "Environment",
    description: "Tell us about your garden's growing conditions",
  },
  {
    id: "design",
    title: "Design",
    description: "How would you like your garden to look?",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Set your gardening preferences and requirements",
  },
];

export default function NewGardenForm({
  onSuccess,
  onCancel,
}: NewGardenFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    // Environment settings
    sunlight_ids: [],
    soil_texture_ids: [],
    soil_drainage_ids: [],
    soil_ph_ids: [],
    landscape_location_ids: [],
    nc_region_ids: [],
    usda_zone_ids: [],

    // Maintenance and preferences
    maintenance_id: null,
    growth_rate_id: null,
    available_space_to_plant_ids: [],
    texture_id: null,

    // Garden design
    landscape_theme_ids: [],
    attracts_ids: [],
    resistance_to_challenges_ids: [],
    problems_ids: [],
    design_feature_ids: [],
    plant_type_ids: [],
    habit_form_ids: [],

    // Plant aesthetics
    flower_color_ids: [],
    leaf_color_ids: [],
    flower_bloom_time_ids: [],
    flower_value_to_gardener_ids: [],
    leaf_feel_ids: [],
    leaf_value_ids: [],
    fall_color_ids: [],

    // Preferences
    wants_recommendations: false,
    year_round_interest: false,
  });

  // Handle form field changes
  const updateFormValues = useCallback(
    (field: string, value: number | number[] | string | null) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Calculate completion percentage for current step
  const calculateStepCompletion = useCallback(() => {
    switch (STEPS[currentStep].id) {
      case "basic":
        return formValues.name.trim() ? 100 : 0;
      case "environment":
        const envFields = [
          formValues.sunlight_ids.length,
          formValues.soil_texture_ids.length,
          formValues.soil_ph_ids.length,
          formValues.soil_drainage_ids.length,
          formValues.landscape_location_ids.length,
        ];
        return (envFields.filter(Boolean).length / envFields.length) * 100;
      case "design":
        const designFields = [
          formValues.landscape_theme_ids.length,
          formValues.flower_color_ids.length,
          formValues.leaf_color_ids.length,
        ];
        return (
          (designFields.filter(Boolean).length / designFields.length) * 100
        );
      case "preferences":
        const prefFields = [
          formValues.maintenance_id,
          formValues.growth_rate_id,
          formValues.available_space_to_plant_ids.length,
        ];
        return (prefFields.filter(Boolean).length / prefFields.length) * 100;
      default:
        return 0;
    }
  }, [currentStep, formValues]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim() || !user) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from("user_gardens")
        .insert([
          {
            name: formValues.name.trim(),
            user_id: user.id,
            // Environment settings
            light_ids: formValues.sunlight_ids,
            soil_texture_ids: formValues.soil_texture_ids,
            soil_drainage_ids: formValues.soil_drainage_ids,
            soil_ph_ids: formValues.soil_ph_ids,
            landscape_location_ids: formValues.landscape_location_ids,
            nc_region_ids: formValues.nc_region_ids,
            usda_zone_ids: formValues.usda_zone_ids,

            // Maintenance and preferences
            maintenance_id: formValues.maintenance_id,
            growth_rate_id: formValues.growth_rate_id,
            available_space_to_plant_ids:
              formValues.available_space_to_plant_ids,
            texture_id: formValues.texture_id,

            // Garden design
            landscape_theme_ids: formValues.landscape_theme_ids,
            attracts_ids: formValues.attracts_ids,
            resistance_to_challenges_ids:
              formValues.resistance_to_challenges_ids,
            problems_ids: formValues.problems_ids,
            design_feature_ids: formValues.design_feature_ids,
            plant_type_ids: formValues.plant_type_ids,
            habit_form_ids: formValues.habit_form_ids,

            // Plant aesthetics
            flower_color_ids: formValues.flower_color_ids,
            leaf_color_ids: formValues.leaf_color_ids,
            flower_bloom_time_ids: formValues.flower_bloom_time_ids,
            flower_value_to_gardener_ids:
              formValues.flower_value_to_gardener_ids,
            leaf_feel_ids: formValues.leaf_feel_ids,
            leaf_value_ids: formValues.leaf_value_ids,
            fall_color_ids: formValues.fall_color_ids,

            // Preferences
            wants_recommendations: formValues.wants_recommendations,
            year_round_interest: formValues.year_round_interest,
          },
        ]);

      if (submitError) {
        console.error("Error creating garden:", submitError);
        setError("There was a problem creating your garden. Please try again.");
        return;
      }

      // Invalidate the garden dashboard query cache to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["gardenDashboard", user.id],
      });

      onSuccess();
    } catch (err) {
      console.error("Error creating garden:", err);
      setError("There was a problem creating your garden. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case "basic":
        return (
          <View className="space-y-6">
            {/* Garden Name */}
            <View>
              <Text className="text-lg text-foreground font-medium mb-3">
                Garden Name
              </Text>
              <TextInput
                className="border border-cream-300 rounded-lg p-3.5 bg-cream-50"
                value={formValues.name}
                onChangeText={(text) => updateFormValues("name", text)}
                placeholder="Enter garden name"
                autoFocus
              />
            </View>

            {/* Location */}
            <View className="my-4">
              <CollapsibleSection
                title="Location"
                icon="location-outline"
                initiallyExpanded={true}
              >
                <Text className="text-lg text-foreground font-medium mb-3">
                  Location
                </Text>
                <View className="space-y-4">
                  <BetterSelector
                    label="USDA Hardiness Zone"
                    placeholder="Select hardiness zone"
                    items={LOOKUP_TABLES.usda_zone}
                    value={formValues.usda_zone_ids}
                    onChange={(value: number[]) =>
                      updateFormValues("usda_zone_ids", value)
                    }
                  />
                  <BetterSelector
                    label="NC Region"
                    placeholder="Select NC region"
                    items={LOOKUP_TABLES.nc_regions}
                    value={formValues.nc_region_ids}
                    onChange={(value: number[]) =>
                      updateFormValues("nc_region_ids", value)
                    }
                  />
                </View>
              </CollapsibleSection>
            </View>
          </View>
        );

      case "environment":
        return (
          <View className="space-y-5">
            <CollapsibleSection
              title="Sunlight"
              icon="sunny-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2">
                <BetterSelector
                  label="Light Requirements"
                  placeholder="Select sunlight conditions"
                  items={LOOKUP_TABLES.light}
                  value={formValues.sunlight_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("sunlight_ids", value)
                  }
                />
              </View>
            </CollapsibleSection>

            <CollapsibleSection
              title="Soil Properties"
              icon="layers-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2 space-y-4">
                <BetterSelector
                  label="Soil Texture"
                  placeholder="Select soil texture"
                  items={LOOKUP_TABLES.soil_texture}
                  value={formValues.soil_texture_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("soil_texture_ids", value)
                  }
                />
                <BetterSelector
                  label="Soil pH"
                  placeholder="Select soil pH"
                  items={LOOKUP_TABLES.soil_ph}
                  value={formValues.soil_ph_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("soil_ph_ids", value)
                  }
                />
                <BetterSelector
                  label="Soil Drainage"
                  placeholder="Select soil drainage"
                  items={LOOKUP_TABLES.soil_drainage}
                  value={formValues.soil_drainage_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("soil_drainage_ids", value)
                  }
                />
              </View>
            </CollapsibleSection>

            <CollapsibleSection
              title="Landscape Location"
              icon="map-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2">
                <BetterSelector
                  label="Location"
                  placeholder="Select landscape locations"
                  items={LOOKUP_TABLES.landscape_location}
                  value={formValues.landscape_location_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("landscape_location_ids", value)
                  }
                />
              </View>
            </CollapsibleSection>
          </View>
        );

      case "design":
        return (
          <View className="space-y-5">
            <CollapsibleSection
              title="Garden Theme"
              icon="color-palette-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2">
                <BetterSelector
                  label="Garden Themes"
                  placeholder="Select garden themes"
                  items={LOOKUP_TABLES.landscape_theme}
                  value={formValues.landscape_theme_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("landscape_theme_ids", value)
                  }
                />
              </View>
            </CollapsibleSection>

            <CollapsibleSection
              title="Plant Aesthetics"
              icon="flower-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2 space-y-4">
                <BetterSelector
                  label="Flower Colors"
                  placeholder="Select flower colors"
                  items={LOOKUP_TABLES.flower_color}
                  value={formValues.flower_color_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("flower_color_ids", value)
                  }
                />
                <BetterSelector
                  label="Leaf Colors"
                  placeholder="Select leaf colors"
                  items={LOOKUP_TABLES.leaf_color}
                  value={formValues.leaf_color_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("leaf_color_ids", value)
                  }
                />
                <BetterSelector
                  label="Texture Preference"
                  placeholder="Select texture preference"
                  items={LOOKUP_TABLES.texture}
                  value={formValues.texture_id}
                  onChange={(value: number | null) =>
                    updateFormValues("texture_id", value)
                  }
                  multiple={false}
                />
              </View>
            </CollapsibleSection>
          </View>
        );

      case "preferences":
        return (
          <View className="space-y-5">
            <CollapsibleSection
              title="Maintenance"
              icon="construct-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2 space-y-4">
                <BetterSelector
                  label="Maintenance Level"
                  placeholder="Select maintenance level"
                  items={LOOKUP_TABLES.maintenance}
                  value={formValues.maintenance_id}
                  onChange={(value: number | null) =>
                    updateFormValues("maintenance_id", value)
                  }
                  multiple={false}
                />
                <BetterSelector
                  label="Growth Rate"
                  placeholder="Select growth rate preference"
                  items={LOOKUP_TABLES.growth_rate}
                  value={formValues.growth_rate_id}
                  onChange={(value: number | null) =>
                    updateFormValues("growth_rate_id", value)
                  }
                  multiple={false}
                />
              </View>
            </CollapsibleSection>

            <CollapsibleSection
              title="Space & Requirements"
              icon="resize-outline"
              initiallyExpanded={true}
            >
              <View className="mt-2 space-y-4">
                <BetterSelector
                  label="Available Space"
                  placeholder="Select available space"
                  items={LOOKUP_TABLES.available_space_to_plant}
                  value={formValues.available_space_to_plant_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("available_space_to_plant_ids", value)
                  }
                />
                <BetterSelector
                  label="Resistance Challenges"
                  placeholder="Select resistance challenges"
                  items={LOOKUP_TABLES.resistance_to_challenges}
                  value={formValues.resistance_to_challenges_ids}
                  onChange={(value: number[]) =>
                    updateFormValues("resistance_to_challenges_ids", value)
                  }
                />
              </View>
            </CollapsibleSection>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        {/* Progress bar */}
        <View className="h-1 bg-cream-200 mb-6">
          <View
            className="h-full bg-brand-500"
            style={{
              width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            }}
          />
        </View>

        {/* Step header */}
        <View className="mb-6">
          <Text className="text-2xl text-foreground font-bold mb-2">
            {STEPS[currentStep].title}
          </Text>
          <Text className="text-cream-600 text-base">
            {STEPS[currentStep].description}
          </Text>
        </View>

        {/* Step content */}
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation buttons */}
        <View className="flex-row justify-between mt-6">
          {currentStep > 0 && (
            <TouchableOpacity
              className="bg-cream-100 px-6 py-3 rounded-lg"
              onPress={() => {
                Keyboard.dismiss();
                handleBack();
              }}
            >
              <Text className="text-foreground font-medium">Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < STEPS.length - 1 ? (
            <TouchableOpacity
              className={`bg-brand-500 px-6 py-3 rounded-lg ml-auto ${
                calculateStepCompletion() < 50 ? "opacity-50" : ""
              }`}
              onPress={() => {
                Keyboard.dismiss();
                handleNext();
              }}
              disabled={calculateStepCompletion() < 50}
            >
              <Text className="text-white font-medium">Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`bg-brand-500 px-6 py-3 rounded-lg ml-auto ${
                calculateStepCompletion() < 50 ? "opacity-50" : ""
              }`}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit();
              }}
              disabled={calculateStepCompletion() < 50 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium">Create Garden</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text className="text-destructive text-sm mt-4 text-center">
            {error}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
