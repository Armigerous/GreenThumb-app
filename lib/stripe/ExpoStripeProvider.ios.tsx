import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import React from "react";

const merchantId = Constants.expoConfig?.plugins?.find(
  (p) => p[0] === "@stripe/stripe-react-native"
)?.[1].merchantIdentifier;

if (!merchantId) {
  throw new Error("Missing Expo config for @stripe/stripe-react-native");
}

const publishableKey =
  Constants.expoConfig?.extra?.stripePublishableKey ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Stripe publishable key is required. Set it in app config or env."
  );
}

export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey" | "merchantIdentifier"
  >
) {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantId}
      urlScheme={Linking.createURL("/")?.split(":")[0]}
      {...props}
    />
  );
}
