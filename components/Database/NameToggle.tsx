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
    <View className="flex-row items-center">
      <Text className="text-sm text-cream-600 mr-2">
        {useCommonNames ? "Common" : "Scientific"}
      </Text>
      <TouchableOpacity
        className={`w-12 h-6 rounded-full p-0.5 ${
          useCommonNames ? "bg-brand-100" : "bg-cream-400/40"
        }`}
        onPress={() => onToggle(!useCommonNames)}
        activeOpacity={0.7}
      >
        <View
          className={`w-5 h-5 rounded-full bg-cream-50 justify-center items-center ${
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
