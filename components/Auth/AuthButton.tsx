import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { TitleText } from "@/components/UI/Text";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, useWindowDimensions } from "react-native";

type AuthButtonProps = {
  onPress: () => void;
  isLoading?: boolean;
  loading?: boolean; // Alternative prop name for consistency
  label?: string;
  title?: string; // Alternative prop name for consistency
  loadingLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
};

export function AuthButton({
  onPress,
  isLoading = false,
  loading = false,
  label,
  title,
  loadingLabel,
  icon,
  disabled = false,
  variant = "primary",
  size = "medium",
}: AuthButtonProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  // Use either label or title prop
  const buttonText = label || title || "Continue";
  const isButtonLoading = isLoading || loading;

  // Size-based styling
  const sizeClasses = {
    small: "px-3 py-2",
    medium: "px-4 py-3",
    large: "px-6 py-4",
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  // Variant-based styling
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border-2 border-primary",
  };

  const textColorClasses = {
    primary: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-primary",
  };

  const iconColor = {
    primary: "#fffefa",
    secondary: "#2e2c29",
    outline: "#5E994B",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonLoading || disabled}
      className={`flex-row items-center justify-center rounded-lg ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        isButtonLoading || disabled ? "opacity-60" : ""
      }`}
      activeOpacity={0.8}
    >
      {icon && !isButtonLoading && (
        <Ionicons
          name={icon}
          size={iconSizes[size]}
          color={iconColor[variant]}
          style={{ marginRight: 8 }}
        />
      )}
      {isButtonLoading ? (
        <>
          <CompactSpinner size={iconSizes[size]} color={iconColor[variant]} />
          <TitleText
            className={`${textColorClasses[variant]} ml-2 ${
              size === "small"
                ? "text-base"
                : size === "large"
                ? "text-xl"
                : "text-lg"
            }`}
          >
            {loadingLabel || "Loading..."}
          </TitleText>
        </>
      ) : (
        <TitleText
          className={`${textColorClasses[variant]} ${
            size === "small"
              ? "text-base"
              : size === "large"
              ? "text-xl font-paragraph-semibold"
              : "text-lg font-paragraph-medium"
          }`}
        >
          {buttonText}
        </TitleText>
      )}
    </TouchableOpacity>
  );
}
