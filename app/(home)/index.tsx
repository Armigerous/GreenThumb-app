import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();

  // Mock data for reminders - in a real app, this would come from your database
  const reminders = [
    {
      id: 1,
      plantName: "Monstera",
      task: "Water",
      dueDate: "Today",
      priority: "high",
    },
    {
      id: 2,
      plantName: "Snake Plant",
      task: "Fertilize",
      dueDate: "Tomorrow",
      priority: "medium",
    },
    {
      id: 3,
      plantName: "Fiddle Leaf Fig",
      task: "Mist leaves",
      dueDate: "Today",
      priority: "low",
    },
  ];

  // Function to handle marking a reminder as complete
  const handleCompleteReminder = (id: number) => {
    // In a real app, you would update your database here
    console.log(`Completed reminder ${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SignedIn>
        <ScrollView className="flex-1">
          <View className="px-5 pt-5">
            <Text className="text-2xl font-bold text-foreground mb-2">
              Hello, {user?.firstName}
            </Text>
            <Text className="text-base text-foreground opacity-70 mb-4">
              Welcome to The brandThumb!
            </Text>

            {/* Garden Stats */}
            <View className="flex-row bg-cream-50 rounded-xl p-4 mb-6">
              <View className="flex-1 items-center border-r border-cream-200">
                <Text className="text-2xl font-bold text-brand-600">3</Text>
                <Text className="text-xs text-cream-500">Gardens</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-brand-600">12</Text>
                <Text className="text-xs text-cream-500">Plants</Text>
              </View>
            </View>
          </View>

          {/* Reminders Section */}
          <View className="px-5 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Today's Reminders
              </Text>
              <TouchableOpacity onPress={() => router.push("/(home)/calendar")}>
                <Text className="text-sm text-brand-600 font-medium">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {reminders.length > 0 ? (
              <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                {reminders.map((reminder, index) => (
                  <View
                    key={reminder.id}
                    className={`p-4 flex-row items-center justify-between ${
                      index < reminders.length - 1
                        ? "border-b border-cream-100"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-2 h-10 rounded-full mr-3 ${
                          reminder.priority === "high"
                            ? "bg-red-500"
                            : reminder.priority === "medium"
                            ? "bg-orange-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-medium text-foreground">
                          {reminder.task} {reminder.plantName}
                        </Text>
                        <Text className="text-xs text-cream-500">
                          {reminder.dueDate}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="bg-brand-50 p-2 rounded-full"
                      onPress={() => handleCompleteReminder(reminder.id)}
                    >
                      <Ionicons name="checkmark" size={18} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-cream-50 rounded-xl p-4 items-center">
                <Text className="text-base text-cream-500">
                  No reminders for today!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="px-5 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-brand-50 rounded-xl p-4 items-center justify-center w-[48%]"
                onPress={() => router.push("/(home)/plants")}
              >
                <Ionicons name="add-circle-outline" size={28} color="#10b981" />
                <Text className="text-sm font-medium text-brand-700 mt-2">
                  Add Plant
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-blue-50 rounded-xl p-4 items-center justify-center w-[48%]"
                onPress={() => router.push("/(home)/calendar")}
              >
                <Ionicons name="water-outline" size={28} color="#3b82f6" />
                <Text className="text-sm font-medium text-blue-700 mt-2">
                  Water Plants
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plant Care Tips */}
          <View className="px-5 mb-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Plant Care Tips
            </Text>
            <View className="bg-cream-50 rounded-xl p-4 mb-4">
              <Text className="text-base font-medium text-foreground mb-2">
                Watering Basics
              </Text>
              <Text className="text-sm text-foreground opacity-70">
                Most houseplants need to be watered when the top inch of soil
                feels dry to the touch.
              </Text>
            </View>
            <View className="bg-cream-50 rounded-xl p-4">
              <Text className="text-base font-medium text-foreground mb-2">
                Light Requirements
              </Text>
              <Text className="text-sm text-foreground opacity-70">
                Pay attention to your plant's light needs. Most plants prefer
                bright, indirect light.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-foreground opacity-80 text-center mb-8">
            You need to sign in to access this page
          </Text>
          <View className="w-full gap-4">
            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center"
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              <Text className="text-primary-foreground font-bold text-base">
                Sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-transparent border border-primary py-4 rounded-lg items-center"
              onPress={() => router.replace("/(auth)/sign-up")}
            >
              <Text className="text-primary font-bold text-base">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}
