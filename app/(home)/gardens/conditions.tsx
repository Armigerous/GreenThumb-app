import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGardenDetails } from "@/lib/queries";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import GardenConditionsEditor from "@/components/Gardens/GardenConditionsEditor";
import GardenConditions from "@/components/Gardens/GardenConditions";

/**
 * Garden Conditions Page
 * A dedicated page for viewing and editing garden growing conditions
 * Accessed through the Conditions button on garden details page
 */
export default function GardenConditionsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch garden details
  const {
    data: gardenData,
    isLoading,
    error,
    refetch,
  } = useGardenDetails(Number(id));

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle save from editor
  const handleSave = (updated: boolean) => {
    setIsEditing(false);
    if (updated) {
      refetch();
    }
  };

  // Handle cancel from editor
  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading garden conditions..." />;
  }

  if (error || !gardenData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading garden conditions. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2c29" />
            <Text className="text-foreground text-lg ml-2">Back to Garden</Text>
          </TouchableOpacity>

          {!isEditing && (
            <TouchableOpacity
              className="bg-cream-100 p-2 rounded-full"
              onPress={handleEditToggle}
            >
              <Ionicons name="create-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title */}
      <View className="px-5 pb-4">
        <Text className="text-2xl text-foreground font-bold mb-1">
          Garden Conditions
        </Text>
        <Text className="text-cream-600">{gardenData.name}</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5">
        {isEditing ? (
          <GardenConditionsEditor
            garden={gardenData}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <GardenConditions
            garden={gardenData}
            onEditPress={handleEditToggle}
            onSettingsUpdate={(updated) => {
              if (updated) refetch();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
