import React, { ComponentType } from "react";
import { Platform } from "react-native";

// Reason: Conditionally import CardField only on native platforms to avoid web build errors.
let CardField: ComponentType<any>;

if (Platform.OS !== "web") {
  // Native: Dynamically require the native Stripe CardField
  CardField = require("@stripe/stripe-react-native").CardField;
} else {
  // Web: Provide a no-op fallback component
  CardField = () => null;
}

export default CardField;
