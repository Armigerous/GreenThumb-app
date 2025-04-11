import React from "react";
import { View } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type PlantsSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function PlantsSection({
  formValues,
  updateFormValues,
}: PlantsSectionProps) {
  return (
    <View className="space-y-5 px-4">
      {/* Plant Types */}
      {LOOKUP_TABLES.plant_type && (
        <CollapsibleSection title="Plant Types" icon="leaf-outline">
          <View className="mt-2">
            <BetterSelector
              label="Plant Types"
              placeholder="Select plant types"
              items={LOOKUP_TABLES.plant_type}
              value={formValues.plant_type_ids}
              onChange={(value: number[]) =>
                updateFormValues("plant_type_ids", value)
              }
            />
          </View>
        </CollapsibleSection>
      )}

      {/* Plant Form/Habit */}
      {LOOKUP_TABLES.habit_form && (
        <CollapsibleSection title="Plant Form/Habit" icon="git-branch-outline">
          <View className="mt-2">
            <BetterSelector
              label="Plant Form/Habit"
              placeholder="Select plant forms"
              items={LOOKUP_TABLES.habit_form}
              value={formValues.habit_form_ids}
              onChange={(value: number[]) =>
                updateFormValues("habit_form_ids", value)
              }
            />
          </View>
        </CollapsibleSection>
      )}

      {/* Growth Rate */}
      <CollapsibleSection title="Growth" icon="trending-up-outline">
        <View className="mt-2">
          <BetterSelector
            label="Growth Rate"
            placeholder="Select growth rate preference"
            items={LOOKUP_TABLES.growth_rate}
            value={formValues.growth_rate_id}
            onChange={(value) => updateFormValues("growth_rate_id", value)}
            multiple={false}
          />
        </View>
      </CollapsibleSection>

      {/* Wildlife */}
      <CollapsibleSection title="Wildlife & Challenges" icon="paw-outline">
        <View className="mt-2 space-y-1">
          <BetterSelector
            label="Attracts Wildlife"
            placeholder="Select wildlife attractions"
            items={LOOKUP_TABLES.attracts}
            value={formValues.attracts_ids}
            onChange={(value: number[]) =>
              updateFormValues("attracts_ids", value)
            }
          />

          <BetterSelector
            label="Resistance Challenges"
            placeholder="Select resistance challenges"
            items={LOOKUP_TABLES.resistance_to_challenges}
            value={formValues.resistance_to_challenges_ids}
            onChange={(value: number[]) =>
              updateFormValues("resistance_to_challenges_ids", value)
            }
          />

          <BetterSelector
            label="Problems to Exclude"
            placeholder="Select problems to exclude"
            items={LOOKUP_TABLES.problems}
            value={formValues.problems_ids}
            onChange={(value: number[]) =>
              updateFormValues("problems_ids", value)
            }
          />
        </View>
      </CollapsibleSection>
    </View>
  );
}
