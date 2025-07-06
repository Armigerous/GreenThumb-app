import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import GardenForm from "@/components/Gardens/GardenForm";
import { PageContainer } from "@/components/UI/PageContainer";
import { useSubscriptionGate } from "@/components/subscription/SubscriptionGate";

export default function NewGarden() {
  const router = useRouter();
  const { user } = useUser();

  // Use the hook to ensure we have a valid Supabase token
  useSupabaseAuth();

  // Subscription gate for garden creation
  const { checkAndProceed, PaywallComponent } = useSubscriptionGate("gardens");

  const handleSuccess = () => {
    // Navigate back to the gardens index
    router.replace("/(tabs)/gardens");
  };

  const handleCancel = () => {
    // Show confirmation dialog before canceling
    Alert.alert(
      "Cancel Creating Garden",
      "Are you sure you want to cancel? Any unsaved changes will be lost.",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
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
        <Text className="text-2xl text-foreground font-title font-bold mb-6">
          Let&apos;s Create Your Garden
        </Text>
      </View>

      <View className="flex-1 px-5">
        <GardenForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </View>
    </PageContainer>
  );
}
