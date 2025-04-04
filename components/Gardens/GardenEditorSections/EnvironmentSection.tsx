import React from "react";
import { View } from "react-native";
import CollapsibleSection from "@/components/UI/CollapsibleSection";
import BetterSelector from "@/components/UI/BetterSelector";
import { LOOKUP_TABLES } from "@/lib/gardenHelpers";

type EnvironmentSectionProps = {
  formValues: any;
  updateFormValues: (field: string, value: any) => void;
};

export default function EnvironmentSection({
  formValues,
  updateFormValues,
}: EnvironmentSectionProps) {
  return (
    <View className="space-y-5 px-4">
      {/* Sunlight Requirements */}
      <CollapsibleSection
        title="Sunlight"
        icon="sunny-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          {/* Note: sunlight_ids in the form maps to light_ids in the database */}
          <BetterSelector
            label="Light Requirements"
            placeholder="Select sunlight conditions"
            items={LOOKUP_TABLES.light}
            value={formValues.sunlight_ids}
            onChange={(value: number[]) =>
              updateFormValues("sunlight_ids", value)
            }
          />
        </View>
      </CollapsibleSection>

      {/* Soil Information */}
      <CollapsibleSection
        title="Soil Characteristics"
        icon="layers-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2 space-y-1">
          <BetterSelector
            label="Soil Texture"
            placeholder="Select soil textures"
            items={LOOKUP_TABLES.soil_texture}
            value={formValues.soil_texture_ids}
            onChange={(value: number[]) =>
              updateFormValues("soil_texture_ids", value)
            }
          />

          <BetterSelector
            label="Soil pH"
            placeholder="Select soil pH"
            items={LOOKUP_TABLES.soil_ph}
            value={formValues.soil_ph_ids}
            onChange={(value: number[]) =>
              updateFormValues("soil_ph_ids", value)
            }
          />

          <BetterSelector
            label="Soil Drainage"
            placeholder="Select soil drainage"
            items={LOOKUP_TABLES.soil_drainage}
            value={formValues.soil_drainage_ids}
            onChange={(value: number[]) =>
              updateFormValues("soil_drainage_ids", value)
            }
          />
        </View>
      </CollapsibleSection>

      {/* Available Space */}
      <CollapsibleSection
        title="Available Space"
        icon="resize-outline"
        initiallyExpanded={true}
      >
        <View className="mt-2">
          <BetterSelector
            label="Available Space"
            placeholder="Select available space"
            items={LOOKUP_TABLES.available_space_to_plant}
            value={formValues.available_space_to_plant_ids}
            onChange={(value: number[]) =>
              updateFormValues("available_space_to_plant_ids", value)
            }
          />
        </View>
      </CollapsibleSection>
    </View>
  );
}
