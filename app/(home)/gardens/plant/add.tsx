import { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlantDetails, useUserGardens } from "@/lib/queries";
import { useUser } from "@clerk/clerk-expo";
import { Garden, UserPlant } from "@/types/garden";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

/**
 * Generate a UUID that is compatible with React Native
 * This is a simple implementation that should be sufficient for our needs
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Import our modular components
import {
  Header,
  ProgressIndicator,
  LoadingState,
  GardenSelectionStep,
  PlantDetailsStep,
  ConfirmationStep,
  ErrorMessage,
} from "@/components/Gardens/Plants/Add";

/**
 * AddPlantToGardenScreen handles the flow for adding a plant to the user's garden
 *
 * This is a multi-step process where users can:
 * 1. Select which garden to add the plant to
 * 2. Customize the plant's details (nickname, status, photo)
 * 3. Confirm and add the plant to their garden
 */
export default function AddPlantToGardenScreen() {
  const { plantId, plantSlug } = useLocalSearchParams<{
    plantId: string;
    plantSlug: string;
  }>();
  const router = useRouter();
  const { user } = useUser();

  // Initialize Supabase auth integration with Clerk
  useSupabaseAuth();

  // Fetch plant details
  const { data: plant, isLoading: loadingPlant } = usePlantDetails(
    plantSlug as string
  );

  // Fetch user's gardens
  const { data: gardens, isLoading: loadingGardens } = useUserGardens(user?.id);

  // States to track the multi-step flow
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<UserPlant["status"]>("Healthy");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set default nickname from plant name when plant data loads
  useEffect(() => {
    if (plant) {
      const defaultName = plant.common_names?.[0] || plant.scientific_name;
      setNickname(defaultName);
    }
  }, [plant]);

  /**
   * Uploads an image to storage and returns the public URL
   */
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique file path for the image
      const fileExt = uri.split(".").pop();
      const filePath = `plant-images/${user?.id}/${generateUUID()}.${fileExt}`;

      // Upload the image to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      return null;
    }
  };

  /**
   * Handles the submission of a new plant to the user's garden
   *
   * This function:
   * 1. Validates required data
   * 2. Uploads any custom image if selected
   * 3. Creates a new plant entry in the user_plants table
   * 4. Navigates to the garden detail page on success
   */
  const handleAddPlant = async () => {
    // Reset any previous errors
    setError(null);

    // Thorough validation
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

    if (!plantId || isNaN(parseInt(plantId as string))) {
      setError("Invalid plant ID");
      return;
    }

    // Ensure user is authenticated
    if (!user?.id) {
      setError("You must be logged in to add plants");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Verify the garden belongs to the current user to enforce RLS policy
      if (selectedGarden.user_id !== user.id) {
        setError("You don't have permission to add plants to this garden");
        setIsSubmitting(false);
        return;
      }

      let plantImageUrl = null;

      // If a custom image was selected, upload it
      if (image) {
        setUploadProgress(30);
        plantImageUrl = await uploadImage(image);
        setUploadProgress(70);

        if (!plantImageUrl) {
          setError("Failed to upload plant image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Use the default image from plant data
        plantImageUrl =
          plant.images && plant.images.length > 0
            ? plant.images[0]?.img || null
            : null;
      }

      setUploadProgress(80);

      // Debug authentication state
      console.log("Current user ID:", user?.id);
      console.log("Selected garden user ID:", selectedGarden.user_id);

      // Check authentication status with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.getSession();
      console.log("Supabase auth session:", authData ? "Present" : "Missing");
      if (authError) {
        console.error("Auth error:", authError);
      }

      // Prepare plant data for insertion
      const plantData = {
        id: generateUUID(), // Generate a unique UUID for the plant compatible with React Native
        garden_id: selectedGarden.id, // This links to user_gardens which has the user_id, enabling RLS policies to work correctly
        plant_id: parseInt(plantId as string),
        nickname: nickname.trim(),
        status: status,
        images: plantImageUrl ? [plantImageUrl] : [],
        care_logs: [], // Empty array initially
      };

      setUploadProgress(90);

      try {
        console.log("Attempting to insert plant data...");

        // Try using RPC to call a database function that bypasses RLS issues
        console.log("Using RPC with add_user_plant function...");
        const { data, error: rpcError } = await supabase.rpc("add_user_plant", {
          p_id: plantData.id,
          p_garden_id: plantData.garden_id,
          p_plant_id: plantData.plant_id,
          p_nickname: plantData.nickname,
          p_status: plantData.status,
          p_images: plantData.images,
          p_care_logs: plantData.care_logs,
        });

        if (rpcError) {
          console.error("Error with RPC:", rpcError);
          throw new Error(`Database function error: ${rpcError.message}`);
        }

        setUploadProgress(100);
        console.log(
          "Plant added successfully via RPC:",
          data ? JSON.stringify(data) : "No data returned"
        );

        // Success! Show alert and navigate after user confirms
        Alert.alert(
          "Plant Added",
          "Your plant has been added to your garden!",
          [
            {
              text: "View Garden",
              onPress: () => {
                // Use setTimeout to ensure the alert is dismissed before navigation
                setTimeout(() => {
                  router.push(
                    `/(home)/gardens/${selectedGarden.id.toString()}`
                  );
                }, 100);
              },
            },
          ],
          { cancelable: false }
        );
      } catch (insertErr) {
        console.error("Error during insert:", insertErr);
        setError("Failed to add plant to garden. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error in handleAddPlant:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step navigation functions
  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleBackButton = () => {
    if (step > 1) {
      handlePreviousStep();
    } else {
      router.push("/(home)/gardens");
    }
  };

  // Render loading state
  if (loadingPlant || loadingGardens) {
    return <LoadingState />;
  }

  // Render error state if plant is not found
  if (!plant) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Header
          title="Plant Not Found"
          onBackPress={() => router.push("/(home)/gardens")}
        />
        <View className="flex-1 px-4 py-2">
          <ScrollView>
            <View className="pt-5 px-5">
              <ErrorMessage
                message="Plant not found. Please try again."
                severity="error"
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Determine plant name to display
  const plantDisplayName = plant.common_names?.[0] || plant.scientific_name;

  // Define step labels for the progress indicator
  const stepLabels = ["Select Garden", "Plant Details", "Confirm"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Header title="Add Plant to Garden" onBackPress={handleBackButton} />

      {/* Progress indicator */}
      <ProgressIndicator
        currentStep={step}
        totalSteps={3}
        stepLabels={stepLabels}
      />

      <ScrollView className="flex-1">
        {/* Step 1: Garden Selection */}
        {step === 1 && (
          <GardenSelectionStep
            gardens={gardens}
            selectedGarden={selectedGarden}
            onSelectGarden={setSelectedGarden}
            onNext={handleNextStep}
            plantName={plantDisplayName}
          />
        )}

        {/* Step 2: Plant Details */}
        {step === 2 && (
          <PlantDetailsStep
            plant={plant}
            nickname={nickname}
            setNickname={setNickname}
            status={status}
            setStatus={setStatus}
            image={image}
            setImage={setImage}
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedGarden && (
          <ConfirmationStep
            plant={plant}
            nickname={nickname}
            status={status}
            image={image}
            selectedGarden={selectedGarden}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            error={error}
            onBack={handlePreviousStep}
            onSubmit={handleAddPlant}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
