import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserPlant, GardenDashboard } from "@/types/garden";
import { PlantData } from "@/types/plant";
import SubmitButton from "./SubmitButton";
import ErrorMessage from "./ErrorMessage";
import AnimatedProgressBar from "../../../UI/AnimatedProgressBar";

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
    <View className="px-4">
      <Text className="text-xl font-bold mb-4">Confirm Your New Plant</Text>
      <Text className="text-cream-600 mb-6">
        Review the details of your plant before adding it to your garden:
      </Text>

      {/* Summary card */}
      <View className="bg-white rounded-xl overflow-hidden border border-cream-100 mb-6">
        {/* Plant image header */}
        <View className="h-44 w-full">
          <Image
            source={{ uri: displayImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Plant details */}
        <View className="p-4">
          {/* Name section */}
          <View className="mb-4 pb-4 border-b border-cream-100">
            <Text className="text-lg font-bold text-foreground">
              {nickname}
            </Text>
            <Text className="text-sm italic text-cream-500">
              {plant.scientific_name}
            </Text>
          </View>

          {/* Status section */}
          <View className="flex-row items-center mb-4 pb-4 border-b border-cream-100">
            <Text className="text-cream-500 text-base mr-2">Status:</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={statusInfo.icon as any}
                size={18}
                color={statusInfo.color}
              />
              <Text className="text-foreground text-base font-medium ml-1">
                {status}
              </Text>
            </View>
          </View>

          {/* Garden section */}
          <View className="flex-row items-center">
            <Text className="text-cream-500 text-base mr-2">Garden:</Text>
            <Text className="text-foreground text-base font-medium">
              {selectedGarden?.name}
            </Text>
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

      {/* Navigation buttons */}
      <View className="flex-row justify-between py-4">
        <SubmitButton
          onPress={onBack}
          isDisabled={isSubmitting}
          color="secondary"
        >
          Back
        </SubmitButton>
        <SubmitButton
          loadingLabel="Adding..."
          onPress={onSubmit}
          isLoading={isSubmitting}
        >
          Add to Garden
        </SubmitButton>
      </View>
    </View>
  );
}
