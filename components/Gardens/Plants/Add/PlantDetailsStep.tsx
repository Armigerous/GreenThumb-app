import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { UserPlant } from "@/types/garden";
import { PlantData } from "@/types/plant";
import SubmitButton from "../../../UI/SubmitButton";
import { Ionicons } from "@expo/vector-icons";
import ImagePicker from "./ImagePicker";
import { useState } from "react";

/**
 * PlantDetailsStep component for customizing plant details
 *
 * This component allows users to:
 * - Set a nickname for their plant
 * - Take or choose a photo of their plant
 *
 * @param plant - Plant data from the API
 * @param nickname - Current nickname value
 * @param setNickname - Function to update the nickname
 * @param image - Current custom image URI
 * @param setImage - Function to update the image
 * @param onBack - Callback for the back button
 * @param onNext - Callback for the next button
 */
interface PlantDetailsStepProps {
  plant: PlantData;
  nickname: string;
  setNickname: (name: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

// List of cute human names for random selection
const cuteNames = [
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
  "Rosie",
  "Lola",
  "Zoe",
  "Tommy",
  "Chloe",
  "Leo",
  "Ellie",
  "Felix",
  "Poppy",
  "Buddy",
  "Molly",
  "Oscar",
  "Teddy",
  "Penny",
  "Jasper",
  "Chorizo",
  "Monday",
  "Colby",
  "Brie",
  "Cheddar",
  "Gracie Moon",
  "Moonpie",
  "Pumpkin",
  "Chunky",
  "Bubbles",
  "Heath",
];

const getRandomCuteName = () => {
  const randomIndex = Math.floor(Math.random() * cuteNames.length);
  return cuteNames[randomIndex];
};

export default function PlantDetailsStep({
  plant,
  nickname,
  setNickname,
  image,
  setImage,
  onBack,
  onNext,
}: PlantDetailsStepProps) {
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Get the first image from the plant data to display as default
  const defaultPlantImage =
    plant?.images && plant.images.length > 0 && plant.images[0]?.img
      ? plant.images[0]?.img
      : null;

  // Function to set a random nickname
  const handleRandomizeName = () => {
    setNickname(getRandomCuteName());
  };

  // Handler for image selection that tracks upload status
  const handleImageSelected = (imageUrl: string | null) => {
    setImage(imageUrl);
  };

  return (
    <View className="px-4 flex-1 flex">
      <View className="flex-1">
        <Text className="text-xl font-bold mb-4">Customize Your Plant</Text>
        <Text className="text-cream-600 mb-6">
          Add details to personalize your plant:
        </Text>

        {/* Plant Image Selector */}
        <View className="mb-6 items-center">
          <ImagePicker
            currentImage={image || defaultPlantImage}
            onImageSelected={handleImageSelected}
            aspect={[1, 1]}
            onUploadStatusChange={setIsImageUploading}
          />

          {/* Option to reset to default image */}
          {image && defaultPlantImage && (
            <TouchableOpacity
              className="mt-2 py-1 px-3 bg-cream-100 rounded-lg self-center"
              onPress={() => setImage(null)}
              disabled={isImageUploading}
            >
              <Text className="text-sm text-cream-700">Use Default Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nickname Input with Randomize button */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Nickname</Text>
          <View className="flex-row items-center">
            <TextInput
              className="bg-white border border-cream-300 rounded-lg p-3 text-foreground flex-1 mr-2"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Give your plant a name"
              placeholderTextColor="#9e9a90"
              maxLength={50}
            />
            <TouchableOpacity
              onPress={handleRandomizeName}
              className="bg-cream-100 p-3 rounded-lg"
            >
              <Ionicons name="shuffle" size={24} color="#2A5D39" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Note about care tracking */}
        <View className="mb-6 bg-brand-50 rounded-lg p-4">
          <Text className="text-brand-700 font-medium text-sm mb-1">
            📋 Automatic Care Tracking
          </Text>
          <Text className="text-brand-600 text-sm">
            We&apos;ll create a personalized care schedule based on this
            plant&apos;s specific needs and your local conditions.
          </Text>
        </View>
      </View>

      {/* Navigation buttons */}
      <View className="flex-row justify-between items-center py-6 mt-auto">
        <SubmitButton
          onPress={onBack}
          color="secondary"
          isDisabled={isImageUploading}
          iconName="arrow-back"
          iconPosition="left"
        >
          Back
        </SubmitButton>
        <SubmitButton
          onPress={onNext}
          isDisabled={!nickname.trim() || isImageUploading}
          iconName={isImageUploading ? undefined : "arrow-forward"}
          iconPosition="right"
        >
          {isImageUploading ? "Uploading..." : "Next"}
        </SubmitButton>
      </View>
    </View>
  );
}
