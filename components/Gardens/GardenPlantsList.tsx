import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Image,
  SectionListData,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import type { UserPlant } from "@/types/garden";
import { ReactNode } from "react";

type PlantSection = {
  title: string;
  status: string;
  data: UserPlant[];
  icon: "alert-circle" | "water" | "checkmark-circle" | "moon";
  color: string;
};

/**
 * Props for the GardenPlantsList component
 *
 * This type defines the properties that can be passed to the GardenPlantsList
 * component for rendering a list of plants in a garden.
 */
type GardenPlantsListProps = {
  /** Array of plants to display in the list */
  plants?: UserPlant[];
  /** Callback function for when the user wants to add a new plant */
  onAddPlant: () => void;
  /** Callback function for when a plant is pressed, receives the plant data */
  onPlantPress: (plant: UserPlant) => void;
  /** Callback function for when a plant is watered, receives the plant data */
  onWaterPlant?: (plant: UserPlant) => void;
  /** Callback function for when a plant is edited, receives the plant data */
  onEditPlant?: (plant: UserPlant) => void;
  /** Optional component to render at the top of the list */
  HeaderComponent?: ReactNode;
  /** Optional component to render at the bottom of the list */
  FooterComponent?: ReactNode;
};

export default function GardenPlantsList({
  plants,
  onAddPlant,
  onPlantPress,
  onWaterPlant,
  onEditPlant,
  HeaderComponent,
  FooterComponent,
}: GardenPlantsListProps) {
  // Group plants by status
  const getGroupedPlants = () => {
    if (!plants || plants.length === 0) return [];

    const criticalPlants: UserPlant[] = plants.filter(
      (p) => p.status === "Dead" || p.status === "Wilting"
    );
    const needsAttentionPlants: UserPlant[] = plants.filter(
      (p) => p.status === "Needs Water" || p.status === "Dormant"
    );
    const healthyPlants: UserPlant[] = plants.filter(
      (p) => p.status === "Healthy"
    );

    const sections = [];

    if (criticalPlants.length > 0) {
      sections.push({
        title: "Needs Immediate Care",
        status: "Dead",
        data: criticalPlants,
        icon: "alert-circle" as const,
        color: "#dc2626", // red-600
      });
    }

    if (needsAttentionPlants.length > 0) {
      sections.push({
        title: "Due for Care",
        status: "Needs Water",
        data: needsAttentionPlants,
        icon: "water" as const,
        color: "#d97706", // yellow-600
      });
    }

    if (healthyPlants.length > 0) {
      sections.push({
        title: "Looking Good",
        status: "Healthy",
        data: healthyPlants,
        icon: "checkmark-circle" as const,
        color: "#77B860", // brand-600
      });
    }

    return sections;
  };

  const groupedPlants = getGroupedPlants();

  // Helper to format date if valid
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    const date = parseISO(dateString);
    if (!isValid(date)) return null;

    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    return format(date, "MMM d");
  };

  const getLastWateringDate = (plant: UserPlant) => {
    if (!plant.care_logs || plant.care_logs.length === 0) return null;
    const lastLog = plant.care_logs[plant.care_logs.length - 1];
    return formatDate(lastLog.taken_care_at);
  };

  const renderPlantCard = ({ item }: { item: UserPlant }) => {
    const statusColors = {
      Healthy: {
        bg: "bg-brand-100",
        text: "text-brand-700",
        icon: "checkmark-circle" as const,
      },
      "Needs Water": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "water" as const,
      },
      Wilting: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "alert-circle" as const,
      },
      Dormant: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "moon" as const,
      },
      Dead: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "alert-circle" as const,
      },
    } as const;

    const statusStyle = statusColors[item.status as keyof typeof statusColors];
    const lastWatered = getLastWateringDate(item);

    return (
      <TouchableOpacity
        className="bg-white border border-cream-100 px-4 py-3.5 rounded-lg shadow-sm mb-3.5 mx-4"
        onPress={() => onPlantPress(item)}
      >
        <View className="flex-row items-start mb-3">
          {item.images?.[0] && (
            <Image
              source={{ uri: item.images[0] }}
              className="h-18 rounded-lg w-18 mr-4"
            />
          )}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-3">
                <Text className="text-base text-foreground font-medium">
                  {item.nickname}
                </Text>
              </View>
              <View
                className={`rounded-full px-3.5 py-1.5 flex-row items-center ${statusStyle.bg}`}
              >
                <Ionicons
                  name={statusStyle.icon}
                  size={16}
                  color={
                    item.status === "Healthy"
                      ? "#059669"
                      : item.status === "Needs Water" ||
                        item.status === "Dormant"
                      ? "#d97706"
                      : "#dc2626"
                  }
                />
                <Text
                  className={`text-xs font-medium ml-1.5 ${statusStyle.text}`}
                >
                  {item.status === "Healthy"
                    ? "Healthy"
                    : item.status === "Needs Water"
                    ? "Needs Water"
                    : item.status === "Dormant"
                    ? "Dormant"
                    : item.status === "Wilting"
                    ? "Wilting"
                    : "Dead"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2.5">
              {lastWatered && (
                <View className="flex-row items-center mr-4">
                  <Ionicons name="water-outline" size={16} color="#0891b2" />
                  <Text className="text-blue-600 text-xs ml-1.5">
                    Watered {lastWatered}
                  </Text>
                </View>
              )}
              {item.care_logs && item.care_logs.length > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                  <Text className="text-cream-500 text-xs ml-1.5">
                    {item.care_logs.length} Care{" "}
                    {item.care_logs.length === 1 ? "Log" : "Logs"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="flex-row border-cream-100 border-t justify-end pt-3">
          {onWaterPlant && (
            <TouchableOpacity
              className="flex-row bg-blue-50 rounded-full items-center mr-3 px-4 py-2"
              onPress={() => onWaterPlant(item)}
            >
              <Ionicons name="water" size={16} color="#0891b2" />
              <Text className="text-blue-600 text-xs font-medium ml-1.5">
                Water
              </Text>
            </TouchableOpacity>
          )}
          {onEditPlant && (
            <TouchableOpacity
              className="flex-row bg-cream-50 rounded-full items-center px-4 py-2"
              onPress={() => onEditPlant(item)}
            >
              <Ionicons name="create-outline" size={16} color="#6b7280" />
              <Text className="text-cream-600 text-xs font-medium ml-1.5">
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<UserPlant, PlantSection>;
  }) => (
    <View className="flex-row items-center mb-3 mt-5 mx-4">
      <Ionicons name={section.icon} size={22} color={section.color} />
      <Text className="text-foreground text-lg font-semibold ml-2.5">
        {section.title}
      </Text>
      <Text className="text-cream-500 ml-2.5">({section.data.length})</Text>
    </View>
  );

  const ListHeader = () => {
    return (
      <>
        <View className="flex-row justify-between items-center mb-5 mx-4 mt-2">
          <Text className="text-foreground text-xl font-semibold">
            My Plants
          </Text>
          <TouchableOpacity
            className="flex-row bg-brand-500 rounded-full items-center px-4 py-2.5"
            onPress={onAddPlant}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1.5">Add Plant</Text>
          </TouchableOpacity>
        </View>
        {HeaderComponent}
      </>
    );
  };

  if (!plants || plants.length === 0) {
    return (
      <View className="flex-1">
        {HeaderComponent}
        <View className="mb-5 mx-4">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-foreground text-xl font-semibold">
              My Plants
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-4 py-2.5"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-1.5">Add Plant</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm items-center px-5 py-12">
            <Ionicons
              name="leaf-outline"
              size={56}
              color="#9e9a90"
              className="mb-3"
            />
            <Text className="text-center text-foreground text-lg font-medium mb-3">
              No plants added yet
            </Text>
            <Text className="text-center text-cream-500 mb-7 px-5">
              Add your first plant to start tracking its care
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-5 py-3"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-2 text-base">
                Add First Plant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {FooterComponent}
      </View>
    );
  }

  return (
    <SectionList<UserPlant, PlantSection>
      sections={groupedPlants}
      renderItem={renderPlantCard}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={<ListHeader />}
      ListFooterComponent={
        FooterComponent ? () => <>{FooterComponent}</> : undefined
      }
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
