# 🌱 GreenThumb Mobile App

> **Smart plant care management for thriving gardens**  
> **App Store Launch:** January 27, 2025

[![Expo SDK](https://img.shields.io/badge/Expo-53+-4630EB?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.3-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)

## 📖 Project Overview

GreenThumb is an intelligent plant care management app that combines AI-powered task generation with intuitive garden management. The app helps users maintain healthy plants through automated care schedules, plant health tracking, and seasonal guidance.

### 🎯 Core Features

- **Smart Garden Management** - Create multiple gardens with detailed environmental preferences
- **Automated Task Generation** - AI-powered watering, fertilizing, and harvesting schedules
- **Plant Health Tracking** - Visual plant status monitoring with photo logs
- **Seasonal Intelligence** - Dynamic illustrations and care adjustments based on season/weather
- **Comprehensive Plant Database** - 10,000+ plants with detailed care instructions
- **Task Calendar** - Visual schedule management with completion tracking

## 🏗️ Technical Stack

### Frontend

- **Framework**: Expo SDK 53+ / React Native 0.79.3
- **Language**: TypeScript 5.8+
- **Styling**: TailwindCSS + NativeWind 4.1+
- **Navigation**: Expo Router 5.0+
- **State Management**: Jotai 2.12+ & TanStack Query 5.68+
- **Animations**: Moti 0.30+ & React Native Reanimated 3.17+

### Backend & Services

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk Expo 2.8+
- **File Storage**: Supabase Storage
- **Push Notifications**: Expo Notifications
- **Weather API**: OpenWeather API

### Development Tools

- **Build System**: EAS Build & Submit
- **Testing**: Jest + Expo Testing
- **Linting**: ESLint + Prettier
- **Version Control**: Git

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app for physical device testing

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd GreenThumb-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your Clerk, Supabase, and OpenWeather API keys

# Start the development server
npm start
```

### Environment Variables

Create a `.env` file with the following keys:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

## 📱 App Structure

```
app/
├── (auth)/                 # Authentication screens
│   ├── welcome.tsx         # Welcome/onboarding
│   ├── sign-in.tsx         # Sign in with animations
│   └── sign-up.tsx         # Registration flow
└── (tabs)/                 # Main app screens
    ├── index.tsx           # Home dashboard
    ├── calendar.tsx        # Task calendar
    ├── profile.tsx         # User profile
    ├── gardens/            # Garden management
    └── plants/             # Plant management

components/
├── UI/                     # Reusable UI components
├── Auth/                   # Authentication components
├── Home/                   # Home screen components
├── Gardens/                # Garden-specific components
└── Database/               # Data management components

lib/
├── queries.ts              # TanStack Query hooks
├── supabaseApi.ts          # Database operations
├── supabaseClient.ts       # Supabase configuration
└── hooks/                  # Custom React hooks

types/
├── garden.ts               # Garden & plant type definitions
├── supabase.ts             # Database schema types
└── plant.ts                # Plant data types
```

## 🗄️ Database Schema

### Core Tables

- **`user_gardens`** - Garden creation with environmental preferences
- **`user_plants`** - Plant instances with nicknames, status, images
- **`plant_tasks`** - Automated task scheduling (water, fertilize, harvest)
- **`plant_care_logs`** - Care activity logging with photos

### Views & Aggregations

- **`user_gardens_dashboard`** - Garden health statistics and task summaries
- **`plant_full_data`** - Complete plant database with care requirements
- **`garden_health_stats`** - Plant health percentages by garden

## 🎨 Key Features Implemented

### ✅ Authentication Flow

- Animated welcome screen with seasonal illustrations
- Smooth sign-in/sign-up transitions
- Clerk integration with Supabase user sync
- Password visibility toggles and validation

### ✅ Home Dashboard

- Real-time garden health overview
- Overdue task notifications with celebratory animations
- Seasonal illustration engine (calm/chaotic states)
- Quick action shortcuts

### ✅ Garden Management

- Multi-garden support with detailed preferences
- Environmental condition tracking (soil, light, space)
- Plant recommendations based on garden conditions
- Garden health statistics and analytics

### ✅ Plant Care System

- Automated task generation based on plant requirements
- Task completion with optimistic UI updates
- Plant status tracking (Healthy, Needs Water, Wilting, etc.)
- Photo-based care logging

### ✅ Calendar & Scheduling

- Visual task calendar with monthly/weekly views
- Task filtering and completion tracking
- Upcoming task previews and notifications

## 🔧 Development Scripts

```bash
# Development
npm start                   # Start Expo development server
npm run android            # Run on Android emulator
npm run ios                # Run on iOS simulator

# Testing & Quality
npm run test               # Run Jest tests
npm run lint               # ESLint code checking

# Building
eas build --platform all   # Build for iOS and Android
eas submit                 # Submit to app stores
```

## 🛠️ Troubleshooting

### Common Issues

- **Clerk + Supabase Integration:** See [`docs/troubleshooting-clerk-supabase.md`](docs/troubleshooting-clerk-supabase.md) for UUID validation errors
- **Database Connection:** Ensure environment variables are correctly configured
- **Build Issues:** Clear cache with `npx expo start --clear`

### Development Guidelines

- **Authentication:** Always use `requesting_user_id()` in RLS policies, never `auth.uid()`
- **User IDs:** Clerk user IDs are TEXT strings, not UUIDs
- **Database Schema:** All `user_id` columns must be `TEXT NOT NULL`

## 📅 App Store Launch Plan - January 27, 2025

### 🚨 URGENT: User Interview Findings (January 14, 2025)

**Critical bugs identified** that must be fixed before launch:

- 🔴 **Database not scrollable** - Core functionality broken
- 🔴 **Database filters non-functional** - Filter buttons cause errors
- 🔴 **Garden completion status mismatch** - Data integrity issue

**Documentation:**

- **Quick Reference:** `notes/USER_INTERVIEW_SUMMARY.md`
- **Full Analysis:** `docs/user_feedback.md`
- **Task Tracking:** `notes/TASK.md` → "USER INTERVIEW FINDINGS" section

### 🔥 Critical Pre-Launch Tasks

#### High Priority (Complete by Jan 16-17)

- [ ] **Fix database scrolling** - Users must be able to scroll through plant database
- [ ] **Fix database filters** - Filter functionality must work without errors
- [ ] **Fix garden completion status** - Ensure data consistency between creation and edit flows

#### High Priority (Complete by Jan 18-19)

- [ ] **Fix typography inconsistency** - Quick actions must match brand guidelines
- [ ] **Fix layout bugs** - Long text should not break UI or hide buttons
- [ ] **Fix selection logic** - Prevent invalid option combinations in garden setup

#### Medium Priority (Complete by Jan 20)

- [ ] **Fix animation bugs** - Resolve useNativeDriver warnings in task completion
- [ ] **App Store assets** - Screenshots, app icon, store descriptions
- [ ] **Beta testing** - Deploy to TestFlight/Play Console for final testing
- [ ] **Privacy policy & terms** - Required legal documents
- [ ] **App Store metadata** - Keywords, descriptions, categories

#### Medium Priority (Complete by Jan 25)

- [ ] **Performance optimization** - Memory usage and startup time
- [ ] **Error tracking** - Sentry integration for crash reporting
- [ ] **Analytics** - User behavior tracking setup
- [ ] **Push notification setup** - For task reminders
- [ ] **Onboarding polish** - First-time user experience

#### Nice to Have (Post-launch)

- [ ] **Plant identification** - Camera-based plant recognition
- [ ] **Weather integration** - Automatic task adjustment based on weather
- [ ] **Social features** - Plant care tips sharing
- [ ] **Premium subscription** - Advanced features and unlimited gardens

### 📊 Current Status

| Feature             | Status      | Notes                                     |
| ------------------- | ----------- | ----------------------------------------- |
| Authentication      | ✅ Complete | Smooth animations, secure flow            |
| Garden Management   | ✅ Complete | Multi-garden support, preferences         |
| Plant Database      | ✅ Complete | 10,000+ plants with care data             |
| Task System         | ✅ Complete | Automated generation, completion tracking |
| Home Dashboard      | ✅ Complete | Health stats, seasonal illustrations      |
| Calendar View       | ✅ Complete | Visual task management                    |
| Profile Management  | ✅ Complete | User settings and preferences             |
| Build Configuration | ✅ Complete | EAS builds ready for stores               |

### 🚨 Known Issues

1. **Task Animation Bug** - useNativeDriver warnings on task completion

   - **Impact**: Visual glitches during task updates
   - **Priority**: High (affects user experience)
   - **ETA**: Fix by Jan 20

2. **Documentation Gaps** - Architecture and technical docs incomplete
   - **Impact**: Developer productivity
   - **Priority**: Medium
   - **ETA**: Complete by Jan 22

## 🔐 Security & Privacy

- **Authentication**: Secure OAuth with Clerk
- **Data Storage**: Encrypted Supabase PostgreSQL
- **File Uploads**: Secure Supabase Storage with RLS policies
- **API Keys**: Environment variables only, never committed
- **User Data**: GDPR compliant with data export/deletion

## 🚀 Deployment

### EAS Build Configuration

```bash
# Development builds
eas build --profile development

# Production builds for app stores
eas build --profile production

# Automatic submission
eas submit --platform ios
eas submit --platform android
```

### Environment Management

- **Development**: Local .env with development keys
- **Preview**: EAS environment variables for staging
- **Production**: Secure production keys in EAS secrets

## 📚 Additional Documentation

- [`docs/architecture.md`](docs/architecture.md) - App architecture and patterns
- [`docs/technical.md`](docs/technical.md) - Implementation details and conventions
- [`tasks/tasks.md`](tasks/tasks.md) - Development task tracking
- [`notes/PLANNING.md`](notes/PLANNING.md) - Business strategy and roadmap

## 🤝 Contributing

1. Follow the established patterns in `docs/architecture.md`
2. Update task status in `tasks/tasks.md`
3. Maintain type safety - no `any` types
4. Test on both iOS and Android
5. Update documentation for significant changes

## 📄 License

Private repository - All rights reserved

---

**🎯 Target Launch: January 27, 2025**  
**📱 Platforms: iOS App Store & Google Play Store**  
**🌍 Initial Markets: United States, Canada**
