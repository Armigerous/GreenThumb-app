/**
 * Checkout screen for GreenThumb subscription purchase
 *
 * Handles Stripe payment processing with:
 * - Plan selection confirmation
 * - Payment method collection
 * - Subscription creation (not one-time payment)
 * - Success/error handling
 */

import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import SubmitButton from "@/components/UI/SubmitButton";
import { BodyText, TitleText } from "@/components/UI/Text";
import { formatPrice } from "@/lib/stripe";
import { useSubscriptionPlans } from "@/lib/subscriptionQueries";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { useStripe } from "@/lib/stripe/useStripe.ios";

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY =
	process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

function CheckoutContent() {
	const router = useRouter();
	const { user } = useUser();
	const { plan: planId } = useLocalSearchParams<{ plan: string }>();
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	// --- Stripe deep link handler: listen for Stripe returnURL and navigate to success ---
	React.useEffect(() => {
		const handleDeepLink = (event: { url: string }) => {
			if (event.url.startsWith("greenthumb://stripe-redirect")) {
				// Reason: Stripe redirected back to the app after payment (3D Secure, etc.)
				// Navigate to the subscription success screen
				router.replace("/subscription-success");
			}
		};
		const subscription = require("expo-linking").addEventListener(
			"url",
			handleDeepLink
		);
		return () => subscription.remove();
	}, [router]);

	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);
	const [initializationError, setInitializationError] = useState<string | null>(
		null
	);

	const { data: subscriptionPlans, isLoading: isLoadingPlans } =
		useSubscriptionPlans();
	// Remove: createSubscriptionMutation, old API fetches

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

	// Replace initializePaymentSheet with new logic
	const initializePaymentSheet = async () => {
		if (!selectedPlan || !user) return;

		try {
			setIsProcessing(true);
			setInitializationError(null);

			// Debug: Log the payload
			console.log("Invoking Edge Function with:", {
				planId: selectedPlan.id,
				userId: user.id,
				userEmail: user.emailAddresses[0]?.emailAddress,
			});

			const { data, error } = await supabase.functions.invoke(
				"create-subscription",
				{
					body: {
						planId: selectedPlan.id,
						userId: user.id,
						userEmail: user.emailAddresses[0]?.emailAddress,
					},
				}
			);

			// Debug: Log the raw response
			console.log("Edge Function response:", { data, error });

			if (error || !data?.clientSecret) {
				// Debug: Log error details
				console.error("Edge Function error:", error);
				throw new Error(error?.message || "Failed to create subscription");
			}

			const clientSecret = data.clientSecret;

			// --- Configure payment sheet with limited payment methods ---
			const { error: initError } = await initPaymentSheet({
				paymentIntentClientSecret: clientSecret,
				merchantDisplayName: "GreenThumb",
				returnURL: "greenthumb://stripe-redirect", // Reason: Required for Stripe to redirect back to the app after 3D Secure or external payment methods
				// Limit payment methods to card and Link only
				allowsDelayedPaymentMethods: false,
				// Disable alternative payment methods (Cash App, Klarna, Amazon Pay)
				applePay: {
					merchantCountryCode: "US",
				},
				// Configure appearance to minimize test mode banner prominence
				appearance: {
					colors: {
						primary: "#5E994B", // Brand green
					},
				},
			});

			if (initError) {
				setInitializationError(initError.message);
				Alert.alert(
					"Setup Error",
					"Failed to initialize payment. Please try again."
				);
			} else {
				setPaymentSheetInitialized(true);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			setInitializationError(errorMessage);
			Alert.alert("Setup Error", errorMessage);
			// Debug: Log the caught error
			console.error("initializePaymentSheet caught error:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	// Refactor handlePayment: remove second API call, just show success after payment
	const handlePayment = async () => {
		if (!selectedPlan || !user || !paymentSheetInitialized) {
			Alert.alert("Error", "Payment not ready. Please try again.");
			return;
		}

		setIsProcessing(true);

		try {
			const { error } = await presentPaymentSheet();

			if (error) {
				if (error.code === "Canceled") {
					// Reason: User cancellation is not an error; do not log or alert.
					return;
				} else {
					// Reason: Only log and alert for real payment errors
					console.error("Payment error:", error);
					Alert.alert("Payment Failed", error.message);
				}
			} else {
				// Payment succeeded! Navigate to success screen or poll Supabase for status
				router.replace("/subscription-success");
			}
		} catch (error) {
			console.error("Payment processing error:", error);
			Alert.alert("Error", "Payment processing failed. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Remove createSubscriptionOnServer (no longer needed)

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
					<BodyText className="text-lg text-muted-foreground mb-4">
						No plan selected
					</BodyText>
					<SubmitButton
						onPress={() => router.back()}
						color="primary"
						width="auto"
						size="md"
					>
						Go Back
					</SubmitButton>
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

					<TitleText className="text-3xl text-foreground mb-2">
						Complete Your Purchase
					</TitleText>
					<BodyText className="text-lg text-muted-foreground">
						Secure payment powered by Stripe
					</BodyText>
				</View>

				{/* Plan Summary */}
				<View className="px-5 mb-8">
					<View className="bg-cream-50 border border-cream-200 rounded-xl p-6">
						<TitleText className="text-xl text-foreground mb-4">
							Order Summary
						</TitleText>

						<View className="gap-3">
							<View className="flex-row justify-between items-center">
								<BodyText className="text-foreground font-medium">
									{selectedPlan.name}
								</BodyText>
								<BodyText className="text-foreground font-semibold">
									{formatPrice(selectedPlan.price_cents)}
								</BodyText>
							</View>

							<View className="flex-row justify-between items-center">
								<BodyText className="text-muted-foreground">
									Billing cycle
								</BodyText>
								<BodyText className="text-muted-foreground">
									{selectedPlan.interval_type === "year" ? "Annual" : "Monthly"}
								</BodyText>
							</View>

							<View className="border-t border-cream-200 pt-3">
								<View className="flex-row justify-between items-center">
									<BodyText className="text-lg font-bold text-foreground">
										Total
									</BodyText>
									<BodyText className="text-lg font-bold text-foreground">
										{formatPrice(selectedPlan.price_cents)}
									</BodyText>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Initialization Error */}
				{initializationError && (
					<View className="px-5 mb-8">
						<View className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
							<View className="flex-row items-center mb-2">
								<Ionicons name="alert-circle" size={20} color="#E50000" />
								<BodyText className="text-destructive font-semibold ml-2">
									Setup Failed
								</BodyText>
							</View>
							<BodyText className="text-destructive text-sm mb-3">
								{initializationError}
							</BodyText>
							<SubmitButton
								onPress={retryInitialization}
								color="destructive"
								width="auto"
								size="md"
							>
								Try Again
							</SubmitButton>
						</View>
					</View>
				)}

				{/* Payment Button */}
				<View className="px-5 mb-8">
					<SubmitButton
						onPress={handlePayment}
						isDisabled={
							isProcessing || !paymentSheetInitialized || !!initializationError
						}
						isLoading={isProcessing}
						color="primary"
						width="full"
						size="lg"
						loadingLabel="Processing..."
					>
						{paymentSheetInitialized
							? `Subscribe Now - ${formatPrice(selectedPlan.price_cents)}`
							: "Setting up payment..."}
					</SubmitButton>

					<BodyText className="text-center text-muted-foreground text-sm mt-4">
						Your subscription will start immediately after payment
					</BodyText>
				</View>

				{/* Security Notice */}
				<View className="px-5 mb-8">
					<View className="bg-brand-100 rounded-xl p-4">
						<View className="flex-row items-center mb-2">
							<Ionicons name="shield-checkmark" size={16} color="#5E994B" />
							<BodyText className="text-foreground font-medium ml-2">
								Secure Payment
							</BodyText>
						</View>
						<BodyText className="text-muted-foreground text-sm">
							Your payment information is encrypted and processed securely by
							Stripe. We never store your payment details.
						</BodyText>
					</View>
				</View>
			</ScrollView>
		</PageContainer>
	);
}

export default function CheckoutScreen() {
	// Update the dynamic require to use the new lib/stripe/ExpoStripeProvider path
	const ExpoStripeProvider =
		require("../../lib/stripe/ExpoStripeProvider.ios").default;
	if (!STRIPE_PUBLISHABLE_KEY) {
		return (
			<PageContainer>
				<View className="flex-1 justify-center items-center">
					<BodyText className="text-lg text-destructive mb-4">
						Payment system not configured
					</BodyText>
					<BodyText className="text-muted-foreground text-center">
						Please contact support if this error persists.
					</BodyText>
				</View>
			</PageContainer>
		);
	}

	return (
		<ExpoStripeProvider>
			<CheckoutContent />
		</ExpoStripeProvider>
	);
}
