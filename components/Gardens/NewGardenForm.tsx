import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useMemo } from "react";
import {
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import HelpIcon from "../UI/HelpIcon";
import BetterSelector from "../UI/BetterSelector";
import ProgressIndicator from "../UI/ProgressIndicator";
import AddressAutocomplete from "../UI/AddressAutocomplete";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { BodyText, TitleText } from "../UI/Text";

type NewGardenFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function NewGardenForm({
  onSuccess,
  onCancel,
}: NewGardenFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const stepLabels = [
    "Garden Name",
    "Location",
    "Growing Conditions",
    "Style & Create",
  ];

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Essential form state - focused on the 6 most important fields plus location and style
  const [formValues, setFormValues] = useState({
    // Step 1: Garden Name
    name: "",

    // Step 2: Location (moved early for weather integration)
    location_address: "",
    latitude: null as number | null,
    longitude: null as number | null,

    // Step 3: Essential growing conditions (5 required fields)
    light_ids: [] as number[], // Essential for plant selection
    soil_texture_ids: [] as number[], // Essential for task generation
    available_space_to_plant_ids: [] as number[], // Essential for plant recommendations
    maintenance_id: null as number | null, // Essential for filtering high-maintenance plants
    growth_rate_id: null as number | null, // Essential for user expectations

    // Step 4: Optional style
    landscape_theme_ids: [] as number[], // For enhanced recommendations
  });

  // Generate garden name suggestions that include the user's name
  const gardenNameSuggestions = useMemo(() => {
    const suggestions = [
      "Front Yard Garden",
      "Backyard",
      "Herb Garden",
      "Balcony Plants",
      "Kitchen Garden",
      "Flower Sanctuary",
    ];

    // Add user's name suggestions if available
    if (user?.firstName) {
      const firstName = user.firstName;
      const personalSuggestions = [`${firstName}'s Garden`];
      // Insert user name suggestions at the beginning
      suggestions.unshift(...personalSuggestions);
    }

    return suggestions;
  }, [user?.firstName]);

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

  // Get current location using device GPS and fill the address field
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is needed to provide weather updates for your garden."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // Format address as "City, State" for better UX
      const addressString = [address.city, address.region]
        .filter(Boolean)
        .join(", ");

      setFormValues((prev) => ({
        ...prev,
        latitude,
        longitude,
        location_address: addressString,
      }));
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Could not get your current location. Please enter your address manually."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (addressData: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  }) => {
    setFormValues((prev) => ({
      ...prev,
      location_address: addressData.address,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    }));
  };

  // Step validation functions
  const isStep1Valid = formValues.name.trim().length > 0;

  const isStep2Valid = true; // Location is optional but recommended

  const isStep3Valid =
    formValues.light_ids.length > 0 &&
    formValues.soil_texture_ids.length > 0 &&
    formValues.available_space_to_plant_ids.length > 0 &&
    formValues.maintenance_id !== null &&
    formValues.growth_rate_id !== null;

  const isStep4Valid = true; // style is optional

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      default:
        return false;
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStep3Valid || !user) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from("user_gardens")
        .insert([
          {
            name: formValues.name.trim(),
            user_id: user.id,
            // Location coordinates for weather (optional)
            latitude: formValues.latitude,
            longitude: formValues.longitude,
            // Essential growing conditions - all required
            light_ids: formValues.light_ids,
            soil_texture_ids: formValues.soil_texture_ids,
            available_space_to_plant_ids:
              formValues.available_space_to_plant_ids,
            maintenance_id: formValues.maintenance_id,
            growth_rate_id: formValues.growth_rate_id,
            // Optional style
            landscape_theme_ids: formValues.landscape_theme_ids,
            // Set sensible defaults for fields not collected
            wants_recommendations: true,
            year_round_interest: false,
            usda_zone_ids: [], // Can be populated later via location
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View className="space-y-6">
            <View className="mb-6">
              <TitleText className="text-3xl mb-2">Name Your Garden</TitleText>
              <BodyText>
                Give your garden a name that helps you identify it and makes it
                feel like home.
              </BodyText>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <TitleText className="text-lg">Garden Name</TitleText>
                <BodyText className="text-destructive ml-1">*</BodyText>
                <HelpIcon
                  title="Garden Name"
                  explanation="Give your garden a name that helps you identify it, like 'Front Yard', 'Herb Garden', or 'Balcony Plants'."
                />
              </View>
              <TextInput
                className="border border-cream-300 rounded-lg p-3.5 bg-cream-50"
                value={formValues.name}
                onChangeText={(text) => updateFormValues("name", text)}
                placeholder="e.g., Front Yard Garden, Balcony Plants"
                placeholderTextColor="#9e9a90"
                autoFocus
              />

              {/* Garden name suggestions */}
              {gardenNameSuggestions.length > 0 && (
                <View className="mt-3">
                  <BodyText className="text-cream-600 mb-2 text-sm">
                    Tap a suggestion to use:
                  </BodyText>
                  <View className="flex-row flex-wrap gap-2">
                    {gardenNameSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        className="bg-brand-100 border border-brand-300 rounded-xl px-3 py-2"
                        onPress={() => updateFormValues("name", suggestion)}
                      >
                        <BodyText className="text-brand-700 text-sm">
                          {suggestion}
                        </BodyText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-8">
            <View className="mb-2">
              <TitleText className="text-3xl mb-3">
                Where&apos;s Your Garden?
              </TitleText>
              <BodyText className="text-cream-600 leading-relaxed mb-4">
                Help us provide weather alerts, frost warnings, and optimal
                planting times for your area.
              </BodyText>
            </View>

            <View className="space-y-6">
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <TitleText className="text-lg">Garden Location</TitleText>
                    <BodyText className="text-primary ml-2 text-sm">
                      (Highly Recommended)
                    </BodyText>
                  </View>
                  <HelpIcon
                    title="Location Privacy"
                    explanation="We only use your location for weather data and growing zone detection. Your garden's exact address is never shared."
                  />
                </View>

                {/* Privacy note - moved up for better context */}
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color="#3B82F6"
                      className="mt-0.5 mr-2"
                    />
                    <View className="flex-1">
                      <BodyText className="text-blue-800 text-sm">
                        Optional • We only store your city and state for weather
                        data • Never shared with anyone
                      </BodyText>
                    </View>
                  </View>
                </View>

                <AddressAutocomplete
                  value={formValues.location_address}
                  onChangeText={(text) =>
                    updateFormValues("location_address", text)
                  }
                  onAddressSelect={handleAddressSelect}
                  placeholder="City, State (e.g., Asheville, NC)"
                  className="mb-4"
                />

                <TouchableOpacity
                  className="flex-row items-center justify-center bg-brand-100 border border-brand-200 rounded-lg p-4"
                  onPress={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#5E994B"
                      />
                      <BodyText className="text-brand-700 font-medium ml-2">
                        Fill with Current Location
                      </BodyText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View className="space-y-6">
            <View className="mb-6">
              <TitleText className="text-2xl mb-2">
                What&apos;s Your Garden Like?
              </TitleText>
              <BodyText className="text-cream-600 leading-relaxed">
                These 5 things help us find plants that will work in your garden
                and tell you when to care for them.
              </BodyText>
            </View>

            <View className="space-y-4">
              {/* Sunlight - Required */}
              <View>
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-foreground font-medium">
                    How Much Sun?
                  </BodyText>
                  <BodyText className="text-destructive ml-1">*</BodyText>
                </View>
                <BetterSelector
                  label=""
                  placeholder="How much sun does your garden get?"
                  items={LOOKUP_TABLES.light.filter(
                    (item) => item.label !== "none"
                  )}
                  value={formValues.light_ids}
                  onChange={(value) => updateFormValues("light_ids", value)}
                />
              </View>

              {/* Soil Type - Required */}
              <View>
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-foreground font-medium">
                    What Kind of Soil?
                  </BodyText>
                  <BodyText className="text-destructive ml-1">*</BodyText>
                </View>
                <BetterSelector
                  label=""
                  placeholder="What type of soil do you have?"
                  items={LOOKUP_TABLES.soil_texture.filter(
                    (item) => item.label !== "none"
                  )}
                  value={formValues.soil_texture_ids}
                  onChange={(value) =>
                    updateFormValues("soil_texture_ids", value)
                  }
                />
                <BodyText className="text-cream-600 text-sm mt-1">
                  Helps us know when to water and what soil might need
                </BodyText>
              </View>

              {/* Available Space - Required */}
              <View>
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-foreground font-medium">
                    How Much Space?
                  </BodyText>
                  <BodyText className="text-destructive ml-1">*</BodyText>
                </View>
                <BetterSelector
                  label=""
                  placeholder="How much space do you have?"
                  items={LOOKUP_TABLES.available_space_to_plant.filter(
                    (item) => item.label !== "none"
                  )}
                  value={formValues.available_space_to_plant_ids}
                  onChange={(value) =>
                    updateFormValues("available_space_to_plant_ids", value)
                  }
                />
                <BodyText className="text-cream-600 text-sm mt-1">
                  Helps us suggest plants that will fit
                </BodyText>
              </View>

              {/* Maintenance Level - Required */}
              <View>
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-foreground font-medium">
                    How Much Work?
                  </BodyText>
                  <BodyText className="text-destructive ml-1">*</BodyText>
                </View>
                <BetterSelector
                  label=""
                  placeholder="How much work do you want to do in your garden?"
                  items={LOOKUP_TABLES.maintenance.filter(
                    (item) => item.label !== "none"
                  )}
                  value={formValues.maintenance_id}
                  onChange={(value) =>
                    updateFormValues("maintenance_id", value as number | null)
                  }
                  multiple={false}
                />
                <BodyText className="text-cream-600 text-sm mt-1">
                  We&apos;ll skip high-maintenance plants if you want easy care
                </BodyText>
              </View>

              {/* Growth Rate - Required */}
              <View>
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-foreground font-medium">
                    Fast or Slow Plants?
                  </BodyText>
                  <BodyText className="text-destructive ml-1">*</BodyText>
                </View>
                <BetterSelector
                  label=""
                  placeholder="Do you prefer fast or slow-growing plants?"
                  items={LOOKUP_TABLES.growth_rate.filter(
                    (item) => item.label !== "none"
                  )}
                  value={formValues.growth_rate_id}
                  onChange={(value) =>
                    updateFormValues("growth_rate_id", value as number | null)
                  }
                  multiple={false}
                />
                <BodyText className="text-cream-600 text-sm mt-1">
                  Fast plants give quick results, slow ones last longer
                </BodyText>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View className="space-y-6">
            <View className="mb-6">
              <TitleText className="text-2xl mb-2">
                Pick a Garden Style
              </TitleText>
              <BodyText className="text-cream-600 leading-relaxed">
                Choose a style if you want specific types of plants, or skip
                this for now and add it later.
              </BodyText>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <TitleText className="text-lg">Garden Style</TitleText>
                <BodyText className="text-cream-500 ml-2 text-sm">
                  (Optional)
                </BodyText>
                <HelpIcon
                  title="Garden Style"
                  explanation="Choose a style if you want specific types of plants. This helps us suggest plants that match your vision."
                />
              </View>

              <BetterSelector
                label=""
                placeholder="Choose a garden style (optional)"
                items={LOOKUP_TABLES.landscape_theme.filter(
                  (theme) => theme.label !== "none"
                )}
                value={formValues.landscape_theme_ids}
                onChange={(value) =>
                  updateFormValues("landscape_theme_ids", value)
                }
              />
            </View>

            {/* Advanced options callout - improved styling */}
            <View className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="settings-outline"
                  size={16}
                  color="#22C55E"
                  className="mt-1 mr-3"
                />
                <View className="flex-1">
                  <BodyText className="text-green-800 font-medium mb-1">
                    Want more options?
                  </BodyText>
                  <BodyText className="text-green-700 text-sm leading-relaxed">
                    After creating your garden, you can add soil pH, drainage,
                    and other advanced features.
                  </BodyText>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          accentColor="brand-500"
          inactiveColor="cream-300"
        />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Error message for submission failures */}
        {error && (
          <View className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <BodyText className="text-red-800 text-sm ml-2">{error}</BodyText>
            </View>
          </View>
        )}

        {/* Navigation buttons */}
        <View className="my-4 flex-row justify-between items-center gap-3">
          {/* Back/Cancel button - Left side */}
          <TouchableOpacity
            className="flex-1 bg-cream-100 border border-cream-300 rounded-lg py-4 px-6"
            onPress={currentStep === 1 ? onCancel : goToPreviousStep}
          >
            <BodyText className="text-cream-700 font-paragraph-semibold text-center text-base">
              {currentStep === 1 ? "Cancel" : "Back"}
            </BodyText>
          </TouchableOpacity>

          {/* Main action button - Right side */}
          <TouchableOpacity
            className={`flex-1 bg-brand-600 rounded-lg py-4 px-6 ${
              !isCurrentStepValid() ? "opacity-50" : ""
            }`}
            onPress={() => {
              Keyboard.dismiss();
              if (currentStep === totalSteps) {
                handleSubmit();
              } else {
                goToNextStep();
              }
            }}
            disabled={!isCurrentStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <LoadingSpinner />
                <BodyText className="text-cream-50 font-paragraph-semibold ml-2 text-base">
                  Creating Garden...
                </BodyText>
              </View>
            ) : (
              <BodyText className="text-cream-50 font-paragraph-semibold text-center text-base">
                {currentStep === totalSteps ? "Create Garden" : "Continue"}
              </BodyText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
