import React from "react";
import { View } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type DesignSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function DesignSection({
  formValues,
  updateFormValues,
}: DesignSectionProps) {
  return (
    <View className="space-y-5 px-4">
      {/* Location Types */}
      <CollapsibleSection
        title="Landscape Location"
        icon="location-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="Location"
            placeholder="Select landscape locations"
            items={LOOKUP_TABLES.landscape_location}
            value={formValues.landscape_location_ids || []}
            onChange={(value: number[]) =>
              updateFormValues("landscape_location_ids", value)
            }
          />
        </View>
      </CollapsibleSection>

      {/* Garden Themes */}
      <CollapsibleSection
        title="Garden Theme"
        icon="color-palette-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="Garden Themes"
            placeholder="Select garden themes"
            items={LOOKUP_TABLES.landscape_theme}
            value={formValues.landscape_theme_ids}
            onChange={(value: number[]) =>
              updateFormValues("landscape_theme_ids", value)
            }
          />
        </View>
      </CollapsibleSection>

      {/* Design Features */}
      {LOOKUP_TABLES.design_feature && (
        <CollapsibleSection
          title="Design Features"
          icon="grid-outline"
          initiallyExpanded={true}
        >
          <View className="mt-2">
            <BetterSelector
              label="Design Features"
              placeholder="Select design features"
              items={LOOKUP_TABLES.design_feature}
              value={formValues.design_feature_ids}
              onChange={(value: number[]) =>
                updateFormValues("design_feature_ids", value)
              }
            />
          </View>
        </CollapsibleSection>
      )}
    </View>
  );
}
