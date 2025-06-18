import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DropdownItem = {
  label: string;
  value: number | string;
};

type DropdownProps = {
  items: DropdownItem[];
  value: (number | string)[] | number | string | null;
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
};

const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  multiple = false,
  searchable = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const filteredItems =
    searchable && searchQuery
      ? items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

  const selectedItems = multiple
    ? items.filter(
        (item) => Array.isArray(value) && value.includes(item.value as never)
      )
    : items.find((item) => item.value === value);

  const displayText = multiple
    ? Array.isArray(selectedItems) && selectedItems.length > 0
      ? selectedItems.map((item) => item.label).join(", ")
      : placeholder
    : selectedItems
    ? (selectedItems as DropdownItem).label
    : placeholder;

  const toggleItem = (itemValue: number | string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      if (currentValues.includes(itemValue as never)) {
        onChange(currentValues.filter((v) => v !== itemValue));
      } else {
        onChange([...currentValues, itemValue]);
      }
    } else {
      onChange(itemValue);
      setIsOpen(false);
    }
  };

  const clearSelection = () => {
    onChange(multiple ? [] : null);
  };

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  return (
    <>
      <TouchableOpacity
        className={`border rounded-lg px-3 py-2.5 flex-row justify-between items-center ${
          disabled ? "bg-gray-100 opacity-70" : "bg-white"
        } ${isOpen ? "border-brand-500" : "border-cream-200"}`}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text
          className={`flex-1 ${
            displayText === placeholder ? "text-cream-500" : "text-foreground"
          }`}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <View className="flex-row items-center">
          {(multiple && Array.isArray(value) && value.length > 0) ||
          (!multiple && value !== null && value !== undefined) ? (
            <TouchableOpacity
              className="p-1 mr-1"
              onPress={clearSelection}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6b7280"
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className="flex-1 bg-black/30 justify-center items-center p-5">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-white rounded-xl w-full max-h-96 overflow-hidden">
                <View className="p-3 border-b border-cream-100 flex-row justify-between items-center">
                  <Text className="font-medium text-lg text-foreground">
                    {placeholder}
                  </Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {searchable && (
                  <View className="px-3 py-2 border-b border-cream-100">
                    <View className="flex-row items-center bg-cream-50 rounded-lg px-3 py-1.5">
                      <Ionicons name="search" size={18} color="#9ca3af" />
                      <TextInput
                        ref={inputRef}
                        className="flex-1 ml-2 text-foreground"
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                      {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                          <Ionicons name="close" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                )}

                <ScrollView className="max-h-64">
                  {filteredItems.length === 0 ? (
                    <View className="p-4 items-center">
                      <Text className="text-cream-500">No items found</Text>
                    </View>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = multiple
                        ? Array.isArray(value) &&
                          value.includes(item.value as never)
                        : item.value === value;

                      return (
                        <TouchableOpacity
                          key={item.value.toString()}
                          className={`px-4 py-3 border-b border-cream-50 flex-row justify-between items-center ${
                            isSelected ? "bg-brand-50" : ""
                          }`}
                          onPress={() => toggleItem(item.value)}
                        >
                          <Text
                            className={`${
                              isSelected
                                ? "text-brand-700 font-medium"
                                : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name={multiple ? "checkmark-circle" : "checkmark"}
                              size={multiple ? 20 : 18}
                              color="#77B860"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {multiple && (
                  <View className="p-3 border-t border-cream-100 flex-row justify-end">
                    <TouchableOpacity
                      className="bg-cream-50 rounded-full px-4 py-2 mr-2"
                      onPress={clearSelection}
                    >
                      <Text className="text-cream-800 text-sm font-medium">
                        Clear All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-brand-500 rounded-full px-4 py-2"
                      onPress={() => setIsOpen(false)}
                    >
                      <Text className="text-white text-sm font-medium">
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default Dropdown;
