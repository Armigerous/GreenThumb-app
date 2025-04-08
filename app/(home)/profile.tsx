import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Linking,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useGardenDashboard, useTasksForDate } from "@/lib/queries";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountSummary, setAccountSummary] = useState({
    plants: 0,
    tasks: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showHelpContent, setShowHelpContent] = useState(false);

  // Get user gardens dashboard data to count plants
  const { data: gardens, isLoading: isLoadingGardens } = useGardenDashboard(
    user?.id
  );

  // Get today's tasks
  const today = new Date();
  const { data: todayTasks, isLoading: isLoadingTasks } = useTasksForDate(
    today,
    user?.id
  );

  // Check if notifications are enabled on load
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (!Device.isDevice) {
          return;
        }

        // Check device notification status
        const { status } = await Notifications.getPermissionsAsync();

        // Get saved preference from AsyncStorage
        const savedPreference = await AsyncStorage.getItem(
          `notifications_${user?.id}`
        );

        // If we have a saved preference and device permissions, use that
        if (savedPreference !== null) {
          setNotificationsEnabled(savedPreference === "true");
        } else {
          // Otherwise use device permission status
          setNotificationsEnabled(status === "granted");
        }
      } catch (error) {
        console.error("Failed to check notification status:", error);
      }
    };

    checkNotificationStatus();
  }, [user?.id]);

  // Update account summary when data changes
  useEffect(() => {
    if (gardens) {
      // Sum the total plants from all gardens
      const totalPlants = gardens.reduce((total, garden) => {
        return total + garden.total_plants;
      }, 0);

      setAccountSummary((prev) => ({
        ...prev,
        plants: totalPlants,
      }));
    }

    if (todayTasks) {
      setAccountSummary((prev) => ({
        ...prev,
        tasks: todayTasks.length,
      }));
    }
  }, [gardens, todayTasks]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          "Notifications",
          "Notifications are not available on simulator."
        );
        return;
      }

      // If enabling notifications, request permissions
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive plant care reminders.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      // Update state
      setNotificationsEnabled(value);

      // Save to AsyncStorage if we have a user
      if (user?.id) {
        await AsyncStorage.setItem(
          `notifications_${user.id}`,
          value.toString()
        );
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      Alert.alert("Error", "Failed to update notification settings.");
    }
  };

  // Edit profile handler
  const handleEditProfile = () => {
    // Navigate to settings section of Clerk (this will require implementation based on Clerk)
    Alert.alert(
      "Edit Profile",
      "Would you like to update your profile information?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update Name",
          onPress: () => {
            // This would navigate to Clerk's profile management
            Alert.alert(
              "Coming Soon",
              "Profile editing will be available soon!"
            );
          },
        },
        {
          text: "Change Password",
          onPress: () => {
            // This would navigate to Clerk's password reset
            Alert.alert(
              "Coming Soon",
              "Password changing will be available soon!"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5">
          <Text className="text-2xl font-bold text-foreground mb-6">
            Profile
          </Text>
        </View>

        <View className="px-5">
          <View className="flex-row items-center mb-8">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-20 h-20 rounded-full mr-4"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-cream-200 items-center justify-center mr-4">
                <Ionicons name="person" size={40} color="#6b7280" />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-base text-foreground opacity-70">
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
              <TouchableOpacity onPress={handleEditProfile}>
                <Text className="text-sm text-primary mt-1">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-cream-50 p-4 rounded-lg mb-6 border border-cream-300">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Account Summary
            </Text>
            {isLoadingGardens || isLoadingTasks ? (
              <View className="flex-1 items-center justify-center">
                <LoadingSpinner message="Loading profile data..." />
              </View>
            ) : (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary">
                    {accountSummary.plants}
                  </Text>
                  <Text className="text-sm text-foreground opacity-70">
                    Plants
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary">
                    {accountSummary.tasks}
                  </Text>
                  <Text className="text-sm text-foreground opacity-70">
                    {accountSummary.tasks === 0
                      ? "No tasks"
                      : accountSummary.tasks === 1
                      ? "Task"
                      : "Tasks"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="border-t border-cream-200 pt-6">
            <View className="flex-row items-center justify-between py-4 border-b border-cream-100">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#6b7280"
                />
                <View className="ml-3">
                  <Text className="text-base text-foreground">
                    Notifications
                  </Text>
                  <Text className="text-xs text-foreground opacity-70">
                    Receive plant care reminders
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#d1d5db", true: "#77B860" }}
                thumbColor={"#f4f3f4"}
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </View>

            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-cream-100"
              onPress={() => setShowHelpContent(!showHelpContent)}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#6b7280"
                />
                <Text className="text-base text-foreground ml-3">
                  Help & Support
                </Text>
              </View>
              <Ionicons
                name={showHelpContent ? "chevron-up" : "chevron-down"}
                size={20}
                color="#d1d5db"
              />
            </TouchableOpacity>

            {showHelpContent && (
              <View className="bg-cream-50 p-4 my-2 rounded-lg">
                <Text className="text-base font-semibold text-foreground mb-2">
                  Frequently Asked Questions
                </Text>

                <View className="mb-3">
                  <Text className="text-sm font-medium text-foreground">
                    How do I add a new plant?
                  </Text>
                  <Text className="text-xs text-foreground opacity-70 mt-1">
                    Tap the "+" button on the home screen to add a new plant to
                    your garden.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-medium text-foreground">
                    How do I mark a task as complete?
                  </Text>
                  <Text className="text-xs text-foreground opacity-70 mt-1">
                    On the calendar or tasks screen, tap the checkbox next to a
                    task to mark it as complete.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-medium text-foreground">
                    How do I contact support?
                  </Text>
                  <Text className="text-xs text-foreground opacity-70 mt-1">
                    Email us at info@theofficialgreenthumb.com with any
                    questions or issues.
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-primary py-2 px-4 rounded-lg mt-2"
                  onPress={() =>
                    Linking.openURL("mailto:info@theofficialgreenthumb.com")
                  }
                >
                  <Text className="text-white text-center font-medium">
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center py-4 mt-6 bg-red-50 border border-destructive rounded-lg"
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text className="text-base text-destructive font-medium ml-3">
                {isLoading ? "Logging out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-xs text-gray-400 mt-8 mb-4">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
