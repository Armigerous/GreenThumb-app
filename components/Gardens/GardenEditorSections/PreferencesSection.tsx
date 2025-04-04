import React from "react";
import { View, Text, Switch } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type PreferencesSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function PreferencesSection({
  formValues,
  updateFormValues,
}: PreferencesSectionProps) {
  return (
    <View className="space-y-5 px-4">
      {/* Maintenance */}
      <CollapsibleSection
        title="Maintenance"
        icon="construct-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="Maintenance Level"
            placeholder="Select maintenance level"
            items={LOOKUP_TABLES.maintenance}
            value={formValues.maintenance_id || formValues.maintenance_level_id}
            onChange={(value) => updateFormValues("maintenance_id", value)}
            multiple={false}
          />
        </View>
      </CollapsibleSection>

      {/* User Preferences */}
      <CollapsibleSection
        title="Garden Preferences"
        icon="options-outline"
        initiallyExpanded={true}
      >
        <View className="p-4 bg-cream-50 border border-cream-300 rounded-lg mt-2">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium text-base mb-0.5">
                Plant Recommendations
              </Text>
              <Text className="text-sm text-gray-600">
                Get personalized plant suggestions
              </Text>
            </View>
            <Switch
              value={formValues.wants_recommendations}
              onValueChange={(val) =>
                updateFormValues("wants_recommendations", val)
              }
              trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
              thumbColor={
                formValues.wants_recommendations ? "#77B860" : "#f4f4f5"
              }
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium text-base mb-0.5">
                Year-round Interest
              </Text>
              <Text className="text-sm text-gray-600">
                Plants that look good all seasons
              </Text>
            </View>
            <Switch
              value={formValues.year_round_interest}
              onValueChange={(val) =>
                updateFormValues("year_round_interest", val)
              }
              trackColor={{ false: "#d1d5db", true: "#a7f3d0" }}
              thumbColor={
                formValues.year_round_interest ? "#77B860" : "#f4f4f5"
              }
            />
          </View>
        </View>
      </CollapsibleSection>
    </View>
  );
}
