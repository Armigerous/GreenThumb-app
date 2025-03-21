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
        color: "#059669", // green-600
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
        bg: "bg-green-100",
        text: "text-green-700",
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
        className="bg-white border border-cream-100 p-3 rounded-lg shadow-sm mb-3 mx-4"
        onPress={() => onPlantPress(item)}
      >
        <View className="flex-row items-start mb-2">
          {item.images?.[0] && (
            <Image
              source={{ uri: item.images[0] }}
              className="h-16 rounded-lg w-16 mr-3"
            />
          )}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-base text-foreground font-medium">
                  {item.nickname}
                </Text>
              </View>
              <View
                className={`rounded-full px-3 py-1 flex-row items-center ${statusStyle.bg}`}
              >
                <Ionicons
                  name={statusStyle.icon}
                  size={14}
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
                  className={`text-xs font-medium ml-1 ${statusStyle.text}`}
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

            <View className="flex-row items-center mt-2">
              {lastWatered && (
                <View className="flex-row items-center mr-4">
                  <Ionicons name="water-outline" size={14} color="#0891b2" />
                  <Text className="text-blue-600 text-xs ml-1">
                    Watered {lastWatered}
                  </Text>
                </View>
              )}
              {item.care_logs && item.care_logs.length > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                  <Text className="text-cream-500 text-xs ml-1">
                    {item.care_logs.length} Care{" "}
                    {item.care_logs.length === 1 ? "Log" : "Logs"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="flex-row border-cream-100 border-t justify-end pt-2">
          {onWaterPlant && (
            <TouchableOpacity
              className="flex-row bg-blue-50 rounded-full items-center mr-2 px-3 py-1.5"
              onPress={() => onWaterPlant(item)}
            >
              <Ionicons name="water" size={14} color="#0891b2" />
              <Text className="text-blue-600 text-xs font-medium ml-1">
                Water
              </Text>
            </TouchableOpacity>
          )}
          {onEditPlant && (
            <TouchableOpacity
              className="flex-row bg-cream-50 rounded-full items-center px-3 py-1.5"
              onPress={() => onEditPlant(item)}
            >
              <Ionicons name="create-outline" size={14} color="#6b7280" />
              <Text className="text-cream-600 text-xs font-medium ml-1">
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
    <View className="flex-row items-center mb-2 mt-4 mx-4">
      <Ionicons name={section.icon} size={20} color={section.color} />
      <Text className="text-foreground text-lg font-semibold ml-2">
        {section.title}
      </Text>
      <Text className="text-cream-500 ml-2">({section.data.length})</Text>
    </View>
  );

  const ListHeader = () => {
    return (
      <>
        <View className="flex-row justify-between items-center mb-4 mx-4">
          <Text className="text-foreground text-xl font-semibold">
            My Plants
          </Text>
          <TouchableOpacity
            className="flex-row bg-brand-500 rounded-full items-center px-3 py-2"
            onPress={onAddPlant}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1">Add Plant</Text>
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
        <View className="mb-4 mx-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground text-xl font-semibold">
              My Plants
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-3 py-2"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-medium ml-1">Add Plant</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm items-center px-4 py-10">
            <Ionicons
              name="leaf-outline"
              size={48}
              color="#9e9a90"
              className="mb-2"
            />
            <Text className="text-center text-foreground text-lg font-medium mb-2">
              No plants added yet
            </Text>
            <Text className="text-center text-cream-500 mb-6">
              Add your first plant to start tracking its care
            </Text>
            <TouchableOpacity
              className="flex-row bg-brand-500 rounded-full items-center px-4 py-2"
              onPress={onAddPlant}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-medium ml-1">
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
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
