import GardenConditions from "@/components/Gardens/GardenConditions";
import { useGardenDetails } from "@/lib/queries";
import type { UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: gardenData,
    isLoading,
    error,
    refetch,
  } = useGardenDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"plants" | "conditions">("plants");

  const handleEditPress = () => {
    if (gardenData?.id) {
      router.push({
        pathname: "/(home)/gardens/[id]",
        params: { id: gardenData.id.toString(), edit: "true" },
      });
    }
  };

  const handleAddPlant = () => {
    if (gardenData?.id) {
      router.push({
        pathname: "/(home)/plants",
        params: { gardenId: gardenData.id.toString(), action: "add" },
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

  const handleSettingsUpdate = (updated: boolean) => {
    if (updated) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#77B860" />
      </SafeAreaView>
    );
  }

  if (error || !gardenData) {
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

  // Extract dashboard data if available
  const dashboardData = gardenData.dashboard;
  const plants =
    dashboardData?.plants?.map(
      (plant) =>
        ({
          ...plant,
          garden_id: gardenData.id,
          created_at: new Date().toISOString(), // Use current date as fallback
          updated_at: new Date().toISOString(), // Use current date as fallback
          care_logs: [], // Initialize empty care logs
          plant_tasks: [], // Initialize empty tasks
        } as UserPlant)
    ) || [];

  // Group plants by status
  const criticalPlants = plants.filter(
    (p) => p.status === "Dead" || p.status === "Wilting"
  );
  const needsAttentionPlants = plants.filter(
    (p) => p.status === "Needs Water" || p.status === "Dormant"
  );
  const healthyPlants = plants.filter((p) => p.status === "Healthy");

  // Check if garden has growing conditions
  const hasConditions = Boolean(
    (gardenData.sunlight_conditions &&
      gardenData.sunlight_conditions.length > 0) ||
      (gardenData.soil_textures && gardenData.soil_textures.length > 0) ||
      (gardenData.soil_ph_ranges && gardenData.soil_ph_ranges.length > 0) ||
      (gardenData.soil_drainage && gardenData.soil_drainage.length > 0)
  );

  const renderPlantCard = (plant: UserPlant) => {
    const statusColors = {
      Healthy: {
        bg: "bg-brand-100",
        text: "text-brand-700",
        icon: "checkmark-circle" as const,
        color: "#059669",
      },
      "Needs Water": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "water" as const,
        color: "#d97706",
      },
      Wilting: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "alert-circle" as const,
        color: "#dc2626",
      },
      Dormant: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "moon" as const,
        color: "#d97706",
      },
      Dead: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "alert-circle" as const,
        color: "#dc2626",
      },
    } as const;

    const statusStyle = statusColors[plant.status as keyof typeof statusColors];

    return (
      <TouchableOpacity
        key={plant.id}
        className="bg-white border border-cream-100 p-3 rounded-lg shadow-sm mb-3"
        onPress={() => handlePlantPress(plant)}
      >
        <View className="flex-row items-start">
          {plant.images?.[0] && (
            <Image
              source={{ uri: plant.images[0] }}
              className="h-16 rounded-lg w-16 mr-3"
              resizeMode="cover"
            />
          )}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text className="text-base text-foreground font-medium flex-1 mr-2">
                {plant.nickname}
              </Text>
              <View
                className={`rounded-full px-3 py-1 flex-row items-center ${statusStyle.bg}`}
              >
                <Ionicons
                  name={statusStyle.icon}
                  size={14}
                  color={statusStyle.color}
                />
                <Text
                  className={`text-xs font-medium ml-1 ${statusStyle.text}`}
                >
                  {plant.status}
                </Text>
              </View>
            </View>

            <View className="flex-row mt-3 justify-end">
              <TouchableOpacity
                className="flex-row bg-blue-50 rounded-full items-center mr-2 px-3 py-1.5"
                onPress={() => handleWaterPlant(plant)}
              >
                <Ionicons name="water" size={14} color="#0891b2" />
                <Text className="text-blue-600 text-xs font-medium ml-1">
                  Water
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row bg-cream-50 rounded-full items-center px-3 py-1.5"
                onPress={() => handleEditPlant(plant)}
              >
                <Ionicons name="create-outline" size={14} color="#6b7280" />
                <Text className="text-cream-600 text-xs font-medium ml-1">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderConditionsSection = () => {
    if (!hasConditions) {
      return (
        <View className="items-center py-6 bg-white rounded-xl p-4">
          <Ionicons
            name="leaf-outline"
            size={40}
            color="#9e9a90"
            className="mb-2"
          />
          <Text className="text-center text-cream-500 mb-4">
            Set your garden conditions to get personalized plant recommendations
          </Text>
          <TouchableOpacity
            onPress={handleEditPress}
            className="flex-row bg-brand-500 rounded-full items-center px-4 py-2"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-medium ml-2">Set Conditions</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="bg-white rounded-xl">
        {gardenData.sunlight_conditions &&
          gardenData.sunlight_conditions.length > 0 && (
            <View className="p-4 border-b border-cream-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sunny" size={20} color="#d97706" />
                <Text className="text-foreground font-semibold ml-2">
                  Sunlight
                </Text>
              </View>
              <Text className="text-cream-700">
                {gardenData.sunlight_conditions.join(", ")}
              </Text>
            </View>
          )}

        {gardenData.soil_textures && gardenData.soil_textures.length > 0 && (
          <View className="p-4 border-b border-cream-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="layers-outline" size={20} color="#92400e" />
              <Text className="text-foreground font-semibold ml-2">
                Soil Type
              </Text>
            </View>
            <Text className="text-cream-700">
              {gardenData.soil_textures.join(", ")}
            </Text>
          </View>
        )}

        {gardenData.soil_ph_ranges && gardenData.soil_ph_ranges.length > 0 && (
          <View className="p-4 border-b border-cream-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="flask-outline" size={20} color="#6b21a8" />
              <Text className="text-foreground font-semibold ml-2">
                Soil pH
              </Text>
            </View>
            <Text className="text-cream-700">
              {gardenData.soil_ph_ranges.join(" to ")}
            </Text>
          </View>
        )}

        {gardenData.soil_drainage && gardenData.soil_drainage.length > 0 && (
          <View className="p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="water-outline" size={20} color="#0284c7" />
              <Text className="text-foreground font-semibold ml-2">
                Drainage
              </Text>
            </View>
            <Text className="text-cream-700">
              {gardenData.soil_drainage.join(", ")}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
            <Text className="text-foreground text-lg ml-2">Back</Text>
          </TouchableOpacity>

          <View className="flex-row">
            <TouchableOpacity
              className="bg-brand-500 p-2 rounded-full mr-2"
              onPress={handleAddPlant}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-cream-100 p-2 rounded-full"
              onPress={handleEditPress}
            >
              <Ionicons name="create-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Garden Title and Health Stats */}
      <View className="px-5 pb-4">
        <Text className="text-2xl text-foreground font-bold mb-4">
          {gardenData.name}
        </Text>

        {dashboardData && (
          <View className="flex-row justify-between p-3 bg-white rounded-xl shadow-sm">
            <View className="items-center">
              <Text className="text-cream-600 text-xs mb-1">PLANTS</Text>
              <View className="flex-row items-center">
                <Ionicons name="leaf" size={16} color="#77B860" />
                <Text className="text-brand-700 text-lg font-semibold ml-1">
                  {dashboardData.total_plants}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <Text className="text-cream-600 text-xs mb-1">NEED CARE</Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="water"
                  size={16}
                  color={
                    dashboardData.plants_needing_care > 0
                      ? "#d97706"
                      : "#9e9a90"
                  }
                />
                <Text
                  className={`text-lg font-semibold ml-1 ${
                    dashboardData.plants_needing_care > 0
                      ? "text-yellow-700"
                      : "text-cream-500"
                  }`}
                >
                  {dashboardData.plants_needing_care}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <Text className="text-cream-600 text-xs mb-1">HEALTH</Text>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={16} color="#77B860" />
                <Text className="text-brand-700 text-lg font-semibold ml-1">
                  {dashboardData.health_percentage}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-cream-100 mx-5 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "plants" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("plants")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "plants" ? "text-brand-700" : "text-cream-500"
            }`}
          >
            Plants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "conditions" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("conditions")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "conditions" ? "text-brand-700" : "text-cream-500"
            }`}
          >
            Conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView className="flex-1 px-5">
        {activeTab === "plants" ? (
          <View className="mb-8">
            {criticalPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text className="text-foreground text-lg font-semibold ml-2">
                    Needs Immediate Care
                  </Text>
                  <Text className="text-cream-500 ml-2">
                    ({criticalPlants.length})
                  </Text>
                </View>
                {criticalPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}

            {needsAttentionPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="water" size={20} color="#d97706" />
                  <Text className="text-foreground text-lg font-semibold ml-2">
                    Due for Care
                  </Text>
                  <Text className="text-cream-500 ml-2">
                    ({needsAttentionPlants.length})
                  </Text>
                </View>
                {needsAttentionPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}

            {healthyPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#77B860" />
                  <Text className="text-foreground text-lg font-semibold ml-2">
                    Looking Good
                  </Text>
                  <Text className="text-cream-500 ml-2">
                    ({healthyPlants.length})
                  </Text>
                </View>
                {healthyPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}

            {plants.length === 0 && (
              <View className="bg-white rounded-xl shadow-sm items-center px-4 py-10">
                <Ionicons
                  name="leaf-outline"
                  size={48}
                  color="#9e9a90"
                  className="mb-2"
                />
                <Text className="text-center text-foreground text-lg font-medium mb-2">
                  No plants added yet
                </Text>
                <Text className="text-center text-cream-500 mb-6">
                  Add your first plant to start tracking its care
                </Text>
                <TouchableOpacity
                  className="flex-row bg-brand-500 rounded-full items-center px-4 py-2"
                  onPress={handleAddPlant}
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white font-medium ml-1">
                    Add First Plant
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View className="mb-8">
            <GardenConditions
              garden={gardenData}
              onEditPress={handleEditPress}
              onSettingsUpdate={handleSettingsUpdate}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GardenDetails;
