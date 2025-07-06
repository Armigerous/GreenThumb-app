import CachedImage from "@/components/CachedImage";
import { ErrorBoundary } from "@/components/Database/Plant/ErrorBoundary";
import { HtmlRenderer } from "@/components/Database/Plant/HtmlRenderer";
import BrandedErrorPage from "@/components/UI/BrandedErrorPage";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { BodyText, SubtitleText, TitleText } from "@/components/UI/Text";
import { usePlantDetails } from "@/lib/queries";
import { PlantFullDataUI } from "@/types/plant";
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

// Overview Section: Description, quick facts, uses, edibility, wildlife value, attracts
const OverviewSection: React.FC<{ plant: PlantFullDataUI }> = ({ plant }) => {
  // Reason: Only display fields if present, and map arrays/objects safely
  return (
    <View className="pb-16">
      {/* Description */}
      {plant.description && (
        <SectionCard title="Description">
          <HtmlRenderer content={plant.description} />
        </SectionCard>
      )}
      {/* Quick Facts */}
      {(plant.height_min ||
        plant.height_max ||
        plant.width_min ||
        plant.width_max ||
        plant.growth_rate ||
        plant.origin) && (
        <SectionCard title="Quick Facts">
          {plant.height_min || plant.height_max ? (
            <FactRow
              label="Height"
              value={`${plant.height_min ?? "?"}-${plant.height_max ?? "?"} in`}
            />
          ) : null}
          {plant.width_min || plant.width_max ? (
            <FactRow
              label="Width"
              value={`${plant.width_min ?? "?"}-${plant.width_max ?? "?"} in`}
            />
          ) : null}
          {plant.growth_rate && (
            <FactRow label="Growth Rate" value={plant.growth_rate} />
          )}
          {plant.origin && <FactRow label="Origin" value={plant.origin} />}
        </SectionCard>
      )}
      {/* Uses, Edibility, Wildlife Value, Attracts */}
      {(plant.uses ||
        plant.edibility ||
        plant.wildlife_value ||
        (Array.isArray(plant.attracts) && plant.attracts.length > 0)) && (
        <SectionCard title="Uses & Value">
          {plant.uses && <FactBlock label="Uses" content={plant.uses} />}
          {plant.edibility && (
            <FactBlock label="Edibility" content={plant.edibility} />
          )}
          {plant.wildlife_value && (
            <FactBlock label="Wildlife Value" content={plant.wildlife_value} />
          )}
          {Array.isArray(plant.attracts) && plant.attracts.length > 0 && (
            <View className="mb-2">
              <BodyText className="text-cream-500 text-base mb-1">
                Attracts
              </BodyText>
              <View className="flex-row flex-wrap">
                {plant.attracts.filter(Boolean).map((a, i) => (
                  <View
                    key={i}
                    className="bg-brand-50 px-3 py-2 rounded-xl mr-2 mb-2"
                  >
                    <BodyText className="text-sm text-brand-700">
                      {String(a)}
                    </BodyText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </SectionCard>
      )}
    </View>
  );
};

// Care Section: Light, water, soil pH, soil texture, maintenance, USDA zones
const CareSection: React.FC<{ plant: PlantFullDataUI }> = ({ plant }) => {
  return (
    <View className="pb-16">
      <SectionCard title="Care Requirements">
        {plant.light_requirements && (
          <FactBlock label="Light" content={String(plant.light_requirements)} />
        )}
        {plant.maintenance && (
          <FactBlock label="Maintenance" content={String(plant.maintenance)} />
        )}
        {plant.soil_ph && (
          <FactRow label="Soil pH" value={String(plant.soil_ph)} />
        )}
        {plant.soil_texture && (
          <FactRow label="Soil Texture" value={String(plant.soil_texture)} />
        )}
        {plant.usda_zones && (
          <FactRow label="USDA Zones" value={String(plant.usda_zones)} />
        )}
      </SectionCard>
    </View>
  );
};

// Features Section: Flower, leaf, fruit details
const FeaturesSection: React.FC<{ plant: PlantFullDataUI }> = ({ plant }) => {
  return (
    <View className="pb-16">
      {/* Flower Features */}
      {(plant.flower_description ||
        plant.flower_colors ||
        plant.flower_bloom_time) && (
        <SectionCard title="Flower Features">
          {plant.flower_description && (
            <FactBlock content={plant.flower_description} />
          )}
          {plant.flower_colors && (
            <FactRow label="Color" value={String(plant.flower_colors)} />
          )}
          {plant.flower_bloom_time && (
            <FactRow
              label="Bloom Time"
              value={String(plant.flower_bloom_time)}
            />
          )}
        </SectionCard>
      )}
      {/* Leaf Features */}
      {(plant.leaf_description || plant.leaf_color || plant.leaf_shape) && (
        <SectionCard title="Leaf Features">
          {plant.leaf_description && (
            <FactBlock content={plant.leaf_description} />
          )}
          {plant.leaf_color && (
            <FactRow label="Color" value={String(plant.leaf_color)} />
          )}
          {plant.leaf_shape && (
            <FactRow label="Shape" value={String(plant.leaf_shape)} />
          )}
        </SectionCard>
      )}
      {/* Fruit Features */}
      {(plant.fruit_description || plant.fruit_color || plant.fruit_type) && (
        <SectionCard title="Fruit Features">
          {plant.fruit_description && (
            <FactBlock content={plant.fruit_description} />
          )}
          {plant.fruit_color && (
            <FactRow label="Color" value={String(plant.fruit_color)} />
          )}
          {plant.fruit_type && (
            <FactRow label="Type" value={String(plant.fruit_type)} />
          )}
        </SectionCard>
      )}
    </View>
  );
};

// Taxonomy Section: Family, genus, species, pronunciation
const TaxonomySection: React.FC<{ plant: PlantFullDataUI }> = ({ plant }) => (
  <View className="pb-16">
    <SectionCard title="Classification">
      {plant.family && <FactRow label="Family" value={plant.family} />}
      {plant.genus && <FactRow label="Genus" value={plant.genus} />}
      {plant.species && <FactRow label="Species" value={plant.species} />}
      {plant.phonetic_spelling && (
        <FactRow label="Pronunciation" value={plant.phonetic_spelling} />
      )}
    </SectionCard>
  </View>
);

// Problems Section: Toxicity, common problems, resistances
const ProblemsSection: React.FC<{ plant: PlantFullDataUI }> = ({ plant }) => (
  <View className="pb-16">
    {/* Toxicity */}
    {(plant.poison_symptoms ||
      plant.poison_toxic_principle ||
      plant.poison_severity ||
      (Array.isArray(plant.poison_parts) && plant.poison_parts.length > 0)) && (
      <SectionCard title="Toxicity Information">
        {plant.poison_symptoms && (
          <FactBlock label="Symptoms" content={plant.poison_symptoms} />
        )}
        {plant.poison_toxic_principle && (
          <FactBlock
            label="Toxic Principle"
            content={plant.poison_toxic_principle}
          />
        )}
        {plant.poison_severity && (
          <FactRow label="Severity" value={plant.poison_severity} />
        )}
        {Array.isArray(plant.poison_parts) && plant.poison_parts.length > 0 && (
          <FactRow
            label="Poisonous Parts"
            value={plant.poison_parts.filter(Boolean).join(", ")}
          />
        )}
      </SectionCard>
    )}
    {/* Common Problems */}
    {Array.isArray(plant.problems) && plant.problems.length > 0 && (
      <SectionCard title="Common Problems">
        <BodyText className="text-foreground leading-relaxed">
          {plant.problems.filter(Boolean).join(", ")}
        </BodyText>
      </SectionCard>
    )}
    {/* Resistances */}
    {Array.isArray(plant.resistance_to_challenges) &&
      plant.resistance_to_challenges.length > 0 && (
        <SectionCard title="Resistances">
          <BodyText className="text-foreground leading-relaxed">
            {plant.resistance_to_challenges.filter(Boolean).join(", ")}
          </BodyText>
        </SectionCard>
      )}
  </View>
);

// --- Helper Components ---

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
    <View className="border-b border-cream-100 pb-3 mb-4">
      <TitleText className="text-lg font-bold text-foreground">
        {title}
      </TitleText>
    </View>
    {children}
  </View>
);

const FactRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View className="flex-row justify-between mb-3">
    <BodyText className="text-cream-500 text-base">{label}</BodyText>
    <BodyText className="text-foreground text-base font-medium max-w-[60%] text-right">
      {value}
    </BodyText>
  </View>
);

const FactBlock: React.FC<{ label?: string; content: string }> = ({
  label,
  content,
}) => (
  <View className="mb-4 pb-4 border-b border-cream-50">
    {label && (
      <BodyText className="text-cream-500 text-base mb-2">{label}</BodyText>
    )}
    <HtmlRenderer content={content} />
  </View>
);

// --- Main Plant Detail Screen ---

export default function PlantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const {
    data: plant,
    isLoading: loading,
    error: queryError,
  } = usePlantDetails(slug);

  useEffect(() => {
    if (plant) {
      const title = plant.common_names?.[0] || plant.scientific_name;
      router.setParams({ title });
    }
  }, [plant, router]);

  // Process image data for the gallery
  const galleryImages = useMemo(
    () =>
      plant?.images
        ?.filter((img) => img && img.img)
        .map((img) => img.img as string) || [],
    [plant]
  );
  const firstImage = plant?.images?.[0]?.img || null;
  const commonName = plant?.common_names?.[0] || undefined;
  const bottomPadding = 60;

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

  // --- Main Layout ---
  return (
    <PageContainer scroll={false} padded={false} safeArea={false}>
      <ErrorBoundary>
        <View className="flex-1">
          {/* Header */}
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
            {/* Hero Image */}
            <View className="w-full h-[300px]">
              <Image
                source={{
                  uri:
                    firstImage ||
                    "https://theofficialgreenthumb.com/no-plant-image.png",
                }}
                className="w-full h-full rounded-b-3xl"
                resizeMode="cover"
                alt={
                  plant.images?.[0]?.alt_text ||
                  plant.scientific_name ||
                  "Plant image"
                }
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
                    onPress={() => {}}
                  >
                    <Ionicons
                      name="volume-high-outline"
                      size={20}
                      color="#5E994B"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {/* Tags - horizontally scrollable, 2 stacked rows, single scroll, '+N more' if too many */}
              {Array.isArray(plant.tags) &&
                plant.tags.length > 0 &&
                (() => {
                  // Reason: Prevent visual overload by limiting to 2 stacked rows (12 tags max), with a single horizontal scroll for both rows. This keeps the UI clean and focused.
                  const MAX_TAGS = 12;
                  const TAGS_PER_ROW = 6;
                  const tags = plant.tags.filter(Boolean).map(String);
                  const displayTags = tags.slice(0, MAX_TAGS);
                  const extraCount = tags.length - MAX_TAGS;
                  const row1 = displayTags.slice(0, TAGS_PER_ROW);
                  const row2 = displayTags.slice(TAGS_PER_ROW, MAX_TAGS);
                  return (
                    <View className="mb-4">
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <View style={{ flexDirection: "column" }}>
                          <View style={{ flexDirection: "row" }}>
                            {row1.map((tag, i) => (
                              <View
                                key={`tag-row1-${i}`}
                                className="bg-brand-100 px-3 py-1.5 rounded-xl mr-2 mb-1"
                              >
                                <BodyText className="text-xs text-brand-700 font-medium">
                                  {tag}
                                </BodyText>
                              </View>
                            ))}
                          </View>
                          {row2.length > 0 && (
                            <View style={{ flexDirection: "row" }}>
                              {row2.map((tag, i) => (
                                <View
                                  key={`tag-row2-${i}`}
                                  className="bg-brand-100 px-3 py-1.5 rounded-xl mr-2 mb-1"
                                >
                                  <BodyText className="text-xs text-brand-700 font-medium">
                                    {tag}
                                  </BodyText>
                                </View>
                              ))}
                              {extraCount > 0 && (
                                <View className="bg-brand-200 px-3 py-1.5 rounded-xl mr-2 mb-1">
                                  <BodyText className="text-xs text-brand-700 font-medium">
                                    +{extraCount} more
                                  </BodyText>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      </ScrollView>
                    </View>
                  );
                })()}
              {/* Image Gallery */}
              {plant.images && plant.images.length > 1 && (
                <View className="my-4">
                  <TitleText className="text-lg font-bold text-cream-800 mb-3">
                    Images
                  </TitleText>
                  <FlatList
                    horizontal
                    data={plant.images.slice(1)}
                    keyExtractor={(item, index) => `image-${index}`}
                    renderItem={({ item }) => (
                      <View className="mr-2">
                        {/* Reason: Apply consistent, fully rounded corners to gallery images for UI consistency */}
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
              {/* Quick Actions */}
              <QuickActions plant={plant} />
              {/* Tab Bar (moved here, below Add to Garden) */}
              <View className="mb-2">
                <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
              </View>
              {/* Tab Content */}
              <View className="mt-2 mb-4">
                {activeTab === "overview" && <OverviewSection plant={plant} />}
                {activeTab === "care" && <CareSection plant={plant} />}
                {activeTab === "features" && <FeaturesSection plant={plant} />}
                {activeTab === "taxonomy" && <TaxonomySection plant={plant} />}
                {activeTab === "problems" && <ProblemsSection plant={plant} />}
              </View>
            </View>
          </ScrollView>
        </View>
      </ErrorBoundary>
    </PageContainer>
  );
}
