import React from "react";
import { View, Text } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import HelpIcon from "@/components/UI/HelpIcon";

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
            <View className="flex-row items-center mb-2">
              <Text className="text-foreground font-medium text-base">
                Plant Types
              </Text>
              <HelpIcon
                title="Plant Types"
                explanation="Choose the types of plants you'd like in your garden. This helps us recommend the right mix of plants for your space. Consider a mix of annuals (live one season), perennials (return year after year), shrubs, trees, and edibles for a diverse garden."
              />
            </View>
            <BetterSelector
              label="Plant Types"
              placeholder="Select plant types"
              items={LOOKUP_TABLES.plant_type}
              value={formValues.plant_type_ids}
              onChange={(value: number[]) =>
                updateFormValues("plant_type_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </CollapsibleSection>
      )}

      {/* Plant Form/Habit */}
      {LOOKUP_TABLES.habit_form && (
        <CollapsibleSection title="Plant Form/Habit" icon="git-branch-outline">
          <View className="mt-2">
            <View className="flex-row items-center mb-2">
              <Text className="text-foreground font-medium text-base">
                Plant Form/Habit
              </Text>
              <HelpIcon
                title="Plant Form/Habit"
                explanation="Plant habit describes the natural growth pattern and shape of plants. Different forms create visual interest and structure. Mixing different forms (upright, spreading, mounding, etc.) creates a more interesting garden with layers and texture."
              />
            </View>
            <BetterSelector
              label="Plant Form/Habit"
              placeholder="Select plant forms"
              items={LOOKUP_TABLES.habit_form}
              value={formValues.habit_form_ids}
              onChange={(value: number[]) =>
                updateFormValues("habit_form_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </CollapsibleSection>
      )}

      {/* Garden Themes */}
      <CollapsibleSection title="Garden Theme" icon="color-palette-outline">
        <View className="mt-2">
          <View className="flex-row items-center mb-2">
            <Text className="text-foreground font-medium text-base">
              Garden Themes
            </Text>
            <HelpIcon
              title="Garden Themes"
              explanation="Garden themes help create cohesive designs with specific purposes or aesthetics. Choose themes that match your interests. Themed gardens (pollinator, cottage, native, etc.) provide focus for your plant choices and can better serve specific purposes."
            />
          </View>
          <BetterSelector
            label="Garden Themes"
            placeholder="Select garden themes"
            items={LOOKUP_TABLES.landscape_theme}
            value={formValues.landscape_theme_ids}
            onChange={(value: number[]) =>
              updateFormValues("landscape_theme_ids", value)
            }
            labelHidden={true}
          />
        </View>
      </CollapsibleSection>

      {/* Plant Aesthetics */}
      <CollapsibleSection title="Plant Aesthetics" icon="flower-outline">
        <View className="mt-2 space-y-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-foreground font-medium text-base">
              Plant Aesthetics
            </Text>
            <HelpIcon
              title="Plant Aesthetics"
              explanation="The visual elements of your garden determine its appearance throughout the seasons. Choose colors and features that appeal to you."
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Flower Colors</Text>
              <HelpIcon explanation="Choose colors that complement each other. Consider using a color scheme (analogous, complementary, etc.) for a cohesive look." />
            </View>
            <BetterSelector
              label="Flower Colors"
              placeholder="Select flower colors"
              items={LOOKUP_TABLES.flower_color}
              value={formValues.flower_color_ids}
              onChange={(value: number[]) =>
                updateFormValues("flower_color_ids", value)
              }
              labelHidden={true}
            />
          </View>

          {LOOKUP_TABLES.flower_bloom_time && (
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-cream-700">
                  Flower Bloom Time
                </Text>
                <HelpIcon explanation="Selecting plants with different bloom times ensures your garden has color throughout the growing season." />
              </View>
              <BetterSelector
                label="Flower Bloom Time"
                placeholder="Select bloom times"
                items={LOOKUP_TABLES.flower_bloom_time}
                value={formValues.flower_bloom_time_ids}
                onChange={(value: number[]) =>
                  updateFormValues("flower_bloom_time_ids", value)
                }
                labelHidden={true}
              />
            </View>
          )}

          {LOOKUP_TABLES.flower_value_to_gardener && (
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-cream-700">
                  Flower Value to Gardener
                </Text>
                <HelpIcon explanation="These qualities add extra value to your garden, such as fragrance, cut flowers, or long-lasting blooms." />
              </View>
              <BetterSelector
                label="Flower Value to Gardener"
                placeholder="Select flower values"
                items={LOOKUP_TABLES.flower_value_to_gardener}
                value={formValues.flower_value_to_gardener_ids}
                onChange={(value: number[]) =>
                  updateFormValues("flower_value_to_gardener_ids", value)
                }
                labelHidden={true}
              />
            </View>
          )}

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Leaf Colors</Text>
              <HelpIcon explanation="Leaf color provides visual interest even when plants aren't flowering and can add contrast to your garden design." />
            </View>
            <BetterSelector
              label="Leaf Colors"
              placeholder="Select leaf colors"
              items={LOOKUP_TABLES.leaf_color}
              value={formValues.leaf_color_ids}
              onChange={(value: number[]) =>
                updateFormValues("leaf_color_ids", value)
              }
              labelHidden={true}
            />
          </View>

          {LOOKUP_TABLES.leaf_feel && (
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-cream-700">Leaf Feel</Text>
                <HelpIcon explanation="Leaf texture adds sensory interest to your garden through touch, creating a more engaging experience." />
              </View>
              <BetterSelector
                label="Leaf Feel"
                placeholder="Select leaf textures"
                items={LOOKUP_TABLES.leaf_feel}
                value={formValues.leaf_feel_ids}
                onChange={(value: number[]) =>
                  updateFormValues("leaf_feel_ids", value)
                }
                labelHidden={true}
              />
            </View>
          )}

          {LOOKUP_TABLES.leaf_value && (
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-cream-700">Leaf Value</Text>
                <HelpIcon explanation="These qualities highlight special features of leaves beyond their appearance, such as edibility or fragrance." />
              </View>
              <BetterSelector
                label="Leaf Value"
                placeholder="Select leaf values"
                items={LOOKUP_TABLES.leaf_value}
                value={formValues.leaf_value_ids}
                onChange={(value: number[]) =>
                  updateFormValues("leaf_value_ids", value)
                }
                labelHidden={true}
              />
            </View>
          )}

          {LOOKUP_TABLES.fall_color && (
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-sm text-cream-700">Fall Colors</Text>
                <HelpIcon explanation="Fall color extends your garden's seasonal interest with beautiful foliage when flowering has ended." />
              </View>
              <BetterSelector
                label="Fall Colors"
                placeholder="Select fall colors"
                items={LOOKUP_TABLES.fall_color}
                value={formValues.fall_color_ids}
                onChange={(value: number[]) =>
                  updateFormValues("fall_color_ids", value)
                }
                labelHidden={true}
              />
            </View>
          )}

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Texture Preference</Text>
              <HelpIcon explanation="Plant texture (fine, medium, coarse) affects the overall feel of your garden. Mix textures for visual interest." />
            </View>
            <BetterSelector
              label="Texture Preference"
              placeholder="Select texture preference"
              items={LOOKUP_TABLES.texture}
              value={formValues.texture_id}
              onChange={(value: number | null) =>
                updateFormValues("texture_id", value)
              }
              multiple={false}
              labelHidden={true}
            />
          </View>
        </View>
      </CollapsibleSection>

      {/* Design Features */}
      {LOOKUP_TABLES.design_feature && (
        <CollapsibleSection title="Design Features" icon="grid-outline">
          <View className="mt-2">
            <View className="flex-row items-center mb-2">
              <Text className="text-foreground font-medium text-base">
                Design Features
              </Text>
              <HelpIcon
                title="Design Features"
                explanation="Design features describe how plants will be used in your landscape for specific functions or visual effects. Consider how plants will function in your space - as specimens, borders, hedges, groundcovers, or for privacy."
              />
            </View>
            <BetterSelector
              label="Design Features"
              placeholder="Select design features"
              items={LOOKUP_TABLES.design_feature}
              value={formValues.design_feature_ids}
              onChange={(value: number[]) =>
                updateFormValues("design_feature_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </CollapsibleSection>
      )}
    </View>
  );
}
