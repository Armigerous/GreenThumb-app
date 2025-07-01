import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, TitleText } from "../../UI/Text";
import HelpIcon from "../../UI/HelpIcon";
import ZipCodeInput from "../../UI/ZipCodeInput";

type LocationStepProps = {
  zipCode: string;
  city: string;
  onZipCodeChange: (text: string) => void;
  onLocationSelect: (locationData: {
    zipCode: string;
    latitude: number;
    longitude: number;
    city?: string;
    county?: string;
  }) => void;
};

export default function LocationStep({
  zipCode,
  city,
  onZipCodeChange,
  onLocationSelect,
}: LocationStepProps) {
  return (
    <View className="space-y-8">
      <View className="mb-2">
        <TitleText className="text-3xl mb-3">
          Where&apos;s Your Garden?
        </TitleText>
        <BodyText className="text-cream-600 leading-relaxed mb-4">
          Enter your NC ZIP code so we can send you frost alerts, rain
          reminders, and optimal planting times for your area.
        </BodyText>
      </View>

      <View className="space-y-6">
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <TitleText className="text-lg">Garden ZIP Code</TitleText>
              <BodyText className="text-primary ml-2 text-sm">
                (Highly Recommended)
              </BodyText>
            </View>
            <HelpIcon
              title="ZIP Code Privacy"
              explanation="We only use your ZIP code for weather data and growing zone detection. Your location is never shared with anyone."
            />
          </View>

          {/* Privacy note - updated for ZIP code */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <View className="flex-row items-start">
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#3B82F6"
                className="mt-0.5 mr-2"
              />
              <View className="flex-1">
                <BodyText className="text-blue-800 text-sm">
                  Optional • We only store your ZIP code for weather data •
                  Never shared with anyone
                </BodyText>
              </View>
            </View>
          </View>

          <ZipCodeInput
            value={zipCode}
            onChangeText={onZipCodeChange}
            onLocationSelect={onLocationSelect}
            placeholder="Enter your 5-digit NC ZIP code"
            className="mb-4"
          />

          {/* Show location info if ZIP is validated */}
          {city && zipCode && (
            <View className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#5E994B" />
                <BodyText className="text-brand-800 text-sm ml-2">
                  {city}, NC {zipCode}
                </BodyText>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
