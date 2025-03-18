import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

export default function NewGarden() {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use the hook to ensure we have a valid Supabase token
  useSupabaseAuth();

  const handleSubmit = async () => {
    if (!name.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("user_gardens").insert([
        {
          name: name.trim(),
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Error creating garden:", error);
        Alert.alert(
          "Error",
          "There was a problem creating your garden. Please try again."
        );
        return;
      }

      router.back();
    } catch (error) {
      console.error("Error creating garden:", error);
      Alert.alert(
        "Error",
        "There was a problem creating your garden. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="close" size={24} color="#2e2c29" />
          <Text className="text-lg font-medium text-foreground ml-2">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`bg-brand-500 px-4 py-2 rounded-full ${
            !name.trim() || isSubmitting ? "opacity-50" : ""
          }`}
          onPress={handleSubmit}
          disabled={!name.trim() || isSubmitting}
        >
          <Text className="text-white font-medium">
            {isSubmitting ? "Creating..." : "Create"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-foreground mb-6">
          Create New Garden
        </Text>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            Garden Name
          </Text>
          <TextInput
            className="bg-cream-50 rounded-lg px-4 py-3 text-foreground"
            placeholder="Enter garden name"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-base font-medium text-foreground mb-4">
            Quick Start
          </Text>
          <Text className="text-sm text-cream-600 leading-5">
            Start by giving your garden a name. After creating your garden, you
            can:
          </Text>
          <View className="mt-4 space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="leaf-outline" size={20} color="#5E994B" />
              <Text className="text-sm text-foreground ml-2">
                Add plants to your garden
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="sunny-outline" size={20} color="#5E994B" />
              <Text className="text-sm text-foreground ml-2">
                Set garden conditions like sunlight and soil type
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#5E994B" />
              <Text className="text-sm text-foreground ml-2">
                Specify your garden's location and growing zones
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
