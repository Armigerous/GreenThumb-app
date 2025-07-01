import { TouchableOpacity, View, TextInput } from "react-native";
import { BodyText, TitleText } from "../../UI/Text";
import HelpIcon from "../../UI/HelpIcon";

type GardenNameStepProps = {
  name: string;
  onNameChange: (name: string) => void;
  gardenNameSuggestions: string[];
};

export default function GardenNameStep({
  name,
  onNameChange,
  gardenNameSuggestions,
}: GardenNameStepProps) {
  return (
    <View className="space-y-6">
      <View className="mb-6">
        <TitleText className="text-3xl mb-2">Name Your Garden</TitleText>
        <BodyText>
          Give your garden a name that helps you identify it and makes it feel
          like home.
        </BodyText>
      </View>

      <View>
        <View className="flex-row items-center mb-2">
          <TitleText className="text-lg">Garden Name</TitleText>
          <BodyText className="text-destructive ml-1">*</BodyText>
          <HelpIcon
            title="Garden Name"
            explanation="Give your garden a name that helps you identify it, like 'Front Yard', 'Herb Garden', or 'Balcony Plants'."
          />
        </View>
        <TextInput
          className="border border-cream-300 rounded-lg p-3.5 bg-cream-50"
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g., Front Yard Garden, Balcony Plants"
          placeholderTextColor="#9e9a90"
          autoFocus
        />

        {/* Garden name suggestions */}
        {gardenNameSuggestions.length > 0 && (
          <View className="mt-3">
            <BodyText className="text-cream-600 mb-2 text-sm">
              Tap a suggestion to use:
            </BodyText>
            <View className="flex-row flex-wrap gap-2">
              {gardenNameSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-brand-100 border border-brand-300 rounded-xl px-3 py-2"
                  onPress={() => onNameChange(suggestion)}
                >
                  <BodyText className="text-brand-700 text-sm">
                    {suggestion}
                  </BodyText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
