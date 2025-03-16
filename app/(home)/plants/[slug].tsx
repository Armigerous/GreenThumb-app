import { usePlantDetails } from "@/lib/queries";
import { PlantData } from "@/types/plant";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addPlantToStoredList } from "@/lib/backgroundService";

export default function PlantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Use our new query hook instead of direct API call
  const {
    data: plant,
    isLoading: loading,
    error: queryError,
  } = usePlantDetails(slug);

  // Add this plant to the stored list for background updates
  useEffect(() => {
    if (slug && typeof slug === "string") {
      addPlantToStoredList(slug).catch((err) => {
        console.error("Failed to add plant to stored list:", err);
      });
    }
  }, [slug]);

  useEffect(() => {
    if (plant) {
      router.setParams({
        title: plant.common_name || plant.scientific_name,
      });
    }
  }, [plant, router]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-cream-50">
        <ActivityIndicator size="large" color="#047857" />
        <Text className="mt-3 text-base text-cream-600">
          Loading plant details...
        </Text>
      </SafeAreaView>
    );
  }

  if (queryError || !plant) {
    const errorMessage =
      queryError instanceof Error ? queryError.message : "Plant not found";

    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-cream-50 p-5">
        <Ionicons name="leaf" size={64} color="#d1d5db" />
        <Text className="text-xl font-bold text-red-500 mt-4">
          Oops! Something went wrong
        </Text>
        <Text className="text-sm text-cream-500 text-center mt-2">
          {errorMessage}
        </Text>
        <TouchableOpacity
          className="mt-6 py-2.5 px-5 bg-brand-600 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream-50">
      <ScrollView>
        {/* Plant Image */}
        <View className="w-full h-[300px]">
          <Image
            source={{
              uri:
                plant.first_image ||
                "https://theofficialbrandthumb.com/no-plant-image.png",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Plant Information */}
        <View className="p-4 bg-white rounded-t-3xl -mt-5">
          <Text className="text-2xl font-bold text-cream-800 mb-1">
            {plant.common_name || plant.scientific_name}
          </Text>
          <Text className="text-base italic text-cream-500 mb-3">
            {plant.scientific_name}
          </Text>

          {plant.first_tag && (
            <View className="bg-brand-100 px-3 py-1.5 rounded-2xl self-start mb-4">
              <Text className="text-xs text-brand-700 font-medium">
                {plant.first_tag}
              </Text>
            </View>
          )}

          {plant.description && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-cream-800 mb-3">
                Description
              </Text>
              <Text className="text-sm leading-relaxed text-cream-600">
                {plant.description.replace(/<[^>]*>/g, "")}
              </Text>
            </View>
          )}

          {/* Care Information */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-cream-800 mb-3">
              Plant Care
            </Text>

            {plant.care_level && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Care Level:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.care_level}
                </Text>
              </View>
            )}

            {plant.light_requirements && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Light:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.light_requirements}
                </Text>
              </View>
            )}

            {plant.water_requirements && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Water:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.water_requirements}
                </Text>
              </View>
            )}

            {plant.temperature_range && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Temperature:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.temperature_range}
                </Text>
              </View>
            )}

            {plant.humidity_requirements && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Humidity:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.humidity_requirements}
                </Text>
              </View>
            )}

            {plant.soil_type && (
              <View className="flex-row mb-2">
                <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                  Soil:
                </Text>
                <Text className="text-sm text-cream-500 flex-1">
                  {plant.soil_type}
                </Text>
              </View>
            )}
          </View>

          {/* Additional Information */}
          {(plant.family || plant.genus || plant.species) && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-cream-800 mb-3">
                Taxonomy
              </Text>

              {plant.family && (
                <View className="flex-row mb-2">
                  <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                    Family:
                  </Text>
                  <Text className="text-sm text-cream-500 flex-1">
                    {plant.family}
                  </Text>
                </View>
              )}

              {plant.genus && (
                <View className="flex-row mb-2">
                  <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                    Genus:
                  </Text>
                  <Text className="text-sm text-cream-500 flex-1">
                    {plant.genus}
                  </Text>
                </View>
              )}

              {plant.species && (
                <View className="flex-row mb-2">
                  <Text className="text-sm font-semibold text-cream-600 w-[100px]">
                    Species:
                  </Text>
                  <Text className="text-sm text-cream-500 flex-1">
                    {plant.species}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
