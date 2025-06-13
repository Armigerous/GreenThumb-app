import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import type { Garden, GardenDashboard } from "@/types/garden";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";
import { Text, TitleText, SubtitleText, BodyText } from "../UI/Text";

type GardenDetailHeaderProps = {
  garden: Garden;
  dashboardData?: GardenDashboard;
  onEditPress: () => void;
  onAddPlant: () => void;
};

export default function GardenDetailHeader({
  garden,
  dashboardData,
  onEditPress,
  onAddPlant,
}: GardenDetailHeaderProps) {
  const router = useRouter();

  return (
    <View className="pt-5 px-5">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#2e2c29" />
          <Text className="text-foreground text-lg font-medium ml-2">Back</Text>
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity
            className="bg-brand-500 p-2 rounded-full mr-2"
            onPress={onAddPlant}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-cream-100 p-2 rounded-full"
            onPress={onEditPress}
          >
            <Ionicons name="create-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <TitleText className="text-2xl text-foreground mb-4">
        {garden.name}
      </TitleText>

      {dashboardData ? (
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="flex-row bg-brand-50 rounded-lg items-center px-3 py-1.5">
                <Ionicons name="leaf" size={16} color="#77B860" />
                <BodyText className="text-brand-600 text-sm font-medium ml-1">
                  {dashboardData.total_plants}{" "}
                  {dashboardData.total_plants === 1 ? "Plant" : "Plants"}
                </BodyText>
              </View>
            </View>

            {dashboardData.plants_needing_care > 0 ? (
              <TouchableOpacity className="bg-yellow-100 rounded-lg px-3 py-1.5">
                <BodyText className="text-sm text-yellow-700 font-medium">
                  {dashboardData.plants_needing_care} need
                  {dashboardData.plants_needing_care === 1 ? "s" : ""} care
                </BodyText>
              </TouchableOpacity>
            ) : (
              <View className="bg-brand-100 rounded-lg px-3 py-1.5">
                <BodyText className="text-brand-700 text-sm font-medium">
                  All plants healthy
                </BodyText>
              </View>
            )}
          </View>

          <View className="bg-cream-50 p-3 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <SubtitleText className="text-cream-700">
                Garden Health
              </SubtitleText>
              <BodyText className="text-cream-600 text-sm">
                {dashboardData.health_percentage}% Healthy
              </BodyText>
            </View>
            <AnimatedProgressBar
              percentage={dashboardData.health_percentage}
              color="#77B860" // brand-500
              height={8}
              duration={500}
            />
          </View>
        </View>
      ) : (
        <View className="bg-cream-50 p-4 rounded-lg">
          <BodyText className="text-center text-cream-600 mb-3">
            Get started by adding your first plant
          </BodyText>
          <TouchableOpacity
            onPress={onAddPlant}
            className="bg-brand-500 rounded-full items-center py-2"
          >
            <Text className="text-white font-medium">Add Plant</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="bg-cream-100 h-px mt-4" />
    </View>
  );
}
