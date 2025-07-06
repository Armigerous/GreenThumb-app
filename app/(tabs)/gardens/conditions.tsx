import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGardenDetails } from "@/lib/queries";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { GardenConditions, GardenEditorTabs } from "@/components/Gardens";
import { getIdsFromNames, LOOKUP_TABLES } from "@/lib/gardenHelpers";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/UI/PageContainer";
// Reason: Needed for deleting plant images from Supabase storage when deleting a garden
import { deleteImageFromStorage } from "@/lib/services/imageUpload";

/**
 * Garden Conditions Page
 * A dedicated page for viewing and editing garden growing conditions
 * Accessed through the Conditions button on garden details page
 */
export default function GardenConditionsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Fetch garden details
  const {
    data: gardenData,
    isLoading,
    error,
    refetch,
  } = useGardenDetails(Number(id));

  // Initialize form values when garden data is loaded
  useEffect(() => {
    if (gardenData && !formValues) {
      // Initialize form values based on the current garden structure
      setFormValues({
        name: gardenData.name || "",
        // Environment settings
        light_ids: getIdsFromNames(
          gardenData.sunlight ? [gardenData.sunlight] : undefined,
          LOOKUP_TABLES.light
        ),
        soil_texture_ids: getIdsFromNames(
          gardenData.soil_texture ? [gardenData.soil_texture] : undefined,
          LOOKUP_TABLES.soil_texture
        ),
        soil_drainage_ids: getIdsFromNames(
          gardenData.soil_drainage,
          LOOKUP_TABLES.soil_drainage
        ),
        soil_ph_ids: getIdsFromNames(
          gardenData.soil_ph_ranges || gardenData.soil_ph,
          LOOKUP_TABLES.soil_ph
        ),
        landscape_location_ids:
          getIdsFromNames(
            gardenData.landscape_locations || gardenData.locations,
            LOOKUP_TABLES.landscape_location
          ) || [],
        nc_region_ids: LOOKUP_TABLES.nc_regions
          ? getIdsFromNames(gardenData.nc_regions, LOOKUP_TABLES.nc_regions) ||
            []
          : [],
        usda_zone_ids: LOOKUP_TABLES.usda_zone
          ? getIdsFromNames(gardenData.usda_zones, LOOKUP_TABLES.usda_zone) ||
            []
          : [],

        // Maintenance and preferences
        maintenance_id: gardenData.maintenance_level
          ? LOOKUP_TABLES.maintenance.find(
              (option) => option.label === gardenData.maintenance_level
            )?.value || null
          : gardenData.maintenance
          ? LOOKUP_TABLES.maintenance.find(
              (option) => option.label === gardenData.maintenance
            )?.value || null
          : null,
        growth_rate_id:
          gardenData.growth_rates && gardenData.growth_rates.length > 0
            ? LOOKUP_TABLES.growth_rate.find(
                (option) => option.label === gardenData.growth_rates[0]
              )?.value || null
            : null,
        available_space_to_plant_ids: getIdsFromNames(
          gardenData.available_space ? [gardenData.available_space] : undefined,
          LOOKUP_TABLES.available_space_to_plant
        ),
        texture_id: gardenData.texture_preference
          ? LOOKUP_TABLES.texture.find(
              (option) => option.label === gardenData.texture_preference
            )?.value || null
          : gardenData.texture
          ? LOOKUP_TABLES.texture.find(
              (option) => option.label === gardenData.texture
            )?.value || null
          : null,

        // Garden design
        landscape_theme_ids:
          getIdsFromNames(
            gardenData.garden_themes,
            LOOKUP_TABLES.landscape_theme
          ) || [],
        attracts_ids:
          getIdsFromNames(
            gardenData.wildlife_attractions,
            LOOKUP_TABLES.attracts
          ) || [],
        resistance_to_challenges_ids:
          getIdsFromNames(
            gardenData.resistance_challenges,
            LOOKUP_TABLES.resistance_to_challenges
          ) || [],
        problems_ids:
          getIdsFromNames(gardenData.problems, LOOKUP_TABLES.problems) || [],
        design_feature_ids: LOOKUP_TABLES.design_feature
          ? getIdsFromNames(
              gardenData.design_features,
              LOOKUP_TABLES.design_feature
            ) || []
          : [],
        plant_type_ids: LOOKUP_TABLES.plant_type
          ? getIdsFromNames(gardenData.plant_types, LOOKUP_TABLES.plant_type) ||
            []
          : [],
        habit_form_ids: LOOKUP_TABLES.habit_form
          ? getIdsFromNames(gardenData.habit_forms, LOOKUP_TABLES.habit_form) ||
            []
          : [],

        // Plant aesthetics
        flower_color_ids:
          getIdsFromNames(
            gardenData.flower_colors,
            LOOKUP_TABLES.flower_color
          ) || [],
        leaf_color_ids:
          getIdsFromNames(gardenData.leaf_colors, LOOKUP_TABLES.leaf_color) ||
          [],
        flower_bloom_time_ids: LOOKUP_TABLES.flower_bloom_time
          ? getIdsFromNames(
              gardenData.flower_bloom_times,
              LOOKUP_TABLES.flower_bloom_time
            ) || []
          : [],
        flower_value_to_gardener_ids: LOOKUP_TABLES.flower_value_to_gardener
          ? getIdsFromNames(
              gardenData.flower_values,
              LOOKUP_TABLES.flower_value_to_gardener
            ) || []
          : [],
        leaf_feel_ids: LOOKUP_TABLES.leaf_feel
          ? getIdsFromNames(gardenData.leaf_feels, LOOKUP_TABLES.leaf_feel) ||
            []
          : [],
        leaf_value_ids: LOOKUP_TABLES.leaf_value
          ? getIdsFromNames(gardenData.leaf_values, LOOKUP_TABLES.leaf_value) ||
            []
          : [],
        fall_color_ids: LOOKUP_TABLES.fall_color
          ? getIdsFromNames(gardenData.fall_colors, LOOKUP_TABLES.fall_color) ||
            []
          : [],

        // Preferences
        wants_recommendations: gardenData.wants_recommendations || false,
        year_round_interest: gardenData.year_round_interest || false,
      });
    }
  }, [gardenData]);

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle form field changes
  const updateFormValues = (field: string, value: any) => {
    setFormValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save from editor
  const handleSave = async () => {
    if (!formValues) return;

    setIsSaving(true);

    try {
      // Create the garden update object with all form values
      const gardenDbUpdate = {
        name: formValues.name,
        light_ids: formValues.light_ids,
        soil_texture_ids: formValues.soil_texture_ids,
        soil_drainage_ids: formValues.soil_drainage_ids,
        soil_ph_ids: formValues.soil_ph_ids,
        maintenance_id: formValues.maintenance_id,
        growth_rate_id: formValues.growth_rate_id,
        available_space_to_plant_ids: formValues.available_space_to_plant_ids,
        wants_recommendations: formValues.wants_recommendations,
        year_round_interest: formValues.year_round_interest,
        landscape_location_ids: formValues.landscape_location_ids,
        landscape_theme_ids: formValues.landscape_theme_ids,
        attracts_ids: formValues.attracts_ids,
        resistance_to_challenges_ids: formValues.resistance_to_challenges_ids,
        problems_ids: formValues.problems_ids,
        flower_color_ids: formValues.flower_color_ids,
        leaf_color_ids: formValues.leaf_color_ids,
        texture_id: formValues.texture_id,
        nc_region_ids: formValues.nc_region_ids,
        usda_zone_ids: formValues.usda_zone_ids,
        flower_bloom_time_ids: formValues.flower_bloom_time_ids,
        flower_value_to_gardener_ids: formValues.flower_value_to_gardener_ids,
        leaf_feel_ids: formValues.leaf_feel_ids,
        leaf_value_ids: formValues.leaf_value_ids,
        fall_color_ids: formValues.fall_color_ids,
        design_feature_ids: formValues.design_feature_ids,
        plant_type_ids: formValues.plant_type_ids,
        habit_form_ids: formValues.habit_form_ids,
        // Set updated_at timestamp
        updated_at: new Date().toISOString(),
      };

      // Update garden in database
      const { error } = await supabase
        .from("user_gardens")
        .update(gardenDbUpdate)
        .eq("id", gardenData?.id || 0);

      if (error) {
        console.error("Error updating garden:", error);
        return;
      }

      // Force invalidate the query to ensure fresh data is fetched
      queryClient.invalidateQueries({
        queryKey: ["gardenDetails", Number(id)],
      });

      setIsEditing(false);
      // Add a small delay before refetching to give the database time to update
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error) {
      console.error("Error saving garden:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel from editor
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values to original garden data on next render
    setFormValues(null);
  };

  // Reason: The delete garden logic is now in the settings/conditions page for better UX and to prevent accidental deletion from the main screen.
  // Handles the deletion of the garden with confirmation. Deletes all associated plants and the garden itself.
  const handleDeleteGarden = async () => {
    if (!gardenData?.id) return;

    // Reason: Confirm with the user before deleting the garden and all related data
    Alert.alert(
      "Delete Garden",
      "Are you sure you want to delete this garden? This action cannot be undone and all plants in this garden will be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get all plants in this garden to delete their images
              const { data: gardenPlants, error: fetchError } = await supabase
                .from("user_plants")
                .select("*")
                .eq("garden_id", gardenData.id);

              if (fetchError) throw fetchError;

              // Delete all plant images from storage
              if (gardenPlants && gardenPlants.length > 0) {
                // Collect all image deletion promises
                const allImageDeletionPromises = [];
                for (const plant of gardenPlants) {
                  if (plant.images && plant.images.length > 0) {
                    const plantImagePromises = plant.images.map(
                      (imageUrl: string) => deleteImageFromStorage(imageUrl)
                    );
                    allImageDeletionPromises.push(...plantImagePromises);
                  }
                }
                if (allImageDeletionPromises.length > 0) {
                  await Promise.all(allImageDeletionPromises);
                }
              }

              // Delete all tasks related to plants in this garden first to avoid FK constraint violations
              if (gardenPlants && gardenPlants.length > 0) {
                const plantIds = gardenPlants.map((plant) => plant.id);
                const { error: tasksError } = await supabase
                  .from("plant_tasks")
                  .delete()
                  .in("user_plant_id", plantIds);
                if (tasksError) {
                  // Continue with deletion anyway
                  console.error("Error deleting plant tasks:", tasksError);
                }
              }

              // Then delete all plants in the garden
              const { error: plantsError } = await supabase
                .from("user_plants")
                .delete()
                .eq("garden_id", gardenData.id);
              if (plantsError) throw plantsError;

              // Then delete the garden
              const { error: gardenError } = await supabase
                .from("user_gardens")
                .delete()
                .eq("id", gardenData.id);
              if (gardenError) throw gardenError;

              // Invalidate the garden dashboard query cache to trigger a refetch
              queryClient.invalidateQueries({
                queryKey: ["gardenDashboard", gardenData.user_id],
              });

              Alert.alert("Success", "Garden deleted successfully");
              router.push("/(tabs)/gardens");
            } catch (err) {
              console.error("Error deleting garden:", err);
              Alert.alert(
                "Error",
                "Failed to delete garden. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading garden conditions..." />
      </PageContainer>
    );
  }

  if (error || !gardenData) {
    return (
      <SafeAreaView className="flex-1">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg font-paragraph">
            Error loading garden conditions. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2c29" />
            <Text className="text-foreground text-lg font-paragraph ml-2">
              Back to Garden
            </Text>
          </TouchableOpacity>

          {!isEditing ? (
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={handleEditToggle}
            >
              <Text className="text-primary-foreground font-paragraph font-medium">
                Edit
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                className="bg-cream-300 px-4 py-2 rounded-lg mr-2"
                onPress={handleCancel}
              >
                <Text className="text-cream-700 font-paragraph font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-lg"
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text className="text-primary-foreground font-paragraph font-medium">
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Title */}
      <View className="px-5 pb-4">
        <Text className="text-2xl text-foreground font-title font-bold mb-1">
          Garden Conditions
        </Text>
        <Text className="text-cream-600 font-paragraph">{gardenData.name}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        {isEditing && formValues ? (
          <GardenEditorTabs
            garden={gardenData}
            formValues={formValues}
            updateFormValues={updateFormValues}
          />
        ) : (
          <ScrollView className="flex-1 px-5">
            <GardenConditions
              garden={gardenData}
              onEditPress={handleEditToggle}
              onSettingsUpdate={(updated) => {
                if (updated) refetch();
              }}
            />
            {/* Danger Zone: Delete Garden */}
            <View
              style={{
                borderWidth: 1,
                borderColor: "#dc2626", // Tailwind red-600
                backgroundColor: "#fef2f2", // Tailwind red-50
                borderRadius: 12,
                padding: 20,
                marginTop: 32,
                marginBottom: 32,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#dc2626",
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                Danger Zone
              </Text>
              <Text
                style={{
                  color: "#b91c1c",
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Deleting your garden will remove all plants, tasks, and images
                associated with it. This action cannot be undone.
              </Text>
              <TouchableOpacity
                onPress={handleDeleteGarden}
                style={{
                  backgroundColor: "#dc2626",
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel="Delete garden"
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Delete Garden
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
