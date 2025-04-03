import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LoadingSpinner, CompactSpinner } from "@/components/UI/LoadingSpinner";
import { useUserPlantDetails } from "@/lib/queries";
import { UserPlant } from "@/types/garden";
import { supabase } from "@/lib/supabaseClient";

// Define the structure of a care log entry
interface CareLog {
  action: string;
  date: string;
  notes?: string;
}

// Extend UserPlant with additional properties we add in the query
interface ExtendedUserPlant extends UserPlant {
  garden_name?: string;
  scientific_name?: string;
  light_requirements?: string;
  soil_requirements?: string;
  water_requirements?: string;
  temperature_requirements?: string;
  added_date: string;
}

const UserPlantDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "care">("info");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<UserPlant["status"]>("Healthy");

  // Fetch the user plant data
  const {
    data: plantData,
    isLoading,
    error,
    refetch,
  } = useUserPlantDetails(id as string);

  const handleWaterPlant = async () => {
    // TODO: Implement water plant functionality
    console.log("Water plant:", id);
  };

  const handleEditPress = () => {
    if (plantData) {
      setNickname(plantData.nickname);
      setStatus(plantData.status);
      setEditModalVisible(true);
    }
  };

  const handleUpdatePlant = async () => {
    if (!id || !nickname.trim()) {
      Alert.alert("Error", "Plant nickname cannot be empty");
      return;
    }

    setIsUpdating(true);

    try {
      console.log(
        `Updating plant ${id} with nickname: "${nickname}" and status: "${status}"`
      );

      // Update the plant in the database
      const { data, error } = await supabase
        .from("user_plants")
        .update({
          nickname: nickname.trim(),
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Update response:", data);

      // Refetch the plant data to update the UI
      await refetch();
      setEditModalVisible(false);
      Alert.alert("Success", "Plant updated successfully");
    } catch (error: any) {
      console.error("Plant update error:", error);
      Alert.alert("Error", error.message || "Failed to update plant");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: UserPlant["status"][] = [
    "Healthy",
    "Needs Water",
    "Wilting",
    "Dormant",
    "Dead",
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading plant details..." />;
  }

  if (error || !plantData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading plant details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const statusStyle =
    statusColors[plantData.status as keyof typeof statusColors];

  // Find the last watering date from care logs if available
  const lastWateringLog =
    plantData.care_logs && plantData.care_logs.length > 0
      ? plantData.care_logs
          .filter((log: CareLog) => log.action === "Watered")
          .sort(
            (a: CareLog, b: CareLog) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]
      : null;

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

          <TouchableOpacity
            className="bg-cream-100 p-2 rounded-full"
            onPress={handleEditPress}
          >
            <Ionicons name="create-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant Image and Basic Info */}
      <View className="px-5 pb-4">
        <View className="items-center mb-4">
          {plantData.images?.[0] ? (
            <Image
              source={{ uri: plantData.images[0] }}
              className="h-40 w-40 rounded-full border-4 border-white"
              resizeMode="cover"
            />
          ) : (
            <View className="h-40 w-40 rounded-full bg-cream-100 items-center justify-center">
              <Ionicons name="leaf-outline" size={60} color="#9e9a90" />
            </View>
          )}
        </View>

        <View className="items-center mb-4">
          <Text className="text-2xl text-foreground font-bold">
            {plantData.nickname}
          </Text>

          <Text className="text-cream-600 text-lg italic mb-2">
            {plantData.scientific_name || "No scientific name"}
          </Text>

          <View
            className={`rounded-full px-4 py-2 flex-row items-center ${statusStyle.bg} mb-4`}
          >
            <Ionicons
              name={statusStyle.icon}
              size={18}
              color={statusStyle.color}
            />
            <Text className={`text-sm font-medium ml-2 ${statusStyle.text}`}>
              {plantData.status}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row bg-blue-500 rounded-lg items-center px-6 py-3 w-full"
            onPress={handleWaterPlant}
          >
            <Ionicons name="water" size={20} color="white" />
            <Text className="text-white text-base font-medium ml-2 text-center flex-1">
              Water Plant
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-cream-100 mx-5 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "info" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("info")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "info" ? "text-brand-700" : "text-cream-500"
            }`}
          >
            Plant Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "care" ? "border-b-2 border-brand-500" : ""
          }`}
          onPress={() => setActiveTab("care")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "care" ? "text-brand-700" : "text-cream-500"
            }`}
          >
            Care Guide
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView className="flex-1 px-5">
        {activeTab === "info" ? (
          <View className="mb-8">
            {/* Plant Details */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                About This Plant
              </Text>

              {lastWateringLog && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="water" size={20} color="#0891b2" />
                  <Text className="text-cream-700 ml-2">
                    Last watered:{" "}
                    {new Date(lastWateringLog.date).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {plantData.garden_name && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="leaf" size={20} color="#77B860" />
                  <Text className="text-cream-700 ml-2">
                    Garden: {plantData.garden_name}
                  </Text>
                </View>
              )}

              {plantData.added_date && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="calendar" size={20} color="#9e9a90" />
                  <Text className="text-cream-700 ml-2">
                    Added: {new Date(plantData.added_date).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {plantData.common_names && plantData.common_names.length > 0 && (
                <View className="flex-row items-start mb-2">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#9e9a90"
                    style={{ marginTop: 2 }}
                  />
                  <View className="flex-1 ml-2">
                    <Text className="text-cream-700">
                      Also known as: {plantData.common_names.join(", ")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Care History */}
            <View className="bg-white rounded-xl p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Care History
              </Text>

              {plantData.care_logs && plantData.care_logs.length > 0 ? (
                plantData.care_logs.map((log: CareLog, index: number) => (
                  <View
                    key={index}
                    className="border-b border-cream-100 pb-2 mb-2"
                  >
                    <Text className="text-foreground font-medium">
                      {log.action}
                    </Text>
                    <Text className="text-cream-500 text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </Text>
                    {log.notes && (
                      <Text className="text-cream-700 mt-1">{log.notes}</Text>
                    )}
                  </View>
                ))
              ) : (
                <View className="items-center py-4">
                  <Text className="text-cream-500">
                    No care history recorded yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="mb-8">
            {/* Water Requirements */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="water" size={22} color="#0891b2" />
                <Text className="text-lg font-semibold text-foreground ml-2">
                  Water
                </Text>
              </View>
              <Text className="text-cream-700 mb-2">
                {plantData.water_requirements ||
                  "Water when the top inch of soil is dry."}
              </Text>
            </View>

            {/* Light Requirements */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sunny" size={22} color="#d97706" />
                <Text className="text-lg font-semibold text-foreground ml-2">
                  Light
                </Text>
              </View>
              <Text className="text-cream-700 mb-2">
                {plantData.light_requirements ||
                  "Prefers bright, indirect light."}
              </Text>
            </View>

            {/* Soil Requirements */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="layers-outline" size={22} color="#92400e" />
                <Text className="text-lg font-semibold text-foreground ml-2">
                  Soil
                </Text>
              </View>
              <Text className="text-cream-700 mb-2">
                {plantData.soil_requirements || "Well-draining potting mix."}
              </Text>
            </View>

            {/* Temperature Requirements */}
            <View className="bg-white rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="thermometer-outline"
                  size={22}
                  color="#dc2626"
                />
                <Text className="text-lg font-semibold text-foreground ml-2">
                  Temperature
                </Text>
              </View>
              <Text className="text-cream-700 mb-2">
                {plantData.temperature_requirements || "65-80°F (18-27°C)"}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-background rounded-xl w-5/6 p-5">
              <Text className="text-xl font-bold text-foreground mb-4">
                Edit Plant
              </Text>

              {/* Nickname Field */}
              <View className="mb-4">
                <Text className="text-cream-700 mb-2">Nickname</Text>
                <TextInput
                  className="bg-cream-50 border border-cream-200 rounded-lg p-2 text-foreground"
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Plant nickname"
                />
              </View>

              {/* Status Field */}
              <View className="mb-6">
                <Text className="text-cream-700 mb-2">Health Status</Text>
                <View className="flex-row flex-wrap">
                  {statusOptions.map((option) => {
                    const isSelected = status === option;
                    const optionStyle = statusColors[option];

                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setStatus(option)}
                        className={`mr-2 mb-2 rounded-full px-3 py-1.5 flex-row items-center ${
                          isSelected ? optionStyle.bg : "bg-cream-50"
                        }`}
                      >
                        <Ionicons
                          name={optionStyle.icon}
                          size={14}
                          color={isSelected ? optionStyle.color : "#9e9a90"}
                        />
                        <Text
                          className={`text-xs font-medium ml-1 ${
                            isSelected ? optionStyle.text : "text-cream-600"
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Buttons */}
              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="bg-cream-50 rounded-lg px-4 py-2 mr-2"
                  onPress={() => setEditModalVisible(false)}
                  disabled={isUpdating}
                >
                  <Text className="text-cream-700 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-primary rounded-lg px-4 py-2"
                  onPress={handleUpdatePlant}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <CompactSpinner size={24} color="white" />
                  ) : (
                    <Text className="text-white font-medium">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default UserPlantDetails;
