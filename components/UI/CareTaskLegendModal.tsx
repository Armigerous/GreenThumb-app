import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SubtitleText, Text } from "./Text";
import { TASK_TYPE_META } from "@/constants/taskTypes";

interface CareTaskLegendModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * CareTaskLegendModal
 *
 * Reason: Extracted from CalendarScreen to keep files maintainable and ensure the modal is only dismissed
 * when the user taps the backdrop or the explicit close button. Taps inside the modal content (including
 * the scroll area) will NOT close the modal, fixing the accidental dismiss issue.
 *
 * This version ensures the scroll view is always scrollable by making the backdrop a sibling, not a parent,
 * of the modal content.
 */
export default function CareTaskLegendModal({
  visible,
  onClose,
}: CareTaskLegendModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={StyleSheet.absoluteFill}
        className="flex-1 justify-center items-center"
      >
        {/* Backdrop: closes modal on press */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          className="bg-black/50"
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close info modal"
          accessibilityRole="button"
        />
        {/* Modal content: centered and above the backdrop */}
        <View className="w-full px-5 max-w-2xl">
          <View className="bg-cream-50 border border-cream-300 rounded-xl p-4 w-full self-center">
            <SubtitleText className="text-lg text-foreground border-b border-cream-300 pb-4 mb-2 text-center">
              About Care Tasks
            </SubtitleText>
            {/* Instructional text for user clarity */}
            <Text className="text-base text-cream-700 font-paragraph text-center mb-4">
              Care Tasks help you keep your plants healthy. Here’s what each
              task type means:
            </Text>
            <ScrollView className="max-h-96">
              <View className="mb-4">
                <View className="divide-y divide-cream-200">
                  {Object.entries(TASK_TYPE_META).map(([type, meta]) => (
                    <View key={type} className="flex-row items-start py-3">
                      <Ionicons
                        name={meta.icon}
                        size={22}
                        color={meta.color}
                        style={{ marginRight: 14, marginTop: 2 }}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-cream-800 mb-1">
                          {meta.label}
                        </Text>
                        <Text className="text-sm text-cream-700 font-paragraph">
                          {meta.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={onClose}
              className="mt-6 px-4 py-2 bg-brand-600 rounded-lg self-center"
              accessibilityLabel="Close info modal"
            >
              <Text className="text-white font-paragraph text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
