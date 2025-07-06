# 🌱 GreenThumb - Project Planning & Strategy

> **Project Status:** Feature-complete with NC-focused enhancements, pilot underway  
> **Launch Target:** August 15, 2025  
> **Last Updated:** July 5, 2025  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)  
2. [Business Model & Strategy](#business-model--strategy)  
3. [Technical Architecture](#technical-architecture)  
4. [Subscription System Implementation](#subscription-system-implementation)  
5. [Feature Roadmap](#feature-roadmap)  
6. [Launch Strategy](#launch-strategy)  
7. [Success Metrics](#success-metrics)  

---

## 🎯 Project Overview

### Vision Statement

**"Empowering North Carolina plant parents to cultivate thriving gardens through zone-aware, personalized AI guidance and community support."**

### Core Value Proposition

- **Zone-Aware Task Scheduling**: AI-driven care plans tuned to USDA Zones 6–8 and local weather  
- **Extension-Backed Content**: Integrated NC State Extension tips, fact sheets & alerts  
- **Visual Progress Tracking**: Photo journals + health dashboards with weather tagging  
- **Triple Guarantee Confidence**: Service, Money-Back, Success guarantees paired with local nursery partners  
- **Community & Expert Access**: In-app articles, local workshop reminders, premium horticulturist consultations  

### Target Audience

- **Novice NC Gardeners** (40%): Need hand-holding, zone guidance, anxiety relief  
- **Intermediate Enthusiasts** (35%): Seek efficiency, expansion tools, Extension resources  
- **Busy Professionals** (25%): Require automated, weather-aware reminders  

---

## 💰 Business Model & Strategy

### Subscription-First + Guarantees

- **Annual Premium**: \$79.99/yr (Most Popular)  
- **6-Month Premium**: \$49.99/6-mo (Best Value)  
- **Monthly Premium**: \$9.99/mo (Entry Tier)  
- **Family Tier**: \$119.99/yr for up to 4 users (planned)  

#### Add-On Upsells

- **Plant Care Guarantee**: \$19.99 one-time (90-day replacement + expert consult)  
- **Horticulturist Credits**: \$29.99 for 3 video calls  
- **Premium Guides**: \$39.99 one-time (rare plant & seasonal deep dives)  
- **Analytics Pack**: \$24.99/yr (growth forecasts + insights)  

#### Financial Targets

- **LTV:CAC**: 15:1  
- **CAC**: \$12–15  
- **Payback**: 2 months  
- **Year 1 ARR**: \$400K  
- **Year 2 ARR**: \$1.8M  

### Triple Guarantee System

1. **Service**: Unlimited support until plants thrive  
2. **Money-Back**: 30-day full refund  
3. **Success**: Plant replacement via local nurseries  

---

## 🏗️ Technical Architecture

### Stack Overview

- **Frontend**: React Native + Expo SDK 53, NativeWind, Reanimated 3  
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)  
- **AI & Weather**: OpenAI GPT-4 + NOAA/Weather API via Edge Functions  
- **Content**: RSS/API feed from NC State Extension  
- **Payments**: Stripe + Stripe Billing + Expo In-App Payments  

### Data Model Highlights

users
├─ user_profiles
├─ gardens (zone_info)
│   ├─ plants
│   ├─ plant_care_logs
│   └─ plant_tasks (with weather_events)
├─ extension_content (article_id, link, county)
└─ subscriptions & addons

---

## 💳 Subscription System Implementation

- **Completed**: Schema, Stripe integration, webhooks, pricing UI, checkout flow, subscription management  
- **Testing**: Final payment & management tests due July 12, 2025  
- **Production**: Stripe account verification, tax & PCI compliance by July 15, 2025  
- **Monitoring**: Conversion & revenue dashboards live  

---

## 🗺️ Feature Roadmap

### Phase 1: NC Pilot (Q2–Q3 2025) ✅

- Zone & weather integration (in progress)  
- Extension content widgets  
- AI task generation with zone/weather modifiers  
- Core garden & plant management  
- Subscription system  

### Phase 2: Pre-Launch Enhancements (July–Aug 2025)

- Push notifications for weather & Extension events  
- Discovery feed of local workshops/articles  
- UI polish: zone badges, weather icons, “Extension Recommended” labels  
- Beta feedback loops with NC Master Gardeners  

### Phase 3: Official Launch (Aug 15, 2025)

- App Store / Play Store release  
- Marketing blitz in NC metros (Raleigh, Charlotte, Asheville)  
- Partnerships: nurseries, Extension offices, influencers  
- Soft-launch bug fixes & performance tuning  

### Phase 4: Post-Launch Scaling (Q4 2025)

- Family & gift subscription tiers  
- IoT sensor integration pilot  
- Marketplace MVP: local plant & supply ordering  
- Community forum & social sharing features  

---

## 🚀 Launch Strategy

### Pre-Launch (July 15–Aug 14)

- Final QA & performance tests  
- Local beta cohort onboarding (500 users)  
- Marketing collateral ready: ads, email, social, PR  
- Training for support team on NC-specific queries  

### Launch Week (Aug 15–21)

- **Day 1**: Official release; press release; social push  
- **Day 2–3**: Monitor app health & reviews; rapid bug fixes  
- **Day 4–7**: User surveys; A/B tests on onboarding & pricing  

### Early Post-Launch (Aug 22–Sept 30)

- Scale ad spend in NC markets  
- Host 3 virtual “Ask an Extension Agent” events  
- Publish success stories from pilot users  
- Iterate on Phase 2 roadmap items  

---

## 📊 Success Metrics

### Launch Week

- 1,000+ downloads  
- 60% signup conversion  
- 4.5+ App Store rating  
- <1% crash rate  
- 5% trial-to-subscription  

### Month 1

- 5,000 MAU in NC  
- 75% task completion  
- 30% Extension widget CTR  
- 10% free-to-premium conversion  

### Q3 2025

- 15,000 MAU  
- \$25K MRR  
- 70% 30-day retention  
- NPS ≥ 50  

### Year 1

- 100,000 users nationwide  
- \$400K ARR  
- 5,000 premium subscribers  
- Market leader in zone-aware plant care  

---

**Planning Document Version:** 3.0  
**Last Updated:** July 5, 2025  
**Maintained by:** GreenThumb Strategy Team  