import CachedImage from "@/components/CachedImage";
import { ErrorBoundary } from "@/components/Database/Plant/ErrorBoundary";
import BrandedErrorPage from "@/components/UI/BrandedErrorPage";
import { HtmlRenderer } from "@/components/Database/Plant/HtmlRenderer";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";
import { usePlantDetails } from "@/lib/queries";
import { PlantFullDataUI, PlantImage } from "@/types/plant";
import { TabType } from "@/types/tab";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

// Tab bar component
const TabBar = ({
  activeTab,
  onTabPress,
}: {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
  }[] = [
    { id: "overview", label: "Overview", icon: "leaf-outline" },
    { id: "care", label: "Care", icon: "water-outline" },
    { id: "features", label: "Features", icon: "flower-outline" },
    { id: "taxonomy", label: "Taxonomy", icon: "book-outline" },
    { id: "problems", label: "Problems", icon: "warning-outline" },
  ];

  return (
    <View className="flex-row bg-cream-50 border-b border-t border-cream-300">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabPress(tab.id)}
          className={`flex-1 py-3 items-center ${
            activeTab === tab.id ? "border-b-2 border-brand-500" : ""
          }`}
        >
          <Ionicons
            name={tab.icon}
            size={20}
            color={activeTab === tab.id ? "#5E994B" : "#9e9a90"}
          />
          <BodyText
            className={`text-xs mt-1 ${
              activeTab === tab.id
                ? "text-brand-500 font-medium"
                : "text-cream-500"
            }`}
          >
            {tab.label}
          </BodyText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Quick actions component
const QuickActions = ({ plant }: { plant: PlantFullDataUI }) => {
  const router = useRouter();

  // Handle adding plant to garden
  const handleAddToGarden = () => {
    // Navigate to add plant to garden flow with plant ID and slug as parameters
    router.push(
      `/(tabs)/gardens/plant/add?plantId=${plant.id}&plantSlug=${plant.slug}`
    );
  };

  return (
    <View className="flex-column justify-center py-2 my-2">
      <TouchableOpacity
        className="bg-primary rounded-xl py-3 px-6 items-center w-full flex-row justify-center"
        onPress={handleAddToGarden}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fffefa" />
        <BodyText className="text-cream-50 font-medium ml-2">
          Add to Garden
        </BodyText>
      </TouchableOpacity>
    </View>
  );
};

// Plant Detail Screen Component wrapped with ErrorBoundary
export default function PlantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Use our query hook to fetch plant data
  const {
    data: plant,
    isLoading: loading,
    error: queryError,
  } = usePlantDetails(slug);

  useEffect(() => {
    if (plant) {
      // Use the first common name or scientific name for the title
      const title = plant.common_names?.[0] || plant.scientific_name;
      router.setParams({ title });
    }
  }, [plant, router]);

  // Process image data for the gallery
  const galleryImages = useMemo(() => {
    if (plant?.images && plant.images.length > 0) {
      return plant.images
        .filter((img: PlantImage) => img && img.img)
        .map((img: PlantImage) => img.img as string);
    }
    return [];
  }, [plant]);

  // Get the first image from images array
  const firstImage =
    plant?.images && plant.images.length > 0 ? plant.images[0]?.img : null;

  // Get common name from array
  const commonName =
    plant?.common_names && plant.common_names.length > 0
      ? plant.common_names[0]
      : undefined;

  // Calculate bottom padding to account for bottom tabs
  // This ensures content isn't hidden behind navigation elements
  const bottomPadding = 60; // Approximate height of bottom tabs

  if (loading) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading plant details..." />
      </PageContainer>
    );
  }

  if (queryError || !plant) {
    const errorMessage =
      queryError instanceof Error ? queryError.message : "Plant not found";

    return (
      <BrandedErrorPage
        message={errorMessage}
        onRetry={() => router.replace(`/plants/${slug}`)}
        onBack={() => router.back()}
      />
    );
  }

  // Wrap the main content with ErrorBoundary
  return (
    <PageContainer scroll={false} padded={false} safeArea={false}>
      <ErrorBoundary>
        <View className="flex-1">
          {/* Fixed Header */}
          <View className="bg-white border-b border-cream-100 pt-12">
            <View className="flex-row justify-between items-center px-5 py-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center"
              >
                <Ionicons name="arrow-back" size={24} color="#2e2c29" />
                <BodyText className="text-foreground text-lg font-medium ml-2">
                  Back
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: bottomPadding }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plant Image */}
            <View className="w-full h-[300px]">
              <Image
                source={{
                  uri:
                    firstImage ||
                    "https://theofficialgreenthumb.com/no-plant-image.png",
                }}
                className="w-full h-full"
                resizeMode="cover"
                alt={plant.images?.[0]?.alt_text || plant.scientific_name}
              />
            </View>
            {/* Plant Information */}
            <View className="p-4 bg-white rounded-t-3xl -mt-5">
              <TitleText className="text-2xl font-bold text-cream-800 mb-1">
                {commonName || plant.scientific_name}
              </TitleText>
              <View className="flex-row items-center mb-3">
                <SubtitleText
                  className="text-base italic text-cream-500 flex-1"
                  numberOfLines={2}
                >
                  {plant.scientific_name?.replace(/'/g, "'")}
                </SubtitleText>
                {plant.sound_file && (
                  <TouchableOpacity
                    className="ml-2 bg-brand-50 rounded-xl p-2"
                    onPress={() => {
                      /* Play pronunciation */
                      console.log("Play pronunciation pressed");
                    }}
                  >
                    <Ionicons
                      name="volume-high-outline"
                      size={20}
                      color="#5E994B"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Display all tags if available */}
              {plant.tags && plant.tags.length > 0 && (
                <View className="mb-4">
                  <FlatList
                    horizontal
                    data={plant.tags.filter(Boolean)}
                    keyExtractor={(item, index) => `tag-${index}`}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View className="bg-brand-100 px-3 py-1.5 rounded-xl mr-2">
                        <BodyText className="text-xs text-brand-700 font-medium">
                          {item}
                        </BodyText>
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Display multiple images if available */}
              {plant.images && plant.images.length > 1 && (
                <View className="my-4">
                  <TitleText className="text-lg font-bold text-cream-800 mb-3">
                    Images
                  </TitleText>
                  <FlatList
                    horizontal
                    data={plant.images.slice(1)} // Skip first image as it's already shown
                    keyExtractor={(item, index) => `image-${index}`}
                    renderItem={({ item }) => (
                      <View className="mr-2">
                        <CachedImage
                          uri={item.img || ""}
                          style={{ height: 120, width: 180, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                        {item.caption && (
                          <BodyText className="text-xs text-cream-500 mt-1 w-[180px]">
                            {item.caption}
                          </BodyText>
                        )}
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}

              {/* Quick Actions - Add to Garden */}
              <QuickActions plant={plant} />

              {/* Tab Content - Reduced margin top from mt-6 to mt-2 to reduce the gap */}
              <View className="mt-2 mb-4">
                {activeTab === "overview" && (
                  <View className="pb-16">
                    {/* Description */}
                    {plant.description && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Description
                          </TitleText>
                        </View>
                        <HtmlRenderer content={plant.description} />
                      </View>
                    )}

                    {/* Quick Facts */}
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                      <View className="border-b border-cream-100 pb-3 mb-4">
                        <TitleText className="text-lg font-bold text-foreground">
                          Quick Facts
                        </TitleText>
                      </View>
                      <View>
                        {(plant.height_min || plant.height_max) && (
                          <View className="flex-row justify-between mb-3">
                            <BodyText className="text-cream-500 text-base">
                              Height
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.height_min || "?"}-
                              {plant.height_max || "?"} inches
                            </BodyText>
                          </View>
                        )}
                        {(plant.width_min || plant.width_max) && (
                          <View className="flex-row justify-between mb-3">
                            <BodyText className="text-cream-500 text-base">
                              Width
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.width_min || "?"}-{plant.width_max || "?"}{" "}
                              inches
                            </BodyText>
                          </View>
                        )}
                        <View className="flex-row justify-between mb-3">
                          <BodyText className="text-cream-500 text-base">
                            Growth Rate
                          </BodyText>
                          <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                            {plant.growth_rate}
                          </BodyText>
                        </View>
                        <View className="flex-row justify-between">
                          <BodyText className="text-cream-500 text-base">
                            Origin
                          </BodyText>
                          <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                            {plant.origin}
                          </BodyText>
                        </View>
                      </View>
                    </View>

                    {/* Uses and Value */}
                    {(plant.uses ||
                      plant.wildlife_value ||
                      plant.edibility ||
                      plant.attracts?.length ||
                      plant.design_features?.length) && (
                      <View className="bg-white rounded-2xl py-5 mb-4 shadow-sm px-5">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Uses and Value
                          </TitleText>
                        </View>
                        <View>
                          {plant.uses && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <BodyText className="text-cream-500 text-base mb-2">
                                Uses
                              </BodyText>
                              <HtmlRenderer content={plant.uses.toString()} />
                            </View>
                          )}
                          {plant.edibility && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <BodyText className="text-cream-500 text-base mb-2">
                                Edibility
                              </BodyText>
                              <HtmlRenderer
                                content={plant.edibility.toString()}
                              />
                            </View>
                          )}
                          {plant.wildlife_value && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <BodyText className="text-cream-500 text-base mb-2">
                                Wildlife Value
                              </BodyText>
                              <HtmlRenderer
                                content={plant.wildlife_value.toString()}
                              />
                            </View>
                          )}
                          {plant.attracts && plant.attracts.length > 0 && (
                            <View>
                              <BodyText className="text-cream-500 text-base mb-3">
                                Attracts
                              </BodyText>
                              <View className="flex-row flex-wrap">
                                {plant.attracts
                                  .filter(Boolean)
                                  .map((attract, index) => (
                                    <View
                                      key={index}
                                      className="bg-brand-50 px-3 py-2 rounded-xl mr-2 mb-2"
                                    >
                                      <BodyText className="text-sm text-brand-700">
                                        {attract}
                                      </BodyText>
                                    </View>
                                  ))}
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === "care" && (
                  <View className="pb-16">
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                      <View className="border-b border-cream-100 pb-3 mb-4">
                        <TitleText className="text-lg font-bold text-foreground">
                          Care Requirements
                        </TitleText>
                      </View>
                      <View>
                        {plant.light_requirements && (
                          <View className="mb-4 pb-4 border-b border-cream-50">
                            <BodyText className="text-cream-500 text-base mb-2">
                              Light
                            </BodyText>
                            <HtmlRenderer
                              content={plant.light_requirements.toString()}
                            />
                          </View>
                        )}
                        {plant.water_requirements && (
                          <View className="mb-4 pb-4 border-b border-cream-50">
                            <BodyText className="text-cream-500 text-base mb-2">
                              Water
                            </BodyText>
                            <HtmlRenderer
                              content={plant.water_requirements.toString()}
                            />
                          </View>
                        )}
                        {plant.soil_ph && (
                          <View className="flex-row justify-between mb-3">
                            <BodyText className="text-cream-500 text-base">
                              Soil pH
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.soil_ph}
                            </BodyText>
                          </View>
                        )}
                        {plant.soil_texture && (
                          <View className="flex-row justify-between mb-3">
                            <BodyText className="text-cream-500 text-base">
                              Soil Texture
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.soil_texture}
                            </BodyText>
                          </View>
                        )}
                        {plant.maintenance && (
                          <View className="mb-4 pb-4 border-b border-cream-50">
                            <BodyText className="text-cream-500 text-base mb-2">
                              Maintenance
                            </BodyText>
                            <HtmlRenderer
                              content={plant.maintenance.toString()}
                            />
                          </View>
                        )}
                        {plant.usda_hardiness_zones && (
                          <View className="flex-row justify-between">
                            <BodyText className="text-cream-500 text-base">
                              USDA Zones
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.usda_hardiness_zones}
                            </BodyText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === "features" && (
                  <View className="pb-16">
                    {/* Flower Features */}
                    {(plant.flower_description ||
                      plant.flower_colors ||
                      plant.flower_bloom_time) && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Flower Features
                          </TitleText>
                        </View>
                        <View>
                          {plant.flower_description && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <HtmlRenderer
                                content={plant.flower_description}
                              />
                            </View>
                          )}
                          {plant.flower_color && (
                            <View className="flex-row justify-between mb-3">
                              <BodyText className="text-cream-500 text-base">
                                Color
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.flower_color)
                                  ? plant.flower_color
                                      .filter(Boolean)
                                      .join(", ")
                                  : plant.flower_color}
                              </BodyText>
                            </View>
                          )}
                          {plant.flower_bloom_time && (
                            <View className="flex-row justify-between">
                              <BodyText className="text-cream-500 text-base">
                                Bloom Time
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.flower_bloom_time)
                                  ? plant.flower_bloom_time
                                      .filter(Boolean)
                                      .join(", ")
                                  : plant.flower_bloom_time}
                              </BodyText>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Leaf Features */}
                    {(plant.leaf_description ||
                      plant.leaf_color ||
                      plant.leaf_shape) && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Leaf Features
                          </TitleText>
                        </View>
                        <View>
                          {plant.leaf_description && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <HtmlRenderer content={plant.leaf_description} />
                            </View>
                          )}
                          {plant.leaf_color && (
                            <View className="flex-row justify-between mb-3">
                              <BodyText className="text-cream-500 text-base">
                                Color
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.leaf_color)
                                  ? plant.leaf_color.filter(Boolean).join(", ")
                                  : plant.leaf_color}
                              </BodyText>
                            </View>
                          )}
                          {plant.leaf_shape && (
                            <View className="flex-row justify-between">
                              <BodyText className="text-cream-500 text-base">
                                Shape
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.leaf_shape)
                                  ? plant.leaf_shape.filter(Boolean).join(", ")
                                  : plant.leaf_shape}
                              </BodyText>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Fruit Features */}
                    {(plant.fruit_description ||
                      plant.fruit_color ||
                      plant.fruit_type) && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Fruit Features
                          </TitleText>
                        </View>
                        <View>
                          {plant.fruit_description && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <HtmlRenderer content={plant.fruit_description} />
                            </View>
                          )}
                          {plant.fruit_color && (
                            <View className="flex-row justify-between mb-3">
                              <BodyText className="text-cream-500 text-base">
                                Color
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.fruit_color)
                                  ? plant.fruit_color.filter(Boolean).join(", ")
                                  : plant.fruit_color}
                              </BodyText>
                            </View>
                          )}
                          {plant.fruit_type && (
                            <View className="flex-row justify-between">
                              <BodyText className="text-cream-500 text-base">
                                Type
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {Array.isArray(plant.fruit_type)
                                  ? plant.fruit_type.filter(Boolean).join(", ")
                                  : plant.fruit_type}
                              </BodyText>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === "taxonomy" && (
                  <View className="pb-16">
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                      <View className="border-b border-cream-100 pb-3 mb-4">
                        <TitleText className="text-lg font-bold text-foreground">
                          Classification
                        </TitleText>
                      </View>
                      <View>
                        <View className="flex-row justify-between mb-3">
                          <BodyText className="text-cream-500 text-base">
                            Family
                          </BodyText>
                          <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                            {plant.family}
                          </BodyText>
                        </View>
                        <View className="flex-row justify-between mb-3">
                          <BodyText className="text-cream-500 text-base">
                            Genus
                          </BodyText>
                          <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                            {plant.genus}
                          </BodyText>
                        </View>
                        <View className="flex-row justify-between mb-3">
                          <BodyText className="text-cream-500 text-base">
                            Species
                          </BodyText>
                          <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                            {plant.species}
                          </BodyText>
                        </View>
                        {plant.phonetic_spelling && (
                          <View className="flex-row justify-between">
                            <BodyText className="text-cream-500 text-base">
                              Pronunciation
                            </BodyText>
                            <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                              {plant.phonetic_spelling}
                            </BodyText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === "problems" && (
                  <View className="pb-16">
                    {(plant.poison_symptoms ||
                      plant.poison_toxic_principle ||
                      plant.poison_severity) && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Toxicity Information
                          </TitleText>
                        </View>
                        <View>
                          {plant.poison_symptoms && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <BodyText className="text-cream-500 text-base mb-2">
                                Symptoms
                              </BodyText>
                              <HtmlRenderer
                                content={plant.poison_symptoms.toString()}
                              />
                            </View>
                          )}
                          {plant.poison_toxic_principle && (
                            <View className="mb-4 pb-4 border-b border-cream-50">
                              <BodyText className="text-cream-500 text-base mb-2">
                                Toxic Principle
                              </BodyText>
                              <HtmlRenderer
                                content={plant.poison_toxic_principle.toString()}
                              />
                            </View>
                          )}
                          {plant.poison_severity && (
                            <View className="flex-row justify-between mb-3">
                              <BodyText className="text-cream-500 text-base">
                                Severity
                              </BodyText>
                              <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                {plant.poison_severity}
                              </BodyText>
                            </View>
                          )}
                          {plant.poison_part &&
                            plant.poison_part.length > 0 && (
                              <View className="flex-row justify-between">
                                <BodyText className="text-cream-500 text-base">
                                  Poisonous Parts
                                </BodyText>
                                <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
                                  {plant.poison_part.filter(Boolean).join(", ")}
                                </BodyText>
                              </View>
                            )}
                        </View>
                      </View>
                    )}

                    {plant.problems && plant.problems.length > 0 && (
                      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="border-b border-cream-100 pb-3 mb-4">
                          <TitleText className="text-lg font-bold text-foreground">
                            Common Problems
                          </TitleText>
                        </View>
                        <View>
                          <BodyText className="text-foreground leading-relaxed">
                            {plant.problems.filter(Boolean).join(", ")}
                          </BodyText>
                        </View>
                      </View>
                    )}

                    {plant.resistance_to_challenges &&
                      plant.resistance_to_challenges.length > 0 && (
                        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                          <View className="border-b border-cream-100 pb-3 mb-4">
                            <TitleText className="text-lg font-bold text-foreground">
                              Resistances
                            </TitleText>
                          </View>
                          <View>
                            <BodyText className="text-foreground leading-relaxed">
                              {plant.resistance_to_challenges
                                .filter(Boolean)
                                .join(", ")}
                            </BodyText>
                          </View>
                        </View>
                      )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Tab Bar at the bottom */}
          <View className="absolute bottom-0 left-0 right-0">
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
          </View>
        </View>
      </ErrorBoundary>
    </PageContainer>
  );
}
