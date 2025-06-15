# 🔧 GreenThumb Technical Implementation Guide

> **Version:** 2.0 (Updated January 2025)  
> **Last Updated:** January 14, 2025  
> **Expo SDK:** 53  
> **React Native:** 0.74+  
> **TypeScript:** 5.0+

---

## 🚨 Important: User Feedback Integration

**Critical Issues Identified:** User interviews (January 14, 2025) revealed several critical bugs and UX issues that must be addressed before launch. See detailed analysis in:

- **Task Tracking:** `notes/TASK.md` → "USER INTERVIEW FINDINGS" section
- **Detailed Analysis:** `docs/user_feedback.md` → Complete interview analysis and recommendations

**Priority Issues for Development Team:**

1. 🔴 **Database scrolling non-functional** - Core feature broken
2. 🔴 **Database filters not working** - Filter modal errors
3. 🔴 **Garden completion status mismatch** - Data integrity issue
4. 🟡 **Typography inconsistency** - Brand guidelines violation
5. 🟡 **Layout bugs with long text** - UI responsiveness issues

**Action Required:** Review user feedback documentation before implementing any new features or making architectural changes.

---

## 📋 Table of Contents

1. [Development Environment](#development-environment)
2. [Authentication Implementation](#authentication-implementation)
3. [Database Integration](#database-integration)
4. [Subscription System](#subscription-system)
5. [UI Components & Styling](#ui-components--styling)
6. [Navigation & Routing](#navigation--routing)
7. [State Management](#state-management)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & CI/CD](#deployment--cicd)

---

## 🛠️ Development Environment

### Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0
eas-cli >= 5.0.0

# Development tools
git
vscode (recommended)
android-studio (for Android development)
xcode (for iOS development, macOS only)
```

### Project Setup

```bash
# Clone repository
git clone https://github.com/your-org/greenthumb-app.git
cd greenthumb-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Environment Variables

```bash
# .env file structure
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration (NEW - January 2025)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional services
SENTRY_DSN=your_sentry_dsn
ANALYTICS_API_KEY=your_analytics_key
```

---

## 🔐 Authentication Implementation

**IMPORTANT:** This project uses **Clerk** for authentication, not Supabase Auth. The examples below are for reference only.

### Clerk + Supabase Integration

This project uses Clerk for authentication with Supabase as the database backend. Key integration points:

#### User ID Handling

- **Clerk User IDs:** TEXT strings like `user_2tj0mC9c8UaPRPo77HUDAQ9ZEs5`
- **Database Schema:** All `user_id` columns must be `TEXT NOT NULL`, never `UUID`
- **RLS Policies:** Always use `requesting_user_id()` function, never `auth.uid()`

#### Critical Function: `requesting_user_id()`

```sql
-- This function extracts Clerk user ID from JWT claims
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE sql STABLE;
```

#### RLS Policy Pattern

```sql
-- ✅ CORRECT - Use requesting_user_id() for Clerk integration
CREATE POLICY "Users can view their own data" ON table_name FOR
SELECT USING (requesting_user_id() = user_id);

-- ❌ WRONG - Never use auth.uid() with Clerk
CREATE POLICY "Users can view their own data" ON table_name FOR
SELECT USING (auth.uid()::text = user_id);
```

#### Common Error Prevention

If you see errors like `"invalid input syntax for type uuid: \"user_2tj0mC9c8UaPRPo77HUDAQ9ZEs5\""`, it means:

1. A table has `user_id UUID` instead of `user_id TEXT`
2. An RLS policy is using `auth.uid()` instead of `requesting_user_id()`
3. The `requesting_user_id()` function is missing from the database

### Legacy Supabase Auth Setup (For Reference Only)

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Auth Context Implementation

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

---

## 🗄️ Database Integration

### Supabase Client Queries

```typescript
// lib/queries/plants.ts
import { supabase } from "@/lib/supabase";
import { Plant, CreatePlantData } from "@/types/plants";

export const plantQueries = {
  // Get all plants for a garden
  getPlantsByGarden: async (gardenId: string): Promise<Plant[]> => {
    const { data, error } = await supabase
      .from("plants")
      .select(
        `
        *,
        plant_care_logs (
          id,
          care_type,
          notes,
          created_at
        )
      `
      )
      .eq("garden_id", gardenId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new plant
  createPlant: async (plantData: CreatePlantData): Promise<Plant> => {
    const { data, error } = await supabase
      .from("plants")
      .insert(plantData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update plant
  updatePlant: async (id: string, updates: Partial<Plant>): Promise<Plant> => {
    const { data, error } = await supabase
      .from("plants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete plant
  deletePlant: async (id: string): Promise<void> => {
    const { error } = await supabase.from("plants").delete().eq("id", id);

    if (error) throw error;
  },
};
```

### React Query Integration

```typescript
// lib/queries/useQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plantQueries } from "./plants";

export const usePlants = (gardenId: string) => {
  return useQuery({
    queryKey: ["plants", gardenId],
    queryFn: () => plantQueries.getPlantsByGarden(gardenId),
    enabled: !!gardenId,
  });
};

export const useCreatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantQueries.createPlant,
    onSuccess: (newPlant) => {
      // Invalidate and refetch plants query
      queryClient.invalidateQueries({
        queryKey: ["plants", newPlant.garden_id],
      });

      // Optimistically update the cache
      queryClient.setQueryData(
        ["plants", newPlant.garden_id],
        (old: Plant[] = []) => {
          return [newPlant, ...old];
        }
      );
    },
  });
};
```

---

## 💳 Subscription System

### Stripe Integration Setup

```typescript
// lib/stripe.ts
import Stripe from "stripe";

// Server-side Stripe instance (for API routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Client-side configuration
export const stripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  merchantIdentifier: "merchant.com.greenthumb.app",
  urlScheme: "greenthumb",
};

// Price formatting utilities
export const formatPrice = (cents: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
};

// Calculate savings for annual plans
export const calculateSavings = (annualPrice: number, monthlyPrice: number) => {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  const percentage = Math.round((savings / monthlyTotal) * 100);
  return { savings, percentage };
};

// Plan recommendation logic
export const getPlanBadge = (plan: SubscriptionPlan): string | null => {
  if (plan.billing_period === "annual") return "Most Popular";
  if (plan.billing_period === "6_month") return "Best Value";
  return null;
};

// Date formatting for subscriptions
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};
```

### Payment Processing Implementation

```typescript
// api/create-payment-intent.ts
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { planId, userId } = await req.json();

    // Validate input
    if (!planId || !userId) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response("Plan not found", { status: 404 });
    }

    // Get or create Stripe customer
    let customer;
    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(
        existingSubscription.stripe_customer_id
      );
    } else {
      // Get user email for customer creation
      const { data: user } = await supabase.auth.admin.getUserById(userId);

      customer = await stripe.customers.create({
        email: user.user?.email,
        metadata: { userId },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price_cents,
      currency: "usd",
      customer: customer.id,
      metadata: {
        planId,
        userId,
        planName: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create ephemeral key for mobile
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" }
    );

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("Payment intent creation failed:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
```

### Subscription React Query Hooks

```typescript
// lib/subscriptionQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  SubscriptionPlan,
  UserSubscription,
  CreateSubscriptionData,
  PricingDisplay,
} from "@/types/subscription";

// Fetch all available subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data || [];
    },
  });
};

// Get pricing display with calculated savings and badges
export const usePricingDisplay = () => {
  const { data: plans, ...rest } = useSubscriptionPlans();

  const pricingDisplay: PricingDisplay[] =
    plans?.map((plan) => {
      const monthlyPlan = plans.find((p) => p.billing_period === "monthly");
      const savings = monthlyPlan
        ? calculateSavings(plan.price_cents, monthlyPlan.price_cents)
        : null;

      return {
        ...plan,
        badge: getPlanBadge(plan),
        savings: savings?.savings || 0,
        savingsPercentage: savings?.percentage || 0,
        monthlyEquivalent: Math.round(
          plan.price_cents /
            (plan.billing_period === "annual"
              ? 12
              : plan.billing_period === "6_month"
              ? 6
              : 1)
        ),
      };
    }) || [];

  return {
    data: pricingDisplay,
    ...rest,
  };
};

// Get current user's subscription
export const useUserSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subscription_plans (*)
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Create new subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (subscriptionData: CreateSubscriptionData) => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          ...subscriptionData,
          user_id: user?.id,
        })
        .select(
          `
          *,
          subscription_plans (*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
};

// Cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
};

// Create payment intent
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      return response.json();
    },
  });
};
```

### Stripe Payment Sheet Implementation

```typescript
// components/subscription/PaymentSheet.tsx
import React, { useState } from "react";
import { Alert } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  useCreatePaymentIntent,
  useCreateSubscription,
} from "@/lib/subscriptionQueries";
import { SubscriptionPlan } from "@/types/subscription";

interface PaymentSheetProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PaymentSheet = ({
  plan,
  onSuccess,
  onError,
}: PaymentSheetProps) => {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const createPaymentIntent = useCreatePaymentIntent();
  const createSubscription = useCreateSubscription();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment intent
      const paymentIntentData = await createPaymentIntent.mutateAsync({
        planId: plan.id,
      });

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "GreenThumb",
        customerId: paymentIntentData.customerId,
        customerEphemeralKeySecret: paymentIntentData.ephemeralKey,
        paymentIntentClientSecret: paymentIntentData.clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "GreenThumb User",
        },
        returnURL: "greenthumb://payment-success",
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === "Canceled") {
          // User canceled payment
          return;
        }
        throw new Error(paymentError.message);
      }

      // Payment successful - create subscription record
      await createSubscription.mutateAsync({
        plan_id: plan.id,
        stripe_customer_id: paymentIntentData.customerId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() +
            (plan.billing_period === "annual"
              ? 365
              : plan.billing_period === "6_month"
              ? 183
              : 30) *
              24 *
              60 *
              60 *
              1000
        ).toISOString(),
      });

      onSuccess();
    } catch (error) {
      console.error("Payment failed:", error);
      onError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onPress={handlePayment} disabled={loading} className="w-full">
      {loading ? (
        <LoadingSpinner size="small" color="white" />
      ) : (
        `Complete Purchase - ${formatPrice(plan.price_cents)}`
      )}
    </Button>
  );
};
```

### Subscription Status Management

```typescript
// components/subscription/SubscriptionStatus.tsx
import React from "react";
import { View, Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useUserSubscription,
  useCancelSubscription,
} from "@/lib/subscriptionQueries";
import { formatDate, formatPrice } from "@/lib/stripe";

export const SubscriptionStatus = () => {
  const { data: subscription, isLoading } = useUserSubscription();
  const cancelSubscription = useCancelSubscription();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Text className="text-muted-foreground mb-4">
            No active subscription
          </Text>
          <Button onPress={() => router.push("/subscription/pricing")}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelSubscription.mutateAsync(subscription.id);
      Alert.alert(
        "Subscription Canceled",
        "Your subscription will remain active until the end of your current billing period."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to cancel subscription. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center justify-between">
          <Text>{subscription.subscription_plans.name}</Text>
          <Badge
            variant={subscription.status === "active" ? "default" : "secondary"}
          >
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Price</Text>
          <Text className="font-semibold">
            {formatPrice(subscription.subscription_plans.price_cents)}/
            {subscription.subscription_plans.billing_period}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Next billing date</Text>
          <Text>{formatDate(subscription.current_period_end)}</Text>
        </View>

        {subscription.cancel_at_period_end && (
          <View className="bg-yellow-50 p-3 rounded-lg">
            <Text className="text-yellow-800 text-sm">
              Your subscription will end on{" "}
              {formatDate(subscription.current_period_end)}
            </Text>
          </View>
        )}

        {!subscription.cancel_at_period_end && (
          <Button
            variant="outline"
            onPress={handleCancel}
            disabled={cancelSubscription.isPending}
          >
            Cancel Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 🎨 UI Components & Styling

### NativeWind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        secondary: {
          100: "#f1f5f9",
          500: "#64748b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        "inter-medium": ["Inter-Medium", "sans-serif"],
        "inter-semibold": ["Inter-SemiBold", "sans-serif"],
        "inter-bold": ["Inter-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### Component Library Structure

```typescript
// components/ui/Button.tsx
import React from "react";
import { Pressable, Text, PressableProps } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends PressableProps {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      className={cn(
        // Base styles
        "rounded-lg items-center justify-center",

        // Size variants
        size === "sm" && "px-3 py-2",
        size === "md" && "px-4 py-3",
        size === "lg" && "px-6 py-4",

        // Color variants
        variant === "default" && "bg-primary-600",
        variant === "outline" && "border border-primary-600",
        variant === "ghost" && "bg-transparent",
        variant === "destructive" && "bg-red-600",

        // Disabled state
        props.disabled && "opacity-50",

        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "font-inter-medium",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg",
          variant === "default" && "text-white",
          variant === "outline" && "text-primary-600",
          variant === "ghost" && "text-primary-600",
          variant === "destructive" && "text-white"
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
};
```

### Animation Patterns

```typescript
// lib/animations.ts
import { Animated, Easing } from "react-native";

export const createFadeAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = 300
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

export const createSlideAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = 300
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.back(1.1)),
    useNativeDriver: true,
  });
};

// Usage in components
const AnimatedCard = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      createFadeAnimation(fadeAnim, 1),
      createSlideAnimation(slideAnim, 0),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Card content */}
    </Animated.View>
  );
};
```

---

## 🧪 Testing Strategy

### Subscription System Testing

```typescript
// __tests__/subscription/paymentFlow.test.ts
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { PaymentSheet } from "@/components/subscription/PaymentSheet";
import { mockStripe } from "@/__mocks__/stripe";

describe("Payment Flow", () => {
  const mockPlan = {
    id: "plan-1",
    name: "Annual Premium",
    price_cents: 7999,
    billing_period: "annual",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize payment sheet correctly", async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { getByText } = render(
      <PaymentSheet plan={mockPlan} onSuccess={onSuccess} onError={onError} />
    );

    const payButton = getByText("Complete Purchase - $79.99");
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockStripe.initPaymentSheet).toHaveBeenCalledWith({
        merchantDisplayName: "GreenThumb",
        customerId: expect.any(String),
        customerEphemeralKeySecret: expect.any(String),
        paymentIntentClientSecret: expect.any(String),
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "GreenThumb User",
        },
        returnURL: "greenthumb://payment-success",
      });
    });
  });

  it("should handle payment success", async () => {
    mockStripe.presentPaymentSheet.mockResolvedValue({ error: null });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { getByText } = render(
      <PaymentSheet plan={mockPlan} onSuccess={onSuccess} onError={onError} />
    );

    const payButton = getByText("Complete Purchase - $79.99");
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it("should handle payment cancellation", async () => {
    mockStripe.presentPaymentSheet.mockResolvedValue({
      error: { code: "Canceled", message: "User canceled" },
    });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { getByText } = render(
      <PaymentSheet plan={mockPlan} onSuccess={onSuccess} onError={onError} />
    );

    const payButton = getByText("Complete Purchase - $79.99");
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it("should handle payment errors", async () => {
    mockStripe.presentPaymentSheet.mockResolvedValue({
      error: { code: "Failed", message: "Payment failed" },
    });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { getByText } = render(
      <PaymentSheet plan={mockPlan} onSuccess={onSuccess} onError={onError} />
    );

    const payButton = getByText("Complete Purchase - $79.99");
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith("Payment failed");
    });
  });
});
```

### Database Query Testing

```typescript
// __tests__/queries/subscription.test.ts
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useSubscriptionPlans,
  useUserSubscription,
} from "@/lib/subscriptionQueries";
import { mockSupabase } from "@/__mocks__/supabase";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Subscription Queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useSubscriptionPlans", () => {
    it("should fetch subscription plans", async () => {
      const mockPlans = [
        {
          id: "plan-1",
          name: "Annual Premium",
          price_cents: 7999,
          billing_period: "annual",
          is_active: true,
        },
        {
          id: "plan-2",
          name: "Monthly Premium",
          price_cents: 999,
          billing_period: "monthly",
          is_active: true,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPlans,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSubscriptionPlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPlans);
    });

    it("should handle fetch errors", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSubscriptionPlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
```

### E2E Testing with Detox

```typescript
// e2e/subscription.e2e.ts
import { device, element, by, expect } from "detox";

describe("Subscription Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should complete subscription purchase flow", async () => {
    // Navigate to pricing page
    await element(by.text("Upgrade to Premium")).tap();

    // Select annual plan
    await element(by.text("Annual Premium")).tap();
    await element(by.text("Choose Plan")).tap();

    // Verify checkout screen
    await expect(element(by.text("Complete Your Purchase"))).toBeVisible();
    await expect(element(by.text("Annual Premium"))).toBeVisible();
    await expect(element(by.text("$79.99"))).toBeVisible();

    // Complete payment (using test card)
    await element(by.text("Complete Purchase")).tap();

    // Verify success screen
    await expect(element(by.text("Welcome to Premium!"))).toBeVisible();
    await expect(
      element(by.text("Your subscription is now active"))
    ).toBeVisible();

    // Navigate to subscription management
    await element(by.text("Manage Subscription")).tap();

    // Verify subscription details
    await expect(element(by.text("Annual Premium"))).toBeVisible();
    await expect(element(by.text("active"))).toBeVisible();
  });

  it("should handle payment cancellation", async () => {
    await element(by.text("Upgrade to Premium")).tap();
    await element(by.text("Monthly Premium")).tap();
    await element(by.text("Choose Plan")).tap();

    // Start payment process
    await element(by.text("Complete Purchase")).tap();

    // Cancel payment in Stripe sheet
    await element(by.text("Cancel")).tap();

    // Should return to checkout screen
    await expect(element(by.text("Complete Your Purchase"))).toBeVisible();
  });
});
```

---

## 🚀 Deployment & CI/CD

### EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_test_..."
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_test_..."
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_live_..."
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Type check
        run: npm run type-check

  build-ios:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build iOS
        run: eas build --platform ios --non-interactive
        env:
          EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build Android
        run: eas build --platform android --non-interactive
        env:
          EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
```

### Environment Management

```bash
# Production environment setup
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Production Stripe keys
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics and monitoring
SENTRY_DSN=your_sentry_dsn
ANALYTICS_API_KEY=your_analytics_key

# App configuration
APP_VERSION=1.0.0
BUILD_NUMBER=1
```

---

## 📊 Performance Monitoring

### Subscription Analytics

```typescript
// lib/analytics.ts
import { supabase } from "@/lib/supabase";

export const trackSubscriptionEvent = async (
  event: "subscription_started" | "subscription_canceled" | "payment_failed",
  data: {
    planId?: string;
    amount?: number;
    currency?: string;
    userId?: string;
  }
) => {
  try {
    await supabase.from("analytics_events").insert({
      event_type: event,
      event_data: data,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics tracking failed:", error);
  }
};

// Usage in components
const handleSubscriptionSuccess = async (subscription: UserSubscription) => {
  await trackSubscriptionEvent("subscription_started", {
    planId: subscription.plan_id,
    amount: subscription.subscription_plans.price_cents,
    currency: "usd",
    userId: subscription.user_id,
  });
};
```

### Error Monitoring

```typescript
// lib/errorTracking.ts
import * as Sentry from "@sentry/react-native";

export const initErrorTracking = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: __DEV__ ? "development" : "production",
  });
};

export const capturePaymentError = (error: Error, context: any) => {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "payment");
    scope.setContext("payment_context", context);
    Sentry.captureException(error);
  });
};
```

---

## 🔧 Development Tools

### Debugging Subscription Issues

```typescript
// lib/debug.ts
export const debugSubscription = {
  logPaymentIntent: (paymentIntent: any) => {
    if (__DEV__) {
      console.log("Payment Intent:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      });
    }
  },

  logSubscriptionState: (subscription: UserSubscription | null) => {
    if (__DEV__) {
      console.log("Subscription State:", {
        id: subscription?.id,
        status: subscription?.status,
        planName: subscription?.subscription_plans?.name,
        currentPeriodEnd: subscription?.current_period_end,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end,
      });
    }
  },

  logStripeError: (error: any) => {
    if (__DEV__) {
      console.error("Stripe Error:", {
        code: error.code,
        message: error.message,
        type: error.type,
        decline_code: error.decline_code,
      });
    }
  },
};
```

### Testing Utilities

```typescript
// __tests__/utils/testUtils.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <StripeProvider publishableKey="pk_test_mock">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
};

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: createTestWrapper() });
};
```

---

**📝 Technical Guide Version:** 2.0  
**🗓️ Last Updated:** January 14, 2025  
**👥 Maintained by:** GreenThumb Development Team
