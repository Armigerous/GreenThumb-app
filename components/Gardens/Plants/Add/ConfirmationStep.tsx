import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserPlant, GardenDashboard } from "@/types/garden";
import { PlantFullDataUI } from "@/types/plant";
import SubmitButton from "../../../UI/SubmitButton";
import ErrorMessage from "./ErrorMessage";
import AnimatedProgressBar from "../../../UI/AnimatedProgressBar";
import CachedImage from "@/components/CachedImage";
import { useEffect, useState } from "react";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";

/**
 * ConfirmationStep component displays the final summary before adding the plant
 *
 * @param plant - Plant data from the API
 * @param nickname - The chosen nickname
 * @param image - Custom image URI if selected
 * @param selectedGarden - The selected garden for the plant
 * @param isSubmitting - Whether the form is currently being submitted
 * @param uploadProgress - Progress percentage for uploads
 * @param error - Error message if any
 * @param onBack - Callback for the back button
 * @param onSubmit - Callback for submission
 */
interface ConfirmationStepProps {
  plant: PlantFullDataUI;
  nickname: string;
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

  return (
    <View className="flex-1 flex">
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

            {/* Care tracking note instead of status */}
            <View className="mb-4 pb-4 border-b border-cream-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={18} color="#77B860" />
                <BodyText className="text-brand-600 text-sm font-medium ml-2">
                  Care Schedule
                </BodyText>
              </View>
              <BodyText className="text-cream-600 text-sm">
                We&apos;ll automatically create a personalized care schedule
                based on this plant&apos;s needs and your local conditions.
              </BodyText>
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
      {/* Removed: Action buttons are now rendered by the parent PlantForm for consistency across all steps. */}
    </View>
  );
}
