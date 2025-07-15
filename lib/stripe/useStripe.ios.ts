import { useStripe as nativeUseStripe } from "@stripe/stripe-react-native";
import type { UseStripe } from "./useStripe.types";

export const useStripe: UseStripe = nativeUseStripe; 