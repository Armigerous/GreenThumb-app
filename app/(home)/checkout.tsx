/**
 * Checkout screen for GreenThumb subscription purchase
 *
 * Handles Stripe payment processing with:
 * - Plan selection confirmation
 * - Payment method collection
 * - Subscription creation
 * - Success/error handling
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { PageContainer } from "@/components/UI/PageContainer";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import {
  useSubscriptionPlans,
  useCreateSubscription,
} from "@/lib/subscriptionQueries";
import { formatPrice } from "@/lib/stripe";
import { SubscriptionPlan } from "@/types/subscription";

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

function CheckoutContent() {
  const router = useRouter();
  const { user } = useUser();
  const { plan: planId } = useLocalSearchParams<{ plan: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);

  const { data: subscriptionPlans, isLoading: isLoadingPlans } =
    useSubscriptionPlans();
  const createSubscriptionMutation = useCreateSubscription();

  const selectedPlan = subscriptionPlans?.find((p) => p.id === planId);

  // Initialize payment sheet
  useEffect(() => {
    if (selectedPlan && user && !paymentSheetInitialized) {
      initializePaymentSheet();
    }
  }, [selectedPlan, user, paymentSheetInitialized]);

  const initializePaymentSheet = async () => {
    if (!selectedPlan || !user) return;

    try {
      setIsProcessing(true);

      // Create payment intent on your backend
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
        }),
      });

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "GreenThumb",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user.fullName || "",
          email: user.emailAddresses[0]?.emailAddress || "",
        },
      });

      if (error) {
        console.error("Payment sheet initialization error:", error);
        Alert.alert("Error", "Failed to initialize payment. Please try again.");
      } else {
        setPaymentSheetInitialized(true);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      Alert.alert("Error", "Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user || !paymentSheetInitialized) {
      Alert.alert("Error", "Payment not ready. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error("Payment error:", error);
        if (error.code !== "Canceled") {
          Alert.alert("Payment Failed", error.message);
        }
      } else {
        // Payment successful, create subscription
        await createSubscription();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      Alert.alert("Error", "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const createSubscription = async () => {
    if (!selectedPlan || !user) return;

    try {
      await createSubscriptionMutation.mutateAsync({
        user_id: user.id,
        subscription_plan_id: selectedPlan.id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() +
            (selectedPlan.interval_type === "year" ? 365 : 30) *
              24 *
              60 *
              60 *
              1000
        ).toISOString(),
        cancel_at_period_end: false,
      });

      // Navigate to success screen
      router.replace("/(home)/subscription-success");
    } catch (error) {
      console.error("Subscription creation error:", error);
      Alert.alert(
        "Subscription Error",
        "Payment was successful but there was an issue creating your subscription. Please contact support."
      );
    }
  };

  if (isLoadingPlans || !selectedPlan) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (!planId) {
    return (
      <PageContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-muted-foreground mb-4">
            No plan selected
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-green-600 rounded-xl py-3 px-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-5 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Complete Your Order
          </Text>
          <Text className="text-lg text-muted-foreground">
            You&apos;re one step away from plant success
          </Text>
        </View>

        {/* Order Summary */}
        <View className="px-5 mb-8">
          <View className="bg-white border border-gray-200 rounded-xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Order Summary
            </Text>

            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  {selectedPlan.name}
                </Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  {selectedPlan.description}
                </Text>

                {/* Features */}
                <View className="mt-3 space-y-1">
                  {selectedPlan.features.slice(0, 3).map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#059669"
                      />
                      <Text className="text-foreground text-xs ml-2 flex-1">
                        {feature}
                      </Text>
                    </View>
                  ))}
                  {selectedPlan.features.length > 3 && (
                    <Text className="text-muted-foreground text-xs ml-5">
                      +{selectedPlan.features.length - 3} more features
                    </Text>
                  )}
                </View>
              </View>

              <View className="items-end ml-4">
                <Text className="text-2xl font-bold text-foreground">
                  {formatPrice(selectedPlan.price_cents)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  per {selectedPlan.interval_type}
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-200 pt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-foreground">
                  Total
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  {formatPrice(selectedPlan.price_cents)}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground mt-1">
                Billed{" "}
                {selectedPlan.interval_type === "year"
                  ? "annually"
                  : selectedPlan.interval_type === "month"
                  ? "monthly"
                  : `every ${selectedPlan.interval_count} ${selectedPlan.interval_type}s`}
              </Text>
            </View>
          </View>
        </View>

        {/* Guarantees Reminder */}
        <View className="px-5 mb-8">
          <View className="bg-green-50 border border-green-200 rounded-xl p-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
              <Text className="text-lg font-semibold text-green-800 ml-2">
                Protected by Our Guarantees
              </Text>
            </View>
            <Text className="text-green-700 text-sm">
              • 30-day money-back guarantee{"\n"}• Plant survival guarantee
              {"\n"}• Success guarantee - full year free if no improvement
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={16} color="#6b7280" />
            <Text className="text-muted-foreground text-sm ml-2">
              Secure payment powered by Stripe. Your payment information is
              encrypted and secure.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing || !paymentSheetInitialized}
          className={`rounded-xl py-4 px-6 ${
            isProcessing || !paymentSheetInitialized
              ? "bg-gray-300"
              : "bg-green-600"
          }`}
        >
          {isProcessing ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-semibold text-lg ml-2">
                Processing...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Complete Payment - {formatPrice(selectedPlan.price_cents)}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-xs text-muted-foreground mt-3">
          By completing this purchase, you agree to our Terms of Service and
          Privacy Policy
        </Text>
      </View>
    </PageContainer>
  );
}

export default function CheckoutScreen() {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <PageContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-red-600 mb-4">
            Stripe configuration missing
          </Text>
          <Text className="text-muted-foreground text-center">
            Please configure your Stripe publishable key in the environment
            variables.
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <CheckoutContent />
    </StripeProvider>
  );
}
