/**
 * Subscription management screen
 *
 * Allows users to:
 * - View current subscription details
 * - Manage billing and payment methods
 * - Purchase add-ons
 * - Cancel or modify subscription
 * - View payment history
 */

import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";
import SubmitButton from "@/components/UI/SubmitButton";
import {
  useSubscriptionSummary,
  useSubscriptionAddons,
  usePaymentHistory,
  useCancelSubscription,
  useUpdateSubscription,
} from "@/lib/subscriptionQueries";
import { formatPrice, formatDate } from "@/lib/stripe";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subscriptionSummary, isLoading: isLoadingSummary } =
    useSubscriptionSummary(user?.id);
  const { data: addons, isLoading: isLoadingAddons } = useSubscriptionAddons();
  const { data: paymentHistory, isLoading: isLoadingHistory } =
    usePaymentHistory(user?.id);

  const cancelSubscriptionMutation = useCancelSubscription();
  const updateSubscriptionMutation = useUpdateSubscription();

  // If user doesn't have premium, redirect to pricing
  React.useEffect(() => {
    if (subscriptionSummary && !subscriptionSummary.is_premium) {
      router.replace("/pricing");
    }
  }, [subscriptionSummary?.is_premium, router]);

  const handleCancelSubscription = () => {
    if (!subscriptionSummary?.subscription) return;

    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: confirmCancelSubscription,
        },
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    if (!subscriptionSummary?.subscription) return;

    setIsProcessing(true);
    try {
      await cancelSubscriptionMutation.mutateAsync({
        subscriptionId: subscriptionSummary.subscription.id,
        cancelAtPeriodEnd: true,
      });

      Alert.alert(
        "Subscription Canceled",
        "Your subscription has been canceled. You'll continue to have access until the end of your current billing period."
      );
    } catch (error) {
      console.error("Error canceling subscription:", error);
      Alert.alert(
        "Error",
        "Failed to cancel subscription. Please try again or contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscriptionSummary?.subscription) return;

    setIsProcessing(true);
    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionId: subscriptionSummary.subscription.id,
        updates: { cancel_at_period_end: false },
      });

      Alert.alert(
        "Subscription Reactivated",
        "Your subscription has been reactivated and will continue to renew automatically."
      );
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      Alert.alert(
        "Error",
        "Failed to reactivate subscription. Please try again or contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeSubscription = () => {
    router.push("/pricing");
  };

  const handlePurchaseAddon = (addonId: string) => {
    // Navigate to addon purchase flow
    router.push(`/(tabs)/addon-checkout?addon=${addonId}`);
  };

  if (isLoadingSummary) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (!subscriptionSummary?.is_premium) {
    return (
      <PageContainer>
        <View className="flex-1 justify-center items-center px-4">
          <BodyText className="text-lg text-muted-foreground mb-6 text-center">
            No active subscription found
          </BodyText>
          <SubmitButton
            onPress={() => router.push("/pricing")}
            color="primary"
            size="lg"
            width="full"
          >
            View Plans
          </SubmitButton>
        </View>
      </PageContainer>
    );
  }

  const subscription = subscriptionSummary.subscription!;

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 flex-row items-center"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2c29" />
          </TouchableOpacity>

          <TitleText className="text-3xl text-foreground mb-2">
            Subscription
          </TitleText>
          <BodyText className="text-lg text-muted-foreground">
            Manage your GreenThumb Premium subscription
          </BodyText>
        </View>

        {/* Current Plan */}
        <View className="px-5 mb-6">
          <View className="bg-cream-50 border border-cream-200 rounded-xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <SubtitleText className="text-xl text-foreground">
                Current Plan
              </SubtitleText>
              <View
                className={`rounded-full px-3 py-1 ${
                  subscription.status === "active"
                    ? "bg-brand-100"
                    : subscription.status === "canceled"
                    ? "bg-red-100"
                    : "bg-accent-100"
                }`}
              >
                <BodyText
                  className={`text-xs font-semibold ${
                    subscription.status === "active"
                      ? "text-brand-800"
                      : subscription.status === "canceled"
                      ? "text-red-800"
                      : "text-accent-800"
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </BodyText>
              </View>
            </View>

            <View className="mb-4">
              <SubtitleText className="text-lg text-foreground">
                {subscription.subscription_plan?.name || "Premium Plan"}
              </SubtitleText>
              <BodyText className="text-muted-foreground text-sm mt-1">
                {subscription.subscription_plan?.description}
              </BodyText>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <BodyText className="text-muted-foreground">Price</BodyText>
                <BodyText className="text-foreground font-medium">
                  {subscription.subscription_plan
                    ? formatPrice(subscription.subscription_plan.price_cents)
                    : "N/A"}
                  {subscription.subscription_plan?.interval_type &&
                    ` per ${subscription.subscription_plan.interval_type}`}
                </BodyText>
              </View>

              <View className="flex-row justify-between items-center">
                <BodyText className="text-muted-foreground">
                  Next billing date
                </BodyText>
                <BodyText className="text-foreground font-medium">
                  {subscription.current_period_end
                    ? formatDate(subscription.current_period_end)
                    : "N/A"}
                </BodyText>
              </View>

              {subscriptionSummary.days_remaining !== null && (
                <View className="flex-row justify-between items-center">
                  <BodyText className="text-muted-foreground">
                    Days remaining
                  </BodyText>
                  <BodyText className="text-foreground font-medium">
                    {subscriptionSummary.days_remaining} days
                  </BodyText>
                </View>
              )}

              <View className="flex-row justify-between items-center">
                <BodyText className="text-muted-foreground">
                  Auto-renewal
                </BodyText>
                <BodyText
                  className={`font-medium ${
                    subscriptionSummary.will_renew
                      ? "text-brand-600"
                      : "text-red-600"
                  }`}
                >
                  {subscriptionSummary.will_renew ? "Enabled" : "Disabled"}
                </BodyText>
              </View>
            </View>

            {/* Cancellation Notice */}
            {subscription.cancel_at_period_end && (
              <View className="mt-4 p-4 bg-accent-50 border border-accent-200 rounded-lg">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={16} color="#d97706" />
                  <BodyText className="text-accent-800 font-medium ml-2">
                    Subscription will cancel on{" "}
                    {formatDate(subscription.current_period_end!)}
                  </BodyText>
                </View>
                <BodyText className="text-accent-700 text-sm mt-1">
                  You&apos;ll continue to have access until then.
                </BodyText>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 mb-6">
          <SubtitleText className="text-xl text-foreground mb-4">
            Manage Subscription
          </SubtitleText>

          <View className="space-y-3">
            {subscription.cancel_at_period_end ? (
              <SubmitButton
                onPress={handleReactivateSubscription}
                isLoading={isProcessing}
                loadingLabel="Reactivating..."
                color="primary"
                size="lg"
                width="full"
              >
                Reactivate Subscription
              </SubmitButton>
            ) : (
              <SubmitButton
                onPress={handleCancelSubscription}
                isLoading={isProcessing}
                loadingLabel="Canceling..."
                color="destructive"
                size="lg"
                width="full"
              >
                Cancel Subscription
              </SubmitButton>
            )}

            <SubmitButton
              onPress={handleUpgradeSubscription}
              color="secondary"
              size="lg"
              width="full"
            >
              Change Plan
            </SubmitButton>
          </View>
        </View>

        {/* Add-ons */}
        {!isLoadingAddons && addons && addons.length > 0 && (
          <View className="px-5 mb-6">
            <SubtitleText className="text-xl text-foreground mb-4">
              Available Add-ons
            </SubtitleText>

            <View className="space-y-3">
              {addons.map((addon) => (
                <View
                  key={addon.id}
                  className="bg-cream-50 border border-cream-200 rounded-xl p-6"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <SubtitleText className="text-lg text-foreground">
                        {addon.name}
                      </SubtitleText>
                      <BodyText className="text-muted-foreground text-sm mt-1">
                        {addon.description}
                      </BodyText>
                    </View>
                    <SubtitleText className="text-lg text-foreground ml-4">
                      {formatPrice(addon.price_cents)}
                    </SubtitleText>
                  </View>

                  <SubmitButton
                    onPress={() => handlePurchaseAddon(addon.id)}
                    color="primary"
                    size="md"
                    width="full"
                  >
                    Add to Subscription
                  </SubmitButton>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment History */}
        {!isLoadingHistory && paymentHistory && paymentHistory.length > 0 && (
          <View className="px-5 mb-6">
            <SubtitleText className="text-xl text-foreground mb-4">
              Payment History
            </SubtitleText>

            <View className="bg-cream-50 border border-cream-200 rounded-xl overflow-hidden">
              {paymentHistory.slice(0, 5).map((payment, index) => (
                <View
                  key={payment.id}
                  className={`p-4 ${
                    index < paymentHistory.length - 1 && index < 4
                      ? "border-b border-cream-200"
                      : ""
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <BodyText className="text-foreground font-medium">
                        {payment.description || "Subscription Payment"}
                      </BodyText>
                      <BodyText className="text-muted-foreground text-sm mt-1">
                        {formatDate(payment.created_at)}
                      </BodyText>
                    </View>
                    <View className="items-end">
                      <BodyText className="text-foreground font-semibold">
                        {formatPrice(payment.amount_cents)}
                      </BodyText>
                      <View
                        className={`rounded-full px-2 py-1 mt-1 ${
                          payment.status === "succeeded"
                            ? "bg-brand-100"
                            : payment.status === "pending"
                            ? "bg-accent-100"
                            : "bg-red-100"
                        }`}
                      >
                        <BodyText
                          className={`text-xs font-medium ${
                            payment.status === "succeeded"
                              ? "text-brand-800"
                              : payment.status === "pending"
                              ? "text-accent-800"
                              : "text-red-800"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </BodyText>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {paymentHistory.length > 5 && (
                <TouchableOpacity
                  className="p-4 bg-cream-100"
                  accessibilityRole="button"
                  accessibilityLabel="View all payments"
                >
                  <BodyText className="text-center text-brand-600 font-medium">
                    View All Payments
                  </BodyText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Support */}
        <View className="px-5 mb-8">
          <View className="bg-cream-100 rounded-xl p-6">
            <SubtitleText className="text-lg text-foreground mb-2">
              Need Help?
            </SubtitleText>
            <BodyText className="text-muted-foreground text-sm mb-4">
              Our support team is here to help with any subscription questions.
            </BodyText>
            <TouchableOpacity
              className="bg-cream-50 border border-cream-300 rounded-lg py-3 px-4"
              accessibilityRole="button"
              accessibilityLabel="Contact support"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color="#2e2c29"
                />
                <BodyText className="text-foreground font-medium ml-2">
                  Contact Support
                </BodyText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
}
