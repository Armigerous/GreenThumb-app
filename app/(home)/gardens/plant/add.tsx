import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { ImagePicker } from "@/components/UI/ImagePicker";
import { uploadImage } from "@/lib/services/imageUpload";
import { Ionicons } from "@expo/vector-icons";

/**
 * Add Plant Page
 * Allows users to add a new plant to their garden
 */
export default function AddPlant() {
  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  /**
   * Handles the save action for adding a new plant
   * Creates a new plant record in the database
   */
  const handleSave = async () => {
    if (!nickname.trim() || !user?.id) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("user_plants")
        .insert([
          {
            user_id: user.id,
            nickname: nickname.trim(),
            status: "Healthy",
            images: image ? [image] : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error("Error adding plant:", error);
      Alert.alert("Error", "Failed to add plant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2e2c29" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Add Plant</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Picker */}
        <View className="mb-6">
          <Text className="text-cream-600 mb-2">Plant Photo</Text>
          <ImagePicker
            currentImage={image}
            onImageSelected={setImage}
            aspect={[4, 3]}
          />
        </View>

        {/* Nickname Input */}
        <View className="mb-6">
          <Text className="text-cream-600 mb-2">Nickname</Text>
          <TextInput
            className="border border-cream-300 rounded-lg p-3 text-foreground"
            value={nickname}
            onChangeText={setNickname}
            placeholder="Give your plant a nickname"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-primary py-4 rounded-xl mb-4"
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text className="text-center text-primary-foreground font-bold text-lg">
            {isSaving ? "Adding..." : "Add Plant"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
