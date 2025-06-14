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
  Text,
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
      router.replace("/(home)/pricing");
    }
  }, [subscriptionSummary?.is_premium, router]);

  const handleCancelSubscription = () => {
    if (!subscriptionSummary?.subscription) return;

    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You&apos;ll continue to have access until the end of your current billing period.",
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
        "Your subscription has been canceled. You&apos;ll continue to have access until the end of your current billing period."
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
    router.push("/(home)/pricing");
  };

  const handlePurchaseAddon = (addonId: string) => {
    // Navigate to addon purchase flow
    router.push(`/(home)/addon-checkout?addon=${addonId}`);
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
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-muted-foreground mb-4">
            No active subscription found
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(home)/pricing")}
            className="bg-green-600 rounded-xl py-3 px-6"
          >
            <Text className="text-white font-semibold">View Plans</Text>
          </TouchableOpacity>
        </View>
      </PageContainer>
    );
  }

  const subscription = subscriptionSummary.subscription!;

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-5 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Subscription
          </Text>
          <Text className="text-lg text-muted-foreground">
            Manage your GreenThumb Premium subscription
          </Text>
        </View>

        {/* Current Plan */}
        <View className="px-5 mb-8">
          <View className="bg-white border border-gray-200 rounded-xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Current Plan
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  subscription.status === "active"
                    ? "bg-green-100"
                    : subscription.status === "canceled"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    subscription.status === "active"
                      ? "text-green-800"
                      : subscription.status === "canceled"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground">
                {subscription.subscription_plan?.name || "Premium Plan"}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {subscription.subscription_plan?.description}
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Price</Text>
                <Text className="text-foreground font-medium">
                  {subscription.subscription_plan
                    ? formatPrice(subscription.subscription_plan.price_cents)
                    : "N/A"}
                  {subscription.subscription_plan?.interval_type &&
                    ` per ${subscription.subscription_plan.interval_type}`}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Next billing date</Text>
                <Text className="text-foreground font-medium">
                  {subscription.current_period_end
                    ? formatDate(subscription.current_period_end)
                    : "N/A"}
                </Text>
              </View>

              {subscriptionSummary.days_remaining !== null && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Days remaining</Text>
                  <Text className="text-foreground font-medium">
                    {subscriptionSummary.days_remaining} days
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Auto-renewal</Text>
                <Text
                  className={`font-medium ${
                    subscriptionSummary.will_renew
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {subscriptionSummary.will_renew ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>

            {/* Cancellation Notice */}
            {subscription.cancel_at_period_end && (
              <View className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={16} color="#d97706" />
                  <Text className="text-yellow-800 font-medium ml-2">
                    Subscription will cancel on{" "}
                    {formatDate(subscription.current_period_end!)}
                  </Text>
                </View>
                <Text className="text-yellow-700 text-sm mt-1">
                  You&apos;ll continue to have access until then.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            Manage Subscription
          </Text>

          <View className="space-y-3">
            {subscription.cancel_at_period_end ? (
              <TouchableOpacity
                onPress={handleReactivateSubscription}
                disabled={isProcessing}
                className="bg-green-600 rounded-xl py-4 px-6"
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Reactivate Subscription
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleCancelSubscription}
                disabled={isProcessing}
                className="bg-red-600 rounded-xl py-4 px-6"
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Cancel Subscription
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleUpgradeSubscription}
              className="bg-blue-600 rounded-xl py-4 px-6"
            >
              <Text className="text-white text-center font-semibold">
                Change Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add-ons */}
        {!isLoadingAddons && addons && addons.length > 0 && (
          <View className="px-5 mb-8">
            <Text className="text-xl font-bold text-foreground mb-4">
              Available Add-ons
            </Text>

            <View className="space-y-3">
              {addons.map((addon) => (
                <View
                  key={addon.id}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {addon.name}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {addon.description}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-foreground ml-4">
                      {formatPrice(addon.price_cents)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePurchaseAddon(addon.id)}
                    className="bg-green-600 rounded-lg py-3 px-4"
                  >
                    <Text className="text-white text-center font-medium">
                      Add to Subscription
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment History */}
        {!isLoadingHistory && paymentHistory && paymentHistory.length > 0 && (
          <View className="px-5 mb-8">
            <Text className="text-xl font-bold text-foreground mb-4">
              Payment History
            </Text>

            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {paymentHistory.slice(0, 5).map((payment, index) => (
                <View
                  key={payment.id}
                  className={`p-4 ${
                    index < paymentHistory.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">
                        {payment.description || "Subscription Payment"}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {formatDate(payment.created_at)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-foreground font-semibold">
                        {formatPrice(payment.amount_cents)}
                      </Text>
                      <View
                        className={`rounded-full px-2 py-1 ${
                          payment.status === "succeeded"
                            ? "bg-green-100"
                            : payment.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            payment.status === "succeeded"
                              ? "text-green-800"
                              : payment.status === "pending"
                              ? "text-yellow-800"
                              : "text-red-800"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {paymentHistory.length > 5 && (
                <TouchableOpacity className="p-4 bg-gray-50">
                  <Text className="text-center text-blue-600 font-medium">
                    View All Payments
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Support */}
        <View className="px-5 mb-8">
          <View className="bg-gray-50 rounded-xl p-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Need Help?
            </Text>
            <Text className="text-muted-foreground text-sm mb-4">
              Our support team is here to help with any subscription questions.
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
    </PageContainer>
  );
}
