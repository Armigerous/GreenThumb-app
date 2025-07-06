import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";
import PlantForm from "../../../../components/Gardens/Plants/PlantForm";
import { useSubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { TitleText } from "@/components/Gardens";

export default function AddPlantScreen() {
  const router = useRouter();
  const { plantSlug, gardenId } = useLocalSearchParams<{
    plantSlug: string;
    gardenId?: string;
  }>();

  // Subscription gate for plant addition (per garden)
  const { PaywallComponent } = useSubscriptionGate("plants_per_garden");

  // Success: go to gardens index
  const handleSuccess = () => {
    router.replace("/(tabs)/gardens");
  };

  // Cancel: confirm and go back
  const handleCancel = () => {
    Alert.alert(
      "Cancel Adding Plant",
      "Are you sure you want to cancel? Any unsaved changes will be lost.",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => router.replace("/(tabs)/gardens"),
        },
      ]
    );
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <PaywallComponent />
      <View className="flex-row justify-between items-center pt-5 px-5">
        <TouchableOpacity
          onPress={handleCancel}
          className="flex-row items-center"
        >
          <Ionicons name="close" size={24} color="#2e2c29" />
          <Text className="text-foreground text-lg font-paragraph font-medium ml-2">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
      <View className="pt-4 px-5">
        <TitleText className="text-2xl mb-6">
          Add a Plant to Your Garden
        </TitleText>
      </View>
      <View className="flex-1 px-5">
        <PlantForm
          plantSlug={plantSlug}
          initialGardenId={gardenId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </View>
    </PageContainer>
  );
}
