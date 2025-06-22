/**
 * Subscription success screen
 *
 * Celebrates successful subscription purchase and guides users to next steps:
 * - Confirmation of purchase
 * - Next steps guidance
 * - Quick access to key features
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PageContainer } from "@/components/UI/PageContainer";

export default function SubscriptionSuccessScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to main app
    router.replace("/(tabs)");
  };

  const handleViewSubscription = () => {
    // Navigate to subscription management
    router.push("/subscription");
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Success Header */}
        <View className="px-5 pt-12 pb-8 items-center">
          <View className="bg-green-100 rounded-full p-6 mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#059669" />
          </View>

          <Text className="text-3xl font-bold text-foreground text-center mb-3">
            Welcome to GreenThumb Premium!
          </Text>
          <Text className="text-lg text-muted-foreground text-center">
            Your subscription is now active and ready to transform your plant
            care journey
          </Text>
        </View>

        {/* Success Details */}
        <View className="px-5 mb-8">
          <View className="bg-green-50 border border-green-200 rounded-xl p-6">
            <Text className="text-lg font-semibold text-green-800 mb-3">
              🎉 You&apos;re all set!
            </Text>
            <Text className="text-green-700 text-base leading-6">
              Your premium features are now unlocked. You&apos;ll receive a
              confirmation email shortly with your receipt and subscription
              details.
            </Text>
          </View>
        </View>

        {/* What's Next */}
        <View className="px-5 mb-8">
          <Text className="text-2xl font-bold text-foreground mb-6">
            What&apos;s Next?
          </Text>

          <View className="space-y-4">
            <View className="bg-white border border-gray-200 rounded-xl p-6">
              <View className="flex-row items-start">
                <View className="bg-blue-100 rounded-full p-3 mr-4">
                  <Ionicons name="camera" size={24} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    1. Add Your First Plant
                  </Text>
                  <Text className="text-muted-foreground">
                    Use our AI plant identification to add your plants and get
                    personalized care schedules
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-xl p-6">
              <View className="flex-row items-start">
                <View className="bg-green-100 rounded-full p-3 mr-4">
                  <Ionicons name="notifications" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    2. Enable Smart Notifications
                  </Text>
                  <Text className="text-muted-foreground">
                    Get weather-aware reminders and never miss a watering or
                    care task again
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-xl p-6">
              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-3 mr-4">
                  <Ionicons name="analytics" size={24} color="#7c3aed" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    3. Track Your Progress
                  </Text>
                  <Text className="text-muted-foreground">
                    Monitor plant health, growth milestones, and celebrate your
                    successes
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Features Unlocked */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            Premium Features Unlocked
          </Text>

          <View className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  AI-powered plant identification & diagnosis
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  Weather-aware care notifications
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  Unlimited plant profiles & gardens
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  Expert consultation access
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  Advanced analytics & insights
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-foreground text-sm ml-2">
                  Priority customer support
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Guarantee Reminder */}
        <View className="px-5 mb-8">
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
              <Text className="text-lg font-semibold text-blue-800 ml-2">
                Remember: You&apos;re Protected
              </Text>
            </View>
            <Text className="text-blue-700 text-sm">
              30-day money-back guarantee • Plant survival guarantee • Success
              guarantee
            </Text>
            <Text className="text-blue-600 text-xs mt-2">
              If you&apos;re not completely satisfied, we&apos;ll make it right
              or refund your money.
            </Text>
          </View>
        </View>

        {/* Support */}
        <View className="px-5 mb-8">
          <View className="bg-gray-50 rounded-xl p-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Need Help Getting Started?
            </Text>
            <Text className="text-muted-foreground text-sm mb-4">
              Our plant experts are here to help you succeed. Reach out anytime!
            </Text>
            <TouchableOpacity className="bg-white border border-gray-300 rounded-lg py-3 px-4">
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color="#374151"
                />
                <Text className="text-foreground font-medium ml-2">
                  Contact Support
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleGetStarted}
          className="bg-green-600 rounded-xl py-4 px-6 mb-3"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Start Growing Success
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleViewSubscription}
          className="bg-gray-100 rounded-xl py-3 px-6"
        >
          <Text className="text-foreground text-center font-medium">
            Manage Subscription
          </Text>
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
}
