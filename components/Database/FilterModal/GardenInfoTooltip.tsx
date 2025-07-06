import React, { useRef, useEffect, ComponentProps } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BodyText, TitleText, SubtitleText } from "@/components/UI/Text";
import { Garden } from "@/types/garden";

// Define a type for Feather icon names (as in QuickFilterTooltip)
type FeatherIconName = ComponentProps<typeof Feather>["name"];

// Accept either a full Garden or a minimal GardenFilterOption
interface GardenInfoTooltipProps {
  garden: Partial<Garden> & { [key: string]: any };
  visible: boolean;
  onClose: () => void;
}

// Section config for grouping fields
const SECTION_CONFIG = [
  {
    id: "basic",
    name: "Basic Info",
    icon: "info" as FeatherIconName,
    fields: [
      {
        key: "created_at",
        label: "Created",
        format: (v: string) => v?.slice(0, 10),
      },
      {
        key: "updated_at",
        label: "Last Updated",
        format: (v: string) => v?.slice(0, 10),
      },
      { key: "available_space", label: "Available Space" },
      { key: "sunlight", label: "Sunlight" },
    ],
  },
  {
    id: "soil",
    name: "Soil & Environment",
    icon: "cloud" as FeatherIconName,
    fields: [
      { key: "soil_texture", label: "Soil Texture" },
      { key: "soil_drainage", label: "Soil Drainage" },
      { key: "soil_ph_ranges", label: "Soil pH" },
      { key: "nc_regions", label: "NC Regions" },
      { key: "usda_zones", label: "USDA Zones" },
    ],
  },
  {
    id: "design",
    name: "Design & Features",
    icon: "layout" as FeatherIconName,
    fields: [
      { key: "plant_types", label: "Plant Types" },
      { key: "habit_forms", label: "Habit/Form" },
      { key: "garden_themes", label: "Themes" },
      { key: "wildlife_attractions", label: "Wildlife Attractions" },
      { key: "resistance_challenges", label: "Resistance Challenges" },
      { key: "landscape_locations", label: "Locations" },
      { key: "growth_rates", label: "Growth Rates" },
    ],
  },
  {
    id: "color",
    name: "Colors & Seasons",
    icon: "feather" as FeatherIconName,
    fields: [
      { key: "flower_colors", label: "Flower Colors" },
      { key: "flower_bloom_times", label: "Flower Bloom Times" },
      { key: "leaf_colors", label: "Leaf Colors" },
      { key: "fall_colors", label: "Fall Colors" },
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: "more-horizontal" as FeatherIconName,
    fields: [
      { key: "maintenance", label: "Maintenance" },
      { key: "maintenance_level", label: "Maintenance Level" },
      { key: "problems", label: "Problems" },
    ],
  },
];

// Info row for a single field
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | string[] | null;
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <View className="mb-1 flex-row">
      <BodyText className="font-medium mr-1">{label}:</BodyText>
      <BodyText className="flex-1">
        {Array.isArray(value) ? value.join(", ") : value}
      </BodyText>
    </View>
  );
};

// Section renderer
const Section = ({
  section,
  garden,
}: {
  section: (typeof SECTION_CONFIG)[0];
  garden: any;
}) => {
  // Only show fields with values
  const rows = section.fields
    .map((field) => {
      const raw = garden[field.key];
      const value = field.format ? field.format(raw) : raw;
      return value ? (
        <InfoRow key={field.key} label={field.label} value={value} />
      ) : null;
    })
    .filter(Boolean);
  if (rows.length === 0) return null;
  return (
    <View className="mb-4 last:mb-0">
      <View className="flex-row items-center mb-2">
        <Feather name={section.icon} size={16} color="#5E994B" />
        <BodyText className="text-sm font-semibold ml-2 text-brand-600">
          {section.name}
        </BodyText>
      </View>
      <View className="bg-cream-400/20 p-3 rounded-lg ml-2">{rows}</View>
    </View>
  );
};

const GardenInfoTooltip: React.FC<GardenInfoTooltipProps> = ({
  garden,
  visible,
  onClose,
}) => {
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  // Check if all sections are empty (minimal info)
  const isMinimal = SECTION_CONFIG.every((section) =>
    section.fields.every((field) => !garden[field.key])
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <TouchableWithoutFeedback
          onPress={onClose}
          accessibilityLabel="Close garden info"
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            opacity,
            transform: [{ scale }],
            width: "90%",
            maxWidth: 400,
            maxHeight: "80%",
            borderRadius: 12,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <View className="p-4 border-b border-cream-300/50 bg-brand-600/5">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="bg-brand-600/10 p-2 rounded-full">
                    <Feather
                      name={"home" as FeatherIconName}
                      size={22}
                      color="#5E994B"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <TitleText className="font-bold text-lg text-gray-800">
                      {garden.name || "Garden"}
                    </TitleText>
                    {garden.isDefault && (
                      <SubtitleText className="text-xs text-brand-600 mt-0.5">
                        Default Garden
                      </SubtitleText>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-cream-400/40 rounded-full p-2"
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  accessibilityLabel="Close info"
                >
                  <Feather name="x" size={18} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Content */}
            <ScrollView className="px-4 py-3" style={{ maxHeight: 300 }}>
              {isMinimal ? (
                <BodyText className="text-base text-gray-700 mb-2">
                  No additional details available for this garden.
                </BodyText>
              ) : (
                SECTION_CONFIG.map((section) => (
                  <Section key={section.id} section={section} garden={garden} />
                ))
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default GardenInfoTooltip;
