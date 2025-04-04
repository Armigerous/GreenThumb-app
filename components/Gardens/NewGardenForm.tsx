import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient";

type NewGardenFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function NewGardenForm({
  onSuccess,
  onCancel,
}: NewGardenFormProps) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !user) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from("user_gardens")
        .insert([
          {
            name: name.trim(),
            user_id: user.id,
          },
        ]);

      if (submitError) {
        console.error("Error creating garden:", submitError);
        setError("There was a problem creating your garden. Please try again.");
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Error creating garden:", err);
      setError("There was a problem creating your garden. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="bg-white p-5 rounded-xl mb-5 shadow-sm">
        <Text className="text-lg text-foreground font-medium mb-3">
          Garden Name
        </Text>
        <TextInput
          className="bg-cream-50 rounded-lg text-foreground px-4 py-3.5 text-base"
          placeholder="Enter garden name"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        {error && (
          <Text className="text-destructive text-sm mt-3">{error}</Text>
        )}

        <TouchableOpacity
          className={`bg-brand-500 rounded-lg mt-5 py-3.5 items-center ${
            !name.trim() || isSubmitting ? "opacity-50" : ""
          }`}
          onPress={handleSubmit}
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-medium text-base">
              Create Garden
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="bg-white p-5 rounded-xl mb-5 shadow-sm">
        <Text className="text-lg text-foreground font-medium mb-4">
          Quick Start
        </Text>
        <Text className="text-cream-600 text-base leading-5">
          Start by giving your garden a name. After creating your garden, you
          can:
        </Text>
        <View className="mt-5 space-y-4">
          <View className="flex-row items-center">
            <Ionicons name="leaf-outline" size={22} color="#5E994B" />
            <Text className="text-foreground text-base ml-3">
              Add plants to your garden
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="sunny-outline" size={22} color="#5E994B" />
            <Text className="text-foreground text-base ml-3">
              Set garden conditions like sunlight and soil type
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={22} color="#5E994B" />
            <Text className="text-foreground text-base ml-3">
              Specify your garden's location and growing zones
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
