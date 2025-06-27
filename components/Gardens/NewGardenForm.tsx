import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import {
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompactSpinner, LoadingSpinner } from "../UI/LoadingSpinner";
import HelpIcon from "../UI/HelpIcon";
import BetterSelector from "../UI/BetterSelector";
import ProgressIndicator from "../UI/ProgressIndicator";
import ZipCodeInput from "../UI/ZipCodeInput";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import { Ionicons } from "@expo/vector-icons";
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
  const [error, setError] = useState<string | null>(null);

  // Form persistence state
  const [isLoadingCachedData, setIsLoadingCachedData] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [showCachedDataNotification, setShowCachedDataNotification] =
    useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache key for this user's garden form
  const cacheKey = `garden_form_${user?.id || "anonymous"}`;

  // Essential form state - focused on the 6 most important fields plus location and style
  const [formValues, setFormValues] = useState({
    // Step 1: Garden Name
    name: "",

    // Step 2: Location (moved early for weather integration)
    zip_code: "",
    latitude: null as number | null,
    longitude: null as number | null,
    city: "",
    county: "",

    // Step 3: Essential growing conditions (5 required fields)
    light_ids: [] as number[], // Essential for plant selection
    soil_texture_ids: [] as number[], // Essential for task generation
    available_space_to_plant_ids: [] as number[], // Essential for plant recommendations
    maintenance_id: null as number | null, // Essential for filtering high-maintenance plants
    growth_rate_id: null as number | null, // Essential for user expectations

    // Step 4: Optional style
    landscape_theme_ids: [] as number[], // For enhanced recommendations
  });

  // Cache management functions
  const saveFormDataToCache = useCallback(
    async (formData: typeof formValues, step: number) => {
      try {
        const cacheData = {
          formValues: formData,
          currentStep: step,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Failed to save form data to cache:", error);
      }
    },
    [cacheKey]
  );

  const loadFormDataFromCache = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const {
          formValues: cachedFormValues,
          currentStep: cachedStep,
          timestamp,
        } = parsedData;

        // Check if cache is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - timestamp < maxAge) {
          setFormValues(cachedFormValues);
          setCurrentStep(cachedStep);
          setHasCachedData(true);
          setShowCachedDataNotification(true);
          return true;
        } else {
          // Cache is too old, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to load form data from cache:", error);
      return false;
    }
  }, [cacheKey]);

  const clearFormCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(cacheKey);
      setHasCachedData(false);
      setShowCachedDataNotification(false);
    } catch (error) {
      console.error("Failed to clear form cache:", error);
    }
  }, [cacheKey]);

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

  // Handle form field changes with automatic caching
  const updateFormValues = useCallback(
    (field: string, value: number | number[] | string | null) => {
      // Hide the cached data notification once user starts making changes
      if (showCachedDataNotification) {
        setShowCachedDataNotification(false);
      }

      setFormValues((prev) => {
        const newFormValues = {
          ...prev,
          [field]: value,
        };

        // Debounced save to cache to avoid too frequent writes
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveFormDataToCache(newFormValues, currentStep);
        }, 500);

        return newFormValues;
      });
    },
    [currentStep, saveFormDataToCache, showCachedDataNotification]
  );

  // Load cached form data on component mount
  useEffect(() => {
    const initializeForm = async () => {
      if (user?.id) {
        const hasCache = await loadFormDataFromCache();
        if (hasCache) {
          console.log("Loaded garden form data from cache");
        }
      }
      setIsLoadingCachedData(false);
    };

    initializeForm();
  }, [user?.id, loadFormDataFromCache]);

  // Enhanced app state handling for form persistence
  useEffect(() => {
    const handleFormPersistence = async (nextAppState: string) => {
      if (nextAppState === "active") {
        // When app becomes active, reload cached data in case it was updated
        if (user?.id && !isLoadingCachedData) {
          const hasCache = await loadFormDataFromCache();
          if (hasCache) {
            console.log("Reloaded garden form data after app resume");
          }
        }
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // Save current form state when app goes to background
        if (user?.id) {
          await saveFormDataToCache(formValues, currentStep);
          console.log("Saved garden form data to cache before backgrounding");
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleFormPersistence
    );
    return () => subscription?.remove();
  }, [
    user?.id,
    loadFormDataFromCache,
    saveFormDataToCache,
    formValues,
    currentStep,
    isLoadingCachedData,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle ZIP code selection
  const handleZipCodeSelect = (locationData: {
    zipCode: string;
    latitude: number;
    longitude: number;
    city?: string;
    county?: string;
  }) => {
    setFormValues((prev) => {
      const newFormValues = {
        ...prev,
        zip_code: locationData.zipCode,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city || "",
        county: locationData.county || "",
      };

      // Save to cache immediately since this is a significant change
      saveFormDataToCache(newFormValues, currentStep);

      return newFormValues;
    });
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
      // Hide cached data notification when user navigates
      if (showCachedDataNotification) {
        setShowCachedDataNotification(false);
      }

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Save step change to cache immediately
      saveFormDataToCache(formValues, nextStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      // Hide cached data notification when user navigates
      if (showCachedDataNotification) {
        setShowCachedDataNotification(false);
      }

      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Save step change to cache immediately
      saveFormDataToCache(formValues, prevStep);
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

      // Clear form cache since garden was successfully created
      await clearFormCache();

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
                Enter your NC ZIP code so we can send you frost alerts, rain
                reminders, and optimal planting times for your area.
              </BodyText>
            </View>

            <View className="space-y-6">
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <TitleText className="text-lg">Garden ZIP Code</TitleText>
                    <BodyText className="text-primary ml-2 text-sm">
                      (Highly Recommended)
                    </BodyText>
                  </View>
                  <HelpIcon
                    title="ZIP Code Privacy"
                    explanation="We only use your ZIP code for weather data and growing zone detection. Your location is never shared with anyone."
                  />
                </View>

                {/* Privacy note - updated for ZIP code */}
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
                        Optional • We only store your ZIP code for weather data
                        • Never shared with anyone
                      </BodyText>
                    </View>
                  </View>
                </View>

                <ZipCodeInput
                  value={formValues.zip_code}
                  onChangeText={(text) => updateFormValues("zip_code", text)}
                  onLocationSelect={handleZipCodeSelect}
                  placeholder="Enter your 5-digit NC ZIP code"
                  className="mb-4"
                />

                {/* Show location info if ZIP is validated */}
                {formValues.city && formValues.zip_code && (
                  <View className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#5E994B" />
                      <BodyText className="text-brand-800 text-sm ml-2">
                        {formValues.city}, NC {formValues.zip_code}
                      </BodyText>
                    </View>
                  </View>
                )}
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

  // Show loading state while loading cached data
  if (isLoadingCachedData) {
    return (
      <View className="flex-1 justify-center items-center">
        <LoadingSpinner />
        <BodyText className="text-cream-600 mt-4">
          Loading your garden...
        </BodyText>
      </View>
    );
  }

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

        {/* Cached data notification */}
        {showCachedDataNotification && (
          <View className="bg-brand-50 border border-brand-100 rounded-lg p-3 mx-2 mb-4">
            <View className="flex-row items-center">
              <Ionicons
                name="refresh-circle-outline"
                size={16}
                color="#5E994B"
              />
              <BodyText className="text-brand-700 text-sm ml-2 flex-1">
                Continuing from where you left off
              </BodyText>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Start Fresh?",
                    "This will clear your current progress and start over.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Start Fresh",
                        style: "destructive",
                        onPress: async () => {
                          await clearFormCache();
                          setFormValues({
                            name: "",
                            zip_code: "",
                            latitude: null,
                            longitude: null,
                            city: "",
                            county: "",
                            light_ids: [],
                            soil_texture_ids: [],
                            available_space_to_plant_ids: [],
                            maintenance_id: null,
                            growth_rate_id: null,
                            landscape_theme_ids: [],
                          });
                          setCurrentStep(1);
                          setShowCachedDataNotification(false);
                        },
                      },
                    ]
                  );
                }}
              >
                <BodyText className="text-brand-600 text-sm font-paragraph-semibold">
                  Start Fresh
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
            onPress={async () => {
              if (currentStep === 1) {
                // Clear cache when canceling
                await clearFormCache();
                onCancel();
              } else {
                goToPreviousStep();
              }
            }}
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
                <BodyText className="text-cream-50 ml-2 ">
                  Creating Garden...
                </BodyText>
              </View>
            ) : (
              <BodyText className="text-cream-50 text-center">
                {currentStep === totalSteps ? "Create Garden" : "Continue"}
              </BodyText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
