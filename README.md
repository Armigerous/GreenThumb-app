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
pnpm install

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

- **`user_gardens_dashboard`** - Garden task summaries and plant counts
- **`plant_full_data`** - Complete plant database with care requirements

## 🎨 Key Features Implemented

### ✅ Authentication Flow

- Animated welcome screen with seasonal illustrations
- Smooth sign-in/sign-up transitions
- Clerk integration with Supabase user sync
- Password visibility toggles and validation

### ✅ Home Dashboard

- Real-time garden overview with task summaries
- Overdue task notifications with celebratory animations
- Seasonal illustration engine (calm/chaotic states)
- Quick action shortcuts

### ✅ Garden Management

- Multi-garden support with detailed preferences
- Environmental condition tracking (soil, light, space)
- Plant recommendations based on garden conditions
- Plant care task tracking and analytics

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
pnpm start                 # Start Expo development server
pnpm run android           # Run on Android emulator
pnpm run ios               # Run on iOS simulator

# Testing & Quality
pnpm run test              # Run Jest tests
pnpm run lint              # ESLint code checking

# Building
eas build --platform all   # Build for iOS and Android
eas submit                 # Submit to app stores
```

## 🛠️ Troubleshooting

### Common Issues

- **Clerk + Supabase Integration:** Follow the development guidelines below for UUID validation errors
- **Database Connection:** Ensure environment variables are correctly configured
- **Build Issues:** Clear cache with `npx expo start --clear`

### iOS Build Issues

If you encounter Sentry-related build failures when building for iOS:

```bash
# Run the Sentry fix script
./scripts/fix-sentry-build.sh

# Or manually set environment variables
export SENTRY_DISABLE_AUTO_UPLOAD=true
export SENTRY_ALLOW_FAILURE=true
```

This disables Sentry's automatic source map upload during build, which can cause build failures if the Sentry configuration is incomplete.

### Development Guidelines

- **Authentication:** Always use `requesting_user_id()` in RLS policies, never `auth.uid()`
- **User IDs:** Clerk user IDs are TEXT strings, not UUIDs
- **Database Schema:** All `user_id` columns must be `TEXT NOT NULL`

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

- [`ai/rules/`](ai/rules/) - Development guidelines and best practices
- [`components/`](components/) - Component documentation and examples

## 🤝 Contributing

1. Follow the established patterns in the codebase
2. Use the `/help` commands for task management
3. Maintain type safety - no `any` types
4. Test on both iOS and Android
5. Update documentation for significant changes

## 📄 License

Private repository - All rights reserved

---

**🎯 Target Launch: January 27, 2025**  
**📱 Platforms: iOS App Store & Google Play Store**  
**🌍 Initial Markets: United States, Canada**
