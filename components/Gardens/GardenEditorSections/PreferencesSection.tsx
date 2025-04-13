import React from "react";
import { View, Text, Switch } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import HelpIcon from "@/components/UI/HelpIcon";

type PreferencesSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function PreferencesSection({
  formValues,
  updateFormValues,
}: PreferencesSectionProps) {
  return (
    <View className="space-y-5">
      {/* Maintenance */}
      <CollapsibleSection title="Maintenance" icon="construct-outline">
        <View className="mt-2">
          <View className="flex-row items-center mb-2">
            <Text className="text-foreground font-medium text-base">
              Maintenance Level
            </Text>
            <HelpIcon
              title="Maintenance Level"
              explanation="Selecting your preferred maintenance level helps us recommend plants that match the time and effort you want to invest in your garden. Low maintenance gardens require less pruning, watering, and care, while high maintenance gardens may offer more seasonal variety but need more attention."
            />
          </View>
          <BetterSelector
            label="Maintenance Level"
            placeholder="Select maintenance level"
            items={LOOKUP_TABLES.maintenance}
            value={formValues.maintenance_id || formValues.maintenance_level_id}
            onChange={(value) => updateFormValues("maintenance_id", value)}
            multiple={false}
            labelHidden={true}
          />
        </View>
      </CollapsibleSection>

      {/* Space & Requirements */}
      <CollapsibleSection title="Space & Requirements" icon="resize-outline">
        <View className="mt-2 space-y-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-foreground font-medium text-base">
              Garden Requirements
            </Text>
            <HelpIcon
              title="Space & Requirements"
              explanation="These selections help us understand the practical aspects of your garden, including space limitations and environmental challenges."
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Available Space</Text>
              <HelpIcon explanation="Plants need appropriate space to grow to their mature size. This helps us recommend plants that fit your available area." />
            </View>
            <BetterSelector
              label="Available Space"
              placeholder="Select available space"
              items={LOOKUP_TABLES.available_space_to_plant}
              value={formValues.available_space_to_plant_ids}
              onChange={(value: number[]) =>
                updateFormValues("available_space_to_plant_ids", value)
              }
              labelHidden={true}
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">
                Resistance Challenges
              </Text>
              <HelpIcon explanation="Select challenges in your area (deer, drought, salt, etc.) to find plants that can withstand these conditions." />
            </View>
            <BetterSelector
              label="Resistance Challenges"
              placeholder="Select resistance challenges"
              items={LOOKUP_TABLES.resistance_to_challenges}
              value={formValues.resistance_to_challenges_ids}
              onChange={(value: number[]) =>
                updateFormValues("resistance_to_challenges_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </View>
      </CollapsibleSection>

      {/* User Preferences */}
      <CollapsibleSection title="Garden Preferences" icon="options-outline">
        <View className="mt-2">
          <View className="flex-row items-center mb-2">
            <Text className="text-foreground font-medium text-base">
              Additional Options
            </Text>
            <HelpIcon
              title="Garden Preferences"
              explanation="These additional options help us customize your garden experience to your specific interests and needs."
            />
          </View>
          <View className="p-4 bg-cream-50 border border-cream-300 rounded-lg mt-2">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-foreground font-medium text-base mb-0.5">
                  Plant Recommendations
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600">
                    Get personalized plant suggestions
                  </Text>
                  <HelpIcon
                    size={16}
                    explanation="We'll suggest plants that match your garden conditions and preferences to help you create a successful garden."
                  />
                </View>
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
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600">
                    Plants that look good all seasons
                  </Text>
                  <HelpIcon
                    size={16}
                    explanation="Prioritize plants that provide visual appeal in multiple seasons through flowers, foliage, berries, or structure."
                  />
                </View>
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
        </View>
      </CollapsibleSection>
    </View>
  );
}
