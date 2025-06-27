import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Garden } from "@/types/garden";
import { GARDEN_TABS } from "@/types/gardenTabs";
import {
  getCompletionColor,
  getCompletionStatusText,
  calculateGardenCompletion,
} from "@/lib/gardenHelpers";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";

// Import section renderers from index file
import {
  BasicInfoSection,
  EnvironmentSection,
  DesignSection,
  PlantsSection,
  AestheticsSection,
  PreferencesSection,
} from "./GardenEditorSections";

type GardenEditorTabsProps = {
  garden: Garden;
  updateFormValues: (field: string, value: any) => void;
  formValues: any;
};

// Field importance weights - used to calculate more accurate tab completion
const FIELD_WEIGHTS = {
  // Basic Info - Name is most important
  name: 3,
  nc_region_ids: 1,
  usda_zone_ids: 1,

  // Environment - All fields are important
  light_ids: 2,
  soil_texture_ids: 2,
  soil_ph_ids: 2,
  soil_drainage_ids: 2,
  available_space_to_plant_ids: 1,

  // Design - Location is most important
  landscape_location_ids: 2,
  landscape_theme_ids: 2,
  design_feature_ids: 1,

  // Plants
  plant_type_ids: 2,
  habit_form_ids: 1,
  growth_rate_id: 1,
  attracts_ids: 1,
  resistance_to_challenges_ids: 1,
  problems_ids: 1,

  // Aesthetics
  flower_color_ids: 2,
  flower_bloom_time_ids: 1,
  flower_value_to_gardener_ids: 1,
  leaf_color_ids: 2,
  leaf_feel_ids: 1,
  leaf_value_ids: 1,
  fall_color_ids: 1,
  texture_id: 1,

  // Preferences
  maintenance_id: 2,
  wants_recommendations: 1,
  year_round_interest: 1,
};

// Map database fields to tabs
const FIELD_TO_TAB = {
  // Basic Info
  name: "basic-info",
  nc_region_ids: "basic-info",
  usda_zone_ids: "basic-info",

  // Environment
  light_ids: "environment",
  soil_texture_ids: "environment",
  soil_ph_ids: "environment",
  soil_drainage_ids: "environment",
  available_space_to_plant_ids: "environment",

  // Design
  landscape_location_ids: "design",
  landscape_theme_ids: "design",
  design_feature_ids: "design",

  // Plants
  plant_type_ids: "plants",
  habit_form_ids: "plants",
  growth_rate_id: "plants",
  attracts_ids: "plants",
  resistance_to_challenges_ids: "plants",
  problems_ids: "plants",

  // Aesthetics
  flower_color_ids: "aesthetics",
  flower_bloom_time_ids: "aesthetics",
  flower_value_to_gardener_ids: "aesthetics",
  leaf_color_ids: "aesthetics",
  leaf_feel_ids: "aesthetics",
  leaf_value_ids: "aesthetics",
  fall_color_ids: "aesthetics",
  texture_id: "aesthetics",

  // Preferences
  maintenance_id: "preferences",
  wants_recommendations: "preferences",
  year_round_interest: "preferences",
};

export default function GardenEditorTabs({
  garden,
  updateFormValues,
  formValues,
}: GardenEditorTabsProps) {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [tabCompletions, setTabCompletions] = useState<{
    [key: string]: number;
  }>({});
  const [overallCompletion, setOverallCompletion] = useState(0);

  // Calculate completion for each tab using weighted fields
  useEffect(() => {
    // Group fields by tab
    const tabFields: { [key: string]: string[] } = {};

    // Initialize tab fields
    Object.entries(FIELD_TO_TAB).forEach(([field, tab]) => {
      if (!tabFields[tab]) {
        tabFields[tab] = [];
      }
      tabFields[tab].push(field);
    });

    // Calculate completion for each tab
    const completions: { [key: string]: number } = {};

    // For each tab, create a subset of form values containing only fields for that tab
    Object.entries(tabFields).forEach(([tab, fields]) => {
      const tabFormValues: Record<string, any> = {};

      // Copy relevant fields to the tab form values
      fields.forEach((field) => {
        if (field in formValues) {
          tabFormValues[field] = formValues[field];
        }
      });

      // Calculate completion percentage for this tab
      completions[tab] = calculateGardenCompletion(tabFormValues);
    });

    // Calculate overall completion
    const overallPercentage = calculateGardenCompletion(formValues);

    setTabCompletions(completions);
    setOverallCompletion(overallPercentage);
  }, [formValues]);

  // Render the appropriate section content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return (
          <BasicInfoSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      case "environment":
        return (
          <EnvironmentSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      case "design":
        return (
          <DesignSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      case "plants":
        return (
          <PlantsSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      case "aesthetics":
        return (
          <AestheticsSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      case "preferences":
        return (
          <PreferencesSection
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        );
      default:
        return null;
    }
  };

  // Get completion status color based on percentage
  const getTabStatusColor = (tabId: string) => {
    const completion = tabCompletions[tabId] || 0;
    return getCompletionColor(completion);
  };

  // Get descriptive status text for completion percentage
  const getCompletionStatus = (percent: number) => {
    return getCompletionStatusText(percent);
  };

  return (
    <View className="flex-1 bg-cream-50">
      {/* Progress Bar */}
      <View className="px-4 pb-3 bg-white pt-3 border-b border-cream-200 shadow-sm">
        <View className="mb-1.5 flex-row justify-between items-center">
          <Text className="text-foreground font-semibold text-base">
            Garden Setup
          </Text>
          <View className="flex-row items-center">
            <Text className="text-cream-600 text-sm mr-2">
              {Math.round(overallCompletion)}% Complete
            </Text>
            <View className="bg-cream-100 w-1.5 h-1.5 rounded-full">
              {overallCompletion > 0 && (
                <Ionicons
                  name={
                    overallCompletion === 100
                      ? "checkmark-circle"
                      : "hourglass-outline"
                  }
                  size={14}
                  color={getCompletionColor(overallCompletion)}
                />
              )}
            </View>
          </View>
        </View>
        <AnimatedProgressBar
          percentage={overallCompletion}
          color={getCompletionColor(overallCompletion)}
          height={8}
          duration={500}
        />
      </View>

      {/* Tab Navigation */}
      <View className="border-b border-cream-200 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          {GARDEN_TABS.sort((a, b) => a.order - b.order).map((tab) => {
            const isActive = activeTab === tab.id;
            const completion = tabCompletions[tab.id] || 0;
            const isComplete = completion === 100;
            const statusColor = getTabStatusColor(tab.id);

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`mr-2 py-3 px-4 flex-row items-center rounded-t-lg ${
                  isActive
                    ? "bg-brand-50 border-b-2"
                    : isComplete
                    ? "bg-cream-50 border-b"
                    : "bg-white border-b"
                }`}
                style={{
                  borderBottomColor: isActive ? statusColor : "transparent",
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className={`p-1.5 rounded-full ${
                      isActive
                        ? "bg-brand-100"
                        : isComplete
                        ? "bg-brand-50"
                        : "bg-cream-100"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? `${statusColor}30`
                        : undefined,
                    }}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={16}
                      color={isActive || isComplete ? statusColor : "#636059"}
                    />
                  </View>
                  <Text
                    className={`ml-2 text-sm font-medium ${
                      isActive
                        ? "text-foreground"
                        : isComplete
                        ? "text-brand-700"
                        : "text-cream-600"
                    }`}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </View>

                {/* Completion indicator */}
                {completion > 0 && (
                  <View
                    className="ml-2 h-5 w-5 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: `${statusColor}20`,
                    }}
                  >
                    {isComplete ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={statusColor}
                      />
                    ) : (
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: statusColor }}
                      >
                        {Math.round(completion)}%
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Current tab header with completion indicator */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <View className="flex-row items-center">
          <View
            className="p-2 rounded-full"
            style={{
              backgroundColor: `${getTabStatusColor(activeTab)}15`,
            }}
          >
            <Ionicons
              name={
                GARDEN_TABS.find((tab) => tab.id === activeTab)?.icon ||
                "information-circle-outline"
              }
              size={18}
              color={getTabStatusColor(activeTab)}
            />
          </View>
          <Text className="ml-2 text-base font-bold text-foreground">
            {GARDEN_TABS.find((tab) => tab.id === activeTab)?.label}
          </Text>
        </View>
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: `${getTabStatusColor(activeTab)}15`,
          }}
        >
          <View className="w-12 h-1.5 bg-cream-200 rounded-full overflow-hidden mr-1.5">
            <View
              style={{
                width: `${tabCompletions[activeTab] || 0}%`,
                backgroundColor: getTabStatusColor(activeTab),
              }}
              className="h-full"
            />
          </View>
          <Text
            className="text-xs font-medium"
            style={{ color: getTabStatusColor(activeTab) }}
          >
            {getCompletionStatus(tabCompletions[activeTab] || 0)}
          </Text>
        </View>
      </View>

      {/* Tab description */}
      <View className="px-4 py-2 bg-cream-50 border-t border-b border-cream-200">
        <Text className="text-xs text-cream-700">
          {GARDEN_TABS.find((tab) => tab.id === activeTab)?.description}
        </Text>
      </View>

      {/* Tab content */}
      <ScrollView className="flex-1 bg-white">{renderTabContent()}</ScrollView>
    </View>
  );
}
