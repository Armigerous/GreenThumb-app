import React from "react";
import { View, Text, TextInput } from "react-native";
import CollapsibleSection from "../../UI/CollapsibleSection";
import BetterSelector from "../../UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type BasicInfoSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function BasicInfoSection({
  formValues,
  updateFormValues,
}: BasicInfoSectionProps) {
  // Handle both nc_region_ids and nc_regions (from materialized view)
  const ncRegionValue = formValues.nc_region_ids || [];

  return (
    <View className="space-y-5 px-4">
      {/* Garden Name */}
      <CollapsibleSection
        title="Garden Name"
        icon="information-circle-outline"
        initiallyExpanded={true}
      >
        <View className="space-y-2 mt-2">
          <Text className="text-foreground font-medium mb-1.5 text-base">
            Garden Name
          </Text>
          <TextInput
            className="border border-cream-300 rounded-lg p-3.5 bg-cream-50 text-base"
            value={formValues.name || ""}
            onChangeText={(text) => updateFormValues("name", text)}
            placeholder="Enter garden name"
          />
        </View>
      </CollapsibleSection>

      {/* USDA Zones */}
      <CollapsibleSection
        title="USDA Hardiness Zone"
        icon="thermometer-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="USDA Hardiness Zone"
            placeholder="Select hardiness zone"
            items={LOOKUP_TABLES.usda_zone}
            value={formValues.usda_zone_ids || []}
            onChange={(value) => updateFormValues("usda_zone_ids", value)}
          />
        </View>
      </CollapsibleSection>

      {/* NC Regions */}
      <CollapsibleSection
        title="NC Region"
        icon="map-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="North Carolina Region"
            placeholder="Select NC region"
            items={LOOKUP_TABLES.nc_regions}
            value={ncRegionValue}
            onChange={(value) => updateFormValues("nc_region_ids", value)}
          />
        </View>
      </CollapsibleSection>
    </View>
  );
}
