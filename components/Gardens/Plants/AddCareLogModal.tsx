import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  ScrollView,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImagePicker from "./Add/ImagePicker";

interface AddJournalEntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (notes: string, imageUrl: string | null) => Promise<void>;
}

/**
 * Modal component for adding a new journal entry to a plant
 * Allows users to add notes and optionally attach an image
 * Features smooth swipe-up and swipe-down animations
 */
export default function AddJournalEntryModal({
  isVisible,
  onClose,
  onSubmit,
}: AddJournalEntryModalProps) {
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values for smooth transitions
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  // Get screen height for gesture calculations
  const screenHeight = Dimensions.get("window").height;

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

  // Handle modal visibility changes with animations
  React.useEffect(() => {
    if (isVisible) {
      // Reset pan value
      pan.setValue({ x: 0, y: 0 });

      // Start entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Start exit animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isVisible) {
      setNotes("");
      setImageUrl(null);
      setIsSubmitting(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    // Animate out before closing
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(notes, imageUrl);
      handleClose();
    } catch (error) {
      console.error("Error submitting journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            opacity: opacityAnim,
          }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              style={{ width: "100%" }}
            >
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  transform: [
                    {
                      translateY: Animated.add(
                        slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [600, 0],
                        }),
                        pan.y
                      ),
                    },
                  ],
                  backgroundColor: "white",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  marginBottom: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                {/* Header with drag indicator */}
                <View className="items-center mb-4">
                  <View className="w-12 h-1.5 bg-cream-300 rounded-full" />
                </View>

                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-foreground">
                    Add Journal Entry
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="p-2"
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Image Picker */}
                  <View className="mb-6">
                    <Text className="text-cream-600 mb-2">
                      Photo (Optional)
                    </Text>
                    <ImagePicker
                      currentImage={imageUrl}
                      onImageSelected={setImageUrl}
                      aspect={[4, 3]}
                    />
                  </View>

                  {/* Notes Input */}
                  <View className="mb-6">
                    <Text className="text-cream-600 mb-2">Notes</Text>
                    <TextInput
                      className="border border-cream-300 rounded-lg p-3 text-foreground min-h-[120px]"
                      placeholder="Write about your plant's progress, observations, or care activities..."
                      placeholderTextColor="#BBBBBB"
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    className={`py-3 rounded-lg items-center ${
                      !notes.trim() || isSubmitting
                        ? "bg-cream-300"
                        : "bg-brand-600"
                    }`}
                    onPress={handleSubmit}
                    disabled={!notes.trim() || isSubmitting}
                  >
                    <Text className="text-white font-semibold">
                      {isSubmitting ? "Saving..." : "Save Entry"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
