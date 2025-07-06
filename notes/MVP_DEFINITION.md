# 🌿 GreenThumb MVP – Updated Product Specifications

## 🎯 Problem Statement

### Market Gaps Addressed (NC-Focused)

1. **Zone-Aware Care**: NC gardeners need guidance tuned to USDA Zones 6–8  
2. **Weather-Adaptive Advice**: Local storms & heat waves in NC require dynamic task tweaks  
3. **Extension-Backed Content**: Seamless NC State Extension integration for science-based guidance  
4. **Personalized Onboarding**: Onboarding must capture county/zone & user’s local conditions  
5. **Beginner Success Focus**: Extra hand-holding to reduce plant failure anxiety

---

## 🚀 Core Features (Re-Prioritized)

### 1. Zone & Weather Integration

**Priority**: Critical (↑)  
**Status**: 🔄 In Progress  

- **Onboarding** captures ZIP for USDA zone + weather API key  
- Real-time weather feed adjusts watering/fertilizing tasks  
- Zone-aware seasonal calendar drives task timing  

**Tech**: Supabase Edge Function pulls weather; zone logic in task generator

---

### 2. AI-Powered Task Generation

**Priority**: Critical  
**Status**: ✅ Complete  

- Now includes weather modifiers (rain delays, heat alerts)  
- Zone & season parameters passed into GPT prompt  
- Tasks scoped by garden location (coastal vs. mountain vs. piedmont)  

**Tech**: GPT-4 via Supabase Edge; prompt enriched with zone/weather data

---

### 3. NC State Extension Content

**Priority**: High (↑)  
**Status**: 🔄 In Progress  

- In-app “Extension Tips” widget on each plant profile  
- Deep link to county-specific fact sheets & pest alerts  
- Weekly Extension article feed in Discovery tab  

**Tech**: RSS/API integration with extension site; caching in Supabase

---

### 4. Garden Management

**Priority**: Critical  
**Status**: ✅ Complete  

- Multi-garden support with zone metadata  
- Visual dashboard now surfaces weather events & Extension alerts  
- Plant grouping by zone-specific health status  

---

### 5. Plant Database & Search

**Priority**: Critical  
**Status**: ✅ Complete  

- Added NC-native and zone-hardiest plant filters  
- Highlight “Extension Recommended” varieties  
- Search results show zone compatibility badge  

---

### 6. Task Management & Notifications

**Priority**: Critical  
**Status**: ✅ Complete  

- Push notifications now reflect weather delays/county alerts  
- Optional “Extension Reminder” for local workshops/events  
- Calendar view flags upcoming freeze/frost days  

---

### 7. Seasonal Illustration Engine

**Priority**: High  
**Status**: ✅ Complete  

- Now respects local season start/end dates per zone  
- Illustrations adapt to heat, humidity, storm icons  

---

### 8. User Authentication & Onboarding

**Priority**: Critical  
**Status**: ✅ Complete  

- Added ZIP/county step for zone/weather context  
- Experience level questions refined to include NC conditions  

---

### 9. Plant Care Tracking

**Priority**: High (↑)  
**Status**: ✅ Complete  

- Health journaling prompts now include “Extension Tip of the Week”  
- Photo log auto-tagged by weather (e.g., “After heavy rain”)  

---

## 🏗️ Technical Architecture Updates
user_gardens
├─ zone_info (county, USDA_zone)
├─ weather_events (forecast, alerts)
├─ extension_content (article_id, link)
├─ user_plants
│   ├─ plant_care_logs
│   └─ plant_tasks
└─ dashboard_views (materialized)

- **Weather API**: NOAA or Weather API key via Supabase Secret  
- **Extension Feed**: Scheduled ETL job pulls new articles daily  
- **Zone Logic**: New Edge Function enriches tasks with zone metadata  

---

## 📊 Updated Success Metrics

- **Task Accuracy**: 95% relevance of weather-adapted tasks  
- **Extension Engagement**: 30% click-through on “Extension Tips”  
- **Zone-Aware Adoption**: 80% of users complete ZIP/county step  
- **Local Retention**: 70% 30-day retention in NC pilot regions  

---

_Last Updated: July 2025_  
_Document Owner: Product & Engineering_  
_Review Cycle: Bi-weekly_  
