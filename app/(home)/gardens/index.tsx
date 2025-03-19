import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserGardens } from "@/lib/queries";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import GardenCard from "@/components/Gardens/GardenCard";

export default function GardensScreen() {
  const { user } = useUser();
  const router = useRouter();
  useSupabaseAuth();
  const { data: gardens, isLoading, error } = useUserGardens(user?.id);

  // Log error details if present
  if (error) {
    console.error("Gardens fetch error:", error);
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Please sign in to view your gardens.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading gardens: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center pt-5 px-5">
        <Text className="text-2xl text-foreground font-bold">My Gardens</Text>
        <TouchableOpacity
          className="bg-brand-500 p-2 rounded-full"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4 px-5">
        {gardens && gardens.length > 0 ? (
          gardens.map((garden) => (
            <GardenCard key={garden.id} garden={garden} />
          ))
        ) : (
          <View className="items-center py-8">
            <Ionicons
              name="leaf-outline"
              size={48}
              color="#9e9a90"
              className="mb-2"
            />
            <Text className="text-center text-cream-500">
              No gardens yet.{"\n"}Create your first garden to get started!
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-cream-50 border border-cream-300 border-dashed justify-center p-4 rounded-xl items-center mb-8"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add-circle-outline" size={32} color="#6b7280" />
          <Text className="text-base text-cream-500 mt-2">Add New Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
