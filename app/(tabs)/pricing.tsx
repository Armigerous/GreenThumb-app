/**
 * Pricing screen for GreenThumb subscription plans
 *
 * Implements the guarantee-based selling strategy from the business model:
 * - Focus on plant survival outcomes, not app features
 * - Triple guarantee structure (service, money-back, success)
 * - Risk reversal positioning
 * - Front-loaded value proposition
 */

import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import { formatPrice } from "@/lib/stripe";
import {
  usePricingDisplay,
  useSubscriptionSummary,
} from "@/lib/subscriptionQueries";
import { PricingDisplay } from "@/types/subscription";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPlanId, setSelectedPlanId] =
    useState<string>("annual_premium");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: pricingPlans, isLoading: isLoadingPlans } = usePricingDisplay();
  const { data: subscriptionSummary, isLoading: isLoadingSummary } =
    useSubscriptionSummary(user?.id);

  // If user already has premium, redirect to subscription management
  React.useEffect(() => {
    if (subscriptionSummary?.is_premium) {
      router.replace("/subscription");
    }
  }, [subscriptionSummary?.is_premium, router]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleContinueToCheckout = async () => {
    if (!selectedPlanId || !user) {
      Alert.alert(
        "Error",
        "Please select a plan and ensure you are logged in."
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Navigate to checkout screen with selected plan
      router.push(`/checkout?plan=${selectedPlanId}`);
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      Alert.alert("Error", "Failed to proceed to checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingPlans || isLoadingSummary) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  const selectedPlan = pricingPlans?.find((p) => p.plan.id === selectedPlanId);

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-5 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Transform Your Plant Care
          </Text>
          <Text className="text-lg text-muted-foreground">
            From anxious plant killer to confident plant parent in 30 days
          </Text>
        </View>

        {/* Value Proposition */}
        <View className="px-5 mb-8">
          <View className="bg-green-50 border border-green-200 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <Ionicons name="shield-checkmark" size={24} color="#059669" />
              </View>
              <Text className="text-xl font-bold text-green-800">
                85% Plant Survival Guarantee
              </Text>
            </View>
            <Text className="text-green-700 text-base leading-6">
              Our AI-powered system ensures your plants thrive with personalized
              care schedules, weather-aware notifications, and expert guidance.
              Save $200+ in plant replacement costs.
            </Text>
          </View>
        </View>

        {/* Pricing Plans */}
        <View className="px-5 mb-8">
          <Text className="text-2xl font-bold text-foreground mb-6">
            Choose Your Plan
          </Text>

          {pricingPlans?.map((pricing: PricingDisplay) => (
            <TouchableOpacity
              key={pricing.plan.id}
              onPress={() => handleSelectPlan(pricing.plan.id)}
              className={`mb-4 rounded-xl border-2 ${
                selectedPlanId === pricing.plan.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="p-6">
                {/* Plan Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-xl font-bold text-foreground mr-2">
                        {pricing.plan.name}
                      </Text>
                      {pricing.badge && (
                        <View className="bg-green-500 rounded-full px-3 py-1">
                          <Text className="text-white text-xs font-semibold">
                            {pricing.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted-foreground mt-1">
                      {pricing.plan.description}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-2xl font-bold text-foreground">
                      {pricing.formatted_price}
                    </Text>
                    {pricing.plan.interval_type === "year" && (
                      <Text className="text-sm text-muted-foreground">
                        {formatPrice(Math.round(pricing.monthly_equivalent))}
                        /month
                      </Text>
                    )}
                    {pricing.savings_percent && (
                      <Text className="text-sm text-green-600 font-semibold">
                        Save {pricing.savings_percent}%
                      </Text>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View className="space-y-2">
                  {pricing.plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#059669"
                        className="mr-2"
                      />
                      <Text className="text-foreground text-sm flex-1 ml-2">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Selection Indicator */}
                {selectedPlanId === pricing.plan.id && (
                  <View className="mt-4 pt-4 border-t border-green-200">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#059669"
                      />
                      <Text className="text-green-700 font-semibold ml-2">
                        Selected Plan
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Triple Guarantee */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            Our Triple Guarantee
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="leaf" size={16} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  Service Guarantee
                </Text>
                <Text className="text-muted-foreground text-sm">
                  If your plants don&apos;t thrive in 30 days, we&apos;ll work
                  with you until they do - at no extra cost
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-green-100 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="card" size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  Money-Back Guarantee
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Not satisfied in 30 days? Get your full money back, no
                  questions asked
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-purple-100 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="trophy" size={16} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  Success Guarantee
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Follow our recommendations for 30 days with no improvement?
                  Get your full year free
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Social Proof */}
        <View className="px-5 mb-8">
          <View className="bg-gray-50 rounded-xl p-6">
            <Text className="text-center text-lg font-semibold text-foreground mb-2">
              Join 25,000+ Successful Plant Parents
            </Text>
            <Text className="text-center text-muted-foreground">
              &quot;I went from killing every plant to having a thriving garden.
              GreenThumb&apos;s AI recommendations are incredible!&quot; - Sarah
              M.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-200">
        {selectedPlan && (
          <View className="mb-4">
            <Text className="text-center text-muted-foreground">
              Selected: {selectedPlan.plan.name} -{" "}
              {selectedPlan.formatted_price}
            </Text>
            {selectedPlan.savings_percent && (
              <Text className="text-center text-green-600 font-semibold">
                You save {selectedPlan.savings_percent}% vs monthly
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleContinueToCheckout}
          disabled={isProcessing || !selectedPlanId}
          className={`rounded-xl py-4 px-6 ${
            isProcessing || !selectedPlanId ? "bg-gray-300" : "bg-green-600"
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Start Your Plant Success Journey
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-xs text-muted-foreground mt-3">
          30-day money-back guarantee • Cancel anytime • Secure payment
        </Text>
      </View>
    </PageContainer>
  );
}
