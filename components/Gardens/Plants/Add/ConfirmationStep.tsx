import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserPlant, GardenDashboard } from "@/types/garden";
import { PlantData } from "@/types/plant";
import SubmitButton from "../../../UI/SubmitButton";
import ErrorMessage from "./ErrorMessage";
import AnimatedProgressBar from "../../../UI/AnimatedProgressBar";
import CachedImage from "@/components/CachedImage";
import { useEffect, useState } from "react";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";

/**
 * ConfirmationStep component for reviewing and confirming plant details
 *
 * Shows a summary of plant details including image, nickname, status, and selected garden
 * Handles the final submission with loading state and error display
 *
 * @param plant - Plant data from API
 * @param nickname - Plant nickname
 * @param status - Plant health status
 * @param image - Custom image URI if any
 * @param selectedGarden - Selected garden to add the plant to
 * @param isSubmitting - Whether the form is currently submitting
 * @param uploadProgress - Upload progress percentage (0-100)
 * @param error - Error message if submission failed
 * @param onBack - Callback for back button
 * @param onSubmit - Callback for submission
 */
interface ConfirmationStepProps {
  plant: PlantData;
  nickname: string;
  status: UserPlant["status"];
  image: string | null;
  selectedGarden: GardenDashboard;
  isSubmitting: boolean;
  uploadProgress: number;
  error: string | null;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

export default function ConfirmationStep({
  plant,
  nickname,
  status,
  image,
  selectedGarden,
  isSubmitting,
  uploadProgress,
  error,
  onBack,
  onSubmit,
}: ConfirmationStepProps) {
  // Track if the image is a remote URL or a local file URI
  const [isLocalImage, setIsLocalImage] = useState(false);
  // Whether the image is a Supabase URL that should be used directly
  const [isSupabaseImage, setIsSupabaseImage] = useState(false);

  // Update image states when image changes
  useEffect(() => {
    if (image) {
      setIsLocalImage(image.startsWith("file://"));
      setIsSupabaseImage(
        image.includes("supabase.co") && image.includes("token=")
      );

      if (image.includes("supabase.co") && image.includes("token=")) {
        console.log(
          "Using already uploaded Supabase image, preventing re-upload"
        );
      }
    } else {
      setIsLocalImage(false);
      setIsSupabaseImage(false);
    }
  }, [image]);

  // Get the image to display
  const displayImage =
    image ||
    (plant?.images && plant.images.length > 0 ? plant.images[0]?.img : null) ||
    "https://theofficialgreenthumb.com/no-plant-image.png";

  // Get status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case "Healthy":
        return { icon: "checkmark-circle", color: "#059669" };
      case "Needs Water":
        return { icon: "water", color: "#d97706" };
      case "Wilting":
        return { icon: "alert-circle", color: "#dc2626" };
      case "Dormant":
        return { icon: "moon", color: "#d97706" };
      case "Dead":
        return { icon: "skull", color: "#991b1b" };
      default:
        return { icon: "help-circle", color: "#6b7280" };
    }
  };

  const statusInfo = getStatusIcon();

  return (
    <View className="px-4 flex-1 flex">
      <View className="flex-1">
        <TitleText className="text-xl text-foreground mb-6">
          Confirm Plant Details
        </TitleText>
        <BodyText className="text-cream-600 mb-6">
          Review the details of your plant before adding it to your garden:
        </BodyText>

        {/* Summary card */}
        <View className="bg-white rounded-xl overflow-hidden border border-cream-100 mb-6">
          {/* Plant image header */}
          <View className="h-44 w-full">
            {isLocalImage ? (
              // Use standard Image component for local file URIs
              <Image
                source={{ uri: displayImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              // Use CachedImage for remote URLs
              <CachedImage
                uri={displayImage}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                preventTransform={isSupabaseImage} // Prevent transforming already uploaded Supabase URLs
                cacheKey={
                  isSupabaseImage ? `confirm-${displayImage}` : undefined
                }
              />
            )}
          </View>

          {/* Plant details */}
          <View className="p-4">
            <SubtitleText className="text-lg text-foreground mb-2">
              Plant Information
            </SubtitleText>

            {/* Name section */}
            <View className="mb-4 pb-4 border-b border-cream-100">
              <BodyText className="text-cream-600 text-sm">Nickname</BodyText>
              <BodyText className="text-foreground text-base font-medium">
                {nickname}
              </BodyText>
              <BodyText className="text-sm italic text-cream-500">
                {plant.scientific_name}
              </BodyText>
            </View>

            {/* Status section */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-cream-100">
              <BodyText className="text-cream-600 text-sm">Status</BodyText>
              <View className="flex-row items-center">
                <Ionicons
                  name={statusInfo.icon as any}
                  size={18}
                  color={statusInfo.color}
                />
                <BodyText className="text-foreground text-base font-medium ml-1">
                  {status}
                </BodyText>
              </View>
            </View>

            {/* Garden section */}
            <View className="flex-row items-center">
              <BodyText className="text-cream-600 text-sm">Garden</BodyText>
              <BodyText className="text-foreground text-base font-medium">
                {selectedGarden.name}
              </BodyText>
            </View>
          </View>
        </View>

        {/* Error message if any */}
        <ErrorMessage message={error} />

        {/* Progress indicator during submission */}
        {isSubmitting && (
          <View className="mb-6">
            <Text className="text-center text-cream-600 mb-2">
              {uploadProgress < 100
                ? `Adding your plant... ${uploadProgress}%`
                : "Plant added successfully!"}
            </Text>
            <AnimatedProgressBar
              percentage={uploadProgress}
              color="#77B860" // brand-500
              height={8}
              duration={300}
            />
          </View>
        )}
      </View>

      {/* Navigation buttons */}
      <View className="flex-row justify-between items-center py-6 mt-auto">
        <SubmitButton
          onPress={onBack}
          isDisabled={isSubmitting}
          color="secondary"
          iconName="arrow-back"
          iconPosition="left"
        >
          Back
        </SubmitButton>
        <SubmitButton
          loadingLabel="Adding..."
          onPress={onSubmit}
          isLoading={isSubmitting}
          iconName={isSubmitting ? undefined : "add-circle-outline"}
          iconPosition="right"
        >
          Add to Garden
        </SubmitButton>
      </View>
    </View>
  );
}
