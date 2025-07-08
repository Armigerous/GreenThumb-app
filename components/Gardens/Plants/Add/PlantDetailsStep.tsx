import { PlantFullDataUI } from "@/types/plant";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ImagePicker from "./ImagePicker";
import { BodyText, TitleText } from "@/components/UI/Text";

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
  plant: PlantFullDataUI;
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
  "Oliver",
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
      ? plant.images[0].img
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 flex">
        <View className="flex-1">
          <TitleText className="text-xl mb-1">
            {/* Reason: Brand voice—short, friendly, inviting (BRAND_IDENTITY.md) */}
            Make it yours
          </TitleText>
          <BodyText className=" mb-6">
            {/* Reason: Conversational, outcome-focused, plain language (BRAND_IDENTITY.md) */}
            Give your plant a name and a photo. It's more fun that way!
          </BodyText>

          {/* Nickname Input with Randomize button */}
          <View className="mb-6">
            <TitleText className="mb-2">
              {/* Reason: Simpler, less formal, plain-spoken (BRAND_IDENTITY.md) */}
              Plant&apos;s name
            </TitleText>
            <View className="flex-row items-center">
              <TextInput
                className="bg-white border border-cream-300 rounded-lg p-3 text-foreground flex-1 mr-2"
                value={nickname}
                onChangeText={setNickname}
                // Reason: Conversational, inviting (BRAND_IDENTITY.md)
                placeholder="What should we call this plant?"
                placeholderTextColor="#9e9a90"
                maxLength={50}
              />
              <TouchableOpacity onPress={handleRandomizeName} className="p-3">
                <Ionicons name="shuffle" size={24} color="#2A5D39" />
              </TouchableOpacity>
            </View>
          </View>

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
                {/* Reason: Simpler, less technical, plain-spoken (BRAND_IDENTITY.md) */}
                <BodyText className="text-sm text-cream-700">
                  Use the original photo
                </BodyText>
              </TouchableOpacity>
            )}
          </View>

          {/* Note about care tracking */}
          <View className="mb-6 bg-brand-50 rounded-lg p-4">
            {/* Reason: Direct, outcome-focused, friendly (BRAND_IDENTITY.md) */}
            <BodyText className="mb-1">
              📋 We&apos;ll help you care for it
            </BodyText>
            <BodyText className="text-sm">
              {/* Reason: Simple, specific, reassuring (BRAND_IDENTITY.md) */}
              We&apos;ll remind you when to water and care for this plant, based
              on what it needs and where you live.
            </BodyText>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
