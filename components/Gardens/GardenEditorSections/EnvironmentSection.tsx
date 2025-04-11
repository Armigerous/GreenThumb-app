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
    <View className="space-y-5">
      {/* Sunlight */}
      <CollapsibleSection title="Sunlight" icon="sunny-outline">
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

      {/* Soil Characteristics */}
      <CollapsibleSection title="Soil Characteristics" icon="layers-outline">
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

      {/* Location */}
      <CollapsibleSection title="Location" icon="location-outline">
        <View className="mt-2 space-y-4">
          <BetterSelector
            label="USDA Hardiness Zone"
            placeholder="Select hardiness zone"
            items={LOOKUP_TABLES.usda_zone}
            value={formValues.usda_zone_ids}
            onChange={(value: number[]) =>
              updateFormValues("usda_zone_ids", value)
            }
          />
          <BetterSelector
            label="NC Region"
            placeholder="Select NC region"
            items={LOOKUP_TABLES.nc_regions}
            value={formValues.nc_region_ids}
            onChange={(value: number[]) =>
              updateFormValues("nc_region_ids", value)
            }
          />
          <BetterSelector
            label="Landscape Location"
            placeholder="Select landscape locations"
            items={LOOKUP_TABLES.landscape_location}
            value={formValues.landscape_location_ids}
            onChange={(value: number[]) =>
              updateFormValues("landscape_location_ids", value)
            }
          />
        </View>
      </CollapsibleSection>
    </View>
  );
}
