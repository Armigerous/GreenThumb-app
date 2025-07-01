import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, TitleText } from "../../UI/Text";
import HelpIcon from "../../UI/HelpIcon";
import Selector from "../../UI/Selector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

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

      <View>
        <View className="flex-row items-center mb-2">
          <TitleText className="text-lg">Garden Style</TitleText>
          <BodyText className="text-cream-500 ml-2 text-sm">
            (Optional)
          </BodyText>
          <HelpIcon
            title="Garden Style"
            explanation="Choose a style if you want specific types of plants. This helps us suggest plants that match your vision."
          />
        </View>

        <Selector
          label=""
          placeholder="e.g. Cottage, Modern, Rock Garden"
          items={LOOKUP_TABLES.landscape_theme}
          value={landscapeThemeIds}
          onChange={onLandscapeThemeChange}
        />
      </View>

      {/* Advanced options callout - improved styling */}
      <View className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
        <View className="flex-row items-start">
          <Ionicons
            name="settings-outline"
            size={16}
            color="#22C55E"
            className="mt-1 mr-3"
          />
          <View className="flex-1">
            <BodyText className="text-green-800 font-medium mb-1">
              Want more options?
            </BodyText>
            <BodyText className="text-green-700 text-sm leading-relaxed">
              After creating your garden, you can add soil pH, drainage, and
              other advanced features.
            </BodyText>
          </View>
        </View>
      </View>
    </View>
  );
}
