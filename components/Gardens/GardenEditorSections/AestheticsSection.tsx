import React from "react";
import { View } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import Selector from "@/components/UI/Selector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type AestheticsSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function AestheticsSection({
  formValues,
  updateFormValues,
}: AestheticsSectionProps) {
  return (
    <View className="space-y-5 px-4">
      {/* Flower Characteristics */}
      <CollapsibleSection
        title="Flower Characteristics"
        icon="color-palette-outline"
      >
        <View className="mt-2">
          <Selector
            label="Flower Colors"
            placeholder="Select flower colors"
            items={LOOKUP_TABLES.flower_color}
            value={formValues.flower_color_ids}
            onChange={(value: number[]) =>
              updateFormValues("flower_color_ids", value)
            }
          />

          {LOOKUP_TABLES.flower_bloom_time && (
            <View className="mt-4">
              <Selector
                label="Flower Bloom Times"
                placeholder="Select flower bloom times"
                items={LOOKUP_TABLES.flower_bloom_time}
                value={formValues.flower_bloom_time_ids}
                onChange={(value: number[]) =>
                  updateFormValues("flower_bloom_time_ids", value)
                }
              />
            </View>
          )}

          {LOOKUP_TABLES.flower_value_to_gardener && (
            <View className="mt-4">
              <Selector
                label="Flower Value to Gardener"
                placeholder="Select flower values"
                items={LOOKUP_TABLES.flower_value_to_gardener}
                value={formValues.flower_value_to_gardener_ids}
                onChange={(value: number[]) =>
                  updateFormValues("flower_value_to_gardener_ids", value)
                }
              />
            </View>
          )}
        </View>
      </CollapsibleSection>

      {/* Leaf Characteristics */}
      <CollapsibleSection title="Leaf Characteristics" icon="leaf-outline">
        <View className="mt-2">
          <Selector
            label="Leaf Colors"
            placeholder="Select leaf colors"
            items={LOOKUP_TABLES.leaf_color}
            value={formValues.leaf_color_ids}
            onChange={(value: number[]) =>
              updateFormValues("leaf_color_ids", value)
            }
          />

          {LOOKUP_TABLES.leaf_feel && (
            <View className="mt-4">
              <Selector
                label="Leaf Feel"
                placeholder="Select leaf textures"
                items={LOOKUP_TABLES.leaf_feel}
                value={formValues.leaf_feel_ids}
                onChange={(value: number[]) =>
                  updateFormValues("leaf_feel_ids", value)
                }
              />
            </View>
          )}

          {LOOKUP_TABLES.leaf_value && (
            <View className="mt-4">
              <Selector
                label="Leaf Value"
                placeholder="Select leaf values"
                items={LOOKUP_TABLES.leaf_value}
                value={formValues.leaf_value_ids}
                onChange={(value: number[]) =>
                  updateFormValues("leaf_value_ids", value)
                }
              />
            </View>
          )}
        </View>
      </CollapsibleSection>

      {/* Fall Color */}
      {LOOKUP_TABLES.fall_color && (
        <CollapsibleSection title="Fall Colors" icon="snow-outline">
          <View className="mt-2">
            <Selector
              label="Fall Colors"
              placeholder="Select fall colors"
              items={LOOKUP_TABLES.fall_color}
              value={formValues.fall_color_ids}
              onChange={(value: number[]) =>
                updateFormValues("fall_color_ids", value)
              }
            />
          </View>
        </CollapsibleSection>
      )}

      {/* Texture */}
      <CollapsibleSection title="Texture" icon="grid-outline">
        <View className="mt-2">
          <Selector
            label="Texture Preference"
            placeholder="Select texture preference"
            items={LOOKUP_TABLES.texture}
            value={formValues.texture_id || formValues.texture_preference_id}
            onChange={(value) => updateFormValues("texture_id", value)}
            multiple={false}
          />
        </View>
      </CollapsibleSection>
    </View>
  );
}
