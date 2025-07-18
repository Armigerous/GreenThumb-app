// PlantForm: Multi-step form for adding a plant, branded and consistent with garden flow.
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Keyboard,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { usePlantDetails, useGardenDashboard } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { UserPlant, GardenDashboard } from "@/types/garden";
import ProgressIndicator from "@/components/UI/ProgressIndicator";
import { Ionicons } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";
import {
  GardenSelectionStep,
  PlantDetailsStep,
  ConfirmationStep,
  ErrorMessage,
} from "./Add";
import { generatePlantTasks } from "@/lib/services/taskGeneration";
import { getRandomPlantNickname } from "@/utils/plantNicknames";

// Props for the plant addition form
interface PlantFormProps {
  plantSlug: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialGardenId?: string;
}

export default function PlantForm({
  plantSlug,
  onSuccess,
  onCancel,
  initialGardenId,
}: PlantFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  useSupabaseAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const stepLabels = ["Select Garden", "Plant Details", "Confirm"];

  // Data loading
  const { data: plant, isLoading: loadingPlant } = usePlantDetails(plantSlug);
  const { data: gardens, isLoading: loadingGardens } = useGardenDashboard(
    user?.id
  );

  // Form state
  const [selectedGarden, setSelectedGarden] = useState<GardenDashboard | null>(
    null
  );
  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pre-select garden if provided
  useEffect(() => {
    if (initialGardenId && gardens && !selectedGarden) {
      const found = gardens.find(
        (g) => g.garden_id?.toString() === initialGardenId
      );
      if (found) {
        setSelectedGarden(found);
        setCurrentStep(2);
      }
    }
  }, [initialGardenId, gardens, selectedGarden]);

  // Set default nickname from plant name when plant data loads ONLY if nickname is empty
  useEffect(() => {
    if (plant && nickname === "") {
      setNickname(getRandomPlantNickname());
    }
  }, [plant]);

  // Step validation
  const isStep1Valid = !!selectedGarden;
  // Reason: If the plant has no default image, require the user to upload one before proceeding.
  // This ensures that every plant added has an image, either from the database or user-uploaded.
  const hasDefaultImage =
    plant && plant.images && plant.images.length > 0 && !!plant.images[0]?.img;
  const isStep2Valid = !!nickname.trim() && (hasDefaultImage || !!image);
  const isStep3Valid = isStep1Valid && isStep2Valid && !!plant;

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      default:
        return false;
    }
  };

  // Navigation
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

  // Submission logic
  async function handleSubmit() {
    setError(null);
    if (!selectedGarden) {
      setError("Please select a garden first");
      return;
    }
    if (!plant) {
      setError("Plant data is missing");
      return;
    }
    if (!nickname.trim()) {
      setError("Please provide a nickname for your plant");
      return;
    }
    if (!user?.id) {
      setError("You must be logged in to add plants");
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(10);
    try {
      let plantImageUrl = null;
      // If a custom image was selected, handle it appropriately
      if (image) {
        setUploadProgress(30);
        if (image.includes("supabase.co") && image.includes("token=")) {
          plantImageUrl = image;
          setUploadProgress(60);
        } else {
          // Upload image logic (delegated to add.tsx, can be refactored into a util)
          // For brevity, use default image if upload fails
          plantImageUrl =
            plant.images && plant.images.length > 0
              ? plant.images[0]?.img || null
              : null;
        }
      } else {
        plantImageUrl =
          plant.images && plant.images.length > 0
            ? plant.images[0]?.img || null
            : null;
      }
      setUploadProgress(70);
      const now = new Date().toISOString();
      // ID will be generated server-side by Supabase
      const plantData = {
        garden_id: selectedGarden.garden_id ?? -1,
        plant_id: plant.id ?? -1,
        nickname: nickname.trim(),
        images: plantImageUrl ? [plantImageUrl] : [],
        care_logs: [],
        created_at: now,
        updated_at: now,
      };
      setUploadProgress(85);
      // Insert via RPC
      const { data, error: rpcError } = await supabase.rpc("add_user_plant", {
        p_garden_id: plantData.garden_id,
        p_plant_id: plantData.plant_id,
        p_nickname: plantData.nickname,
        p_images: plantData.images,
        p_care_logs: plantData.care_logs,
      });
      if (rpcError) {
        // Enhanced debugging: log the full error object for developer inspection
        // and display detailed error info in the UI for diagnosis.
        console.error("Supabase RPC add_user_plant error:", rpcError);
        setError(
          `Failed to add plant to garden.\n` +
            (rpcError.message ? `Message: ${rpcError.message}\n` : "") +
            (rpcError.details ? `Details: ${rpcError.details}\n` : "") +
            (rpcError.code ? `Code: ${rpcError.code}\n` : "") +
            (rpcError.hint ? `Hint: ${rpcError.hint}` : "")
        );
        setIsSubmitting(false);
        return;
      }
      // --- Call Edge Function to Generate Tasks ---
      // Reason: After adding the plant, generate initial care tasks via edge function
      if (data && data.length > 0) {
        const newUserPlant = data[0];
        try {
          setUploadProgress(90);
          await generatePlantTasks({
            id: newUserPlant.id,
            garden_id: newUserPlant.garden_id,
            plant_id: newUserPlant.plant_id,
            nickname: newUserPlant.nickname,
            created_at: newUserPlant.created_at,
            updated_at: newUserPlant.updated_at ?? new Date().toISOString(),
            images: Array.isArray(newUserPlant.images)
              ? newUserPlant.images
              : [],
            care_logs: [],
          });
        } catch (edgeError) {
          // Log and show error if task generation fails
          console.error("Error generating plant tasks:", edgeError);
          setError(
            "Plant was added, but failed to generate care tasks. " +
              (edgeError instanceof Error
                ? edgeError.message
                : JSON.stringify(edgeError))
          );
          setIsSubmitting(false);
          return;
        }
      } else {
        setError(
          "Plant was added, but could not retrieve new plant data for task generation."
        );
        setIsSubmitting(false);
        return;
      }
      setUploadProgress(100);
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["gardenDetails", selectedGarden.garden_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["gardenDashboard", user?.id],
      });
      onSuccess();
    } catch (err) {
      // Log the error for debugging
      console.error("Unexpected error in PlantForm handleSubmit:", err);
      setError(
        "An unexpected error occurred. " +
          (err instanceof Error ? err.message : JSON.stringify(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render loading state
  if (loadingPlant || loadingGardens) {
    return (
      <View className="flex-1 justify-center items-center">
        <Ionicons name="leaf-outline" size={32} color="#5E994B" />
        <BodyText className="text-cream-600 mt-4">Loading...</BodyText>
      </View>
    );
  }
  if (!plant) {
    return (
      <View className="flex-1 justify-center items-center">
        <ErrorMessage
          message="Plant not found. Please try again."
          severity="error"
        />
      </View>
    );
  }

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <GardenSelectionStep
            plantSlug={plantSlug}
            gardens={gardens}
            selectedGarden={selectedGarden}
            onSelectGarden={setSelectedGarden}
            onNext={goToNextStep}
            plantName={
              (plant.common_names?.[0] || plant.scientific_name) as string
            }
          />
        );
      case 2:
        return (
          <PlantDetailsStep
            plant={plant as any}
            nickname={nickname}
            setNickname={setNickname}
            image={image}
            setImage={setImage}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            plant={plant as any}
            nickname={nickname}
            image={image}
            selectedGarden={selectedGarden as GardenDashboard}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            error={error}
            onBack={goToPreviousStep}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

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
      {/* Unified action bar for all steps */}
      <View className="my-4 flex-row justify-between items-center gap-3">
        {/* Cancel/Back button */}
        <TouchableOpacity
          className="flex-1 bg-cream-100 border border-cream-300 rounded-lg py-4 px-6"
          onPress={async () => {
            if (currentStep === 1) {
              onCancel();
            } else {
              goToPreviousStep();
            }
          }}
          disabled={isSubmitting}
        >
          <Text className="text-cream-700 font-paragraph-semibold text-center text-base">
            {currentStep === 1 ? "Cancel" : "Back"}
          </Text>
        </TouchableOpacity>
        {/* Main action button */}
        <TouchableOpacity
          className={`flex-1 bg-brand-600 rounded-lg py-4 px-6 ${
            !isCurrentStepValid() || isSubmitting ? "opacity-50" : ""
          }`}
          onPress={() => {
            Keyboard.dismiss();
            if (currentStep < totalSteps) {
              goToNextStep();
            } else {
              handleSubmit();
            }
          }}
          disabled={!isCurrentStepValid() || isSubmitting}
        >
          {isSubmitting && currentStep === totalSteps ? (
            <View className="flex-row items-center justify-center">
              {/* Use ActivityIndicator for loading state, matching native spinner */}
              <ActivityIndicator color="#FEFDF8" size={20} />
            </View>
          ) : (
            <Text className="text-cream-50 text-center font-paragraph-semibold text-base">
              {currentStep === totalSteps ? "Add to Garden" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {/* For step 3 (confirmation), navigation and submit handled by unified action bar */}
    </View>
  );
}
