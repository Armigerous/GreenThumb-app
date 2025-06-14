# 🏗️ GreenThumb App Architecture

> **Version:** 2.0 (Updated January 2025)  
> **Framework:** React Native with Expo SDK 53  
> **Backend:** Supabase (PostgreSQL + Auth + Storage)  
> **State Management:** React Query + Context API  
> **Styling:** NativeWind (Tailwind CSS for React Native)  
> **Navigation:** Expo Router (File-based routing)  
> **Payments:** Stripe for subscription management

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Application Structure](#application-structure)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Authentication System](#authentication-system)
6. [Subscription System](#subscription-system)
7. [Component Hierarchy](#component-hierarchy)
8. [API Integration](#api-integration)
9. [State Management](#state-management)
10. [File Organization](#file-organization)

---

## 🌐 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GreenThumb Mobile App                    │
├─────────────────────────────────────────────────────────────┤
│  React Native + Expo SDK 53 + TypeScript + NativeWind     │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Screens   │ │ Components  │ │   Hooks     │          │
│  │             │ │             │ │             │          │
│  │ • Home      │ │ • UI Kit    │ │ • Queries   │          │
│  │ • Garden    │ │ • Forms     │ │ • Auth      │          │
│  │ • Plants    │ │ • Cards     │ │ • Storage   │          │
│  │ • Tasks     │ │ • Modals    │ │ • Payments  │          │
│  │ • Profile   │ │ • Lists     │ │             │          │
│  │ • Pricing   │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Supabase   │ │   Stripe    │ │   Storage   │          │
│  │             │ │             │ │             │          │
│  │ • Auth      │ │ • Payments  │ │ • Images    │          │
│  │ • Database  │ │ • Billing   │ │ • Cache     │          │
│  │ • RLS       │ │ • Webhooks  │ │ • Offline   │          │
│  │ • Real-time │ │ • Customers │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Modular Design**: Each feature is self-contained with clear boundaries
2. **Type Safety**: Full TypeScript coverage with strict typing
3. **Performance**: Optimized for mobile with lazy loading and caching
4. **Offline-First**: Core functionality works without internet connection
5. **Scalable**: Architecture supports growth from MVP to enterprise features
6. **Secure**: Row-level security, encrypted payments, and data protection

---

## 🗄️ Database Architecture

### Core Tables

```sql
-- User Management
users (Supabase Auth)
user_profiles
user_preferences

-- Garden & Plant Management
gardens
plants
plant_care_logs
plant_images

-- Task System
tasks
task_templates
task_completions

-- Subscription System (NEW - January 2025)
subscription_plans
user_subscriptions
subscription_addons
user_subscription_addons
payment_history
```

### Subscription Schema Details

```sql
-- Subscription Plans: Available pricing tiers
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Annual Premium", "Monthly Premium"
  description TEXT,                      -- Plan description
  price_cents INTEGER NOT NULL,          -- Price in cents (7999 = $79.99)
  billing_period TEXT NOT NULL,          -- "annual", "monthly", "6_month"
  stripe_price_id TEXT UNIQUE,           -- Stripe price ID
  features JSONB DEFAULT '[]',           -- Array of feature descriptions
  is_active BOOLEAN DEFAULT true,        -- Can be purchased
  sort_order INTEGER DEFAULT 0,          -- Display order
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions: Active user subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,    -- Stripe subscription ID
  stripe_customer_id TEXT NOT NULL,      -- Stripe customer ID
  status TEXT NOT NULL,                  -- "active", "canceled", "past_due"
  current_period_start TIMESTAMPTZ,      -- Billing period start
  current_period_end TIMESTAMPTZ,        -- Billing period end
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Add-ons: Upsell products
CREATE TABLE subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Plant Care Guarantee"
  description TEXT,                      -- Add-on description
  price_cents INTEGER NOT NULL,          -- One-time or recurring price
  addon_type TEXT NOT NULL,              -- "one_time", "recurring"
  stripe_price_id TEXT UNIQUE,           -- Stripe price ID
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Add-on Purchases
CREATE TABLE user_subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES subscription_addons(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_line_item_id TEXT,              -- Stripe line item ID
  status TEXT NOT NULL DEFAULT 'active', -- "active", "canceled"
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                -- For time-limited add-ons
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment History: Transaction records
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,  -- Stripe payment intent ID
  amount_cents INTEGER NOT NULL,         -- Amount charged
  currency TEXT DEFAULT 'usd',           -- Currency code
  status TEXT NOT NULL,                  -- "succeeded", "failed", "pending"
  description TEXT,                      -- Payment description
  payment_method_type TEXT,              -- "card", "apple_pay", "google_pay"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Users can only access their own subscription data
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only access their own payment history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Subscription plans are publicly readable
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON subscription_plans
  FOR SELECT USING (is_active = true);
```

### Database Relationships

```
users (Supabase Auth)
├── user_profiles (1:1)
├── user_preferences (1:1)
├── gardens (1:many)
│   └── plants (1:many)
│       ├── plant_care_logs (1:many)
│       └── plant_images (1:many)
├── tasks (1:many)
├── user_subscriptions (1:many)
│   ├── subscription_plans (many:1)
│   └── user_subscription_addons (1:many)
│       └── subscription_addons (many:1)
└── payment_history (1:many)
```

---

## 📱 Application Structure

### Screen Hierarchy

```
app/
├── (auth)/                    # Authentication flow
│   ├── sign-in.tsx           # Sign in screen
│   ├── sign-up.tsx           # Sign up screen
│   └── forgot-password.tsx   # Password reset
├── (home)/                   # Main app screens
│   ├── index.tsx             # Dashboard/Home
│   ├── gardens/              # Garden management
│   │   ├── index.tsx         # Garden list
│   │   ├── [id].tsx          # Garden details
│   │   └── create.tsx        # Create garden
│   ├── plants/               # Plant management
│   │   ├── index.tsx         # Plant database
│   │   ├── [id].tsx          # Plant details
│   │   └── add.tsx           # Add plant
│   ├── tasks/                # Task management
│   │   ├── index.tsx         # Task list
│   │   ├── calendar.tsx      # Calendar view
│   │   └── [id].tsx          # Task details
│   ├── profile/              # User profile
│   │   ├── index.tsx         # Profile overview
│   │   ├── settings.tsx      # App settings
│   │   └── preferences.tsx   # User preferences
│   ├── pricing.tsx           # Subscription pricing (NEW)
│   ├── checkout.tsx          # Payment processing (NEW)
│   ├── subscription-success.tsx  # Success screen (NEW)
│   └── subscription.tsx      # Subscription management (NEW)
└── _layout.tsx               # Root layout with navigation
```

### Component Organization

```
components/
├── ui/                       # Base UI components
│   ├── Button.tsx           # Primary button component
│   ├── Input.tsx            # Form input component
│   ├── Card.tsx             # Card container
│   ├── Modal.tsx            # Modal overlay
│   ├── LoadingSpinner.tsx   # Loading indicator
│   └── Badge.tsx            # Status badges
├── forms/                   # Form components
│   ├── AuthForm.tsx         # Authentication forms
│   ├── PlantForm.tsx        # Plant creation/editing
│   ├── TaskForm.tsx         # Task creation/editing
│   └── PaymentForm.tsx      # Payment processing (NEW)
├── lists/                   # List components
│   ├── PlantList.tsx        # Plant grid/list view
│   ├── TaskList.tsx         # Task list view
│   ├── GardenList.tsx       # Garden grid view
│   └── PaymentHistory.tsx   # Payment history list (NEW)
├── cards/                   # Card components
│   ├── PlantCard.tsx        # Individual plant card
│   ├── TaskCard.tsx         # Individual task card
│   ├── GardenCard.tsx       # Individual garden card
│   └── PricingCard.tsx      # Subscription plan card (NEW)
├── navigation/              # Navigation components
│   ├── TabBar.tsx           # Bottom tab navigation
│   ├── Header.tsx           # Screen headers
│   └── DrawerMenu.tsx       # Side drawer menu
└── subscription/            # Subscription-specific components (NEW)
    ├── PricingPlans.tsx     # Pricing plan selection
    ├── PaymentSheet.tsx     # Stripe payment sheet
    ├── SubscriptionStatus.tsx # Current subscription display
    ├── AddOnList.tsx        # Available add-ons
    └── GuaranteeSection.tsx # Triple guarantee display
```

---

## 🔄 Data Flow Patterns

### Authentication Flow

```
1. User opens app
2. Check Supabase auth state
3. If authenticated → Navigate to home
4. If not authenticated → Navigate to sign-in
5. User signs in/up → Supabase handles auth
6. Create/update user profile
7. Navigate to home with user context
```

### Subscription Flow (NEW)

```
1. User views pricing page
2. Select subscription plan
3. Navigate to checkout
4. Initialize Stripe payment sheet
5. Process payment with Stripe
6. Create subscription in database
7. Navigate to success screen
8. Update user subscription status
9. Enable premium features
```

### Plant Care Flow

```
1. User adds plant to garden
2. System generates care tasks
3. User receives task notifications
4. User completes tasks
5. System logs care history
6. Update plant health status
7. Generate new tasks based on schedule
```

### Data Synchronization

```
React Query Cache ←→ Supabase Database
        ↓
Local Storage (Offline)
        ↓
UI Components (Real-time updates)
```

---

## 🔐 Authentication System

### Supabase Auth Integration

```typescript
// lib/auth.ts
import { supabase } from "./supabase";

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },
};
```

### Auth Context Provider

```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 💳 Subscription System

### Stripe Integration Architecture

```typescript
// lib/stripe.ts
import { StripeProvider } from "@stripe/stripe-react-native";

export const stripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  merchantIdentifier: "merchant.com.greenthumb.app",
  urlScheme: "greenthumb",
};

// Price calculation utilities
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
```

### Payment Processing Flow

```typescript
// api/create-payment-intent.ts
export default async function handler(req: Request) {
  const { planId, userId } = await req.json();

  // Get plan details
  const plan = await getSubscriptionPlan(planId);

  // Create or retrieve Stripe customer
  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: plan.price_cents,
    currency: "usd",
    customer: customer.id,
    metadata: { planId, userId },
  });

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    customerId: customer.id,
  });
}
```

### Subscription State Management

```typescript
// lib/subscriptionQueries.ts
export const useUserSubscription = () => {
  return useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subscription_plans (*)
        `
        )
        .eq("user_id", user?.id)
        .eq("status", "active")
        .single();

      return data;
    },
    enabled: !!user,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionData: CreateSubscriptionData) => {
      const { data } = await supabase
        .from("user_subscriptions")
        .insert(subscriptionData)
        .select()
        .single();

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
};
```

---

## 🧩 Component Hierarchy

### Screen Component Pattern

```typescript
// app/(home)/pricing.tsx
export default function PricingScreen() {
  const { data: plans, isLoading } = usePricingDisplay();
  const navigation = useRouter();

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageContainer scroll>
      <PricingHeader />
      <PricingPlans
        plans={plans}
        onSelectPlan={(plan) => navigation.push(`/checkout?plan=${plan.id}`)}
      />
      <GuaranteeSection />
      <SocialProof />
    </PageContainer>
  );
}
```

### Reusable Component Pattern

```typescript
// components/subscription/PricingCard.tsx
interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

export const PricingCard = ({
  plan,
  isPopular,
  onSelect,
}: PricingCardProps) => {
  const badge = getPlanBadge(plan);
  const savings = calculateSavings(plan.price_cents, monthlyPrice);

  return (
    <Card className={cn("relative", isPopular && "border-primary")}>
      {badge && <Badge className="absolute -top-2">{badge}</Badge>}

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <PriceDisplay
          price={plan.price_cents}
          period={plan.billing_period}
          savings={savings}
        />
        <FeatureList features={plan.features} />
      </CardContent>

      <CardFooter>
        <Button
          onPress={() => onSelect(plan)}
          variant={isPopular ? "default" : "outline"}
          className="w-full"
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  );
};
```

### Form Component Pattern

```typescript
// components/forms/PaymentForm.tsx
export const PaymentForm = ({ plan, onSuccess, onError }: PaymentFormProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const createPaymentIntent = useCreatePaymentIntent();

  const handlePayment = async () => {
    try {
      // Create payment intent
      const { clientSecret, customerId } =
        await createPaymentIntent.mutateAsync({
          planId: plan.id,
        });

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "GreenThumb",
        customerId,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) throw initError;

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) throw paymentError;

      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <View className="space-y-4">
      <OrderSummary plan={plan} />
      <Button onPress={handlePayment} className="w-full">
        Complete Purchase
      </Button>
    </View>
  );
};
```

---

## 🔌 API Integration

### Supabase Client Configuration

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### React Query Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### API Endpoints

```typescript
// API Routes (Expo Router API)
api/
├── create-payment-intent.ts    # Create Stripe payment intent
├── webhook-stripe.ts           # Handle Stripe webhooks
├── subscription-status.ts      # Get subscription status
└── cancel-subscription.ts     # Cancel subscription

// Usage in components
const createPaymentIntent = useMutation({
  mutationFn: async (data: PaymentIntentData) => {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }
})
```

---

## 🏪 State Management

### Global State Architecture

```typescript
// contexts/AppContext.tsx
interface AppState {
  user: User | null;
  subscription: UserSubscription | null;
  preferences: UserPreferences;
  gardens: Garden[];
  selectedGarden: Garden | null;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  // Subscription to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel("app-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_subscriptions" },
        (payload) => {
          // Update subscription state
          setState((prev) => ({
            ...prev,
            subscription: payload.new as UserSubscription,
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
};
```

### Local State Patterns

```typescript
// Custom hooks for component state
export const useFormState = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (schema: ValidationSchema<T>) => {
    const newErrors = validateSchema(values, schema);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validate,
    reset: () => {
      setValues(initialValues);
      setErrors({});
      setIsSubmitting(false);
    },
  };
};
```

---

## 📁 File Organization

### Project Structure

```
GreenThumb-app/
├── app/                      # Expo Router screens
├── components/               # Reusable components
├── lib/                      # Utilities and services
│   ├── supabase.ts          # Supabase client
│   ├── stripe.ts            # Stripe utilities
│   ├── subscriptionQueries.ts # Subscription React Query hooks
│   ├── auth.ts              # Authentication utilities
│   ├── storage.ts           # Local storage utilities
│   └── utils.ts             # General utilities
├── types/                   # TypeScript type definitions
│   ├── database.ts          # Supabase generated types
│   ├── subscription.ts      # Subscription types
│   ├── auth.ts              # Authentication types
│   └── common.ts            # Common types
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication context
│   ├── AppContext.tsx       # Global app state
│   └── SubscriptionContext.tsx # Subscription state
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useSubscription.ts   # Subscription hook
│   ├── useStorage.ts        # Local storage hook
│   └── usePermissions.ts    # Device permissions hook
├── constants/               # App constants
│   ├── Colors.ts            # Color palette
│   ├── Fonts.ts             # Typography
│   ├── Layout.ts            # Layout constants
│   └── Subscription.ts      # Subscription constants
├── assets/                  # Static assets
│   ├── images/              # Image files
│   ├── icons/               # Icon files
│   └── fonts/               # Custom fonts
├── supabase/               # Database migrations and types
│   ├── migrations/          # SQL migration files
│   └── types.ts             # Generated database types
├── api/                    # API endpoints (Expo Router API)
│   ├── create-payment-intent.ts
│   ├── webhook-stripe.ts
│   └── subscription-status.ts
└── docs/                   # Documentation
    ├── architecture.md      # This file
    ├── technical.md         # Technical implementation details
    └── deployment.md        # Deployment instructions
```

### Import Organization

```typescript
// Standard import order
import React from "react"; // React imports
import { View, Text } from "react-native"; // React Native imports
import { useRouter } from "expo-router"; // Expo imports
import { useQuery } from "@tanstack/react-query"; // Third-party imports

import { Button } from "@/components/ui/Button"; // Internal component imports
import { useAuth } from "@/hooks/useAuth"; // Internal hook imports
import { supabase } from "@/lib/supabase"; // Internal service imports
import { User } from "@/types/auth"; // Internal type imports
```

### Component File Structure

```typescript
// components/subscription/PricingCard.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { cn } from '@/lib/utils'

// Types
interface PricingCardProps {
  plan: SubscriptionPlan
  isPopular?: boolean
  onSelect: (plan: SubscriptionPlan) => void
}

// Component
export const PricingCard = ({ plan, isPopular, onSelect }: PricingCardProps) => {
  // Component logic here
  return (
    // JSX here
  )
}

// Styles (if using StyleSheet)
const styles = StyleSheet.create({
  // Styles here
})

// Default export
export default PricingCard
```

---

## 🔄 Data Flow Summary

### Complete User Journey

```
1. App Launch
   ├── Check auth state
   ├── Load user preferences
   └── Initialize subscription status

2. Authentication
   ├── Sign in/up with Supabase
   ├── Create user profile
   └── Set up default preferences

3. Subscription Flow (NEW)
   ├── View pricing plans
   ├── Select plan and proceed to checkout
   ├── Process payment with Stripe
   ├── Create subscription record
   ├── Enable premium features
   └── Show success confirmation

4. Garden Management
   ├── Create/select garden
   ├── Add plants to garden
   ├── Generate care tasks
   └── Track plant health

5. Task Management
   ├── View scheduled tasks
   ├── Complete care activities
   ├── Log care history
   └── Update plant status

6. Subscription Management
   ├── View current subscription
   ├── Manage payment methods
   ├── Purchase add-ons
   ├── View payment history
   └── Cancel/reactivate subscription
```

### Real-time Updates

```
Supabase Real-time → React Query Cache → UI Components
                  ↓
            Local Storage (Offline backup)
```

---

## 🚀 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Screens and components load on demand
2. **Image Optimization**: Cached plant images with progressive loading
3. **Query Optimization**: React Query with smart caching and background updates
4. **Bundle Splitting**: Feature-based code splitting with Expo Router
5. **Memory Management**: Proper cleanup of subscriptions and listeners
6. **Offline Support**: Critical data cached locally with sync on reconnection

### Monitoring

- **Performance**: React Native Performance Monitor
- **Crashes**: Expo crash reporting
- **Analytics**: Custom events for user behavior
- **Payments**: Stripe dashboard for payment analytics
- **Database**: Supabase analytics for query performance

---

**📝 Architecture Version:** 2.0  
**🗓️ Last Updated:** January 14, 2025  
**👥 Maintained by:** GreenThumb Development Team
