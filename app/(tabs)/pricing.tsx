/**
 * Pricing screen for GreenThumb subscription plans
 *
 * Implements the guarantee-based selling strategy from the business model:
 * - Focus on plant survival outcomes, not app features
 * - Triple guarantee structure (service, money-back, success)
 * - Risk reversal positioning
 * - Front-loaded value proposition
 */

import { BodyText, TitleText } from "@/components/UI/Text";
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
import SubmitButton from "@/components/UI/SubmitButton";

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
        <View className="pb-8 px-4">
          <View className="flex flex-row items-start">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex flex-row items-center gap-2 mb-4"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <BodyText className="text-foreground text-base leading-6">
                Back
              </BodyText>
            </TouchableOpacity>
          </View>

          <TitleText className="text-3xl mb-2">
            We help your plants live longer
          </TitleText>
          <BodyText className="text-lg text-cream-600">
            Simple reminders and real help for every plant. Most plants survive
            their first year with us.
          </BodyText>
        </View>

        {/* Value Proposition */}
        <View className="px-4 mb-8">
          <View className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <View className="flex-row items-center mb-4">
              <View className="bg-brand-100 rounded-full p-2 mr-3">
                <Ionicons name="shield-checkmark" size={24} color="#5E994B" />
              </View>
              <TitleText className="text-xl text-brand-600">
                85% Plant Survival Guarantee
              </TitleText>
            </View>
            <BodyText className="text-foreground text-base leading-6">
              Our app helps your plants thrive with simple, personalized care
              reminders. Most people save money by keeping more plants alive.
            </BodyText>
          </View>
        </View>

        {/* Pricing Plans */}
        <View className="px-4 mb-8">
          <TitleText className="text-2xl text-cream-800 mb-6">
            Choose Your Plan
          </TitleText>

          {pricingPlans?.map((pricing: PricingDisplay) => (
            <TouchableOpacity
              key={pricing.plan.id}
              onPress={() => handleSelectPlan(pricing.plan.id)}
              className={`mb-4 rounded-xl border-2 ${
                selectedPlanId === pricing.plan.id
                  ? "border-brand-600 bg-brand-50"
                  : "border-cream-300 bg-cream-50"
              }`}
            >
              <View className="p-4">
                {/* Plan Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <TitleText className="text-xl text-cream-800 mr-2">
                        {pricing.plan.name}
                      </TitleText>
                      {pricing.badge && (
                        <View className="bg-accent-200 rounded-full px-3 py-1">
                          <Text className="text-accent-800 text-xs font-paragraph-semibold">
                            {pricing.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <BodyText className="text-cream-600 mt-1">
                      {pricing.plan.description}
                    </BodyText>
                  </View>

                  <View className="items-end">
                    <TitleText className="text-2xl text-cream-800">
                      {pricing.formatted_price}
                    </TitleText>
                    {pricing.plan.interval_type === "year" && (
                      <BodyText className="text-sm text-cream-600">
                        {formatPrice(Math.round(pricing.monthly_equivalent))}
                        /month
                      </BodyText>
                    )}
                    {pricing.savings_percent && (
                      <BodyText className="text-sm font-paragraph-semibold text-brand-600">
                        Save {pricing.savings_percent}%
                      </BodyText>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View className="gap-3">
                  {/*
                    Reason: Supabase 'features' is typed as Json | null, so it could be any JSON value.
                    We must check it's an array of strings before mapping to avoid runtime and type errors.
                  */}
                  {Array.isArray(pricing.plan.features) &&
                    pricing.plan.features.map(
                      (feature: unknown, index: number) => {
                        if (typeof feature !== "string") return null; // Only render string features
                        return (
                          <View key={index} className="flex-row items-center">
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#5E994B" // brand-600
                              className="mr-2"
                            />
                            <BodyText className="text-cream-800 text-sm flex-1 ml-2">
                              {feature}
                            </BodyText>
                          </View>
                        );
                      }
                    )}
                </View>

                {/* Selection Indicator */}
                {selectedPlanId === pricing.plan.id && (
                  <View className="mt-4 pt-4 border-t border-brand-100">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#5E994B"
                      />
                      <BodyText className="text-brand-600 font-paragraph-semibold ml-2">
                        Selected Plan
                      </BodyText>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Triple Guarantee */}
        <View className="px-4 mb-8">
          <TitleText className="text-xl mb-4">Our Triple Guarantee</TitleText>

          <View className="gap-4">
            <View className="flex-row items-start">
              <View className="bg-accent-50 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="leaf" size={16} color="#5E994B" />
              </View>
              <View className="flex-1">
                <BodyText className="font-paragraph-semibold text-cream-800">
                  Service Guarantee
                </BodyText>
                <BodyText className="text-cream-600 text-sm">
                  If your plants don’t do better in 30 days, we’ll help you
                  until they do—at no extra cost.
                </BodyText>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-brand-100 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="card" size={16} color="#5E994B" />
              </View>
              <View className="flex-1">
                <BodyText className="font-paragraph-semibold text-cream-800">
                  Money-Back Guarantee
                </BodyText>
                <BodyText className="text-cream-600 text-sm">
                  Not satisfied in 30 days? Get your money back. No questions
                  asked.
                </BodyText>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-purple-100 rounded-full p-2 mr-3 mt-1">
                <Ionicons name="trophy" size={16} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <BodyText className="font-paragraph-semibold text-cream-800">
                  Success Guarantee
                </BodyText>
                <BodyText className="text-cream-600 text-sm">
                  Follow our advice for 30 days and don’t see improvement? Get a
                  full year free.
                </BodyText>
              </View>
            </View>
          </View>
        </View>

        {/* Social Proof */}
        <View className="px-4 mb-8">
          <View className="bg-cream-50 rounded-xl p-4">
            <TitleText className="text-center text-lg mb-2">
              Join 25,000+ Successful Plant Parents
            </TitleText>
            <BodyText className="text-center text-cream-600">
              “I went from killing every plant to having a thriving garden.
              GreenThumb’s reminders are simple and actually work!” – Sarah M.
            </BodyText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 pb-8 pt-4 bg-cream-50 border-t border-cream-200">
        {selectedPlan && (
          <View className="mb-4">
            <BodyText className="text-center text-cream-600">
              Selected: {selectedPlan.plan.name} –{" "}
              {selectedPlan.formatted_price}
            </BodyText>
            {selectedPlan.savings_percent && (
              <BodyText className="text-center text-brand-600 font-paragraph-semibold">
                You save {selectedPlan.savings_percent}% vs monthly
              </BodyText>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleContinueToCheckout}
          disabled={isProcessing || !selectedPlanId}
          className={`rounded-xl h-12 py-3 px-6 font-paragraph-semibold ${
            isProcessing || !selectedPlanId
              ? "bg-cream-300 text-cream-600"
              : "bg-brand-600 text-primary-foreground"
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fffefa" />
          ) : (
            <BodyText className="text-primary-foreground text-center font-paragraph-semibold text-base">
              Help your plants live longer
            </BodyText>
          )}
        </TouchableOpacity>

        <BodyText className="text-center text-xs text-cream-600 mt-3">
          30-day money-back guarantee • Cancel anytime • Secure payment
        </BodyText>
      </View>
    </PageContainer>
  );
}
