-- Create subscription plans table
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  interval_type TEXT NOT NULL CHECK (interval_type IN ('month', 'year', 'one_time')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  stripe_price_id TEXT UNIQUE,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create user subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subscription_plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN (
      'active',
      'canceled',
      'past_due',
      'unpaid',
      'incomplete',
      'incomplete_expired',
      'trialing'
    )
  ),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create subscription add-ons table for upsells
CREATE TABLE subscription_addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create user subscription add-ons table
CREATE TABLE user_subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  addon_id TEXT NOT NULL REFERENCES subscription_addons(id),
  stripe_subscription_item_id TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create payment history table
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (
    status IN (
      'succeeded',
      'pending',
      'failed',
      'canceled',
      'refunded'
    )
  ),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_user_subscription_id ON payment_history(user_subscription_id);
-- Insert default subscription plans based on the business model
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price_cents,
    interval_type,
    interval_count,
    features
  )
VALUES (
    'annual_premium',
    'Annual Premium',
    'Transform from anxious plant killer to confident plant parent with our comprehensive annual plan',
    7999,
    'year',
    1,
    '[
  "Unlimited plants",
  "AI-powered task generation", 
  "Weather-aware notifications",
  "Photo-based plant health tracking",
  "Multi-garden management",
  "Expert consultation access",
  "Advanced analytics",
  "85% plant survival guarantee"
]'::jsonb
  ),
  (
    'six_month_premium',
    '6-Month Premium',
    'Get started with our comprehensive plant care system for 6 months',
    4999,
    'month',
    6,
    '[
  "Unlimited plants",
  "AI-powered task generation",
  "Weather-aware notifications", 
  "Photo-based plant health tracking",
  "Multi-garden management",
  "Expert consultation access",
  "Advanced analytics"
]'::jsonb
  ),
  (
    'monthly_premium',
    'Monthly Premium',
    'Month-to-month premium access to all features',
    999,
    'month',
    1,
    '[
  "Unlimited plants",
  "AI-powered task generation",
  "Weather-aware notifications",
  "Photo-based plant health tracking", 
  "Multi-garden management",
  "Expert consultation access"
]'::jsonb
  ),
  (
    'family_annual',
    'Family Annual',
    'Annual premium plan for the whole family',
    11999,
    'year',
    1,
    '[
  "Everything in Annual Premium",
  "Up to 5 family members",
  "Shared garden management",
  "Family plant care coordination",
  "Priority expert support"
]'::jsonb
  );
-- Insert subscription add-ons (zero-cost upsells)
INSERT INTO subscription_addons (id, name, description, price_cents)
VALUES (
    'plant_care_guarantee',
    'Plant Care Guarantee',
    'Insurance-style add-on that guarantees plant replacement if they die following our care instructions',
    1999
  ),
  (
    'expert_consultation_credits',
    'Expert Consultation Credits',
    '3 one-on-one sessions with certified plant care experts',
    2999
  ),
  (
    'premium_plant_guides',
    'Premium Plant Guides Bundle',
    'Seasonal collections of detailed plant care guides and tutorials',
    3999
  ),
  (
    'advanced_analytics',
    'Advanced Analytics Package',
    'Detailed insights into your plant care patterns and garden health trends',
    2499
  );
-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
-- Subscription plans are public (readable by all authenticated users)
CREATE POLICY "Subscription plans are viewable by authenticated users" ON subscription_plans FOR
SELECT USING (auth.role() = 'authenticated');
-- User subscriptions are only viewable by the owner
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR
SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR
INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR
UPDATE USING (auth.uid()::text = user_id);
-- Subscription add-ons are public (readable by all authenticated users)
CREATE POLICY "Subscription add-ons are viewable by authenticated users" ON subscription_addons FOR
SELECT USING (auth.role() = 'authenticated');
-- User subscription add-ons are only viewable by the owner
CREATE POLICY "Users can view their own subscription add-ons" ON user_subscription_addons FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM user_subscriptions
      WHERE user_subscriptions.id = user_subscription_addons.user_subscription_id
        AND user_subscriptions.user_id = auth.uid()::text
    )
  );
CREATE POLICY "Users can insert their own subscription add-ons" ON user_subscription_addons FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_subscriptions
      WHERE user_subscriptions.id = user_subscription_addons.user_subscription_id
        AND user_subscriptions.user_id = auth.uid()::text
    )
  );
-- Payment history is only viewable by the owner
CREATE POLICY "Users can view their own payment history" ON payment_history FOR
SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own payment history" ON payment_history FOR
INSERT WITH CHECK (auth.uid()::text = user_id);
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Add updated_at triggers
CREATE TRIGGER update_subscription_plans_updated_at BEFORE
UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE
UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_addons_updated_at BEFORE
UPDATE ON subscription_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscription_addons_updated_at BEFORE
UPDATE ON user_subscription_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();