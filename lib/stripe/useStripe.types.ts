// Type definition for the useStripe hook to ensure platform-specific files are type-safe
import type { useStripe as NativeUseStripe } from "@stripe/stripe-react-native";

export type UseStripe = typeof NativeUseStripe; 