import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NameToggleProps {
  useCommonNames: boolean;
  onToggle: (value: boolean) => void;
}

const NameToggle: React.FC<NameToggleProps> = ({
  useCommonNames,
  onToggle,
}) => {
  return (
    <View className="flex-row items-center mb-4">
      <Text className="text-sm text-cream-600 mr-2">
        {useCommonNames ? "Using Common Names" : "Using Scientific Names"}
      </Text>
      <TouchableOpacity
        className={`w-12 h-6 rounded-full p-0.5 ${
          useCommonNames ? "bg-brand-100" : "bg-cream-200"
        }`}
        onPress={() => onToggle(!useCommonNames)}
        activeOpacity={0.7}
      >
        <View
          className={`w-5 h-5 rounded-full bg-white justify-center items-center shadow-sm ${
            useCommonNames ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {useCommonNames ? (
            <Ionicons name="people" size={12} color="#047857" />
          ) : (
            <Ionicons name="flask" size={12} color="#047857" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NameToggle;
