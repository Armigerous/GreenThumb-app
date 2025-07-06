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
      {/* Confirmation Card - Brand-aligned, soft, and visually grouped */}
      <View className="flex-1">
        <TitleText className="text-xl mb-1">Confirm Plant Details</TitleText>
        <BodyText className="text-cream-600 mb-6">
          Review the details of your plant before adding it to your garden:
        </BodyText>

        {/* Brand-styled summary card */}
        <View className="bg-cream-50 rounded-2xl shadow-sm border border-cream-200 mb-6 overflow-hidden">
          {/* Plant image header with fallback and badge */}
          <View className="h-44 w-full bg-brand-100 justify-center items-center relative">
            {displayImage ? (
              isLocalImage ? (
                <Image
                  source={{ uri: displayImage }}
                  className="w-full h-full rounded-t-2xl"
                  resizeMode="cover"
                />
              ) : (
                <CachedImage
                  uri={displayImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                  resizeMode="cover"
                  preventTransform={isSupabaseImage}
                  cacheKey={
                    isSupabaseImage ? `confirm-${displayImage}` : undefined
                  }
                />
              )
            ) : (
              // Fallback: Branded placeholder if no image
              <View className="w-full h-full flex items-center justify-center bg-brand-100">
                <Ionicons name="leaf-outline" size={48} color="#A5D196" />
                <Text className="text-cream-600 mt-2">No image available</Text>
              </View>
            )}
            {/* Optional: Overlay badge with plant name for personality */}
            <View className="absolute top-3 left-3 bg-brand-500 px-3 py-1 rounded-full shadow-sm max-w-[120px]">
              <Text
                className="text-cream-50 text-xs font-paragraph-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 120 }}
              >
                {/* Use first common name if available, else fallback */}
                {Array.isArray(plant.common_names) &&
                plant.common_names.length > 0
                  ? plant.common_names[0]
                  : "Plant"}
              </Text>
            </View>
          </View>

          {/* Plant details section - grouped and styled */}
          <View className="p-4">
            {/* Nickname and scientific name */}
            <View className="mb-4 pb-4 border-b border-cream-200">
              <TitleText
                className="text-lg text-foreground mb-1"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 180 }}
              >
                {nickname || "No Nickname"}
              </TitleText>
              <BodyText
                className="text-sm italic text-cream-500 mb-1"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 180 }}
              >
                {plant.scientific_name || "No scientific name"}
              </BodyText>
              {/* Optional: Plant type/category if available */}
              {Array.isArray(plant.plant_types) &&
                typeof plant.plant_types[0] === "string" &&
                plant.plant_types.length > 0 && (
                  <BodyText
                    className="text-xs text-brand-600"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ maxWidth: 120 }}
                  >
                    {plant.plant_types[0]}
                  </BodyText>
                )}
            </View>

            {/* Care schedule section - brand accent, icon, and friendly text */}
            <View className="mb-4 pb-4 border-b border-cream-200 bg-brand-100 rounded-lg px-3 py-2 flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={18} color="#5E994B" />
              <BodyText className="text-brand-700 text-sm font-medium">
                Personalized care schedule will be created for this plant.
              </BodyText>
            </View>

            {/* Garden info section - icon and name */}
            <View className="flex-row items-center gap-2 mt-2">
              <Ionicons name="flower-outline" size={18} color="#A5D196" />
              <BodyText className="text-cream-600 text-sm">Garden</BodyText>
              <BodyText
                className="text-foreground text-base font-medium"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 160 }}
              >
                {selectedGarden.name || "Unnamed Garden"}
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

      {/* Navigation buttons are rendered by the parent PlantForm for consistency */}
    </View>
  );
}
