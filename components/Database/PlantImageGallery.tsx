import { View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PlantImageGalleryProps = {
  images: string[];
  onAddImage?: () => void;
};

export default function PlantImageGallery({
  images,
  onAddImage,
}: PlantImageGalleryProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
    >
      {images.map((image, index) => (
        <View
          key={index}
          className="bg-cream-100 h-32 rounded-lg w-32 mr-2 overflow-hidden"
        >
          <Image
            source={{ uri: image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      ))}
      {onAddImage && (
        <TouchableOpacity
          onPress={onAddImage}
          className="bg-cream-50 border-2 border-cream-200 border-dashed h-32 justify-center rounded-lg w-32 items-center"
        >
          <Ionicons name="camera-outline" size={24} color="#9e9a90" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
