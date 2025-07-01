import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompactSpinner, LoadingSpinner } from "../UI/LoadingSpinner";
import ProgressIndicator from "../UI/ProgressIndicator";
import { Ionicons } from "@expo/vector-icons";
import { BodyText } from "../UI/Text";
import {
  GardenNameStep,
  LocationStep,
  GrowingConditionsStep,
  StyleStep,
} from "./NewGardenFormSteps";

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

  // ZIP code validation state
  const [isZipCodeValid, setIsZipCodeValid] = useState(true); // Default to true since it's optional
  const [hasZipCodeValue, setHasZipCodeValue] = useState(false);

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

    // Step 2: Location (for weather integration - only coordinates stored in DB)
    zip_code: "", // Used for geocoding, not stored in database
    latitude: null as number | null, // Stored in database for weather data
    longitude: null as number | null, // Stored in database for weather data
    city: "", // Used for display, not stored in database
    county: "", // Used for display, not stored in database

    // Step 3: Essential growing conditions (5 required fields)
    light_id: null as number | null, // Essential for plant selection (single selection)
    soil_texture_id: null as number | null, // Essential for task generation (single selection)
    available_space_to_plant_id: null as number | null, // Essential for plant recommendations (single selection)
    maintenance_id: null as number | null, // Essential for filtering high-maintenance plants (single selection)
    growth_rate_ids: [] as number[], // Essential for user expectations (multiple selection)

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

  // Handle ZIP code validation state changes
  const handleZipCodeValidationChange = (
    isValid: boolean,
    hasValue: boolean
  ) => {
    setIsZipCodeValid(isValid);
    setHasZipCodeValue(hasValue);
  };

  // Step validation functions
  const isStep1Valid = formValues.name.trim().length > 0;

  const isStep2Valid = isZipCodeValid; // Either empty (optional) or valid if provided

  const isStep3Valid =
    formValues.light_id !== null &&
    formValues.soil_texture_id !== null &&
    formValues.available_space_to_plant_id !== null &&
    formValues.maintenance_id !== null &&
    formValues.growth_rate_ids.length > 0;

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

            // Location data (optional but useful for weather integration)
            latitude: formValues.latitude,
            longitude: formValues.longitude,
            zip_code: formValues.zip_code || null,

            // Essential growing conditions collected from the form
            light_id: formValues.light_id,
            soil_texture_id: formValues.soil_texture_id,
            available_space_to_plant_id: formValues.available_space_to_plant_id,
            maintenance_id: formValues.maintenance_id,
            growth_rate_ids: formValues.growth_rate_ids,

            // Optional style preferences
            landscape_theme_ids: formValues.landscape_theme_ids,

            // Set sensible defaults for user preferences
            wants_recommendations: true,
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
          <GardenNameStep
            name={formValues.name}
            onNameChange={(name: string) => updateFormValues("name", name)}
            gardenNameSuggestions={gardenNameSuggestions}
          />
        );

      case 2:
        return (
          <LocationStep
            zipCode={formValues.zip_code}
            city={formValues.city}
            onZipCodeChange={(text: string) =>
              updateFormValues("zip_code", text)
            }
            onLocationSelect={handleZipCodeSelect}
            onZipCodeValidationChange={handleZipCodeValidationChange}
          />
        );

      case 3:
        return (
          <GrowingConditionsStep
            lightId={formValues.light_id}
            soilTextureId={formValues.soil_texture_id}
            availableSpaceToPlantId={formValues.available_space_to_plant_id}
            maintenanceId={formValues.maintenance_id}
            growthRateIds={formValues.growth_rate_ids}
            onLightChange={(value: number | null) =>
              updateFormValues("light_id", value)
            }
            onSoilTextureChange={(value: number | null) =>
              updateFormValues("soil_texture_id", value)
            }
            onAvailableSpaceChange={(value: number | null) =>
              updateFormValues("available_space_to_plant_id", value)
            }
            onMaintenanceChange={(value: number | null) =>
              updateFormValues("maintenance_id", value)
            }
            onGrowthRateChange={(value: number[]) =>
              updateFormValues("growth_rate_ids", value)
            }
          />
        );

      case 4:
        return (
          <StyleStep
            landscapeThemeIds={formValues.landscape_theme_ids}
            onLandscapeThemeChange={(value: number[]) =>
              updateFormValues("landscape_theme_ids", value)
            }
          />
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
            <Ionicons name="refresh-circle-outline" size={16} color="#5E994B" />
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
                          light_id: null,
                          soil_texture_id: null,
                          available_space_to_plant_id: null,
                          maintenance_id: null,
                          growth_rate_ids: [],
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
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
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
              <CompactSpinner color="#FEFDF8" size={20} />
            </View>
          ) : (
            <BodyText className="text-cream-50 text-center">
              {currentStep === totalSteps ? "Create Garden" : "Continue"}
            </BodyText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
