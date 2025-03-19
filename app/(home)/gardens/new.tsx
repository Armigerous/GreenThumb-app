import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import NewGardenForm from "@/components/Gardens/NewGardenForm";

export default function NewGarden() {
  const router = useRouter();
  // Use the hook to ensure we have a valid Supabase token
  useSupabaseAuth();

  const handleSuccess = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center pt-5 px-5">
        <TouchableOpacity
          onPress={handleCancel}
          className="flex-row items-center"
        >
          <Ionicons name="close" size={24} color="#2e2c29" />
          <Text className="text-foreground text-lg font-medium ml-2">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <View className="pt-4 px-5">
        <Text className="text-2xl text-foreground font-bold mb-6">
          Create New Garden
        </Text>
      </View>

      <View className="flex-1 px-5">
        <NewGardenForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </View>
    </SafeAreaView>
  );
}
