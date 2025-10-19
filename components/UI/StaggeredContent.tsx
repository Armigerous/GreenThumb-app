import React, { useEffect } from "react";
import Animated, {
	Easing,
	type WithTimingConfig,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { ViewStyle } from "react-native";

interface StaggeredContentProps {
	children: React.ReactNode;
	index?: number;
	staggerInterval?: number;
	baseDelay?: number;
	duration?: number;
	enabled?: boolean;
	initialY?: number;
	style?: ViewStyle;
	className?: string;
}

/**
 * A component for creating smooth, staggered animations for content sections.
 * This component handles the timing and coordination of animations to ensure
 * a fluid, professional feeling when loading multiple elements.
 */
export function StaggeredContent({
	children,
	index = 0,
	staggerInterval = 40,
	baseDelay = 100,
	duration = 500,
	enabled = true,
	initialY = 15,
	style = {},
	className = "",
}: StaggeredContentProps) {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);

	useEffect(() => {
		if (!enabled) {
			translateY.value = 0;
			opacity.value = 1;
			return;
		}

		const delay = baseDelay + index * staggerInterval;

		translateY.value = initialY;
		opacity.value = 0;

		const timingConfig: WithTimingConfig = {
			duration,
			easing: Easing.out(Easing.cubic),
		};

		translateY.value = withDelay(delay, withTiming(0, timingConfig));
		opacity.value = withDelay(delay, withTiming(1, timingConfig));
	}, [enabled, baseDelay, index, initialY, staggerInterval, duration, opacity, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<Animated.View className={className} style={[animatedStyle, style]}>
			{children}
		</Animated.View>
	);
}
