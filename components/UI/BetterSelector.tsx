import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  BackHandler,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type LookupItem = {
  label: string;
  value: number;
};

type BetterSelectorProps<T extends boolean = true> = {
  label: string;
  placeholder: string;
  items: Array<LookupItem>;
  value: T extends true ? number[] : number | null;
  onChange: (value: T extends true ? number[] : number | null) => void;
  multiple?: T;
  labelHidden?: boolean;
};

export default function BetterSelector<T extends boolean = true>({
  label,
  placeholder,
  items,
  value,
  onChange,
  multiple = true as T,
  labelHidden = false,
}: BetterSelectorProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Handle closing the modal
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // Handle opening the modal
  const handleOpen = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Add effect to handle back button press and outside taps
  useEffect(() => {
    // For Android, handle back button press
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (modalVisible) {
            handleClose();
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }
  }, [modalVisible]);

  // Get the display value for the selector
  const getDisplayValue = () => {
    if (multiple) {
      const selectedItems = (value as number[]) || [];
      if (selectedItems.length === 0) return placeholder;

      if (selectedItems.length === 1) {
        const selectedItem = items.find(
          (item) => item.value === selectedItems[0]
        );
        return selectedItem?.label || placeholder;
      }

      return `${selectedItems.length} selected`;
    } else {
      const selectedValue = value as number | null;
      if (selectedValue === null) return placeholder;

      const selectedItem = items.find((item) => item.value === selectedValue);
      return selectedItem?.label || placeholder;
    }
  };

  // Handle item selection
  const handleItemToggle = (itemValue: number) => {
    if (multiple) {
      const selectedItems = [...((value as number[]) || [])];
      const index = selectedItems.indexOf(itemValue);

      if (index === -1) {
        selectedItems.push(itemValue);
      } else {
        selectedItems.splice(index, 1);
      }

      onChange(selectedItems as any);
    } else {
      // For single selection, just set the value directly
      onChange(itemValue as any);
      handleClose();
    }
  };

  // Handle clearing all selections
  const handleClear = () => {
    onChange((multiple ? [] : null) as any);
  };

  // Check if an item is selected
  const isSelected = (itemValue: number) => {
    if (multiple) {
      return (value as number[])?.includes(itemValue) || false;
    } else {
      return value === itemValue;
    }
  };

  return (
    <View className="mb-5">
      {!labelHidden && (
        <Text className="text-foreground font-medium mb-1.5 text-base">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        className="flex-row items-center justify-between px-4 py-3.5 bg-white border border-cream-300 rounded-lg"
      >
        <Text
          className={`${
            (multiple ? (value as number[])?.length || 0 : value)
              ? "text-gray-800"
              : "text-gray-300"
          } text-base`}
        >
          {getDisplayValue()}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#4b5563" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                className="bg-white rounded-t-xl max-h-[80%]"
                style={{
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                }}
              >
                {/* Modal header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                  <TouchableOpacity
                    onPress={handleClear}
                    className="px-3 py-1.5"
                  >
                    <Text className="text-brand-500 font-medium">Clear</Text>
                  </TouchableOpacity>

                  <Text className="text-lg font-medium">{label}</Text>

                  <TouchableOpacity
                    onPress={handleClose}
                    className="px-3 py-1.5"
                  >
                    <Text className="text-brand-500 font-medium">Done</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal content */}
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleItemToggle(item.value)}
                      className="flex-row items-center justify-between px-5 py-3.5 border-b border-gray-100"
                    >
                      <Text className="text-gray-800 text-base">
                        {item.label}
                      </Text>

                      {isSelected(item.value) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#77B860"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
