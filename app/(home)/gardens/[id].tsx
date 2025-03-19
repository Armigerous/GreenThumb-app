import {
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGardenDetails } from "@/lib/queries";
import GardenDetailHeader from "@/components/Gardens/GardenDetailHeader";
import GardenPlantsList from "@/components/Gardens/GardenPlantsList";
import GardenConditions from "@/components/Gardens/GardenConditions";
import { Garden, UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";

export default function GardenDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Get garden details with the materialized view
  const {
    data: garden,
    isLoading,
    isError,
    error,
  } = useGardenDetails(typeof id === "string" ? parseInt(id, 10) : 0);

  const handleAddPlant = () => {
    if (garden) {
      router.push({
        pathname: "/plants",
        params: { gardenId: garden.id.toString(), action: "addToGarden" },
      });
    }
  };

  const handlePlantPress = (plant: UserPlant) => {
    // TODO: Navigate to plant detail screen
    console.log("Plant pressed:", plant);
  };

  const handleEditPress = () => {
    if (garden) {
      router.push({
        pathname: "/gardens/new",
        params: { editId: garden.id.toString() },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#5E994B" />
          <Text className="text-base text-foreground mt-4">
            Loading garden details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !garden) {
    return (
      <SafeAreaView className="flex-1 bg-cream-100">
        <View className="flex-1 justify-center p-4 items-center">
          <Ionicons name="alert-circle-outline" size={60} color="#d97706" />
          <Text className="text-center text-xl font-bold mt-4">
            {isError ? "Failed to load garden details" : "Garden not found"}
          </Text>
          <Text className="text-base text-center mb-6 mt-2">
            {isError
              ? error?.message || "Please try again later"
              : "This garden does not exist or has been removed"}
          </Text>
          <TouchableOpacity
            className="bg-green-600 rounded-full px-6 py-3"
            onPress={() =>
              isError ? router.back() : router.replace("/gardens")
            }
          >
            <Text className="text-white font-medium">
              {isError ? "Go Back" : "View All Gardens"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream-100">
      {/* Main Content - Use SectionList via GardenPlantsList */}
      <View className="flex-1">
        {/* Garden Header with Health Summary */}
        <GardenDetailHeader
          garden={garden}
          onEditPress={handleEditPress}
          onAddPlant={handleAddPlant}
        />

        {/* Plant List with SectionList - Will handle scrolling for whole page */}
        <GardenPlantsList
          plants={garden.plants as UserPlant[]}
          onAddPlant={handleAddPlant}
          onPlantPress={handlePlantPress}
          HeaderComponent={
            <View className="px-4">
              {/* Add Plant Button */}
              <TouchableOpacity
                className="flex-row bg-cream-100 border border-green-600 justify-center rounded-xl items-center mb-6 py-3"
                onPress={handleAddPlant}
              >
                <Ionicons name="add-circle-outline" size={20} color="#5E994B" />
                <Text className="text-green-700 font-medium ml-2">
                  Add Plants to Garden
                </Text>
              </TouchableOpacity>
            </View>
          }
          FooterComponent={
            <View className="mb-6 px-4">
              {/* Collapsible Garden Conditions */}
              <GardenConditions garden={garden} onEditPress={handleEditPress} />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
