import React, { useCallback, useEffect, useState } from "react";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  BackHandler,
  Platform,
} from "react-native";

import HelpIcon from "./HelpIcon";
import { BodyText, TitleText } from "./Text";

export type LookupItem<T extends string | number> = {
  label: string;
  value: T;
};

type SelectorProps<T extends string | number, U extends boolean = true> = {
  label: string;
  placeholder: string;
  items: LookupItem<T>[];
  value: U extends true ? T[] : T | null;
  onChange: (value: U extends true ? T[] : T | null) => void;
  multiple?: U;
  required?: boolean;
  helpExplanation?: string;
};

export default function Selector<
  T extends string | number,
  U extends boolean = true
>({
  label,
  placeholder,
  items,
  value,
  onChange,
  multiple = true as U,
  required = false,
  helpExplanation,
}: SelectorProps<T, U>) {
  const [modalVisible, setModalVisible] = useState(false);
  const slideProgress = useSharedValue(0);

  // Handle closing the modal
  const handleClose = useCallback(() => {
    slideProgress.value = withTiming(
      0,
      {
        duration: 260,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
        }
      }
    );
  }, [slideProgress]);

  // Handle opening the modal
  const handleOpen = useCallback(() => {
    setModalVisible(true);
    slideProgress.value = 0;
    slideProgress.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [slideProgress]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - slideProgress.value) * 600,
      },
    ],
  }));

  // Add effect to handle back button press and outside taps
  useEffect(() => {
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

    return undefined;
  }, [modalVisible, handleClose]);

  // Get the display value for the selector
  const getDisplayValue = () => {
    if (multiple) {
      const selectedItems = (value as T[]) || [];
      if (selectedItems.length === 0) return placeholder;

      if (selectedItems.length === 1) {
        const selectedItem = items.find(
          (item) => item.value === selectedItems[0]
        );
        return selectedItem?.label || placeholder;
      }

      return `${selectedItems.length} selected`;
    } else {
      const selectedValue = value as T | null;
      if (selectedValue === null) return placeholder;

      const selectedItem = items.find((item) => item.value === selectedValue);
      return selectedItem?.label || placeholder;
    }
  };

  // Handle item selection
  const handleItemToggle = (itemValue: T) => {
    if (multiple) {
      const selectedItems = [...((value as T[]) || [])];
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
  const isSelected = (itemValue: T) => {
    if (multiple) {
      return (value as T[])?.includes(itemValue) || false;
    } else {
      return value === itemValue;
    }
  };

  return (
    <View className="mb-6">
      <View className="mb-1.5">
        <View className="flex-row items-start">
          <View className="flex-1 flex-row items-start flex-wrap">
            <TitleText
              className="text-foreground font-medium flex-1"
              numberOfLines={0}
            >
              {label}
            </TitleText>
            {required && (
              <BodyText className="text-destructive ml-1">*</BodyText>
            )}
          </View>
          {helpExplanation && (
            <HelpIcon title={label} explanation={helpExplanation} />
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleOpen}
        className="flex-row items-center justify-between px-4 py-3.5 bg-cream-50 border border-cream-300 rounded-lg"
      >
        <BodyText
          className={`${
            (multiple ? (value as T[])?.length || 0 : value)
              ? "text-foreground"
              : "text-cream-500/80"
          } text-base font-paragraph`}
        >
          {getDisplayValue()}
        </BodyText>
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
                className="bg-cream-50 rounded-t-xl max-h-[80%]"
                style={modalAnimatedStyle}
              >
                {/* Modal header */}
                <View className="flex-row items-center p-4 border-b border-cream-300">
                  <TouchableOpacity
                    onPress={handleClear}
                    className="px-3 py-1.5"
                  >
                    <BodyText className="text-destructive font-medium">
                      Clear
                    </BodyText>
                  </TouchableOpacity>

                  <View className="flex-1 px-3">
                    <TitleText
                      className="text-lg font-medium text-center"
                      numberOfLines={2}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.8}
                    >
                      {label}
                    </TitleText>
                  </View>

                  <TouchableOpacity
                    onPress={handleClose}
                    className="px-3 py-1.5"
                  >
                    <BodyText className="text-primary font-medium">
                      Done
                    </BodyText>
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
                      <Text className="text-gray-800 text-base font-paragraph">
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
