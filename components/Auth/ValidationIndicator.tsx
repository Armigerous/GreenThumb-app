import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import {
	ValidationResult,
	validateEmail,
	validatePhoneNumber,
	validatePassword,
	validateName,
	validateVerificationCode,
} from "@/lib/validation";

interface ValidationIndicatorProps {
	validationType: "email" | "phone" | "password" | "verification" | "name";
	value: string;
	validation: ValidationResult;
	isVisible: boolean;
	isTouched: boolean;
	isFocused: boolean;
	isSignUp?: boolean;
}

interface ValidationRule {
	id: string;
	label: string;
	test: (value: string, isSignUp?: boolean) => boolean;
	icon: keyof typeof Ionicons.glyphMap;
}

const getValidationRules = (
	type: ValidationIndicatorProps["validationType"]
): ValidationRule[] => {
	switch (type) {
		case "email":
			return [
				{
					id: "format",
					label: "Valid email format",
					test: (value) => {
						const result = validateEmail(value);
						return result.isValid;
					},
					icon: "mail-outline",
				},
				{
					id: "length",
					label: "Appropriate length (under 320 characters)",
					test: (value) => {
						const trimmed = value.trim();
						return trimmed.length > 0 && trimmed.length <= 320;
					},
					icon: "resize-outline",
				},
				{
					id: "structure",
					label: "Proper email structure",
					test: (value) => {
						const trimmed = value.trim();
						if (!trimmed) return false;

						const parts = trimmed.split("@");
						if (parts.length !== 2) return false;

						const [localPart, domain] = parts;
						// Check local part length (max 64 characters)
						if (localPart.length > 64) return false;
						// Check domain length (max 253 characters)
						if (domain.length > 253) return false;

						return true;
					},
					icon: "checkmark-outline",
				},
			];

		case "phone":
			return [
				{
					id: "length",
					label: "Valid length (7-15 digits)",
					test: (value) => {
						const digits = value.replace(/\D/g, "");
						return digits.length >= 7 && digits.length <= 15;
					},
					icon: "call-outline",
				},
				{
					id: "format",
					label: "Valid phone format",
					test: (value) => {
						const result = validatePhoneNumber(value);
						return result.isValid;
					},
					icon: "checkmark-outline",
				},
			];

		case "password":
			return [
				{
					id: "length",
					label: "At least 8 characters",
					test: (value, isSignUp) => !isSignUp || value.length >= 8,
					icon: "text-outline",
				},
				{
					id: "complexity",
					label: "3 of: lowercase, uppercase, numbers, symbols",
					test: (value, isSignUp) => {
						if (!isSignUp) return true;

						const hasLowercase = /[a-z]/.test(value);
						const hasUppercase = /[A-Z]/.test(value);
						const hasNumbers = /[0-9]/.test(value);
						const hasSpecialChars =
							/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value);

						const characterTypeCount = [
							hasLowercase,
							hasUppercase,
							hasNumbers,
							hasSpecialChars,
						].filter(Boolean).length;
						return characterTypeCount >= 3;
					},
					icon: "key-outline",
				},
				{
					id: "common",
					label: "Not a common password",
					test: (value, isSignUp) => {
						if (!isSignUp) return true;

						// Use the centralized validation logic
						const result = validatePassword(value, isSignUp);
						// If it fails due to common passwords, this rule fails
						return !result.error?.includes("too common");
					},
					icon: "shield-outline",
				},
				{
					id: "patterns",
					label: "No simple patterns",
					test: (value, isSignUp) => {
						if (!isSignUp) return true;

						// Use the centralized validation logic
						const result = validatePassword(value, isSignUp);
						// If it fails due to patterns, this rule fails
						return !result.error?.includes("common patterns");
					},
					icon: "ban-outline",
				},
				{
					id: "personal",
					label: "No common words",
					test: (value, isSignUp) => {
						if (!isSignUp) return true;

						// Use the centralized validation logic
						const result = validatePassword(value, isSignUp);
						// If it fails due to personal info, this rule fails
						return !result.error?.includes("common words");
					},
					icon: "person-outline",
				},
			];

		case "name":
			return [
				{
					id: "length",
					label: "At least 2 characters",
					test: (value) => {
						const trimmed = value.trim();
						return trimmed.length >= 2;
					},
					icon: "text-outline",
				},
				{
					id: "format",
					label: "Valid name format",
					test: (value) => {
						const result = validateName(value);
						return result.isValid;
					},
					icon: "person-outline",
				},
			];

		case "verification":
			return [
				{
					id: "format",
					label: "Valid verification code",
					test: (value) => {
						const result = validateVerificationCode(value);
						return result.isValid;
					},
					icon: "shield-checkmark-outline",
				},
			];

		default:
			return [];
	}
};

export function ValidationIndicator({
	validationType,
	value,
	validation,
	isVisible,
	isTouched,
	isFocused,
	isSignUp = false,
}: ValidationIndicatorProps) {
	const rules = getValidationRules(validationType);
	const containerOpacity = useSharedValue(0);
	const containerTranslateY = useSharedValue(-10);
	const containerScale = useSharedValue(0.95);

	// Calculate validation progress
	const validRulesCount = rules.filter((rule) =>
		rule.test(value, isSignUp)
	).length;
	const totalRulesCount = rules.length;
	const progressPercentage =
		totalRulesCount > 0 ? (validRulesCount / totalRulesCount) * 100 : 0;

	React.useEffect(() => {
		// Show validation indicator only when field is focused, has content, and has been touched
		const shouldShow =
			isVisible && value.trim().length > 0 && isTouched && isFocused;

		if (shouldShow) {
			containerOpacity.value = withTiming(1, { duration: 200 });
			containerTranslateY.value = withSpring(0, {
				damping: 15,
				stiffness: 200,
			});
			containerScale.value = withSpring(1, { damping: 15, stiffness: 200 });
		} else {
			containerOpacity.value = withTiming(0, { duration: 150 });
			containerTranslateY.value = withTiming(-10, { duration: 150 });
			containerScale.value = withTiming(0.95, { duration: 150 });
		}
	}, [isVisible, isTouched, isFocused, value]);

	const containerAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: containerOpacity.value,
			transform: [
				{ scale: containerScale.value },
				{ translateY: containerTranslateY.value },
			],
		};
	});

	const shouldShow =
		isVisible && value.trim().length > 0 && isTouched && isFocused;

	if (!shouldShow) {
		return null;
	}

	// Determine overall validation state for styling using brand colors
	const getValidationState = () => {
		if (progressPercentage === 100) return "excellent";
		if (progressPercentage >= 75) return "good";
		if (progressPercentage >= 50) return "fair";
		return "poor";
	};

	const validationState = getValidationState();

	// Updated to use brand colors following brand guidelines
	const getBorderColor = () => {
		switch (validationState) {
			case "excellent":
				return "border-brand-300"; // Brand green for excellent validation
			case "good":
				return "border-brand-200"; // Lighter brand green for good validation
			case "fair":
				return "border-accent-300"; // Brand yellow for fair validation
			default:
				return "border-cream-300"; // Brand neutral for poor validation
		}
	};

	const getBackgroundColor = () => {
		switch (validationState) {
			case "excellent":
				return "bg-brand-50"; // Light brand green background
			case "good":
				return "bg-brand-25"; // Very light brand green background
			case "fair":
				return "bg-accent-50"; // Light brand yellow background
			default:
				return "bg-cream-50"; // Brand neutral background
		}
	};

	return (
		<Animated.View
			style={containerAnimatedStyle}
			className={`${getBackgroundColor()} border ${getBorderColor()} rounded-lg px-4 py-3 shadow-sm`}
		>
			<View>
				{/* Progress header for password validation */}
				{validationType === "password" && isSignUp && (
					<View className="mb-3 pb-2 border-b border-cream-200">
						<View className="flex-row items-center justify-between mb-1">
							<BodyText className="text-sm font-paragraph-medium text-cream-700">
								Password Strength
							</BodyText>
							<BodyText className="text-xs text-cream-600">
								{validRulesCount}/{totalRulesCount}
							</BodyText>
						</View>
						{/* Progress bar using brand colors */}
						<View className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
							<View
								className={`h-full rounded-full ${
									validationState === "excellent"
										? "bg-brand-500" // Brand green for excellent
										: validationState === "good"
										? "bg-brand-400" // Medium brand green for good
										: validationState === "fair"
										? "bg-accent-400" // Brand yellow for fair
										: "bg-cream-400" // Brand neutral for poor
								}`}
								style={{ width: `${progressPercentage}%` }}
							/>
						</View>
					</View>
				)}

				{/* Validation rules */}
				{rules.map((rule, index) => (
					<View key={rule.id} className={index > 0 ? "mt-2" : ""}>
						<ValidationRuleItem rule={rule} value={value} isSignUp={isSignUp} />
					</View>
				))}
			</View>
		</Animated.View>
	);
}

interface ValidationRuleItemProps {
	rule: ValidationRule;
	value: string;
	isSignUp: boolean;
}

function ValidationRuleItem({
	rule,
	value,
	isSignUp,
}: ValidationRuleItemProps) {
	const isValid = rule.test(value, isSignUp);
	const iconScale = useSharedValue(0.8);
	const iconOpacity = useSharedValue(0.6);
	const textOpacity = useSharedValue(0.6);
	const checkmarkScale = useSharedValue(0);

	React.useEffect(() => {
		if (isValid) {
			// Animate checkmark appearance
			checkmarkScale.value = withSpring(1, { damping: 10, stiffness: 300 });
			iconScale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
				iconScale.value = withSpring(1, { damping: 15, stiffness: 200 });
			});
			iconOpacity.value = withTiming(1, { duration: 200 });
			textOpacity.value = withTiming(1, { duration: 200 });
		} else {
			checkmarkScale.value = withSpring(0, { damping: 15, stiffness: 200 });
			iconScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
			iconOpacity.value = withTiming(0.6, { duration: 200 });
			textOpacity.value = withTiming(0.6, { duration: 200 });
		}
	}, [isValid]);

	const iconAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: iconOpacity.value,
			transform: [{ scale: iconScale.value }],
		};
	});

	const checkmarkAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: checkmarkScale.value }],
		};
	});

	const textAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: textOpacity.value,
		};
	});

	return (
		<View className="flex-row items-center">
			<Animated.View style={iconAnimatedStyle}>
				<View
					className={`w-5 h-5 rounded-full items-center justify-center relative ${
						isValid
							? "bg-brand-100 border border-brand-300" // Brand green for valid states
							: "bg-cream-100 border border-cream-300" // Brand neutral for invalid states
					}`}
				>
					{isValid ? (
						<Animated.View style={checkmarkAnimatedStyle}>
							<Ionicons name="checkmark" size={12} color="#5E994B" />
						</Animated.View>
					) : (
						<Ionicons name={rule.icon} size={10} color="#636059" />
					)}
				</View>
			</Animated.View>

			<Animated.View style={textAnimatedStyle} className="flex-1 ml-3">
				<BodyText
					className={`text-sm ${
						isValid
							? "text-brand-700 font-paragraph-medium" // Brand green text for valid
							: "text-cream-600 font-paragraph" // Brand neutral text for invalid
					}`}
				>
					{rule.label}
				</BodyText>
			</Animated.View>
		</View>
	);
}
