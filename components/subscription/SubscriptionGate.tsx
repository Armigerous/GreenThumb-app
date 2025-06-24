/**
 * Subscription gate component that wraps features and checks limits
 * before allowing access. Shows paywall prompts when limits are reached.
 */

import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import {
  useCanPerformAction,
  useIncrementUsage,
  type UsageLimitKey,
} from "@/lib/usageLimits";
import { PaywallPrompt } from "./PaywallPrompt";
import { TouchableOpacity } from "react-native";

interface SubscriptionGateProps {
  feature: UsageLimitKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onBlock?: () => void;
  autoIncrement?: boolean;
  urgency?: "low" | "medium" | "high";
}

/**
 * Component that gates features behind subscription limits
 */
export function SubscriptionGate({
  feature,
  children,
  fallback,
  onBlock,
  autoIncrement = false,
  urgency = "medium",
}: SubscriptionGateProps) {
  const { user } = useUser();
  const { canPerformAction } = useCanPerformAction(user?.id);
  const incrementUsage = useIncrementUsage();
  const [showPaywall, setShowPaywall] = useState(false);

  const actionCheck = canPerformAction(feature);

  // If user can perform the action, render children
  if (actionCheck.canPerform) {
    // Auto-increment usage if enabled
    if (autoIncrement && user?.id) {
      incrementUsage.mutate({ userId: user.id, action: feature });
    }

    return <>{children}</>;
  }

  // If blocked, show fallback or trigger paywall
  const handleBlock = () => {
    if (onBlock) {
      onBlock();
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <>
      {fallback || (
        <TouchableOpacity onPress={handleBlock}>{children}</TouchableOpacity>
      )}

      <PaywallPrompt
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
        currentUsage={actionCheck.currentUsage}
        limit={actionCheck.limit}
        urgency={urgency}
      />
    </>
  );
}

/**
 * Hook for manual usage checking and paywall triggering
 */
export function useSubscriptionGate(feature: UsageLimitKey) {
  const { user } = useUser();
  const { canPerformAction } = useCanPerformAction(user?.id);
  const incrementUsage = useIncrementUsage();
  const [showPaywall, setShowPaywall] = useState(false);

  const actionCheck = canPerformAction(feature);

  const checkAndProceed = (callback: () => void) => {
    if (actionCheck.canPerform) {
      // Increment usage and proceed
      if (user?.id) {
        incrementUsage.mutate({ userId: user.id, action: feature });
      }
      callback();
    } else {
      // Show paywall
      setShowPaywall(true);
    }
  };

  const PaywallComponent = () => (
    <PaywallPrompt
      isVisible={showPaywall}
      onClose={() => setShowPaywall(false)}
      feature={feature}
      currentUsage={actionCheck.currentUsage}
      limit={actionCheck.limit}
    />
  );

  return {
    canPerform: actionCheck.canPerform,
    checkAndProceed,
    showPaywall,
    setShowPaywall,
    PaywallComponent,
    usage: {
      current: actionCheck.currentUsage,
      limit: actionCheck.limit,
      reason: actionCheck.reason,
    },
  };
}
