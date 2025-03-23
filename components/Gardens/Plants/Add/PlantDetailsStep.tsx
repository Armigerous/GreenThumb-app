import { View, Text, TextInput } from "react-native";
import { UserPlant } from "@/types/garden";
import { PlantData } from "@/types/plant";
import PlantImageSelector from "./PlantImageSelector";
import PlantStatusSelector from "./PlantStatusSelector";
import SubmitButton from "./SubmitButton";

/**
 * PlantDetailsStep component for customizing plant details
 *
 * This component allows users to:
 * - Set a nickname for their plant
 * - Select its current health status
 * - Take or choose a photo of their plant
 *
 * @param plant - Plant data from the API
 * @param nickname - Current nickname value
 * @param setNickname - Function to update the nickname
 * @param status - Current plant status
 * @param setStatus - Function to update the status
 * @param image - Current custom image URI
 * @param setImage - Function to update the image
 * @param onBack - Callback for the back button
 * @param onNext - Callback for the next button
 */
interface PlantDetailsStepProps {
  plant: PlantData;
  nickname: string;
  setNickname: (name: string) => void;
  status: UserPlant["status"];
  setStatus: (status: UserPlant["status"]) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PlantDetailsStep({
  plant,
  nickname,
  setNickname,
  status,
  setStatus,
  image,
  setImage,
  onBack,
  onNext,
}: PlantDetailsStepProps) {
  // Get the first image from the plant data to display as default
  const defaultPlantImage =
    plant?.images && plant.images.length > 0 && plant.images[0]?.img
      ? plant.images[0]?.img
      : null;

  return (
    <View className="px-4">
      <Text className="text-xl font-bold mb-4">Customize Your Plant</Text>
      <Text className="text-cream-600 mb-6">
        Add details to personalize your plant:
      </Text>

      {/* Plant Image Selector */}
      <PlantImageSelector
        image={image}
        defaultImage={defaultPlantImage}
        onImageChange={setImage}
      />

      {/* Nickname Input */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Nickname</Text>
        <TextInput
          className="bg-white border border-cream-400 rounded-lg p-3 text-foreground"
          value={nickname}
          onChangeText={setNickname}
          placeholder="Give your plant a name"
          placeholderTextColor="#9e9a90"
          maxLength={50}
        />
      </View>

      {/* Plant Status Selector */}
      <PlantStatusSelector selectedStatus={status} onStatusChange={setStatus} />

      {/* Navigation buttons */}
      <View className="flex-row justify-between py-4">
        <SubmitButton label="Back" onPress={onBack} variant="secondary" />
        <SubmitButton
          label="Next"
          onPress={onNext}
          isDisabled={!nickname.trim()}
        />
      </View>
    </View>
  );
}
