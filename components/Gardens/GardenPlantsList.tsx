import { View, Text, TouchableOpacity, SectionList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isValid, parseISO } from "date-fns";
import type { UserPlant as BaseUserPlant } from "@/types/garden";
import { ReactNode } from "react";

interface ExtendedUserPlant extends BaseUserPlant {
  planting_date?: string;
}

type GardenPlantsListProps = {
  plants?: ExtendedUserPlant[];
  onAddPlant: () => void;
  onPlantPress: (plant: ExtendedUserPlant) => void;
  HeaderComponent?: ReactNode;
  FooterComponent?: ReactNode;
};

export default function GardenPlantsList({
  plants,
  onAddPlant,
  onPlantPress,
  HeaderComponent,
  FooterComponent,
}: GardenPlantsListProps) {
  // Group plants by status
  const getGroupedPlants = () => {
    if (!plants || plants.length === 0) return [];

    const criticalPlants = plants.filter((p) => p.status === "critical");
    const needsAttentionPlants = plants.filter(
      (p) => p.status === "needs_attention"
    );
    const healthyPlants = plants.filter((p) => p.status === "healthy");

    const sections = [];

    if (criticalPlants.length > 0) {
      sections.push({
        title: "Critical",
        status: "critical",
        data: criticalPlants,
        icon: "alert-circle" as const,
        color: "#dc2626", // red-600
      });
    }

    if (needsAttentionPlants.length > 0) {
      sections.push({
        title: "Needs Attention",
        status: "needs_attention",
        data: needsAttentionPlants,
        icon: "water" as const,
        color: "#d97706", // yellow-600
      });
    }

    if (healthyPlants.length > 0) {
      sections.push({
        title: "Healthy",
        status: "healthy",
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

    return format(date, "MMM d, yyyy");
  };

  const renderPlantCard = ({ item }: { item: ExtendedUserPlant }) => {
    const plantingDate = formatDate(item.planting_date);
    const statusColors = {
      healthy: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "checkmark-circle" as const,
      },
      needs_attention: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "water" as const,
      },
      critical: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "alert-circle" as const,
      },
    };

    const statusStyle = statusColors[item.status];

    return (
      <TouchableOpacity
        className="bg-white border border-cream-100 p-3 rounded-lg shadow-sm mb-3 mx-4"
        onPress={() => onPlantPress(item)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base text-foreground font-medium">
              {item.custom_name || item.botanical_name}
            </Text>
            {item.custom_name && (
              <Text className="text-cream-500 text-xs">
                {item.botanical_name}
              </Text>
            )}
          </View>

          <View
            className={`rounded-full px-3 py-1 flex-row items-center ${statusStyle.bg}`}
          >
            <Ionicons
              name={statusStyle.icon}
              size={14}
              color={
                item.status === "healthy"
                  ? "#059669"
                  : item.status === "needs_attention"
                  ? "#d97706"
                  : "#dc2626"
              }
            />
            <Text className={`text-xs font-medium ml-1 ${statusStyle.text}`}>
              {item.status === "healthy"
                ? "Healthy"
                : item.status === "needs_attention"
                ? "Needs Care"
                : "Critical"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-1">
          {plantingDate && (
            <Text className="text-cream-500 text-xs">
              Planted: {plantingDate}
            </Text>
          )}

          {item.care_logs && item.care_logs.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={12} color="#9ca3af" />
              <Text className="text-cream-500 text-xs ml-1">
                {item.care_logs.length} Care{" "}
                {item.care_logs.length === 1 ? "Log" : "Logs"}
              </Text>
            </View>
          )}

          <View className="flex-row">
            <TouchableOpacity className="mr-2">
              <Ionicons name="water" size={18} color="#0ea5e9" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View className="flex-row items-center mb-2 mt-4 mx-4">
      <Ionicons name={section.icon} size={20} color={section.color} />
      <Text className="text-foreground text-lg font-semibold ml-2">
        {section.title}
      </Text>
      <Text className="text-cream-500 ml-2">({section.data.length})</Text>
    </View>
  );

  const ListHeader = () => (
    <>
      <View className="flex-row justify-between items-center mb-4 mx-4">
        <Text className="text-foreground text-xl font-semibold">My Plants</Text>
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
            <Text className="text-center text-cream-500 mb-4">
              Add your first plant to get started with tracking your garden!
            </Text>
            <TouchableOpacity
              className="bg-brand-500 rounded-full px-5 py-2.5"
              onPress={onAddPlant}
            >
              <Text className="text-white font-medium">
                Add Your First Plant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {FooterComponent}
      </View>
    );
  }

  return (
    <SectionList
      sections={groupedPlants}
      keyExtractor={(item) => item.id}
      renderItem={renderPlantCard}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={<ListHeader />}
      ListFooterComponent={
        <>
          <View className="h-4" />
          {FooterComponent}
        </>
      }
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}
