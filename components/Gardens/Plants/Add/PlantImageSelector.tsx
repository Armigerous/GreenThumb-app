import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

/**
 * PlantImageSelector component for handling plant image selection
 *
 * Provides functionality to:
 * - Display the current plant image
 * - Take a new photo using the camera
 * - Select an image from the device's gallery
 * - Reset to the default image
 *
 * @param image - The currently selected custom image URI, if any
 * @param defaultImage - The default image URI to use if no custom image is selected
 * @param onImageChange - Callback function when an image is selected or removed
 */
interface PlantImageSelectorProps {
  image: string | null;
  defaultImage: string | null;
  onImageChange: (imageUri: string | null) => void;
}

export default function PlantImageSelector({
  image,
  defaultImage,
  onImageChange,
}: PlantImageSelectorProps) {
  // Fallback image for when no image is available
  const fallbackImageUrl =
    "https://theofficialgreenthumb.com/no-plant-image.png";

  // The image to display (custom image, default image, or fallback)
  const displayImage = image || defaultImage || fallbackImageUrl;

  /**
   * Handles permission requests for camera and media library access
   *
   * @param permissionType The type of permission to request
   * @returns Whether permission was granted
   */
  const getPermission = async (
    permissionType: "camera" | "mediaLibrary"
  ): Promise<boolean> => {
    let permission;

    if (permissionType === "camera") {
      permission = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        `We need ${permissionType} permission to add photos of your plant.`,
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  /**
   * Handles taking a photo with the device camera
   */
  const handleTakePhoto = async () => {
    if (!(await getPermission("camera"))) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false, // Don't need base64 as we'll use blob
        exif: false, // Skip EXIF data to reduce size
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(`Camera image selected: ${result.assets[0].uri}`);
        console.log(
          `Image type: ${result.assets[0].type || "unknown"}, fileSize: ${
            result.assets[0].fileSize || "unknown"
          } bytes`
        );

        // Verify the image has content
        if (result.assets[0].fileSize && result.assets[0].fileSize > 0) {
          onImageChange(result.assets[0].uri);
        } else {
          Alert.alert(
            "Error",
            "The captured photo appears to be empty or invalid. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  /**
   * Handles selecting an image from the device's media library
   */
  const handlePickImage = async () => {
    if (!(await getPermission("mediaLibrary"))) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false, // Don't need base64 as we'll use blob
        exif: false, // Skip EXIF data to reduce size
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(`Gallery image selected: ${result.assets[0].uri}`);
        console.log(
          `Image type: ${result.assets[0].type || "unknown"}, fileSize: ${
            result.assets[0].fileSize || "unknown"
          } bytes`
        );

        // Verify the image has content
        if (result.assets[0].fileSize && result.assets[0].fileSize > 0) {
          onImageChange(result.assets[0].uri);
        } else {
          Alert.alert(
            "Error",
            "The selected image appears to be empty or invalid. Please select another image."
          );
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  return (
    <View className="items-center mb-6">
      {/* Image preview */}
      <View className="h-32 w-32 rounded-xl overflow-hidden bg-cream-100 mb-2">
        <Image
          source={{ uri: displayImage }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      {/* Image action buttons */}
      <View className="flex-row mt-2">
        <TouchableOpacity
          className="bg-brand-500 rounded-lg py-2 px-3 mr-3 flex-row items-center"
          onPress={handleTakePhoto}
        >
          <Ionicons name="camera" size={16} color="white" />
          <Text className="text-white ml-1 font-medium">Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-cream-50 border border-cream-400 rounded-lg py-2 px-3 flex-row items-center"
          onPress={handlePickImage}
        >
          <Ionicons name="images" size={16} color="#6b7280" />
          <Text className="ml-1 font-medium text-gray-700">Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Option to reset to default image */}
      {image && (
        <TouchableOpacity
          className="mt-2 py-1 px-3 bg-cream-100 rounded-lg"
          onPress={() => onImageChange(null)}
        >
          <Text className="text-sm text-cream-700">Use Default Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
