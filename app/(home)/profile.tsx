import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <Text className="text-2xl font-bold text-foreground mb-6">Profile</Text>
      </View>

      <View className="px-5">
        <View className="flex-row items-center mb-8">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-20 h-20 rounded-full mr-4"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mr-4">
              <Ionicons name="person" size={40} color="#6b7280" />
            </View>
          )}

          <View>
            <Text className="text-xl font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-base text-foreground opacity-70">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-200 pt-6">
          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {}}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color="#6b7280"
              className="mr-3"
            />
            <Text className="text-base text-foreground ml-3">Settings</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#d1d5db"
              className="ml-auto"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {}}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color="#6b7280"
              className="mr-3"
            />
            <Text className="text-base text-foreground ml-3">
              Help & Support
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#d1d5db"
              className="ml-auto"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 mt-6 bg-red-50 rounded-lg"
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#ef4444"
              className="ml-3"
            />
            <Text className="text-base text-red-500 font-medium ml-3">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
