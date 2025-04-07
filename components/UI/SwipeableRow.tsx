import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onWater?: () => void;
}

// SwipeableRow component that provides iOS-style swipe actions
export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onEdit,
  onWater,
}) => {
  // Reference to the swipeable component for programmatic control
  const swipeableRef = useRef<Swipeable>(null);

  // Track if row is being dragged to prevent unwanted animations
  const isDragging = useRef(false);

  // Renders a single action button
  const renderAction = (
    icon: "water" | "pencil" | "trash",
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<number>,
    onPress?: () => void
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
      extrapolate: "clamp",
    });

    // Fade in the button as it slides in
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: trans }],
          opacity,
        }}
      >
        <RectButton
          style={{
            width: 68,
            height: "100%",
            justifyContent: "center",
            backgroundColor: color,
          }}
          onPress={() => {
            swipeableRef.current?.close();
            onPress?.();
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name={icon} size={24} color="white" />
            <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>
              {text}
            </Text>
          </View>
        </RectButton>
      </Animated.View>
    );
  };

  // Renders all right actions (swipe from right to left)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    return (
      <View
        style={{
          width: onDelete ? 204 : onEdit ? 136 : 68,
          flexDirection: "row",
        }}
      >
        {onWater &&
          renderAction("water", "Water", "#3b82f6", 204, progress, onWater)}
        {onEdit &&
          renderAction("pencil", "Edit", "#eab308", 136, progress, onEdit)}
        {onDelete &&
          renderAction("trash", "Delete", "#ef4444", 68, progress, onDelete)}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={30}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        isDragging.current = true;
      }}
      onSwipeableWillClose={() => {
        isDragging.current = false;
      }}
      overshootRight={false}
      containerStyle={{ backgroundColor: "#fff" }}
    >
      {children}
    </Swipeable>
  );
};
