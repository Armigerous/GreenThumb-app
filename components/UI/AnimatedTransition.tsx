import React, { useCallback, useEffect, useRef } from "react";
import Animated, {
	Easing,
	type WithTimingConfig,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { ViewStyle } from "react-native";

type AnimatedTransitionProps = {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	initialY?: number;
	style?: ViewStyle;
	className?: string;
	enabled?: boolean;
};

/**
 * A reusable component that provides smooth transitions with configurable
 * fade-in and slide-up animations.
 */
const AnimatedTransition = ({
	children,
	delay = 150,
	duration = 400,
	initialY = 10,
	style = {},
	className = "",
	enabled = true,
}: AnimatedTransitionProps) => {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);
	const hasAnimated = useRef(false);
	const isInitialized = useRef(false);

	const startAnimation = useCallback(() => {
		if (!enabled || hasAnimated.current) {
			return;
		}

		hasAnimated.current = true;

		const timingConfig: WithTimingConfig = {
			duration,
			easing: Easing.out(Easing.cubic),
		};

		translateY.value = withDelay(delay, withTiming(0, timingConfig));
		opacity.value = withDelay(delay, withTiming(1, timingConfig));
	}, [delay, duration, enabled, opacity, translateY]);

	useEffect(() => {
		if (!isInitialized.current) {
			isInitialized.current = true;
		}

		hasAnimated.current = false;

		if (enabled) {
			translateY.value = initialY;
			opacity.value = 0;
			startAnimation();
		} else {
			translateY.value = 0;
			opacity.value = 1;
		}
	}, [enabled, initialY, opacity, startAnimation, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<Animated.View className={className} style={[animatedStyle, style]}>
			{children}
		</Animated.View>
	);
};

export default AnimatedTransition;
