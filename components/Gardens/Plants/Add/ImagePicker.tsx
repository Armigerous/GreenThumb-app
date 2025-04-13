import CachedImage from "@/components/CachedImage";
import { uploadImage } from "@/lib/services/imageUpload";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ImagePickerProps {
  currentImage: string | null;
  onImageSelected: (imageUrl: string | null) => void;
  aspect?: [number, number];
  onUploadStatusChange?: (isUploading: boolean) => void;
}

/**
 * Image picker component that handles image selection and upload
 * Supports selecting images from the device's gallery or taking a new photo
 */
export default function ImagePicker({
  currentImage,
  onImageSelected,
  aspect = [4, 3],
  onUploadStatusChange,
}: ImagePickerProps) {
  const { user } = useUser();
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Update parent when uploaded image URL changes
  useEffect(() => {
    if (uploadedImageUrl) {
      console.log("Final image URL set:", uploadedImageUrl);
      console.log(
        "Image filename in URL:",
        uploadedImageUrl.split("/").pop()?.split("?")[0]
      );
      onImageSelected(uploadedImageUrl);
    }
  }, [uploadedImageUrl, onImageSelected]);

  // Notify parent component about upload status changes
  useEffect(() => {
    if (onUploadStatusChange) {
      onUploadStatusChange(isUploading);
    }
  }, [isUploading, onUploadStatusChange]);

  /**
   * Handles the image selection process
   * Allows users to pick an image from their gallery or take a new photo
   */
  const handleImagePick = async () => {
    if (!user?.id) {
      alert("You must be logged in to upload images");
      return;
    }

    // Don't allow new selection while upload is in progress
    if (isUploading) {
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

      // Launch the image picker with base64 enabled
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.8,
        base64: true, // Always request base64 data
        exif: false, // We don't need EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        // Clear previous state
        setUploadedImageUrl(null);
        // Set the local image URI immediately for display
        setLocalImageUri(result.assets[0].uri);
        setIsUploading(true);

        try {
          const base64Data = result.assets[0].base64;
          if (!base64Data) {
            throw new Error("Failed to get base64 data from selected image");
          }

          console.log(
            "Starting upload with uri:",
            result.assets[0].uri.substring(0, 50) + "..."
          );

          // Only upload once using the base64 data
          const imageUrl = await uploadImage(
            result.assets[0].uri, // URI is only used for file extension, not actual upload
            user.id,
            0,
            2,
            base64Data // Using base64 data for upload
          );

          if (imageUrl) {
            console.log("Image uploaded successfully to:", imageUrl);
            console.log(
              "Filename in upload:",
              imageUrl.split("/").pop()?.split("?")[0]
            );

            // Store the URL but don't call onImageSelected here - it will be called by useEffect
            setUploadedImageUrl(imageUrl);
          } else {
            throw new Error("Failed to upload image: No URL returned");
          }
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          alert("Failed to upload image. Please try again.");
          setLocalImageUri(null);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image. Please try again.");
      // Reset local image if selection fails
      setLocalImageUri(null);
      setIsUploading(false);
    }
  };

  // Show the local image first if available (immediate feedback)
  // Otherwise fall back to the remote image or placeholder
  const imageToDisplay = localImageUri || uploadedImageUrl || currentImage;

  return (
    <TouchableOpacity
      onPress={handleImagePick}
      disabled={isUploading}
      className="w-full h-40 bg-cream-100 rounded-lg overflow-hidden items-center justify-center max-w-52 self-center"
    >
      {imageToDisplay ? (
        localImageUri && !uploadedImageUrl ? (
          // Display local image directly without cache for immediate feedback
          <Image
            source={{ uri: localImageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          // Use CachedImage for remote URLs - with preventTransform for fresh uploads
          <CachedImage
            uri={imageToDisplay}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            preventTransform={!!uploadedImageUrl} // Prevent transforming freshly uploaded URLs
            cacheKey={
              uploadedImageUrl ? `fresh-${uploadedImageUrl}` : undefined
            } // Use unique cache key for fresh uploads
          />
        )
      ) : (
        <View className="items-center">
          <Ionicons name="camera-outline" size={32} color="#9e9a90" />
          <Text className="text-cream-600 mt-2">
            {isUploading ? "Uploading..." : "Add Photo"}
          </Text>
        </View>
      )}
      {isUploading && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <Text className="text-white font-medium">Uploading...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
