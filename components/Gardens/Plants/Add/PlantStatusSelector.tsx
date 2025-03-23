import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserPlant } from "@/types/garden";

/**
 * Plant status option type definition
 */
export interface StatusOption {
  value: UserPlant["status"];
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}

/**
 * PlantStatusSelector component for selecting plant health status
 *
 * Displays a list of plant status options with appropriate icons and colors.
 *
 * @param selectedStatus - The currently selected status
 * @param onStatusChange - Callback function when a status is selected
 * @param customOptions - Optional custom status options (defaults provided if not specified)
 */
interface PlantStatusSelectorProps {
  selectedStatus: UserPlant["status"];
  onStatusChange: (status: UserPlant["status"]) => void;
  customOptions?: StatusOption[];
}

export default function PlantStatusSelector({
  selectedStatus,
  onStatusChange,
  customOptions,
}: PlantStatusSelectorProps) {
  // Default status options
  const defaultOptions: StatusOption[] = [
    {
      value: "Healthy",
      label: "Healthy",
      icon: "checkmark-circle",
      color: "#059669",
    },
    {
      value: "Needs Water",
      label: "Needs Water",
      icon: "water",
      color: "#d97706",
    },
    {
      value: "Wilting",
      label: "Wilting",
      icon: "alert-circle",
      color: "#dc2626",
    },
    {
      value: "Dormant",
      label: "Dormant",
      icon: "moon",
      color: "#d97706",
    },
    {
      value: "Dead",
      label: "Dead",
      icon: "skull",
      color: "#991b1b",
    },
  ];

  // Use custom options if provided, otherwise use defaults
  const statusOptions = customOptions || defaultOptions;

  return (
    <View className="mb-6">
      <Text className="text-base font-medium mb-2">Current Status</Text>
      <View className="flex-row flex-wrap">
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`mr-2 mb-2 p-2 rounded-lg border flex-row items-center ${
              selectedStatus === option.value
                ? "border-brand-500 bg-brand-50"
                : "border-cream-400 bg-white"
            }`}
            onPress={() => onStatusChange(option.value)}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={option.color}
              style={{ marginRight: 4 }}
            />
            <Text
              className={
                selectedStatus === option.value
                  ? "text-brand-700 font-medium"
                  : "text-cream-700"
              }
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
