import { useEffect, useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlantDetails, useGardenDashboard } from "@/lib/queries";
import { useUser } from "@clerk/clerk-expo";
import { UserPlant, GardenDashboard } from "@/types/garden";
import { PlantData } from "@/types/plant";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import {
  generatePlantTasks,
  storePlantTasks,
} from "@/lib/services/taskGeneration";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/UI/PageContainer";

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
  const queryClient = useQueryClient();

  // Initialize Supabase auth integration with Clerk
  useSupabaseAuth();

  // Fetch plant details
  const { data: plant, isLoading: loadingPlant } = usePlantDetails(
    plantSlug as string
  );

  // Fetch user's gardens using the dashboard view
  const { data: gardens, isLoading: loadingGardens } = useGardenDashboard(
    user?.id
  );

  // States to track the multi-step flow
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGarden, setSelectedGarden] = useState<GardenDashboard | null>(
    null
  );
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<UserPlant["status"]>("Healthy");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Set default nickname from plant name when plant data loads ONLY if nickname is empty
  useEffect(() => {
    if (plant && nickname === "") {
      // Generate a random name as the initial default
      const randomNames = [
        "Milo",
        "Daisy",
        "Oliver",
        "Lily",
        "Charlie",
        "Sophie",
        "Ruby",
        "Bella",
        "Toby",
        "Emma",
        "Lucy",
        "Finn",
      ];
      const randomName =
        randomNames[Math.floor(Math.random() * randomNames.length)];
      setNickname(randomName);
    }
  }, [plant]);

  /**
   * Debug function to check authentication status
   * This helps diagnose why storage bucket access might be failing
   */
  const debugAuthStatus = async () => {
    console.log("---------------- AUTH DEBUG ----------------");
    // Log Clerk user ID
    console.log("Clerk user ID:", user?.id || "Not signed in");

    // Check Supabase session
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    console.log("Supabase session present:", session?.session ? "Yes" : "No");
    if (sessionError) {
      console.error("Session error:", sessionError.message);
    }

    // Try to get user ID from JWT claims via RPC
    try {
      const { data: userId, error: userIdError } = await supabase.rpc(
        "requesting_user_id"
      );
      console.log("User ID from JWT claims:", userId || "Not found");
      if (userIdError) {
        console.error("Error getting user ID from JWT:", userIdError.message);
      }
    } catch (error) {
      console.error("Error calling requesting_user_id():", error);
    }

    console.log("-------------------------------------------");
  };

  /**
   * Uploads an image to storage and returns the public URL
   * Ensures proper handling of file content
   */
  const uploadImage = async (uri: string): Promise<string | null> => {
    // Debug auth status before attempting upload
    await debugAuthStatus();

    const MAX_RETRIES = 2;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`Fetching image data from URI: ${uri}`);

        // More robust fetch with timeout and explicit response handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(uri, {
          method: "GET",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`
          );
        }

        // Log response details for debugging
        console.log(
          `Response status: ${response.status}, type: ${response.headers.get(
            "content-type"
          )}`
        );

        // Create blob properly ensuring content type is preserved
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        const blob = await response.blob();

        // Verify blob has content
        console.log(
          `Created blob of size: ${blob.size} bytes, type: ${blob.type}`
        );

        if (blob.size === 0) {
          throw new Error(
            "Image blob has 0 bytes - source image may be invalid"
          );
        }

        // Create a unique file path for the image with user_id to enforce ownership
        if (!user?.id) {
          console.error("No user ID available for upload");
          throw new Error("User ID is required for upload");
        }

        // Extract file extension from content type if not available in URI
        let fileExt = uri.split(".").pop()?.toLowerCase();
        if (!fileExt || fileExt.length > 5 || !fileExt.match(/^[a-z0-9]+$/)) {
          // Extract from mime type as fallback
          fileExt = contentType.split("/")[1] || "jpg";
        }

        const fileName = `${generateUUID()}.${fileExt}`;
        const userId = user.id;
        const filePath = `plant-images/${userId}/${fileName}`;

        console.log(`Uploading image to: ${filePath}`);
        console.log(`Content type: ${contentType}, Size: ${blob.size} bytes`);

        // Upload with explicit content type from the response
        const { data, error: uploadError } = await supabase.storage
          .from("user-uploads")
          .upload(filePath, blob, {
            contentType: contentType,
            upsert: true, // Use upsert in case of conflicts
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        console.log(`Upload successful! Path: ${filePath}`);

        // Get the URL for the uploaded image
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("user-uploads")
            .createSignedUrl(filePath, 315360000); // ~10 years in seconds

        if (signedUrlError) {
          console.error("Error creating signed URL:", signedUrlError);
          throw signedUrlError;
        }

        // Verify URL was created
        console.log(
          `Signed URL created: ${signedUrlData?.signedUrl ? "Yes" : "No"}`
        );

        return signedUrlData?.signedUrl || null;
      } catch (error) {
        console.error(
          `Error in uploadImage (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
          error
        );

        if (retryCount < MAX_RETRIES - 1) {
          retryCount++;
          console.log(
            `Retrying image upload (attempt ${
              retryCount + 1
            }/${MAX_RETRIES})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
          continue;
        }

        // Handle the error in a user-friendly way
        setError(
          "Unable to upload your image. Using the default plant image instead."
        );
        return null;
      }
    }

    return null;
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

      // If a custom image was selected, handle it appropriately
      if (image) {
        setUploadProgress(30);

        // Check if the image is already a Supabase URL with a token
        if (image.includes("supabase.co") && image.includes("token=")) {
          console.log(
            "Image is already a Supabase URL with token, using directly:",
            image
          );
          plantImageUrl = image;
          setUploadProgress(60); // Skip upload progress
        } else {
          // This is a local image or non-Supabase URL that needs to be uploaded
          try {
            plantImageUrl = await uploadImage(image);

            // If upload failed but we want to continue with default image
            if (
              !plantImageUrl &&
              error &&
              error.includes("Using the default")
            ) {
              // Clear the error since we're handling it by using the default image
              setError(null);
              console.log("Using default plant image instead of custom image");

              // Use the default image from plant data
              plantImageUrl =
                plant.images && plant.images.length > 0
                  ? plant.images[0]?.img || null
                  : null;
            }
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            setError("Failed to upload image. Using default image instead.");
            plantImageUrl =
              plant.images && plant.images.length > 0
                ? plant.images[0]?.img || null
                : null;
          }
        }
      } else {
        // Use the default image from plant data
        plantImageUrl =
          plant.images && plant.images.length > 0
            ? plant.images[0]?.img || null
            : null;
      }

      // Set progress after image handling (whether uploaded or direct use)
      setUploadProgress(70);

      // Get current timestamp for created/updated fields
      const now = new Date().toISOString();

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
      const plantData: UserPlant = {
        id: generateUUID(),
        garden_id: selectedGarden.garden_id,
        plant_id: parseInt(plantId as string),
        nickname: nickname.trim(),
        status: status,
        images: plantImageUrl ? [plantImageUrl] : [],
        care_logs: [],
        created_at: now,
        updated_at: now,
      };

      setUploadProgress(85);

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

        setUploadProgress(90);
        console.log(
          "Plant added successfully via RPC:",
          data ? JSON.stringify(data) : "No data returned"
        );

        setUploadProgress(100);

        // Invalidate both garden details and dashboard queries to refresh all related UI
        if (selectedGarden) {
          queryClient.invalidateQueries({
            queryKey: ["gardenDetails", selectedGarden.garden_id],
          });
          queryClient.invalidateQueries({
            queryKey: ["gardenDashboard", user?.id],
          });
        }

        // Show success alert and navigate immediately
        Alert.alert(
          "Plant Added",
          "Your plant has been added to your garden! Care tasks will be generated in the background.",
          [
            {
              text: "View Garden",
              onPress: () => {
                // Use setTimeout to ensure the alert is dismissed before navigation
                setTimeout(() => {
                  router.push(
                    `/(home)/gardens/${selectedGarden.garden_id.toString()}`
                  );
                }, 100);
              },
            },
          ],
          { cancelable: false }
        );

        // Generate and store tasks in the background
        try {
          console.log("Generating tasks for new plant in background...");
          generatePlantTasks(plantData as UserPlant)
            .then((tasks) => {
              console.log(
                "Background tasks generated successfully:",
                tasks.length
              );
              // The tasks are already stored by the Edge Function
              // No need to call storePlantTasks() again
            })
            .catch((taskError) =>
              console.error("Error in background task generation:", taskError)
            );
        } catch (taskError) {
          console.error(
            "Error initiating background task generation:",
            taskError
          );
        }
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
      router.push(`/(home)/gardens`);
    }
  };

  // Render loading state
  if (loadingPlant || loadingGardens) {
    return <LoadingSpinner message="Loading data..." />;
  }

  // Render error state if plant is not found
  if (!plant) {
    return (
      <PageContainer padded={false}>
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
      </PageContainer>
    );
  }

  // Determine plant name to display
  const plantDisplayName = plant.common_names?.[0] || plant.scientific_name;

  // Define step labels for the progress indicator
  const stepLabels = ["Select Garden", "Plant Details", "Confirm"];

  return (
    <PageContainer padded={false} scroll={false}>
      <View className="flex-1">
        <View className="mx-4">
          {/* Header */}
          <Header title="Add Plant to Garden" onBackPress={handleBackButton} />

          {/* Progress indicator */}
          <ProgressIndicator
            currentStep={step}
            totalSteps={3}
            stepLabels={stepLabels}
          />
        </View>

        <View className="flex-1 px-4">
          {/* Step 1: Garden Selection */}
          {step === 1 && (
            <GardenSelectionStep
              plantSlug={plantSlug}
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
              plant={plant as PlantData}
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
              plant={plant as PlantData}
              nickname={nickname}
              status={status}
              image={image}
              selectedGarden={selectedGarden as GardenDashboard}
              isSubmitting={isSubmitting}
              uploadProgress={uploadProgress}
              error={error}
              onBack={handlePreviousStep}
              onSubmit={handleAddPlant}
            />
          )}
        </View>
      </View>
    </PageContainer>
  );
}
