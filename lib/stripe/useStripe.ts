/**
 * Platform-specific useStripe hook export
 * 
 * This index file allows importing useStripe from @/lib/stripe/useStripe
 * while maintaining platform-specific implementations.
 */

import { useStripe as iosUseStripe } from './useStripe.ios';

export const useStripe = iosUseStripe;
