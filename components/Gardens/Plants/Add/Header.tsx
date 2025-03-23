import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/**
 * Header component for the Add Plant flow
 *
 * This component displays the title and back button, handling navigation.
 * It can be reused across different screens with custom titles.
 *
 * @param title - The title to display in the header
 * @param onBackPress - Optional custom back button handler
 * @param currentStep - Current step in a multi-step flow (optional)
 */
interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  currentStep?: number;
}

export default function Header({
  title,
  onBackPress,
  currentStep,
}: HeaderProps) {
  const router = useRouter();

  // Default back handler navigates to the gardens screen
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.push("/(home)/gardens");
    }
  };

  return (
    <View className="pt-5 px-4 flex-row items-center mb-4">
      <TouchableOpacity onPress={handleBackPress} className="mr-4">
        <Ionicons name="arrow-back" size={24} color="#2e2c29" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-foreground flex-1">{title}</Text>
    </View>
  );
}
