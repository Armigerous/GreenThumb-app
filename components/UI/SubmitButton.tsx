import { TouchableOpacity, Text, View } from "react-native";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";

/**
 * SubmitButton component for form submissions with loading state
 */
interface SubmitButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  isDisabled?: boolean;
  loadingLabel?: string;
  isLoading?: boolean;
  color?: "primary" | "secondary" | "destructive";
  type?: "solid" | "outline";
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  iconSize?: number;
  width?: "auto" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

export default function SubmitButton({
  children,
  onPress,
  isDisabled = false,
  loadingLabel = "Submitting...",
  isLoading = false,
  color = "primary",
  type = "solid",
  iconName,
  iconPosition = "right",
  iconSize = 18,
  width = "auto",
  size = "md",
  className = "",
  iconOnly = false,
}: SubmitButtonProps) {
  // Determine button styles based on variant and states
  let buttonClass = "";
  let textClass = "";
  let spinnerColor = "white";

  const isButtonDisabled = isDisabled || isLoading;

  // Size classes with special handling for icon-only mode
  const sizeClasses = {
    sm: iconOnly ? "p-2" : "py-2 px-4",
    md: iconOnly ? "p-3" : "py-3 px-6",
    lg: iconOnly ? "p-4" : "py-4 px-8",
  };

  // Width classes
  const widthClass = width === "full" ? "w-full" : "";

  // Apply appropriate styles based on variant and disabled state
  if (color === "primary") {
    if (type === "outline") {
      buttonClass = isButtonDisabled
        ? "bg-transparent border border-brand-300 opacity-70"
        : "bg-transparent border border-primary";
      textClass = isButtonDisabled ? "text-brand-300" : "text-primary";
      spinnerColor = "#047857"; // Brand color
    } else {
      buttonClass = isButtonDisabled
        ? "bg-brand-300 border border-brand-400 opacity-70"
        : "bg-primary";
      textClass = "text-primary-foreground";
      spinnerColor = "white";
    }
  } else if (color === "secondary") {
    if (type === "outline") {
      buttonClass = isButtonDisabled
        ? "bg-transparent border border-cream-500 opacity-70"
        : "bg-transparent border border-cream-500";
      textClass = isButtonDisabled ? "text-cream-400" : "text-cream-600";
      spinnerColor = "#047857";
    } else {
      buttonClass = isButtonDisabled
        ? "border border-accent-400 bg-accent-300 opacity-70"
        : "border border-accent-400 bg-accent-200";
      textClass = isButtonDisabled ? "text-accent-500" : "text-foreground";
      spinnerColor = "#047857"; // Brand color for better visibility on light background
    }
  } else if (color === "destructive") {
    if (type === "outline") {
      buttonClass = isButtonDisabled
        ? "bg-transparent border border-red-300 opacity-70"
        : "bg-transparent border border-red-500";
      textClass = isButtonDisabled ? "text-red-300" : "text-red-500";
      spinnerColor = "#EF4444"; // Red
    } else {
      buttonClass = isButtonDisabled ? "bg-red-300 opacity-70" : "bg-red-500";
      textClass = "text-white";
      spinnerColor = "white";
    }
  }

  // Determine icon color based on button color and type
  const getIconColor = () => {
    if (isButtonDisabled) {
      if (type === "outline") {
        if (color === "primary") return "#64A583"; // Lighter primary
        if (color === "destructive") return "#F87171"; // Lighter red
        return "#9CA3AF"; // Light gray
      }
      return "#ffffff";
    }

    if (type === "outline") {
      if (color === "primary") return "#047857"; // Primary color
      if (color === "destructive") return "#EF4444"; // Red
      return "#4B5563"; // Dark gray
    }

    return color === "secondary" ? "#047857" : "#ffffff";
  };

  return (
    <TouchableOpacity
      className={`rounded-lg ${sizeClasses[size]} ${buttonClass} ${widthClass} ${className}`}
      onPress={onPress}
      disabled={isButtonDisabled}
      accessible={!isButtonDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isButtonDisabled, busy: isLoading }}
      accessibilityHint={isLoading ? "Processing, please wait" : undefined}
    >
      <View
        className={`flex-row items-center justify-center ${
          width === "full" ? "w-full" : ""
        }`}
      >
        {isLoading ? (
          <View className="flex-row items-center space-x-2">
            <CompactSpinner size={18} color={spinnerColor} />
            <Text className={`font-medium ${textClass} ml-2`}>
              {loadingLabel}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-center">
            {iconName && (iconPosition === "left" || iconOnly) && (
              <Ionicons
                name={iconName}
                size={iconOnly ? iconSize + 4 : iconSize}
                color={getIconColor()}
                style={{ marginRight: iconOnly ? 0 : 6 }}
              />
            )}

            {!iconOnly &&
              (typeof children === "string" ? (
                <Text className={`font-medium ${textClass} text-center`}>
                  {children}
                </Text>
              ) : (
                children
              ))}

            {iconName && iconPosition === "right" && !iconOnly && (
              <Ionicons
                name={iconName}
                size={iconSize}
                color={getIconColor()}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
