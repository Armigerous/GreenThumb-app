/**
 * Checkout screen for GreenThumb subscription purchase
 *
 * Handles Stripe payment processing with:
 * - Plan selection confirmation
 * - Payment method collection
 * - Subscription creation (not one-time payment)
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
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );

  const { data: subscriptionPlans, isLoading: isLoadingPlans } =
    useSubscriptionPlans();
  const createSubscriptionMutation = useCreateSubscription();

  const selectedPlan = subscriptionPlans?.find((p) => p.id === planId);

  // Initialize payment sheet
  useEffect(() => {
    if (
      selectedPlan &&
      user &&
      !paymentSheetInitialized &&
      !initializationError
    ) {
      initializePaymentSheet();
    }
  }, [selectedPlan, user, paymentSheetInitialized, initializationError]);

  const initializePaymentSheet = async () => {
    if (!selectedPlan || !user) return;

    try {
      setIsProcessing(true);
      setInitializationError(null);

      // Create subscription setup intent on your backend
      const response = await fetch("/api/create-subscription-setup", {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { setupIntent, ephemeralKey, customer } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "GreenThumb",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret: setupIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user.fullName || "",
          email: user.emailAddresses[0]?.emailAddress || "",
        },
        returnURL: "greenthumb://checkout-success",
      });

      if (error) {
        console.error("Payment sheet initialization error:", error);
        setInitializationError(error.message);
        Alert.alert(
          "Setup Error",
          "Failed to initialize payment. Please try again."
        );
      } else {
        setPaymentSheetInitialized(true);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setInitializationError(errorMessage);
      Alert.alert(
        "Setup Error",
        "Failed to initialize payment. Please try again."
      );
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
        if (error.code === "Canceled") {
          // User canceled, don't show error
          return;
        } else {
          Alert.alert("Payment Failed", error.message);
        }
      } else {
        // Payment method saved successfully, now create subscription
        await createSubscriptionOnServer();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      Alert.alert("Error", "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const createSubscriptionOnServer = async () => {
    if (!selectedPlan || !user) return;

    try {
      setIsProcessing(true);

      // Create subscription on your backend
      const response = await fetch("/api/create-subscription", {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { subscription } = await response.json();

      // Navigate to success screen
      router.replace(
        `/subscription/subscription-success?subscription=${subscription.id}`
      );
    } catch (error) {
      console.error("Subscription creation error:", error);
      Alert.alert(
        "Subscription Error",
        "Payment method was saved but there was an issue creating your subscription. Please contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const retryInitialization = () => {
    setInitializationError(null);
    setPaymentSheetInitialized(false);
    initializePaymentSheet();
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
            Complete Your Purchase
          </Text>
          <Text className="text-lg text-muted-foreground">
            Secure payment powered by Stripe
          </Text>
        </View>

        {/* Plan Summary */}
        <View className="px-5 mb-8">
          <View className="bg-white border border-gray-200 rounded-xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Order Summary
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-medium">
                  {selectedPlan.name}
                </Text>
                <Text className="text-foreground font-semibold">
                  {formatPrice(selectedPlan.price_cents)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Billing cycle</Text>
                <Text className="text-muted-foreground">
                  {selectedPlan.interval_type === "year" ? "Annual" : "Monthly"}
                </Text>
              </View>

              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-foreground">
                    Total
                  </Text>
                  <Text className="text-lg font-bold text-foreground">
                    {formatPrice(selectedPlan.price_cents)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Initialization Error */}
        {initializationError && (
          <View className="px-5 mb-8">
            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-800 font-semibold ml-2">
                  Setup Failed
                </Text>
              </View>
              <Text className="text-red-700 text-sm mb-3">
                {initializationError}
              </Text>
              <TouchableOpacity
                onPress={retryInitialization}
                className="bg-red-600 rounded-lg py-2 px-4"
              >
                <Text className="text-white text-center font-medium">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Button */}
        <View className="px-5 mb-8">
          <TouchableOpacity
            onPress={handlePayment}
            disabled={
              isProcessing || !paymentSheetInitialized || !!initializationError
            }
            className={`rounded-xl py-4 px-6 ${
              isProcessing || !paymentSheetInitialized || !!initializationError
                ? "bg-gray-300"
                : "bg-green-600"
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {paymentSheetInitialized
                  ? `Subscribe Now - ${formatPrice(selectedPlan.price_cents)}`
                  : "Setting up payment..."}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-center text-muted-foreground text-sm mt-4">
            Your subscription will start immediately after payment
          </Text>
        </View>

        {/* Security Notice */}
        <View className="px-5 mb-8">
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text className="text-foreground font-medium ml-2">
                Secure Payment
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm">
              Your payment information is encrypted and processed securely by
              Stripe. We never store your payment details.
            </Text>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
}

export default function CheckoutScreen() {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <PageContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-red-600 mb-4">
            Payment system not configured
          </Text>
          <Text className="text-muted-foreground text-center">
            Please contact support if this error persists.
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
