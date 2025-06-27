import React from "react";
import { View, Text } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";
import HelpIcon from "@/components/UI/HelpIcon";

type EnvironmentSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function EnvironmentSection({
  formValues,
  updateFormValues,
}: EnvironmentSectionProps) {
  return (
    <View className="space-y-5">
      {/* Sunlight */}
      <CollapsibleSection title="Sunlight" icon="sunny-outline">
        <View className="mt-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-medium text-base">
              Light Requirements
            </Text>
            <HelpIcon
              title="Sunlight"
              explanation="The amount of sunlight your garden receives affects which plants will thrive. Different plants have different light requirements."
            />
          </View>
          <BetterSelector
            label="Light Requirements"
            placeholder="Select sunlight conditions"
            items={LOOKUP_TABLES.light}
            value={formValues.light_ids}
            onChange={(value: number[]) => updateFormValues("light_ids", value)}
            labelHidden={true}
          />
        </View>
      </CollapsibleSection>

      {/* Soil Characteristics */}
      <CollapsibleSection title="Soil Characteristics" icon="layers-outline">
        <View className="mt-2 space-y-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-medium text-base">
              Soil Properties
            </Text>
            <HelpIcon
              title="Soil Properties"
              explanation="Soil properties determine which plants will grow best. These selections help us recommend plants that match your garden's soil conditions."
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Soil Texture</Text>
              <HelpIcon explanation="Soil texture affects water retention and nutrient availability. Clay holds moisture well but drains slowly, while sandy soil drains quickly but retains fewer nutrients." />
            </View>
            <BetterSelector
              label="Soil Texture"
              placeholder="Select soil textures"
              items={LOOKUP_TABLES.soil_texture}
              value={formValues.soil_texture_ids}
              onChange={(value: number[]) =>
                updateFormValues("soil_texture_ids", value)
              }
              labelHidden={true}
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Soil pH</Text>
              <HelpIcon explanation="Soil pH affects nutrient availability. Some plants prefer acidic soil (like blueberries), while others thrive in alkaline conditions." />
            </View>
            <BetterSelector
              label="Soil pH"
              placeholder="Select soil pH"
              items={LOOKUP_TABLES.soil_ph}
              value={formValues.soil_ph_ids}
              onChange={(value: number[]) =>
                updateFormValues("soil_ph_ids", value)
              }
              labelHidden={true}
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Soil Drainage</Text>
              <HelpIcon explanation="Drainage affects how water moves through soil. Poor drainage can lead to root rot in many plants, while others thrive in wetter conditions." />
            </View>
            <BetterSelector
              label="Soil Drainage"
              placeholder="Select soil drainage"
              items={LOOKUP_TABLES.soil_drainage}
              value={formValues.soil_drainage_ids}
              onChange={(value: number[]) =>
                updateFormValues("soil_drainage_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </View>
      </CollapsibleSection>

      {/* Location */}
      <CollapsibleSection title="Location" icon="location-outline">
        <View className="mt-2 space-y-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-medium text-base">
              Garden Location
            </Text>
            <HelpIcon
              title="Garden Location"
              explanation="Your garden's location influences which plants will survive seasonal temperature extremes and regional growing conditions."
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">
                USDA Hardiness Zone
              </Text>
              <HelpIcon explanation="USDA zones are based on minimum winter temperatures and help determine which plants can survive in your area year-round." />
            </View>
            <BetterSelector
              label="USDA Hardiness Zone"
              placeholder="Select hardiness zone"
              items={LOOKUP_TABLES.usda_zone}
              value={formValues.usda_zone_ids}
              onChange={(value: number[]) =>
                updateFormValues("usda_zone_ids", value)
              }
              labelHidden={true}
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">NC Region</Text>
              <HelpIcon explanation="North Carolina has distinct growing regions (Mountains, Piedmont, Coastal) with different climate conditions affecting plant choices." />
            </View>
            <BetterSelector
              label="NC Region"
              placeholder="Select NC region"
              items={LOOKUP_TABLES.nc_regions}
              value={formValues.nc_region_ids}
              onChange={(value: number[]) =>
                updateFormValues("nc_region_ids", value)
              }
              labelHidden={true}
            />
          </View>

          <View>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-cream-700">Landscape Location</Text>
              <HelpIcon explanation="The specific location within your property (slope, near water, patio, etc.) affects microclimates and growing conditions." />
            </View>
            <BetterSelector
              label="Landscape Location"
              placeholder="Select landscape locations"
              items={LOOKUP_TABLES.landscape_location}
              value={formValues.landscape_location_ids}
              onChange={(value: number[]) =>
                updateFormValues("landscape_location_ids", value)
              }
              labelHidden={true}
            />
          </View>
        </View>
      </CollapsibleSection>
    </View>
  );
}
