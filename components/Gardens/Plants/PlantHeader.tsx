import SubmitButton from "@/components/UI/SubmitButton";
import { View } from "react-native";
import React from "react";

/**
 * Header for the plant detail screen.
 * Shows Back and Edit buttons.
 * @param onBack - callback for back navigation
 * @param onEdit - callback to open edit modal
 * @param className - optional styling
 */
interface PlantHeaderProps {
  onBack: () => void;
  onEdit: () => void;
  className?: string;
}

const PlantHeader: React.FC<PlantHeaderProps> = ({
  onBack,
  onEdit,
  className,
}) => (
  <View className={`pt-safe pb-4 ${className || ""}`}>
    <View className="flex-row justify-between items-center px-5">
      <SubmitButton
        onPress={onBack}
        iconName="arrow-back"
        iconPosition="left"
        type="outline"
        color="secondary"
        className="border-transparent"
      >
        Back
      </SubmitButton>
      <SubmitButton
        onPress={onEdit}
        iconName="create-outline"
        iconPosition="left"
      >
        Edit
      </SubmitButton>
    </View>
  </View>
);

export default PlantHeader;
