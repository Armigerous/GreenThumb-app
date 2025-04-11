import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DesignSection from "./GardenEditorSections/DesignSection";
import EnvironmentSection from "./GardenEditorSections/EnvironmentSection";
import PreferencesSection from "./GardenEditorSections/PreferencesSection";
import { LoadingSpinner } from "../UI/LoadingSpinner";

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
          </View>
        );

      case "environment":
        return (
          <EnvironmentSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );

      case "design":
        return (
          <DesignSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );

      case "preferences":
        return (
          <PreferencesSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
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
                <LoadingSpinner />
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
