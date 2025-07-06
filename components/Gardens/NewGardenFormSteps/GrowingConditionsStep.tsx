import { View } from "react-native";
import { BodyText, TitleText } from "../../UI/Text";
import Selector from "../../UI/Selector";
import { LOOKUP_TABLES, getOrderedOptions } from "@/lib/gardenHelpers";

type GrowingConditionsStepProps = {
  lightId: number | null;
  soilTextureId: number | null;
  availableSpaceToPlantId: number | null;
  maintenanceId: number | null;
  growthRateIds: number[];
  onLightChange: (value: number | null) => void;
  onSoilTextureChange: (value: number | null) => void;
  onAvailableSpaceChange: (value: number | null) => void;
  onMaintenanceChange: (value: number | null) => void;
  onGrowthRateChange: (value: number[]) => void;
};

export default function GrowingConditionsStep({
  lightId,
  soilTextureId,
  availableSpaceToPlantId,
  maintenanceId,
  growthRateIds,
  onLightChange,
  onSoilTextureChange,
  onAvailableSpaceChange,
  onMaintenanceChange,
  onGrowthRateChange,
}: GrowingConditionsStepProps) {
  return (
    <View>
      <View className="mb-6">
        <TitleText className="text-2xl mb-2">
          What&apos;s Your Garden Like?
        </TitleText>
        <BodyText className="text-cream-600 leading-relaxed">
          These 5 things help us find plants that will work in your garden and
          tell you when to care for them.
        </BodyText>
      </View>

      {/* Sunlight - Required (Single Selection) */}
      <Selector
        label="How Much Sunlight Does Your Garden Get?"
        required
        placeholder="Choose your garden's sun exposure"
        items={getOrderedOptions("light")}
        value={lightId}
        multiple={false}
        onChange={onLightChange}
        helpExplanation="Different plants need different amounts of light to grow well. Full sun plants need 6+ hours of direct sunlight, while shade plants prefer indirect light."
      />

      {/* Soil Type - Required (Single Selection) */}
      <Selector
        label="What Does Your Soil Feel Like When Dry?"
        required
        placeholder="Describe your garden's soil texture"
        items={getOrderedOptions("soil_texture")}
        value={soilTextureId}
        multiple={false}
        onChange={onSoilTextureChange}
        helpExplanation="Soil texture affects how water drains. Clay soil holds water longer, sand drains quickly, and loam is in between. This helps us time your watering."
      />

      {/* Available Space - Required (Single Selection) */}
      <Selector
        label="How Much Room Do Your Plants Have?"
        required
        placeholder="Choose your available growing space"
        items={getOrderedOptions("available_space_to_plant")}
        value={availableSpaceToPlantId}
        multiple={false}
        onChange={onAvailableSpaceChange}
        helpExplanation="Plant size matters for your space. Small plants work in containers, medium plants need garden beds, and large plants need lots of room to spread."
      />

      {/* Maintenance Level - Required (Single Selection) */}
      <Selector
        label="How Much Time Can You Spend on Plant Care?"
        required
        placeholder="Choose your preferred time commitment"
        items={getOrderedOptions("maintenance")}
        value={maintenanceId}
        onChange={onMaintenanceChange}
        multiple={false}
        helpExplanation="Low maintenance plants need care once a week or less. High maintenance plants may need daily attention. We'll match plants to your schedule."
      />

      {/* Growth Rate - Required (Multiple Selection) */}
      <Selector
        label="Do You Want Quick Results or Long-Term Plants?"
        required
        placeholder="Choose between fast or slow growing plants"
        items={getOrderedOptions("growth_rate")}
        value={growthRateIds}
        onChange={onGrowthRateChange}
        multiple={true}
        helpExplanation="You can choose both fast and slow growing plants. Fast-growing plants show changes in weeks and give quick satisfaction. Slow-growing plants take months but often live longer and need less care."
      />
    </View>
  );
}
