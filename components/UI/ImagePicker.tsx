import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoImagePicker from "expo-image-picker";
import { uploadImage } from "@/lib/services/imageUpload";
import { useUser } from "@clerk/clerk-expo";
import CachedImage from "@/components/Database/CachedImage";

interface ImagePickerProps {
  currentImage: string | null;
  onImageSelected: (imageUrl: string | null) => void;
  aspect?: [number, number];
}

/**
 * Image picker component that handles image selection and upload
 * Supports selecting images from the device's gallery or taking a new photo
 */
export function ImagePicker({
  currentImage,
  onImageSelected,
  aspect = [4, 3],
}: ImagePickerProps) {
  const { user } = useUser();

  /**
   * Handles the image selection process
   * Allows users to pick an image from their gallery or take a new photo
   */
  const handleImagePick = async () => {
    if (!user?.id) {
      alert("You must be logged in to upload images");
      return;
    }

    try {
      // Request permission to access the media library
      const { status } =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch the image picker
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload the image using our shared service
        const imageUrl = await uploadImage(result.assets[0].uri, user.id);
        if (imageUrl) {
          onImageSelected(imageUrl);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image. Please try again.");
    }
  };

  return (
    <TouchableOpacity
      onPress={handleImagePick}
      className="w-full aspect-[4/3] bg-cream-100 rounded-lg overflow-hidden items-center justify-center"
    >
      {currentImage ? (
        <CachedImage
          uri={currentImage}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <View className="items-center">
          <Ionicons name="camera-outline" size={32} color="#9e9a90" />
          <Text className="text-cream-600 mt-2">Add Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
