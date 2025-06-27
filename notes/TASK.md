# ✅ GreenThumb - App Store Launch Tasks

> **Launch Date:**  
> **Current Status:**  
> **Last Updated:**

---

## 🎯 Launch Overview

**Core App Status:**

### 🧪 TESTING REQUIRED - High Priority

**SUBS-TEST-010**: Payment flow testing  
**Status:** 🔴 **CRITICAL** - Must test before launch  
**Owner:** QA Team  
**Due:** January 18, 2025  
**Test Cases:**

- [ ] **Stripe Test Mode**: Verify test card processing works
- [ ] **Payment Success Flow**: Complete purchase → success screen → subscription active
- [ ] **Payment Failure Flow**: Failed payment → error handling → retry option
- [ ] **Subscription Creation**: Verify database records created correctly
- [ ] **Plan Selection**: Test all pricing tiers (Annual, 6-month, Monthly)
- [ ] **Add-on Purchases**: Test upsell product purchases
- [ ] **Error Handling**: Network failures, invalid cards, expired cards

**SUBS-TEST-011**: Subscription management testing  
**Status:** 🔴 **CRITICAL** - Must test before launch  
**Owner:** QA Team  
**Due:** January 19, 2025  
**Test Cases:**

- [ ] **Subscription Status Display**: Verify correct plan and status shown
- [ ] **Payment History**: Verify transaction records display correctly
- [ ] **Plan Changes**: Test upgrade/downgrade functionality
- [ ] **Cancellation Flow**: Test subscription cancellation
- [ ] **Reactivation Flow**: Test subscription reactivation
- [ ] **Add-on Management**: Test purchasing and managing add-ons

**SUBS-TEST-012**: Business logic testing  
**Status:** 🟡 **HIGH** - Important for accuracy  
**Owner:** Development Team  
**Due:** January 17, 2025  
**Test Cases:**

- [ ] **Price Calculations**: Verify savings calculations are accurate
- [ ] **Plan Recommendations**: Test "Most Popular" and "Best Value" badges
- [ ] **Date Calculations**: Verify subscription period calculations
- [ ] **Status Mapping**: Test Stripe status → internal status mapping
- [ ] **Query Hooks**: Test all React Query hooks with mock data

### 🔧 INTEGRATION WORK REQUIRED

**SUBS-INT-013**: Environment configuration
**Status:** 🟡 **HIGH** - Required for production  
**Owner:** DevOps Team  
**Due:** January 20, 2025  
**Requirements:**

- [ ] **Production Stripe Keys**: Set up production Stripe account
- [ ] **Webhook Configuration**: Configure Stripe webhooks for subscription events
- [ ] **Environment Variables**: Set all required Stripe environment variables
- [ ] **Security Review**: Ensure API keys are properly secured

**SUBS-INT-014**: App navigation integration  
**Status:** 🟡 **HIGH** - User experience  
**Owner:** Development Team  
**Due:** January 18, 2025  
**Requirements:**

- [ ] **Navigation Links**: Add subscription links to main app navigation
- [ ] **Premium Feature Gates**: Implement premium feature restrictions
- [ ] **Subscription Status**: Show subscription status in profile/settings
- [ ] **Upgrade Prompts**: Add upgrade prompts for free users
- [ ] **Onboarding Integration**: Include subscription in user onboarding

### 📊 ANALYTICS & MONITORING SETUP

**SUBS-ANALYTICS-015**: Subscription analytics  
**Status:** 🟡 **MEDIUM** - Important for business insights  
**Owner:** Development Team  
**Due:** January 25, 2025  
**Requirements:**

- [ ] **Conversion Tracking**: Track pricing page → checkout → success
- [ ] **Revenue Metrics**: Track MRR, ARR, churn rate
- [ ] **Plan Performance**: Track which plans convert best
- [ ] **Error Monitoring**: Track payment failures and errors
- [ ] **User Behavior**: Track subscription management actions

**Key Metrics to Track:**

- Conversion Rate: Free users → premium subscribers
- Payment Success Rate: Successful payments / payment attempts
- Churn Rate: Monthly subscription cancellations
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)
- Plan Distribution: Annual vs monthly vs 6-month adoption

### 📋 LEGAL & COMPLIANCE

**SUBS-LEGAL-016**: Legal documentation updates  
**Status:** 🔴 **CRITICAL** - Required for app store approval  
**Owner:** Legal Team  
**Due:** January 21, 2025  
**Requirements:**

- [ ] **Terms of Service**: Update with subscription terms
- [ ] **Privacy Policy**: Update with payment data handling
- [ ] **Refund Policy**: Implement guarantee and refund policies
- [ ] **Auto-renewal Disclosures**: Comply with app store requirements

### 📁 SUBSCRIPTION SYSTEM FILES SUMMARY

**New Files Created:**

- `types/subscription.ts` - TypeScript interfaces for subscription entities
- `lib/stripe.ts` - Stripe configuration and utility functions
- `lib/subscriptionQueries.ts` - React Query hooks for subscription data
- `app/(tabs)/pricing.tsx` - Pricing page with guarantee-based selling
- `app/(tabs)/checkout.tsx` - Stripe payment processing screen
- `app/(tabs)/subscription-success.tsx` - Post-purchase success screen
- `app/(tabs)/subscription.tsx` - Subscription management screen
- `api/create-payment-intent.ts` - Backend API for payment processing
- `supabase/migrations/20250103000000_create_subscriptions.sql` - Database schema

**Modified Files:**

- `package.json` - Added Stripe React Native SDK dependencies
- `.env.example` - Added Stripe environment variables
- `docs/architecture.md` - Updated with subscription system architecture
- `docs/technical.md` - Added comprehensive subscription implementation guide
- `notes/PLANNING.md` - Added subscription system implementation details
- `notes/TASK.md` - Added subscription system tasks and testing requirements

### 🎯 SUBSCRIPTION SYSTEM SUCCESS CRITERIA

**Technical Success:**

- [ ] All payment flows work correctly in test and production
- [ ] Database records are created and updated properly
- [ ] Error handling provides clear user feedback
- [ ] Performance meets mobile app standards (<2s load times)
- [ ] Security standards are met (PCI compliance)

**Business Success:**

- [ ] Conversion rate from free to premium >5%
- [ ] Payment success rate >95%
- [ ] Customer satisfaction with purchase process >4.5/5
- [ ] Monthly churn rate <5%
- [ ] Revenue targets met ($5K MRR in month 1)

**User Experience Success:**

- [ ] Intuitive pricing and plan selection
- [ ] Smooth payment process with minimal friction
- [ ] Clear subscription management interface
- [ ] Helpful error messages and support options
- [ ] Guarantee messaging builds confidence and trust

### 🚀 PRODUCTION READINESS TASKS

**SUBS-PROD-015**: Stripe production setup  
**Status:** 🔴 **CRITICAL** - Required for launch  
**Owner:** Business Team  
**Due:** January 22, 2025  
**Requirements:**

- [ ] **Stripe Account Verification**: Complete business verification
- [ ] **Payment Methods**: Enable credit cards, Apple Pay, Google Pay
- [ ] **Tax Configuration**: Set up tax collection if required
- [ ] **Compliance**: Ensure PCI compliance and data protection

**SUBS-PROD-016**: Legal and compliance  
**Status:** 🔴 **CRITICAL** - Required for launch  
**Owner:** Legal Team  
**Due:** January 21, 2025  
**Requirements:**

- [ ] **Terms of Service**: Update with subscription terms
- [ ] **Privacy Policy**: Update with payment data handling
- [ ] **Refund Policy**: Implement guarantee and refund policies
- [ ] **Auto-renewal Disclosures**: Comply with app store requirements

### 📊 ANALYTICS AND MONITORING

**SUBS-ANALYTICS-017**: Subscription analytics  
**Status:** 🟡 **HIGH** - Business intelligence  
**Owner:** Development Team  
**Due:** January 25, 2025  
**Implementation:**

- [ ] **Conversion Tracking**: Track pricing page → checkout → success
- [ ] **Revenue Metrics**: Track MRR, ARR, churn rate
- [ ] **Plan Performance**: Track which plans convert best
- [ ] **Error Monitoring**: Track payment failures and errors
- [ ] **User Behavior**: Track subscription management actions

---

## 🔧 RECENT FIXES COMPLETED

### ✅ UI-FIX-001: Location Input Autocomplete Issues

**Status:** ✅ **COMPLETED** - January 15, 2025  
**Owner:** Development Team  
**Problem:** Address autocomplete was blocking input field and not dismissing properly on mobile
**Solution:** Replaced problematic address autocomplete with ZIP code input

**Changes Made:**

- Created new `ZipCodeInput` component for NC ZIP code validation
- Validates NC ZIP codes (27xxx or 28xxx format)
- Geocodes ZIP to get coordinates and city/county information
- Updated `NewGardenForm` to use ZIP code instead of full address
- Removed GPS location functions and complex permission handling
- Simplified mobile UX with numeric keyboard and clear validation

**Benefits:**

- Eliminates autocomplete dropdown blocking input field
- Better mobile experience with numeric keyboard
- No complex location permissions required
- Faster input with 5-digit ZIP code vs full address
- Clear validation feedback for users
- Still provides coordinates for weather integration

**Files Modified:**

- `components/UI/ZipCodeInput.tsx` (new)
- `components/Gardens/NewGardenForm.tsx` (updated)
- Removed dependency on `AddressAutocomplete.tsx`

---

## 🔥 CRITICAL - Week of Jan 14-20 (T-7 days)

### 🐛 High Priority Bug Fixes

**TASK-ANIM-001**: Fix useNativeDriver animation warnings  
**Status:** 🔴 **CRITICAL** - Must fix before launch  
**Owner:** Development Team  
**Due:** January 18, 2025  
**Description:** Resolve animation warnings in task completion flows

```typescript
// Problem: Using useNativeDriver with layout properties
// Solution: Separate transform animations from layout changes
```

**Acceptance Criteria:**

- [ ] No console warnings during task completion animations
- [ ] Smooth animation performance on both iOS and Android
- [ ] Task completion celebration animations work flawlessly

**TASK-ANIM-002**: Optimize LayoutAnimation performance  
**Status:** 🟡 **HIGH** - Performance improvement  
**Owner:** Development Team  
**Due:** January 19, 2025  
**Description:** Replace problematic LayoutAnimation calls with explicit animations
**Acceptance Criteria:**

- [ ] Task list updates smoothly without jank
- [ ] No dropped frames during list animations
- [ ] Consistent performance across devices

### 📱 App Store Preparation

**STORE-ASSETS-001**: Create app store screenshots  
**Status:** 🔴 **CRITICAL** - Required for submission  
**Owner:** Design Team  
**Due:** January 17, 2025  
**Required Screenshots:**

- [ ] iPhone 6.7" display (iPhone 15 Pro Max)
- [ ] iPhone 6.1" display (iPhone 15 Pro)
- [ ] iPad Pro (6th gen) 12.9"
- [ ] Android phone screenshots
- [ ] Android tablet screenshots
- [ ] **NEW**: Subscription/pricing screenshots for app store

**STORE-ASSETS-002**: App store descriptions and metadata  
**Status:** 🔴 **CRITICAL** - Required for submission  
**Owner:** Marketing Team  
**Due:** January 18, 2025  
**Deliverables:**

- [ ] App title and subtitle
- [ ] Short description (170 characters)
- [ ] Full description (4000 characters) - **Include subscription features**
- [ ] Keywords for ASO - **Include "plant care subscription", "premium gardening"**
- [ ] App category selection
- [ ] Age rating information
- [ ] **NEW**: In-app purchase descriptions for app stores

**STORE-ASSETS-003**: Legal documents  
**Status:** 🔴 **CRITICAL** - Required for approval  
**Owner:** Legal Team  
**Due:** January 19, 2025  
**Documents:**

- [ ] Privacy Policy - **Updated with payment data handling**
- [ ] Terms of Service - **Updated with subscription terms**
- [ ] Data Usage Agreement
- [ ] Cookie Policy (if applicable)
- [ ] **NEW**: Refund and Cancellation Policy

### 🧪 Beta Testing

**BETA-001**: TestFlight deployment  
**Status:** 🟡 **HIGH** - Quality assurance  
**Owner:** Development Team  
**Due:** January 16, 2025  
**Requirements:**

- [ ] Upload beta build to TestFlight
- [ ] Invite 50 beta testers
- [ ] Create feedback collection system
- [ ] Monitor crash reports and performance
- [ ] **NEW**: Test subscription flows with Stripe test mode

**BETA-002**: Android internal testing  
**Status:** 🟡 **HIGH** - Quality assurance  
**Owner:** Development Team  
**Due:** January 16, 2025  
**Requirements:**

- [ ] Upload to Google Play Console internal testing
- [ ] Test on multiple Android devices
- [ ] **Verify payment processing works** - Critical for subscriptions
- [ ] Test all critical user journeys
- [ ] **NEW**: Test Google Play billing integration

---

## 🔥 DISCOVERED DURING WORK - Critical Issues to Address

### 🎯 USER INTERVIEW FINDINGS (January 14, 2025)

**Source:** User interview feedback session  
**Participants:** Beta testers and target users  
**Priority:** Critical bugs and UX improvements for launch

#### 🔴 CRITICAL BUGS - Must Fix Before Launch

**INTERVIEW-CRIT-001**: Database page not scrollable  
**Status:** ✅ **COMPLETE** - January 15, 2025  
**Owner:** Development Team  
**Completed:** January 15, 2025  
**User Impact:** "I can't scroll through the plant database to see more plants"  
**Description:** Users cannot scroll through plant database results, severely limiting plant discovery  
**Acceptance Criteria:**

- [x] Database page allows full scrolling functionality
- [x] All plants are accessible through scrolling
- [x] Smooth scrolling performance on all devices

**INTERVIEW-CRIT-002**: Database filters non-functional  
**Status:** ✅ **COMPLETE** - January 15, 2025  
**Owner:** Development Team  
**Completed:** January 15, 2025  
**User Impact:** "The filter buttons don't work and the filter page doesn't load"  
**Description:** Filter functionality completely broken, preventing users from finding specific plants  
**Acceptance Criteria:**

- [x] Filter buttons open modal without errors
- [x] All filter options function correctly
- [x] Filter page loads and displays properly

**INTERVIEW-CRIT-003**: Garden setup completion mismatch  
**Status:** 🔴 **CRITICAL** - Data integrity issue  
**Owner:** Development Team  
**Due:** January 17, 2025  
**User Impact:** "My garden shows incomplete even after I set it up completely"  
**Description:** Garden setup shows incomplete (not 100%) when editing conditions after creation  
**Root Cause:** Mismatch between garden creation flow and edit flow data structures  
**Acceptance Criteria:**

- [ ] Garden completion status accurately reflects setup state
- [ ] Edit flow maintains completion percentage
- [ ] Data consistency between creation and edit flows

#### 🟡 HIGH PRIORITY UX ISSUES - Fix Before Launch

**INTERVIEW-HIGH-004**: Typography inconsistency in quick actions  
**Status:** 🟡 **HIGH** - Brand consistency issue  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "The font in quick actions doesn't match the rest of the app"  
**Description:** Quick actions font doesn't match brand guidelines (should use Mali/Nunito system)  
**Reference:** See `docs/fonts.md` and `notes/BRAND_IDENTITY.md`  
**Acceptance Criteria:**

- [ ] Quick actions use correct brand fonts
- [ ] Typography consistency across all UI elements
- [ ] Font weights and sizes match design system

**INTERVIEW-HIGH-005**: Garden setup UI bottom stack transparency  
**Status:** 🟡 **HIGH** - Visual bug  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "The bottom part looks transparent during garden setup"  
**Description:** Bottom stack doesn't extend fully to screen bottom during garden condition selection  
**Acceptance Criteria:**

- [ ] Bottom stack extends to screen edge
- [ ] No transparency issues in garden setup flow
- [ ] Consistent background across all setup screens

**INTERVIEW-HIGH-006**: Selection logic allows invalid combinations  
**Status:** 🟡 **HIGH** - Logic error  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "I can select 'none' plus other options which doesn't make sense"  
**Description:** Users can select "none" plus other options simultaneously in garden setup  
**Acceptance Criteria:**

- [ ] "None" option is mutually exclusive with other selections
- [ ] Clear visual feedback for invalid selections
- [ ] Proper validation before allowing progression

**INTERVIEW-HIGH-007**: Single selection questions allow multiple choices  
**Status:** 🟡 **HIGH** - Logic error  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "I should only be able to pick one space size and one region since I'm setting up one garden"  
**Description:** Available space and NC region questions should only allow single selection  
**Acceptance Criteria:**

- [ ] Available space allows only one selection
- [ ] NC region allows only one selection
- [ ] UI clearly indicates single vs multiple selection questions

**INTERVIEW-HIGH-008**: Long garden names break layout  
**Status:** 🟡 **HIGH** - Layout bug  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "When I add plants with long names, the Next button disappears off screen"  
**Description:** Long garden names push "Next" button off screen during plant addition flow  
**Acceptance Criteria:**

- [ ] Garden names truncate appropriately
- [ ] Next button always remains accessible
- [ ] Responsive layout handles long text gracefully

**INTERVIEW-HIGH-009**: Garden card name truncation missing  
**Status:** 🟡 **HIGH** - Text display issue  
**Owner:** Development Team  
**Due:** January 18, 2025  
**User Impact:** "Garden names get cut off in weird ways on the cards"  
**Description:** Garden card names need proper truncation (1 line for small cards, 2 lines for large cards)  
**Acceptance Criteria:**

- [ ] Small garden cards: 1 line with ellipsis
- [ ] Large garden cards: 2 lines with ellipsis
- [ ] Consistent truncation behavior across card types

**INTERVIEW-HIGH-010**: Inconsistent scrolling in garden setup  
**Status:** 🟡 **HIGH** - UX consistency  
**Owner:** Development Team  
**Due:** January 19, 2025  
**User Impact:** "Some screens scroll smoothly, others feel jerky or don't scroll at all"  
**Description:** Garden setup has inconsistent scrolling behavior across different screens  
**Acceptance Criteria:**

- [ ] Consistent scrolling behavior across all setup screens
- [ ] Smooth scroll performance on all devices
- [ ] Proper scroll indicators where needed

#### 🟢 ENHANCEMENT SUGGESTIONS - Post-Launch Consideration

**INTERVIEW-ENHANCE-011**: Improve selection organization  
**Status:** 🟢 **ENHANCEMENT** - UX improvement  
**Owner:** Product Team  
**Due:** Post-launch (February 2025)  
**User Suggestion:** "Options should be organized better - alphabetical or logical like coastal→piedmont→mountains"  
**Description:** Selection options need better organization for improved usability  
**Implementation Ideas:**

- [ ] Alphabetical sorting for plant lists
- [ ] Logical geographic ordering (coastal→piedmont→mountains)
- [ ] Category grouping for better navigation

**INTERVIEW-ENHANCE-012**: Soil pyramid visualization  
**Status:** 🟢 **ENHANCEMENT** - UI improvement  
**Owner:** Design Team  
**Due:** Post-launch (February 2025)  
**User Suggestion:** "Use a soil pyramid visualization for soil type selection"  
**Description:** Replace current soil type selection with visual pyramid interface  
**Implementation Ideas:**

- [ ] Interactive soil pyramid component
- [ ] Visual representation of soil composition
- [ ] Educational tooltips for soil types

**INTERVIEW-ENHANCE-013**: Icon improvement in info modals  
**Status:** 🟢 **ENHANCEMENT** - Visual improvement  
**Owner:** Design Team  
**Due:** Post-launch (February 2025)  
**User Suggestion:** "Replace question marks with exclamation points in info modal circles"  
**Description:** Info modal icons should use exclamation points instead of question marks  
**Implementation Ideas:**

- [ ] Update icon library usage
- [ ] Consistent info icon treatment
- [ ] Better visual hierarchy in modals

**INTERVIEW-ENHANCE-014**: Smart plant recommendations  
**Status:** 🟢 **ENHANCEMENT** - Feature addition  
**Owner:** Product Team  
**Due:** Post-launch (March 2025)  
**User Suggestion:** "Suggest plants based on my garden conditions"  
**Description:** Implement intelligent plant recommendations based on created garden inputs  
**Implementation Ideas:**

- [ ] Algorithm for matching plants to garden conditions
- [ ] Recommendation engine integration
- [ ] Personalized plant suggestions

**INTERVIEW-ENHANCE-015**: Database content cleanup  
**Status:** 🟢 **ENHANCEMENT** - Content curation  
**Owner:** Content Team  
**Due:** Post-launch (February 2025)  
**User Suggestion:** "Remove weeds from plantable options since users wouldn't intentionally plant weeds"  
**Description:** Clean up plant database to remove inappropriate plant types  
**Implementation Ideas:**

- [ ] Audit plant database for inappropriate entries
- [ ] Create plant category filters
- [ ] Separate beneficial vs problematic plants

### 🐛 User Interface & Experience Issues

**UI-SCROLL-001**: Database view not scrollable  
**Status:** 🔴 **CRITICAL** - Core functionality broken  
**Owner:** Development Team  
**Due:** January 16, 2025  
**Description:** The plant database page opens but users cannot scroll down to see more plants  
**Root Cause:** PageContainer with `scroll={false}` and SearchResults component not properly handling scrollable content  
**Acceptance Criteria:**

- [ ] Users can scroll through plant database results
- [ ] Pagination works correctly with scrolling
- [ ] Smooth scrolling performance on both iOS and Android

**UI-FILTER-002**: Database filters cause errors when clicked  
**Status:** ✅ **COMPLETE** - January 15, 2025  
**Owner:** Development Team  
**Completed:** January 15, 2025  
**Description:** Clicking on filter button in database view throws errors and prevents filter application  
**Root Cause:** FilterModal component has routing or state management issues  
**Acceptance Criteria:**

- [x] Filter button opens modal without errors
- [x] Users can select and apply filters successfully
- [x] Filter state persists correctly across navigation

**UI-TEXT-003**: Sign in/up pages have black text on green background  
**Status:** ✅ **COMPLETE** - January 15, 2025  
**Owner:** Development Team  
**Completed:** January 15, 2025  
**Description:** Phone and email input fields have poor contrast with black text on green background  
**Root Cause:** AuthInput component using `text-foreground` class which resolves to dark text  
**Acceptance Criteria:**

- [x] Input text is light colored and readable on green background
- [x] Placeholder text has appropriate contrast
- [x] Icon colors are adjusted for visibility

**UI-TEXT-004**: Database buttons have black text on green background  
**Status:** ✅ **COMPLETE** - January 15, 2025  
**Owner:** Development Team  
**Completed:** January 15, 2025  
**Description:** Filter and other database buttons have poor contrast  
**Root Cause:** Button components using dark text classes on primary background  
**Acceptance Criteria:**

- [x] Button text is light colored and readable
- [x] Consistent button styling across database views
- [x] Proper contrast ratios for accessibility

**UI-PROFILE-005**: Profile page needs complete redesign  
**Status:** 🟡 **HIGH** - User experience improvement  
**Owner:** Development Team  
**Due:** January 19, 2025  
**Description:** Current profile page is basic and doesn't match app design standards  
**Requirements:**

- [ ] Modern, cohesive design matching app theme
- [ ] Better organization of user information and settings
- [ ] Improved navigation and user actions
- [ ] Integration with user statistics and achievements
- [ ] **NEW**: Subscription status and management links

**UI-TOGGLE-006**: Scientific/common name button colors need adjustment  
**Status:** 🟡 **HIGH** - Visual consistency  
**Owner:** Development Team  
**Due:** January 17, 2025  
**Description:** Name toggle buttons don't follow consistent color scheme  
**Root Cause:** NameToggle component using inconsistent color classes  
**Acceptance Criteria:**

- [ ] Toggle buttons use consistent brand colors
- [ ] Clear visual indication of active/inactive states
- [ ] Proper contrast for accessibility

### 🌤️ Feature Enhancement Issues

**FEAT-WEATHER-007**: Weather API integration needs prominence  
**Status:** 🟡 **HIGH** - Feature enhancement  
**Owner:** Development Team  
**Due:** January 20, 2025  
**Description:** Weather integration should be more prominent and dynamic task adjustment needs implementation  
**Requirements:**

- [ ] Weather information prominently displayed on dashboard
- [ ] Tasks automatically adjust based on weather conditions
- [ ] Weather-based notifications and recommendations
- [ ] Visual weather indicators throughout the app

**FEAT-WEATHER-008**: Weather API integration in home header  
**Status:** 🟡 **HIGH** - User experience enhancement  
**Owner:** Development Team  
**Due:** January 19, 2025  
**Description:** Integrate weather API data into the home page header for better user experience  
**Requirements:**

- [ ] Display current weather conditions in HomeHeader component
- [ ] Show temperature, weather description, and weather icon
- [ ] Use garden location coordinates for accurate weather data
- [ ] Handle loading states and error cases gracefully
- [ ] Update weather data periodically (every 30 minutes)
- [ ] Ensure weather display doesn't interfere with existing header layout
- [ ] Add weather-based greeting variations (e.g., "Good morning, it's 72°F and sunny")

**Implementation Details:**

- Use existing `getWeatherAndSeason()` function from `lib/services/weather.ts`
- Modify `HomeHeader` component to accept and display weather data
- Add weather state management in `app/(tabs)/index.tsx`
- Consider using React Query for weather data caching and updates
- Ensure weather data is fetched based on user's primary garden location

**Acceptance Criteria:**

- [ ] Weather information displays correctly in header
- [ ] Weather updates automatically without manual refresh
- [ ] Graceful fallback when weather API is unavailable
- [ ] No performance impact on app loading
- [ ] Weather data is accurate for user's garden location

**FEAT-CALENDAR-008**: Calendar needs upcoming/overdue task panel  
**Status:** 🟡 **HIGH** - User experience improvement  
**Owner:** Development Team  
**Due:** January 19, 2025  
**Description:** Users should see upcoming and overdue tasks without navigating to specific days  
**Requirements:**

- [ ] Bottom panel or sidebar showing upcoming tasks
- [ ] Overdue tasks prominently highlighted
- [ ] Quick task completion from overview panel
- [ ] Smooth animations for panel interactions

### ⚡ Performance & Technical Issues

**PERF-CACHE-009**: Database caching needs improvement  
**Status:** 🟡 **HIGH** - Performance optimization  
**Owner:** Development Team  
**Due:** January 18, 2025  
**Description:** Plant database should implement better caching for improved performance  
**Requirements:**

- [ ] Implement proper image caching for plant photos
- [ ] Cache search results and filter combinations
- [ ] Optimize database queries and pagination
- [ ] Reduce loading times for frequently accessed data

---

## 🚧 IMPORTANT - Week of Jan 21-26 (Launch week)

### 🚀 Final Preparations

**LAUNCH-001**: Production app builds  
**Status:** ⚪ **PENDING** - Depends on bug fixes  
**Owner:** Development Team  
**Due:** January 22, 2025  
**Tasks:**

- [ ] Create production iOS build with EAS
- [ ] Create production Android build with EAS
- [ ] Verify all environment variables are set
- [ ] **NEW**: Verify Stripe production keys are configured
- [ ] Test builds on physical devices
- [ ] **NEW**: Test subscription flows in production builds

**LAUNCH-002**: App store submissions  
**Status:** ⚪ **PENDING** - Final step  
**Owner:** Development Team  
**Due:** January 24, 2025  
**Steps:**

- [ ] Submit to Apple App Store for review
- [ ] Submit to Google Play Store for review
- [ ] **NEW**: Configure in-app purchases in both stores
- [ ] Monitor review status daily
- [ ] Respond to any review feedback immediately

**LAUNCH-003**: Marketing preparation  
**Status:** 🟡 **HIGH** - Growth strategy  
**Owner:** Marketing Team  
**Due:** January 25, 2025  
**Deliverables:**

- [ ] Press release draft
- [ ] Social media campaign assets
- [ ] Product Hunt submission materials
- [ ] Influencer outreach list
- [ ] Launch day communication plan
- [ ] **NEW**: Subscription pricing announcement materials

### 📊 Monitoring & Analytics

**MONITOR-001**: Error tracking setup  
**Status:** 🟡 **HIGH** - Post-launch support  
**Owner:** Development Team  
**Due:** January 26, 2025  
**Implementation:**

- [ ] Integrate Sentry for crash reporting
- [ ] Set up custom analytics events
- [ ] Create performance monitoring dashboard
- [ ] Configure alert thresholds
- [ ] **NEW**: Set up subscription analytics tracking
- [ ] **NEW**: Configure payment failure alerts

---

## 📈 POST-LAUNCH ROADMAP (Feb-Mar 2025)

### 🔄 Version 1.1 Features (February)

- [ ] **WEATHER-INTEGRATION**: Automatic weather-based task adjustments
- [ ] **PUSH-NOTIFICATIONS**: Task reminders and plant care alerts
- [ ] **SOCIAL-FEATURES**: Plant care tips sharing between users
- [ ] **PERFORMANCE-OPTIMIZATION**: Memory usage and startup time improvements
- [ ] **ADVANCED-ANALYTICS**: Detailed plant health insights and trends
- [ ] **SUBSCRIPTION-ANALYTICS**: Revenue tracking and churn analysis

### 🌟 Version 1.2 Features (March)

- [ ] **PLANT-IDENTIFICATION**: Camera-based plant recognition
- [ ] **PREMIUM-FEATURES**: Advanced features locked behind subscription
- [ ] **EXPERT-CONSULTATIONS**: Video calls with horticulturists (premium add-on)
- [ ] **MARKETPLACE-INTEGRATION**: Plant purchasing recommendations
- [ ] **FAMILY-SHARING**: Multi-user garden management
- [ ] **SUBSCRIPTION-TIERS**: Multiple subscription levels with different features

### 🚀 Future Considerations (Q2 2025)

- [ ] **AR-FEATURES**: Augmented reality plant care guidance
- [ ] **IOT-INTEGRATION**: Smart sensor connectivity
- [ ] **WEB-VERSION**: Browser-based garden management
- [ ] **ENTERPRISE-FEATURES**: Commercial greenhouse management
- [ ] **INTERNATIONAL-EXPANSION**: Localization for EU markets
- [ ] **B2B-SUBSCRIPTIONS**: Business plans for nurseries and professionals

### 🌱 Future Task System Improvements

- [ ] **SOIL-PH-AUTOMATION**: Implement `soil_ph_ids` field for auto-scheduling lime/sulfur tasks (Optional enhancement - only if implementing automatic soil pH adjustment task scheduling)

---

### 🎯 USER INTERVIEW FINDINGS (January 26, 2025)

**Source:** User interview feedback session  
**Participants:** Target users  
**Priority:** Critical and high-priority UX improvements for launch

#### 🔴 CRITICAL BUGS & BLOCKERS

**INTERVIEW-CRIT-016**: Garden creation form is too complex  
**Status:** ✅ **COMPLETED** (January 26, 2025)  
**Owner:** Product/Design/Development Team  
**User Impact:** "The garden creation form asks too many questions. I just want to get started quickly."  
**Description:** The current garden creation flow is overwhelming. Users should only be asked essential questions up front, with advanced customization available later.  
**Acceptance Criteria:**

- [x] New garden creation form asks only essential questions
- [x] Advanced options are accessible after initial creation
- [x] User can create a garden in under 1 minute
- [x] No required fields that are not strictly necessary

**Solution Implemented:**

- Replaced complex 4-step wizard with streamlined single-step form
- Only asks for essential fields that drive core functionality:
  - Garden Name (required)
  - Location with GPS support (for weather updates)
  - USDA Hardiness Zone (for frost warnings, seasonal schedules)
  - Sunlight Exposure (affects watering cadence, plant recommendations)
  - Soil Type (drives irrigation timing, soil amendments)
  - Available Space (influences plant-specific tasks)
  - Garden Theme (optional for plant recommendations)
- Added location services with "Use Current Location" button
- Clear messaging about advanced options being available later
- Reduced completion time from 5+ minutes to under 1 minute
- All advanced fields accessible via garden detail page after creation

**INTERVIEW-CRIT-017**: Plant database is overwhelming  
**Status:** 🔴 **CRITICAL**  
**Owner:** Product/Content/Development Team  
**User Impact:** "There are way too many plants in the database. It's scary to see 4500+ plants!"  
**Description:** The plant database needs to be trimmed or filtered for each user. The current experience is overwhelming and not actionable.  
**Acceptance Criteria:**

- [ ] Users see a manageable, relevant subset of plants by default
- [ ] There is a clear plan for how to filter or recommend plants per user
- [ ] Database is not overwhelming on first open

#### 🟡 HIGH PRIORITY UX ISSUES

**INTERVIEW-HIGH-016**: Plant page navigation is confusing  
**Status:** 🟡 **HIGH**  
**Owner:** Design/Development Team  
**User Impact:** "The navigation tabs (overview, care, features, taxonomy, problems) are confusing above the app navigation."  
**Description:** Move plant page section navigation below the 'Add to Garden' button for clarity.  
**Acceptance Criteria:**

- [ ] Section navigation is below the 'Add to Garden' button
- [ ] No confusion between app navigation and plant page navigation

**INTERVIEW-HIGH-017**: Add to Garden button is too small  
**Status:** 🟡 **HIGH**  
**Owner:** Design/Development Team  
**User Impact:** "The 'Add to Garden' button should be thicker and more prominent."  
**Description:** Increase the height and visual prominence of the 'Add to Garden' button on plant pages.  
**Acceptance Criteria:**

- [ ] Button height increased for better tap target
- [ ] Button stands out visually

**INTERVIEW-HIGH-018**: WelcomeSubscriptionBanner modal is too aggressive  
**Status:** 🟡 **HIGH**  
**Owner:** Development Team  
**User Impact:** "The subscription banner pops up every time I go to the home page. That's annoying."  
**Description:** The WelcomeSubscriptionBanner should not show every time the user navigates home.  
**Acceptance Criteria:**

- [ ] Banner only shows once or at appropriate intervals
- [ ] No repeated popups on every home navigation

**INTERVIEW-HIGH-019**: Profile page lacks value  
**Status:** 🟡 **HIGH**  
**Owner:** Product/Design Team  
**User Impact:** "The profile page is kind of useless right now."  
**Description:** The profile page should provide more value, such as stats, achievements, or useful actions.  
**Acceptance Criteria:**

- [ ] Profile page has meaningful content and actions
- [ ] Users find value in visiting their profile

**INTERVIEW-HIGH-020**: No plant recommendations after garden creation  
**Status:** 🟡 **HIGH**  
**Owner:** Product/Development Team  
**User Impact:** "After I create my garden, I want to see recommended plants for it."  
**Description:** After garden creation, show recommended plants based on garden data.  
**Acceptance Criteria:**

- [ ] Recommended plants are shown after garden creation
- [ ] Recommendations are relevant to the user's garden

**INTERVIEW-HIGH-021**: App needs better descriptions and explanations  
**Status:** 🟡 **HIGH**  
**Owner:** Product/Content/Design Team  
**User Impact:** "I need better descriptions of how the app works. It's not always intuitive."  
**Description:** Add more helpful descriptions and explanations throughout the app to improve intuitiveness.  
**Acceptance Criteria:**

- [ ] Key flows have clear, concise explanations
- [ ] Users understand how to use the app without confusion

**INTERVIEW-HIGH-022**: Sign in/up page is confusing about password  
**Status:** 🟡 **HIGH**  
**Owner:** Design/Development Team  
**User Impact:** "I thought I couldn't use the sign in/up page because it asked for a password, but I don't have one yet."  
**Description:** Clarify on the sign in/up page that a password is not required if the user is signing up for the first time.  
**Acceptance Criteria:**

- [ ] Sign in/up page clearly explains password requirements
- [ ] No user confusion about needing a password to sign up
