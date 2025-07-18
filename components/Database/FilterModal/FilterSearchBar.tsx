import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";

interface FilterSearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * FilterSearchBar
 * A reusable search bar for filtering options in the FilterModal.
 * Handles focus, clear, and value changes.
 */
const FilterSearchBar: React.FC<FilterSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search filters...",
  onFocus,
  onBlur,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center rounded-xl px-3 py-2.5 border ${
        focused || value
          ? "border-brand-600 bg-cream-200"
          : "bg-cream-100 border-cream-300"
      }`}
    >
      <Feather name="search" size={18} color="#666" />
      <TextInput
        className="flex-1 ml-2"
        placeholder={placeholder}
        placeholderTextColor="#BBBBBB"
        value={value}
        onChangeText={onChange}
        onFocus={(e) => {
          setFocused(true);
          if (onFocus) onFocus();
        }}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur();
        }}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange("")}>
          <Feather name="x" size={18} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default FilterSearchBar;
