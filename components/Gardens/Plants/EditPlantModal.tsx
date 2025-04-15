import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
  BackHandler,
  Platform,
  InteractionManager,
  LayoutAnimation,
  UIManager,
  KeyboardAvoidingView,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserPlant } from "@/types/garden";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import ImagePicker from "@/components/Gardens/Plants/Add/ImagePicker";
import { useUser } from "@clerk/clerk-expo";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface EditPlantModalProps {
  plant: UserPlant;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Modal component for editing plant details
 * Allows users to update the plant's nickname, status, and image
 */
export default function EditPlantModal({
  plant,
  isVisible,
  onClose,
}: EditPlantModalProps) {
  const [nickname, setNickname] = useState(plant.nickname);
  const [status, setStatus] = useState(plant.status);
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Create a single animation value for better synchronization
  const animation = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  // Get screen height for gesture calculations
  const screenHeight = Dimensions.get("window").height;

  // Derived animations for better synchronization
  const slideAnim = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacityAnim = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  });

  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipe
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down more than 20% of screen height, close the modal
        if (gestureState.dy > screenHeight * 0.2) {
          handleClose();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  // Track if animation is in progress
  const animationInProgress = useRef(false);

  // Preload content flag
  const contentPreloaded = useRef(false);

  // Handle back button press on Android
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (isVisible) {
            handleClose();
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }
  }, [isVisible]);

  // Preload content when component mounts
  useEffect(() => {
    if (!contentPreloaded.current && plant) {
      // Set initial values
      setNickname(plant.nickname);
      setStatus(plant.status);
      if (plant.images && plant.images.length > 0) {
        setImage(plant.images[0]);
      }
      contentPreloaded.current = true;
    }
  }, [plant]);

  // Handle modal visibility with improved animation
  useEffect(() => {
    if (isVisible) {
      // Reset pan value
      pan.setValue({ x: 0, y: 0 });

      // Make modal visible first
      setModalVisible(true);

      // Wait for next frame to ensure layout is ready
      requestAnimationFrame(() => {
        // Wait for any interactions to complete
        InteractionManager.runAfterInteractions(() => {
          animationInProgress.current = true;

          // Use a single animation for better synchronization
          Animated.spring(animation, {
            toValue: 1,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start(() => {
            animationInProgress.current = false;
          });
        });
      });
    } else if (modalVisible) {
      animationInProgress.current = true;

      // Single animation for closing
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        animationInProgress.current = false;
      });
    }
  }, [isVisible]);

  // Reset form data when modal opens
  useEffect(() => {
    if (isVisible) {
      setNickname(plant.nickname);
      setStatus(plant.status);
      if (plant.images && plant.images.length > 0) {
        setImage(plant.images[0]);
      }
    }
  }, [isVisible, plant]);

  // Available plant statuses for selection
  const plantStatuses = [
    "Healthy",
    "Needs Water",
    "Wilting",
    "Dormant",
    "Dead",
  ] as const;

  const handleClose = () => {
    if (!animationInProgress.current) {
      onClose();
    }
  };

  /**
   * Handles the save action for plant updates
   * Updates the plant details in the database and refreshes the data
   */
  const handleSave = async () => {
    if (!nickname.trim() || !user?.id) return;

    setIsSaving(true);
    try {
      const updates = {
        nickname: nickname.trim(),
        status,
        images: image ? [image] : [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_plants")
        .update(updates)
        .eq("id", plant.id);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["userPlantDetails", plant.id],
      });
      onClose();
    } catch (error) {
      console.error("Error updating plant:", error);
      alert("Failed to update plant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Memoize the modal content to prevent unnecessary re-renders
  const modalContent = (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-xl font-bold text-foreground">Edit Plant</Text>
      <TouchableOpacity
        onPress={handleClose}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Ionicons name="close" size={24} color="#2e2c29" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      onRequestClose={handleClose}
      animationType="none" // We handle animation ourselves
      hardwareAccelerated={true} // Enable hardware acceleration
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
          opacity: opacityAnim,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ width: "100%" }}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [{ translateY: slideAnim }, { translateY: pan.y }],
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                // Add shadow for iOS
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                // Add elevation for Android
                elevation: 5,
                marginBottom: 0,
              }}
            >
              {/* Drag indicator at the top */}
              <View className="items-center mb-4">
                <View className="w-12 h-1.5 bg-cream-300 rounded-full" />
              </View>

              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {modalContent}

                <ScrollView
                  className="max-h-[80vh]"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  removeClippedSubviews={false}
                  scrollEventThrottle={16}
                  overScrollMode="never"
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Image Picker */}
                  <View className="mb-6">
                    <Text className="text-cream-600 mb-2">Plant Photo</Text>
                    <ImagePicker
                      currentImage={image}
                      onImageSelected={setImage}
                      aspect={[4, 3]}
                    />
                  </View>

                  {/* Nickname Input */}
                  <View className="mb-6">
                    <Text className="text-cream-600 mb-2">Nickname</Text>
                    <TextInput
                      className="border border-cream-300 rounded-lg p-3 text-foreground"
                      value={nickname}
                      onChangeText={setNickname}
                      placeholder="Give your plant a nickname"
                    />
                  </View>

                  {/* Status Selection */}
                  <View className="mb-6">
                    <Text className="text-cream-600 mb-2">Status</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {plantStatuses.map((plantStatus) => (
                        <TouchableOpacity
                          key={plantStatus}
                          onPress={() => setStatus(plantStatus)}
                          className={`px-4 py-2 rounded-lg ${
                            status === plantStatus
                              ? "bg-brand-500"
                              : "bg-cream-100"
                          }`}
                        >
                          <Text
                            className={`${
                              status === plantStatus
                                ? "text-white"
                                : "text-cream-700"
                            } font-medium`}
                          >
                            {plantStatus}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    className="bg-primary py-4 rounded-xl mb-4"
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <Text className="text-center text-primary-foreground font-bold text-lg">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
