// Reason: Prevents native Stripe code from being bundled on web
import type { UseStripe } from "./useStripe.types";

export const useStripe: UseStripe = () => {
  throw new Error("Stripe is not supported on web.");
}; 