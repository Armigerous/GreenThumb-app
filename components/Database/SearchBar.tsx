import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search plants...",
}) => {
  return (
    <View className="flex-row items-center bg-cream-100 rounded-xl px-3 py-2.5 mb-4 border border-cream-300">
      <Ionicons name="search" size={20} color="#161513" />
      <TextInput
        className="flex-1 ml-2 text-cream-800"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#161513"
        cursorColor="#5E994B"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color="#161513" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
