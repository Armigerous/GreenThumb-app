import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, TitleText } from "../../UI/Text";
import Selector from "../../UI/Selector";
import { LOOKUP_TABLES, getOrderedOptions } from "@/lib/gardenHelpers";

type StyleStepProps = {
  landscapeThemeIds: number[];
  onLandscapeThemeChange: (value: number[]) => void;
};

export default function StyleStep({
  landscapeThemeIds,
  onLandscapeThemeChange,
}: StyleStepProps) {
  return (
    <View className="space-y-6">
      <View className="mb-6">
        <TitleText className="text-2xl mb-2">Pick a Garden Style</TitleText>
        <BodyText className="text-cream-600 leading-relaxed">
          Choose a style if you want specific types of plants, or skip this for
          now and add it later.
        </BodyText>
      </View>

      <Selector
        label="Garden Style (Optional)"
        required={false}
        placeholder="e.g. Cottage, Modern, Rock Garden"
        items={getOrderedOptions("landscape_theme")}
        value={landscapeThemeIds}
        multiple={true}
        onChange={onLandscapeThemeChange}
        helpExplanation="Choose a style if you want specific types of plants. This helps us suggest plants that match your vision."
      />

      {/* Advanced options callout - brand-compliant styling */}
      <View className="bg-brand-50 border-l-4 border-brand-300 rounded-r-lg p-4">
        <View className="flex-row items-start">
          <Ionicons
            name="settings-outline"
            size={16}
            color="#5E994B"
            className="mt-1 mr-3"
          />
          <View className="flex-1">
            <BodyText className="text-brand-600 font-paragraph-semibold mb-1">
              Want more options?
            </BodyText>
            <BodyText className="text-cream-700 text-sm leading-relaxed">
              After creating your garden, you can add soil pH, drainage, and
              other advanced features.
            </BodyText>
          </View>
        </View>
      </View>
    </View>
  );
}
