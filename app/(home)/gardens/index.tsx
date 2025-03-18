import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserGardens } from "@/lib/queries";
import { ActivityIndicator } from "react-native";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

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
        <View className="px-5 pt-5">
          <Text className="text-lg text-destructive">
            Please sign in to view your gardens.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-5 pt-5">
          <Text className="text-lg text-destructive">
            Error loading gardens: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-foreground">My Gardens</Text>
        <TouchableOpacity
          className="bg-brand-500 p-2 rounded-full"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {gardens && gardens.length > 0 ? (
          gardens.map((garden) => (
            <TouchableOpacity
              key={garden.id}
              className="bg-cream-50 rounded-xl overflow-hidden mb-4 shadow-sm"
              onPress={() =>
                router.push({
                  pathname: "/(home)/gardens/[id]",
                  params: { id: garden.id },
                })
              }
            >
              <View className="p-4">
                <Text className="text-lg font-bold text-foreground mb-1">
                  {garden.name}
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {garden.nc_regions_ids && (
                    <View className="bg-cream-100 px-2 py-1 rounded">
                      <Text className="text-xs text-cream-800">
                        {Array.isArray(garden.nc_regions_ids)
                          ? garden.nc_regions_ids.join(", ")
                          : garden.nc_regions_ids}
                      </Text>
                    </View>
                  )}
                  {garden.sunlight_ids && (
                    <View className="bg-cream-100 px-2 py-1 rounded">
                      <Text className="text-xs text-cream-800">
                        {Array.isArray(garden.sunlight_ids)
                          ? garden.sunlight_ids.join(", ")
                          : garden.sunlight_ids}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="leaf" size={16} color="#10b981" />
                  <Text className="text-sm text-brand-600 ml-1 font-medium">
                    {garden.user_plants?.length || 0} Plants
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="py-8 items-center">
            <Ionicons
              name="leaf-outline"
              size={48}
              color="#9e9a90"
              className="mb-2"
            />
            <Text className="text-cream-500 text-center">
              No gardens yet.{"\n"}Create your first garden to get started!
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-cream-50 rounded-xl p-4 items-center justify-center mb-8 border border-dashed border-cream-300"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add-circle-outline" size={32} color="#6b7280" />
          <Text className="text-base text-cream-500 mt-2">Add New Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
