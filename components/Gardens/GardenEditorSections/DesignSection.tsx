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
    <View className="space-y-5">
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

      {/* Garden Themes */}
      <CollapsibleSection title="Garden Theme" icon="color-palette-outline">
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

      {/* Plant Aesthetics */}
      <CollapsibleSection title="Plant Aesthetics" icon="flower-outline">
        <View className="mt-2 space-y-4">
          <BetterSelector
            label="Flower Colors"
            placeholder="Select flower colors"
            items={LOOKUP_TABLES.flower_color}
            value={formValues.flower_color_ids}
            onChange={(value: number[]) =>
              updateFormValues("flower_color_ids", value)
            }
          />
          {LOOKUP_TABLES.flower_bloom_time && (
            <BetterSelector
              label="Flower Bloom Time"
              placeholder="Select bloom times"
              items={LOOKUP_TABLES.flower_bloom_time}
              value={formValues.flower_bloom_time_ids}
              onChange={(value: number[]) =>
                updateFormValues("flower_bloom_time_ids", value)
              }
            />
          )}
          {LOOKUP_TABLES.flower_value_to_gardener && (
            <BetterSelector
              label="Flower Value to Gardener"
              placeholder="Select flower values"
              items={LOOKUP_TABLES.flower_value_to_gardener}
              value={formValues.flower_value_to_gardener_ids}
              onChange={(value: number[]) =>
                updateFormValues("flower_value_to_gardener_ids", value)
              }
            />
          )}
          <BetterSelector
            label="Leaf Colors"
            placeholder="Select leaf colors"
            items={LOOKUP_TABLES.leaf_color}
            value={formValues.leaf_color_ids}
            onChange={(value: number[]) =>
              updateFormValues("leaf_color_ids", value)
            }
          />
          {LOOKUP_TABLES.leaf_feel && (
            <BetterSelector
              label="Leaf Feel"
              placeholder="Select leaf textures"
              items={LOOKUP_TABLES.leaf_feel}
              value={formValues.leaf_feel_ids}
              onChange={(value: number[]) =>
                updateFormValues("leaf_feel_ids", value)
              }
            />
          )}
          {LOOKUP_TABLES.leaf_value && (
            <BetterSelector
              label="Leaf Value"
              placeholder="Select leaf values"
              items={LOOKUP_TABLES.leaf_value}
              value={formValues.leaf_value_ids}
              onChange={(value: number[]) =>
                updateFormValues("leaf_value_ids", value)
              }
            />
          )}
          {LOOKUP_TABLES.fall_color && (
            <BetterSelector
              label="Fall Colors"
              placeholder="Select fall colors"
              items={LOOKUP_TABLES.fall_color}
              value={formValues.fall_color_ids}
              onChange={(value: number[]) =>
                updateFormValues("fall_color_ids", value)
              }
            />
          )}
          <BetterSelector
            label="Texture Preference"
            placeholder="Select texture preference"
            items={LOOKUP_TABLES.texture}
            value={formValues.texture_id}
            onChange={(value: number | null) =>
              updateFormValues("texture_id", value)
            }
            multiple={false}
          />
        </View>
      </CollapsibleSection>

      {/* Design Features */}
      {LOOKUP_TABLES.design_feature && (
        <CollapsibleSection title="Design Features" icon="grid-outline">
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
