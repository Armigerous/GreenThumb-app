import CachedImage from "@/components/CachedImage";
import { Ionicons } from "@expo/vector-icons";
import { TitleText, BodyText } from "@/components/UI/Text";
import { View } from "react-native";
import React from "react";
import { PlantCareLog, UserPlant, TaskWithDetails } from "@/types/garden";

/**
 * PlantIdentityCard displays the main plant info card.
 * @param plantData - user plant data
 * @param careStatus - current care status object
 * @param lastCareLog - most recent care log (optional)
 * @param nextTask - next upcoming task (optional)
 * @param formatDate - function to format dates
 */
interface PlantIdentityCardProps {
  plantData: UserPlant & {
    scientific_name?: string;
    garden_name?: string;
  };
  careStatus: {
    text: string;
    color: string;
    bg: string;
    emoji: string;
    description: string;
  };
  lastCareLog?: PlantCareLog | null;
  nextTask?: TaskWithDetails | null;
  formatDate: (dateString: string) => string;
}

const PlantIdentityCard: React.FC<PlantIdentityCardProps> = ({
  plantData,
  careStatus,
  lastCareLog,
  nextTask,
  formatDate,
}) => (
  <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
    {/* Plant Image */}
    <View className="w-full h-[250px]">
      {plantData?.images && plantData.images.length > 0 ? (
        <CachedImage
          uri={plantData.images[0]}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityLabel="Main plant photo"
        />
      ) : (
        <View className="w-full h-full bg-cream-100 items-center justify-center">
          <Ionicons name="leaf-outline" size={64} className="text-cream-400" />
        </View>
      )}
    </View>
    {/* Plant Info */}
    <View className="p-5">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <TitleText className="text-2xl text-foreground">
            {plantData.nickname}
          </TitleText>
          <TitleText className="text-cream-600 text-base font-title mt-1">
            {plantData.scientific_name || ""}
          </TitleText>
        </View>
        {/* Health Status */}
        <View
          className={`rounded-full px-3 py-1.5 flex-row items-center ${careStatus.bg}`}
        >
          <BodyText className="text-lg mr-1">{careStatus.emoji}</BodyText>
          <BodyText
            className="text-sm font-medium"
            style={{ color: careStatus.color }}
          >
            {careStatus.text}
          </BodyText>
        </View>
      </View>
      {/* Garden Context */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="flower-outline" size={18} color={"#5E994B"} />
        <BodyText className="text-foreground ml-2 font-paragraph">
          In {plantData.garden_name || ""}
        </BodyText>
      </View>
      {/* Last Care & Next Task */}
      <View className="flex-row justify-between">
        <View className="flex-1 mr-2">
          <BodyText className="text-cream-600 text-sm">Last Entry</BodyText>
          <BodyText className="text-foreground font-paragraph-semibold">
            {lastCareLog
              ? `${formatDate(lastCareLog.taken_care_at)}`
              : "No entries yet"}
          </BodyText>
        </View>
        {nextTask && (
          <View className="flex-1 ml-2">
            <BodyText className="text-cream-600 text-sm">Next Task</BodyText>
            <BodyText className="text-foreground font-paragraph-semibold">
              {nextTask.task_type} {formatDate(nextTask.due_date)}
            </BodyText>
          </View>
        )}
      </View>
    </View>
  </View>
);

export default PlantIdentityCard;
