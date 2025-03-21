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
import type { Garden, UserPlant } from "@/types/garden";

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: garden, isLoading, error } = useGardenDetails(Number(id));

  const handleEditPress = () => {
    if (garden?.id) {
      router.push({
        pathname: "/(home)/gardens/[id]",
        params: { id: garden.id.toString(), edit: "true" },
      });
    }
  };

  const handleAddPlant = () => {
    if (garden?.id) {
      router.push({
        pathname: "/(home)/plants",
        params: { gardenId: garden.id.toString(), action: "add" },
      });
    }
  };

  const handlePlantPress = (plant: UserPlant) => {
    router.push({
      pathname: "/(home)/plants",
      params: { id: plant.id.toString() },
    });
  };

  const handleWaterPlant = async (plant: UserPlant) => {
    // TODO: Implement water plant functionality
    console.log("Water plant:", plant.id);
  };

  const handleEditPlant = (plant: UserPlant) => {
    router.push({
      pathname: "/(home)/plants",
      params: { id: plant.id.toString(), edit: "true" },
    });
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
      <GardenDetailHeader
        garden={garden}
        onEditPress={handleEditPress}
        onAddPlant={handleAddPlant}
      />

      <ScrollView className="flex-1">
        <GardenPlantsList
          plants={garden.user_plants}
          onAddPlant={handleAddPlant}
          onPlantPress={handlePlantPress}
          onWaterPlant={handleWaterPlant}
          onEditPlant={handleEditPlant}
          HeaderComponent={
            <GardenConditions garden={garden} onEditPress={handleEditPress} />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GardenDetails;
