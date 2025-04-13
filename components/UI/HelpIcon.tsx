import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HelpIconProps = {
  title?: string;
  explanation: string;
  size?: number;
};

export default function HelpIcon({
  title,
  explanation,
  size = 18,
}: HelpIconProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="ml-2"
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="help-circle-outline" size={size} color="#77B860" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-lg p-6 m-4 w-5/6 max-w-md">
            {title && (
              <Text className="text-lg font-medium text-foreground mb-3">
                {title}
              </Text>
            )}
            <Text className="text-sm text-cream-800 mb-4">{explanation}</Text>
            <Pressable
              className="bg-brand-500 py-2 px-4 rounded-lg self-end"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-medium">Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
