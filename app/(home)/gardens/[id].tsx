import {
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGardenDetails } from "@/lib/queries";
import GardenDetailHeader from "@/components/Gardens/GardenDetailHeader";
import GardenPlantsList from "@/components/Gardens/GardenPlantsList";
import GardenConditions from "@/components/Gardens/GardenConditions";
import type { UserPlant } from "@/types/garden";

// Extend UserPlant to include planting_date
interface ExtendedUserPlant extends UserPlant {
  planting_date?: string;
}

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: garden, isLoading, error } = useGardenDetails(Number(id));

  const handleEditPress = () => {
    // TODO: Navigate to edit garden screen
    console.log("Edit garden pressed");
  };

  const handleAddPlant = () => {
    // TODO: Navigate to add plant screen
    console.log("Add plant pressed");
  };

  const handlePlantPress = (plant: ExtendedUserPlant) => {
    // TODO: Navigate to plant detail screen
    console.log("Plant pressed:", plant);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </SafeAreaView>
    );
  }

  if (error || !garden) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading garden details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <GardenDetailHeader garden={garden} onEditPress={handleEditPress} />

      <ScrollView className="flex-1 px-5">
        <GardenPlantsList
          plants={garden.user_plants as ExtendedUserPlant[]}
          onAddPlant={handleAddPlant}
          onPlantPress={handlePlantPress}
        />

        <GardenConditions garden={garden} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GardenDetails;
