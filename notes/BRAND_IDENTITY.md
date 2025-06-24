# 🎨 GreenThumb - Brand Identity & Design Guidelines

**⚡ UPDATED FOR CODEBASE CONSISTENCY** _(January 2025)_

This document has been updated to reflect the actual implementation in the GreenThumb React Native app. All colors, typography, and technical specifications now match the codebase in `/app`, `/components`, and `tailwind.config.js`.

**Key Updates Made**:

- ✅ Color palette now matches `tailwind.config.js` exactly
- ✅ Typography reflects actual font implementation (Mali + Nunito)
- ✅ File structure matches actual `/app` and `/components` directories
- ✅ Technical specs updated for React Native/Expo/NativeWind stack
- ✅ Logo section reflects current placeholder asset status
- ✅ Implementation examples include actual CSS classes used

## 🌱 Brand Overview

### Mission Statement

Empowering plant enthusiasts to cultivate thriving gardens through intelligent, personalized plant care management that transforms uncertainty into confidence and growth.

### Brand Positioning

GreenThumb is the intelligent plant care companion that bridges the gap between plant care anxiety and gardening success. We combine cutting-edge AI technology with nurturing guidance to help every plant parent—from nervous beginners to scaling gardeners—achieve their green-thumb dreams.

### Brand Personality

- **Nurturing**: Like a wise, patient gardening mentor who celebrates every small victory
- **Intelligent**: Data-driven and scientific, but accessible and never intimidating
- **Optimistic**: Focuses on growth, progress, and the joy of successful plant care
- **Authentic**: Honest about challenges while maintaining an encouraging outlook
- **Empowering**: Builds confidence through knowledge and successful outcomes

### Core Values

1. **Growth-Oriented**: Every interaction should foster learning and improvement
2. **Accessible Intelligence**: Advanced technology made simple and approachable
3. **Celebration of Progress**: Acknowledge and celebrate every plant care success
4. **Community Connection**: Foster relationships between gardeners of all levels
5. **Sustainable Success**: Long-term plant health over quick fixes

---

## 🎨 Visual Identity

### GreenThumb Pastel-Gouache Style Guide

#### Core Aesthetic Philosophy

Picture the cozy pages of a well‑loved children's book: everything is painted in soft gouache and watery‑light watercolor on textured paper, so the colors feel sun‑aged and nostalgic—never harsh, never neon. Each scene is washed in a single seasonal hue (buttery spring yellows, honey‑amber autumns, slate‑blue winters) that glows gently around rounded, outline‑less shapes. You see visible paper grain and a few speckles of "pollen dust," as if the image itself has been living in someone's garden journal. The mood is always warm, calm, and a little whimsical—friendly enough that a five‑year‑old would feel at home, yet sophisticated enough for adults to feel a tug of nostalgia. That's the GreenThumb Pastel‑Gouache vibe we want every new illustration to breathe.

#### Technical Specifications

**App Platform & Framework**:

- **Platform**: React Native with Expo SDK 52
- **Styling System**: NativeWind (Tailwind CSS for React Native)
- **Design Resolution**: Responsive design for all screen sizes
- **Color Implementation**: Tailwind CSS color classes

**Design Token Structure (Actual Implementation)**:

```css
// Brand colors (from tailwind.config.js)
brand: {
  600: "#5E994B",    // Primary brand color - main buttons, links
  700: "#4A7A3B",    // Hover states, darker accents
  500: "#77B860",    // Regular accent, secondary actions
  100: "#D6E8CC",    // Light backgrounds, borders
  50: "#ECF4E7",     // Very light backgrounds
}

cream: {
  50: "#fffefa",     // Primary background (bg-background)
  800: "#2e2c29",    // Primary text (text-foreground)
  300: "#ded8ca",    // Standard borders
  200: "#fff8e8",    // Light borders
}

accent: {
  200: "#ffd900",    // Badge backgrounds, warnings
  800: "#483b00",    // High contrast text on badges
}

// Typography classes (from app/fonts.css)
.font-title          // Mali Regular (400) - headers
.font-title-bold     // Mali Bold (700) - main headlines
.font-paragraph      // Nunito Regular (400) - body text
.font-paragraph-semibold // Nunito SemiBold (600) - buttons, emphasis
```

**Asset Requirements**:

- **App Icons**: iOS (multiple sizes), Android (adaptive icon)
- **Splash Screen**: Centered logo on white background
- **Illustrations**: Seasonal artwork following gouache style guide
- **Component Icons**: Ionicons library + custom additions

**Illustration Technical Specs** (for external assets):

- **Canvas Texture**: Cold‑press paper grain
- **Working Resolution**: 300 DPI minimum
- **Base Resolution**: 4096×2730 minimum
- **Layering Structure**:
  - Watery wash layer (Multiply, 100%)
  - Gouache detail layer (Normal, 100%)
  - Paper grain overlay (Multiply, 35%)
  - Speckle dust layer (Screen, 5‑8%)

**Seasonal Color Palette** (Aligned with Brand Colors):

- **Spring Wash**: #F7FAF5 (brand-25 - extremely light background)
- **Summer Wash**: #ECF4E7 (brand-50 - light background)
- **Autumn Wash**: #ffe264 (accent-100 - light amber)
- **Winter Wash**: #D6E8CC (brand-100 - light green border)

**Accent Colors** (From Brand Palette):

- **Brand Green**: #5E994B (brand-600 - primary)
- **Garden Green**: #77B860 (brand-500 - regular accent)
- **Earth Brown**: #484540 (cream-700 - dark text)
- **Shadow Neutral**: #636059 (cream-600 - medium-dark text)

**Core Principles**:

1. Soft gouache + watercolor look on lightly‑toothed cold‑press paper
2. Single season‑tinted wash; very low global contrast; gentle highlight bloom
3. Muted pastel palette (never pure white or jet black)
4. Rounded silhouettes with no hard outlines; edges feather into background
5. Visible paper grain (≈35% overlay) and subtle pigment speckles (≈5%)
6. Cozy, gentle, memory‑like mood suitable for a five‑year‑old audience

#### Character Design Guidelines

**Proportions**:

- Head-to-body ratio: 0.25 (child-friendly proportions)
- Eye shape: Bean or dot; no pupils unless needed
- Mouth shape: Small curved line or wedge
- Animal rules: Anatomically plausible with light anthropomorphism

#### Composition Rules

**Layout**:

- Rule of thirds composition
- Natural vignette framing (branches, snow flurries, fences)
- Three distinct depth planes
- Foreground blur: 10%
- Background saturation drop: 35%

**Lighting**:

- Dominant wash usage: Scene‑wide color grade; shadows inherit wash hue
- Highlight handling: Soft bloom, no pure white
- Contrast level: Low throughout

#### AI Generation Blueprint

**Positive Prompt Template**:
"A [subject] in the GreenThumb Pastel‑Gouache style: soft gouache + watercolor on textured cold‑press paper, nostalgic pastel palette dominated by [season wash color], diffused back‑lighting with gentle bloom, rounded forms, no hard outlines, visible brush granulation and paper grain overlay, whimsical child‑friendly proportions, cozy and serene mood, low contrast, vignette composition, subtle pigment speckles"

**Negative Prompt**:
"vector, neon, photorealism, comic ink, hard edges, modern plastic props"

#### Quality Checklist

- [ ] Reads instantly as gouache‑watercolor painting
- [ ] Muted, sun‑aged palette with zero pure white/black
- [ ] Rounded, feathered edges with no crisp outlines
- [ ] Visible paper grain and light speckles present
- [ ] Overall mood feels cozy, nostalgic, low‑contrast
- [ ] Suitable for a five‑year‑old audience

### Logo & Brand Assets

#### Current Implementation Status

**App Icon**:

- Located in iOS splash screen assets (`ios/GreenThumb/Images.xcassets/SplashScreenLogo.imageset/`)
- Referenced in Android launcher (`android/app/src/main/res/drawable/`)
- Current implementation uses placeholder/temporary assets

**Splash Screen**:

- Background color: White (#ffffff)
- Logo centered on screen with 200x200px dimensions
- Simple, clean presentation during app launch

#### Proposed Logo Concepts

#### Primary Logo: "The Growing Leaf"

**Concept**: A stylized leaf with subtle growth rings or AI-inspired geometric patterns
**Symbolism**:

- Organic growth and natural beauty
- Technology integration (geometric elements)
- Progress and development (growth rings)
- Life and vitality (using brand green #5E994B)

**Usage**: App icon, primary brand mark, marketing materials
**Variations**: Full color, monochrome, white/reversed, simplified icon

#### Secondary Mark: "GT Monogram"

**Concept**: Elegant "GT" letterform with leaf accent
**Usage**: Favicon, social media profile images, compact applications
**Style**: Clean, modern typography with organic flourish

#### Implementation Requirements

**Technical Specifications**:

- App Icon: 1024x1024px master file
- iOS: Multiple sizes from 20x20 to 1024x1024
- Android: 48dp to 512dp adaptive icon
- File formats: PNG for raster, SVG for vector

**Asset Locations**:

```
ios/GreenThumb/Images.xcassets/
├── AppIcon.appiconset/        # App icons
├── SplashScreenLogo.imageset/ # Splash screen logo
└── SplashScreenBackground.colorset/ # Splash background

android/app/src/main/res/
├── drawable/                  # Logo assets
├── mipmap-*/                 # App icons (various densities)
└── values/colors.xml         # Brand colors
```

#### Icon System: "Plant Care Symbols"

**Elements**: Watering can, sun, calendar, growth chart, community
**Style**: Consistent line weight, rounded corners, friendly appearance
**Usage**: App navigation, feature illustrations, marketing graphics
**Implementation**: Ionicons library with custom additions as needed

### Color Palette

#### Primary Colors - Brand Green Scale

Based on the actual implementation in `tailwind.config.js` and component usage:

- **Brand 600**: #5E994B (Primary brand color)

  - _Usage_: Primary buttons, active states, success states, main CTAs
  - _Psychology_: Growth, nature, success, harmony
  - _Accessibility_: WCAG AA compliant with white text
  - _Implementation_: `bg-brand-600`, `text-brand-600`, `border-brand-600`
  - _Component Usage_: AuthButton, SubmitButton primary variant

- **Brand 500**: #77B860 (Regular accent)

  - _Usage_: Secondary actions, plant health indicators, positive states
  - _Psychology_: Growth, vitality, natural progression
  - _Implementation_: `bg-brand-500`, `text-brand-500`
  - _Component Usage_: Progress bars, health indicators

- **Brand 700**: #4A7A3B (Hover state)

  - _Usage_: Button hover states, darker accents, pressed states
  - _Implementation_: `hover:bg-brand-700`, `text-brand-700`
  - _Component Usage_: Interactive button states

- **Brand 100**: #D6E8CC (Light backgrounds)
  - _Usage_: Light accent backgrounds, subtle highlights
  - _Implementation_: `bg-brand-100`, `border-brand-100`
  - _Component Usage_: Completed task backgrounds, success states

#### Brand Color Scale (Complete Palette)

```css
brand: {
  25: "#F7FAF5",  // Extremely light background
  50: "#ECF4E7",  // Light background
  100: "#D6E8CC", // Light border
  200: "#BDDDB1", // Border
  300: "#A5D196", // Light accent
  400: "#8EC57B", // Medium accent
  500: "#77B860", // Regular accent
  600: "#5E994B", // Primary brand color ⭐
  700: "#4A7A3B", // Hover state
  800: "#355A2B", // Dark accent
  900: "#233C1B", // Very dark
  950: "#162814", // Ultra dark
}
```

#### Neutral Colors - Cream Scale

- **Cream 50**: #fffefa (Background color)

  - _Usage_: Primary app background
  - _Implementation_: `bg-cream-50`, `bg-background`

- **Cream 800**: #2e2c29 (Foreground text)

  - _Usage_: Primary text color
  - _Implementation_: `text-cream-800`, `text-foreground`

- **Cream 200**: #fff8e8 (Light borders)

  - _Usage_: Subtle borders and dividers
  - _Implementation_: `border-cream-200`

- **Cream 300**: #ded8ca (Border color)
  - _Usage_: Standard borders
  - _Implementation_: `border-cream-300`

#### Cream Color Scale (Complete Palette)

```css
cream: {
  50: "#fffefa",  // Background color ⭐
  100: "#fffaef", // Subtle background variation
  200: "#fff8e8", // Light borders
  300: "#ded8ca", // Border color
  400: "#9e9a90", // Light text (poor contrast)
  500: "#807c74", // Medium text (use sparingly)
  600: "#636059", // Medium-dark text
  700: "#484540", // Dark text with good contrast
  800: "#2e2c29", // Foreground text ⭐
  900: "#030303", // Ultra dark
}
```

#### Accent Colors - Yellow Scale

- **Accent 200**: #ffd900 (Badge background)

  - _Usage_: Warning badges, highlights
  - _Implementation_: `bg-accent-200`

- **Accent 800**: #483b00 (Dark amber text)
  - _Usage_: Text on light backgrounds with good contrast
  - _Implementation_: `text-accent-800`

#### Accent Color Scale (Complete Palette)

```css
accent: {
  50: "#ffea92",  // Very light background
  100: "#ffe264", // Light accent
  200: "#ffd900", // Badge background ⭐
  300: "#debc00", // Border
  400: "#bea100", // Medium accent
  500: "#9e8600", // Medium accent
  600: "#806c00", // Medium-dark accent
  700: "#635300", // Dark accent
  800: "#483b00", // Dark amber text ⭐
  900: "#161100", // Very dark
}
```

#### Semantic Colors

- **Background**: #fffefa (Cream 50)
- **Foreground**: #2e2c29 (Cream 800)
- **Primary**: #5E994B (Brand 600)
- **Primary Foreground**: #fffefa (Cream 50)
- **Destructive**: #E50000 (Red)
- **Destructive Foreground**: #fffefa (Cream 50)

### Typography

#### Implementation in App

**Font Configuration** (from `tailwind.config.js`):

```css
fontFamily: {
  title: ["Mali_400Regular", "Mali_700Bold", "serif"],
  paragraph: ["Nunito_400Regular", "Nunito_600SemiBold", "sans-serif"],
}
```

**CSS Classes** (from `app/fonts.css`):

```css
.font-title          // Mali Regular (400)
.font-title-medium   // Mali Medium (500) 
.font-title-semibold // Mali SemiBold (600)
.font-title-bold     // Mali Bold (700)

.font-paragraph         // Nunito Regular (400)
.font-paragraph-medium  // Nunito Medium (500)
.font-paragraph-semibold // Nunito SemiBold (600)
.font-paragraph-bold    // Nunito Bold (700);
```

#### Primary Typeface: "Nunito" (Google Fonts)

**Usage**: Body text, UI elements, most content
**Implementation**: `font-paragraph` class family
**Characteristics**:

- Friendly, rounded sans-serif
- Excellent readability on mobile devices
- Multiple weights available (400, 500, 600, 700)
- Supports international characters

**Weight Guidelines**:

- **Regular (400)**: `font-paragraph` - Body text, standard content
- **Medium (500)**: `font-paragraph-medium` - Secondary emphasis
- **SemiBold (600)**: `font-paragraph-semibold` - Subheadings, buttons
- **Bold (700)**: `font-paragraph-bold` - Strong emphasis, headers

#### Secondary Typeface: "Mali" (Google Fonts)

**Usage**: Headlines, decorative elements, seasonal content
**Implementation**: `font-title` class family
**Characteristics**:

- Handwritten, organic feel
- Adds personality and warmth
- Use for headings and special content

**Weight Guidelines**:

- **Regular (400)**: `font-title` - Regular headers
- **Medium (500)**: `font-title-medium` - Medium emphasis headers
- **SemiBold (600)**: `font-title-semibold` - Strong headers
- **Bold (700)**: `font-title-bold` - Main headlines, hero text

#### System Fallbacks

- **iOS**: San Francisco (SF Pro)
- **Android**: Roboto
- **Web**: -apple-system, BlinkMacSystemFont, "Segoe UI"

### Iconography Style

#### Design Principles

- **Consistent Line Weight**: 2px stroke for all icons
- **Rounded Corners**: 2px radius for friendly appearance
- **Minimal Detail**: Clear at 16px size
- **Organic Inspiration**: Nature-inspired but geometric

#### Icon Categories

1. **Plant Care Actions**: Water, fertilize, prune, harvest
2. **Plant Health**: Healthy, needs care, critical, dormant
3. **Garden Management**: Add, edit, organize, analyze
4. **Community**: Share, comment, like, expert advice
5. **Navigation**: Home, gardens, calendar, profile, settings

---

## 🗣️ Brand Voice & Messaging

### Core Messaging Strategy

#### "Sell the Vacation, Not the Plane Flight"

**Focus on Outcomes (The Vacation)**:

- "Transform from anxious plant killer to confident plant parent"
- "Never wonder 'am I killing my plants?' again"
- "Wake up to thriving plants that make your home beautiful"
- "Join 25,000+ successful plant parents who've mastered plant care"
- "Save $200+ annually by keeping plants alive"

**Minimize Process Details (The Plane Flight)**:

- De-emphasize: AI algorithms, database size, technical features
- Minimize: App functionality, notification systems, data analytics
- Avoid: Complex feature lists, technical specifications

#### Guarantee-Based Positioning

**Primary Value Proposition**:
"We guarantee your plants will thrive, or you get your money back"

**Risk Reversal Messaging**:

- "Try it risk-free for 30 days"
- "If your plants don't improve, we'll keep working until they do"
- "The only guarantee is that doing nothing guarantees failure"
- "What's riskier - $79.99 with a guarantee, or another $200 in dead plants?"

### Brand Personality

**Core Traits**:

- **Confident**: We guarantee results because we deliver them
- **Nurturing**: Supportive guidance without judgment
- **Intelligent**: AI-powered but accessible to everyone
- **Authentic**: Honest about challenges, realistic about solutions
- **Results-Focused**: Outcomes matter more than features

**Voice Characteristics**:

- **Encouraging**: "You've got this" attitude
- **Knowledgeable**: Expert advice made simple
- **Reassuring**: Calm confidence in uncertain situations
- **Practical**: Focus on actionable steps and real results
- **Empathetic**: Understanding plant care anxiety and frustration

### Messaging Framework

#### Problem Agitation

"Tired of killing plants? Frustrated with generic advice that doesn't work? Anxious every time you look at your struggling plants?"

#### Solution Presentation

"GreenThumb's AI learns your specific conditions and creates personalized care plans that actually work. No more guesswork, no more dead plants."

#### Proof & Credibility

"85% plant survival rate vs. 45% industry average. Over 25,000 plants saved. Thousands of before/after transformations."

#### Risk Reversal

"Try it completely risk-free. If your plants don't thrive, get every penny back. What do you have to lose except plant anxiety?"

### Content Tone Guidelines

#### What We Say

- **Results-Focused**: "Your plants will thrive"
- **Confidence-Building**: "You can do this"
- **Outcome-Oriented**: "Imagine walking into a home full of healthy plants"
- **Guarantee-Backed**: "We're so confident, we guarantee it"
- **Community-Driven**: "Join thousands of successful plant parents"

#### What We Avoid

- **Feature-Heavy**: "Our AI uses machine learning algorithms..."
- **Technical Jargon**: "Database optimization and API integration..."
- **Uncertain Language**: "Might help" or "could improve"
- **Generic Advice**: "Water when soil is dry"
- **Overwhelming Details**: Complex setup instructions

### Sales Conversation Scripts

#### Opening Hook

"What if I told you that you could guarantee your plants will thrive, or get your money back?"

#### Problem Identification

"How much have you spent on plants that died in the last year? Most people tell me $200-300."

#### Solution Presentation

"Here's what's different: We don't just give you generic advice. Our AI creates a personalized plan for your exact plants, in your exact conditions, with your exact schedule."

#### Proof Statement

"We have an 85% plant survival rate. The industry average is 45%. That means you're almost twice as likely to succeed with us."

#### Risk Reversal Close

"Best case: You finally become the plant parent you've always wanted to be. Worst case: You try it for 30 days and get your money back. What makes more sense?"

### Brand Messaging Hierarchy

#### Primary Message (Hero Statement)

"Transform from anxious plant killer to confident plant parent - guaranteed"

#### Secondary Messages (Supporting Points)

- "85% plant survival rate vs. 45% industry average"
- "AI-powered personalized care plans that actually work"
- "Join 25,000+ successful plant parents"
- "Save $200+ annually by keeping plants alive"
- "30-day money-back guarantee"
- "76% profit margins enable the best AI technology"

#### Tertiary Messages (Feature Benefits)

- "Weather-aware task adjustments"
- "10,000+ plant database"
- "Photo-based progress tracking"
- "Expert consultation access"
- "Multi-garden management"
- "Negligible operating costs = maximum value for customers"

#### Financial Confidence Messaging

**Why We Can Guarantee Success**:

- "Our 76% profit margins allow us to invest in the best AI technology"
- "Negligible API costs mean we focus 100% on your plant success"
- "We can afford to guarantee results because our costs are so low"
- "Every dollar you pay goes toward making your plants thrive"

#### Competitive Advantage Messaging

**Why We Outspend Competitors**:

- "Front-loaded annual pricing gives us 5x more ad budget than monthly competitors"
- "We can afford the best plant experts because our margins are 76%"
- "Low operating costs = higher investment in customer success"
- "While competitors worry about costs, we focus on your results"

#### Value Proposition Reinforcement

**Economic Confidence**:

- "Our business model is so efficient, we can guarantee your success"
- "99.97% gross margins mean we never compromise on quality"
- "We outspend competitors 5:1 on customer acquisition because we can afford to"
- "Your success is our only expense that matters"

---

## 📱 Digital Applications

### Mobile App Technology Stack

#### Frontend Architecture

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing system)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated 3
- **State Management**: Jotai for global state, React Query for server state
- **UI Components**: Custom component library with consistent design system

#### Backend Infrastructure

- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Clerk with Supabase integration
- **File Storage**: Supabase Storage for plant images
- **Edge Functions**: Supabase Edge Functions for AI processing
- **Real-time**: Supabase Realtime for live updates

#### File Structure

```
app/
├── (auth)/           # Authentication screens
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── welcome.tsx
│   └── _layout.tsx
├── (tabs)/           # Main app screens
│   ├── gardens/      # Garden management
│   ├── plants/       # Plant database
│   ├── calendar.tsx  # Task calendar
│   ├── profile.tsx   # User profile
│   └── _layout.tsx
└── _layout.tsx       # Root layout

components/
├── Auth/             # Authentication components
├── Database/         # Plant database components
├── Gardens/          # Garden management components
├── Home/             # Home screen components
├── Task/             # Task management components
├── UI/               # Reusable UI components
└── icons/            # Custom icon components
```

### Mobile App Design

#### Interface Principles

- **Clean & Uncluttered**: Generous white space, clear hierarchy
- **Touch-Friendly**: Minimum 44px touch targets, easy navigation
- **Consistent Patterns**: Reusable components, predictable interactions
- **Accessible Design**: High contrast, screen reader support, scalable text
- **NativeWind Integration**: Tailwind classes for consistent styling across components

#### Screen Layout Standards

- **Header Height**: 64px with safe area considerations
- **Content Padding**: 16px horizontal, 12px vertical minimum using `px-4 py-3`
- **Card Spacing**: 12px between cards using `gap-3`, 8px internal padding using `p-2`
- **Button Heights**: 48px for primary actions, 36px for secondary using size classes

#### Component System

**Base Components**:

- `PageContainer`: Provides consistent background gradients and safe areas
- `BackgroundGradient`: Standard green-cream gradient backgrounds
- `LoadingSpinner`/`PlantGrowthLoader`: Themed loading animations
- `SubmitButton`: Standardized button component with variants
- `AnimatedTransition`: Smooth entrance animations

**Color Implementation**:

- Primary buttons: `bg-brand-600 text-primary-foreground`
- Background: `bg-cream-50` or `bg-background`
- Text: `text-cream-800` or `text-foreground`
- Borders: `border-cream-200` or `border-cream-300`

#### Animation Guidelines

- **Duration**: 200-300ms for micro-interactions, 400-600ms for transitions
- **Easing**: Ease-out for entrances, ease-in for exits
- **Purpose**: Provide feedback, guide attention, create delight
- **Performance**: Use native driver when possible, optimize for 60fps
- **Implementation**: React Native Reanimated 3 with `useNativeDriver: true`

### Website Design

#### Layout Structure

- **Max Width**: 1200px for content, centered with auto margins
- **Grid System**: 12-column responsive grid with 24px gutters
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px)
- **Typography Scale**: 1.25 ratio (16px, 20px, 25px, 31px, 39px)

#### Component Library

- **Headers**: Consistent navigation, clear hierarchy
- **Cards**: Plant profiles, feature highlights, testimonials
- **Forms**: App download, newsletter signup, contact
- **Buttons**: Primary, secondary, text, icon combinations

### Social Media Guidelines

#### Profile Consistency

- **Profile Image**: GreenThumb logo on brand green background
- **Cover Images**: Seasonal plant photography with brand overlay
- **Bio Format**: "AI-powered plant care • [Key benefit] • Download: [link]"

#### Content Templates

- **Plant Care Tips**: Educational carousel posts with brand colors
- **User Success Stories**: Before/after plant photos with testimonials
- **Feature Highlights**: App screenshots with benefit callouts
- **Seasonal Content**: Timely plant care advice with seasonal imagery

#### Hashtag Strategy

- **Brand**: #GreenThumbApp #PlantCareAI #SmartGardening
- **Community**: #PlantParent #GreenThumb #PlantCare #Gardening
- **Seasonal**: #SpringPlanting #SummerGarden #FallPrep #WinterCare

---

## 🎯 Brand Applications

### Marketing Materials

#### App Store Assets

- **App Icon**: Primary logo optimized for small sizes
- **Screenshots**: Consistent UI with brand colors and typography
- **Preview Videos**: Brand intro, feature demos, success stories
- **Descriptions**: Brand voice, key benefits, clear call-to-action

#### Print Materials

- **Business Cards**: Minimalist design with logo and contact info
- **Brochures**: Plant care guides with brand photography
- **Stickers**: Logo variations for plant pots, laptops, phones
- **Packaging**: If physical products, eco-friendly with brand colors

#### Digital Advertising

- **Display Ads**: Consistent visual style across all platforms
- **Video Ads**: Brand intro, app demo, user testimonials
- **Social Media Ads**: Platform-optimized with clear value proposition
- **Email Templates**: Branded headers, consistent typography

### Partnership Materials

#### Co-Marketing Assets

- **Logo Lockups**: GreenThumb + partner logos with proper spacing
- **Joint Presentations**: Branded slide templates for partnerships
- **Retail Displays**: Point-of-sale materials for plant stores
- **QR Codes**: Branded codes linking to app download or plant care

#### Educational Content

- **Plant Care Guides**: Branded PDFs with expert advice
- **Video Tutorials**: Consistent intro/outro with brand elements
- **Infographics**: Data visualization with brand color palette
- **Seasonal Calendars**: Monthly plant care reminders with branding

---

## 📏 Usage Guidelines

### Logo Usage

#### Proper Usage

- **Clear Space**: Minimum 1x logo height on all sides
- **Minimum Size**: 24px height for digital, 0.5" for print
- **Backgrounds**: Use on white, light gray, or brand green only
- **Placement**: Top-left for apps, centered for marketing materials

#### Improper Usage

- **Don't**: Stretch, rotate, or distort the logo
- **Don't**: Use on busy backgrounds or low contrast surfaces
- **Don't**: Recreate or modify logo elements
- **Don't**: Use outdated or unofficial logo versions

### Color Usage

#### Primary Color Applications

- **Brand 600** (#5E994B): Primary buttons, active states, success messages
  - Implementation: `bg-brand-600`, `text-brand-600`, `border-brand-600`
- **Cream 50** (#fffefa): App backgrounds, card backgrounds
  - Implementation: `bg-cream-50`, `bg-background`
- **Cream 800** (#2e2c29): Primary text, headers
  - Implementation: `text-cream-800`, `text-foreground`
- **Accent 200** (#ffd900): Badges, warnings, highlights
  - Implementation: `bg-accent-200`, `text-accent-800`

#### Color Accessibility

- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Don't rely solely on color to convey information
- **Testing**: Use tools like WebAIM contrast checker for validation

### Typography Usage

#### Typography Hierarchy (Actual Implementation)

- **H1**: `text-3xl font-title-bold` - Main headlines (Mali Bold)
  - _Component Usage_: HomeHeader, welcome screen titles
- **H2**: `text-2xl font-title` - Section headers (Mali Regular)
  - _Component Usage_: Garden names, section headers
- **H3**: `text-xl font-title` - Subsections (Mali Regular)
  - _Component Usage_: Plant names, modal titles
- **Body**: `text-base font-paragraph` - Main content (Nunito Regular)
  - _Component Usage_: BodyText component, descriptions, content
- **Small**: `text-sm font-paragraph` - Secondary information (Nunito Regular)
  - _Component Usage_: Metadata, timestamps, helper text
- **Button Text**: `text-base font-paragraph-semibold` - Button labels (Nunito SemiBold)
  - _Component Usage_: AuthButton, SubmitButton text

#### Text Components (Actual Implementation)

Custom text components in `components/UI/Text.tsx`:

- **TitleText**: Uses Mali font family for headlines and titles
- **SubtitleText**: Mali for secondary headings
- **BodyText**: Nunito for all body content and UI text
- **Text**: Generic wrapper with NativeWind support

#### Responsive Text Sizing

NativeWind provides responsive text sizing that scales appropriately across devices:

- Base sizes work well for mobile (primary target)
- Text scales automatically based on device settings
- All text supports accessibility scaling

#### Spacing Standards (NativeWind Implementation)

- **Line Height**: Default NativeWind line heights (optimized for readability)
- **Padding**: `p-4` (16px), `p-3` (12px), `p-2` (8px) for components
- **Margins**: `mb-4` (16px), `mb-6` (24px), `mb-8` (32px) for section spacing
- **Gap**: `gap-3` (12px), `gap-4` (16px) for component spacing

---

## 📊 Brand Metrics & Consistency

### Brand Recognition KPIs

- **Logo Recognition**: 80% of users recognize logo within 6 months
- **Brand Recall**: 60% unaided brand recall in plant care category
- **Visual Consistency**: 95% of brand touchpoints follow guidelines
- **Voice Consistency**: Brand voice recognition in user feedback

### Quality Assurance

#### Design Review Process

1. **Initial Concept**: Brand alignment check with guidelines
2. **Design Development**: Color, typography, and layout review
3. **Final Approval**: Brand manager sign-off before publication
4. **Post-Launch**: Monitor usage and gather feedback

#### Brand Compliance Checklist

- [ ] Logo usage follows spacing and sizing guidelines
- [ ] Colors match brand palette specifications
- [ ] Typography uses approved fonts and hierarchy
- [ ] Voice and tone align with brand personality
- [ ] Accessibility standards met for all elements

### Brand Evolution

#### Review Schedule

- **Monthly**: Social media and marketing material review
- **Quarterly**: Brand guideline updates and refinements
- **Annually**: Comprehensive brand audit and strategy review
- **As Needed**: Major product launches or market changes

#### Update Process

1. **Identify Need**: Market research, user feedback, business goals
2. **Propose Changes**: Design team creates updated guidelines
3. **Stakeholder Review**: Leadership and marketing team approval
4. **Implementation**: Gradual rollout across all brand touchpoints
5. **Training**: Team education on updated guidelines

---

## 🎨 Asset Library

### Digital Assets

- **Logo Files**: SVG, PNG (multiple sizes), PDF vector files
- **Color Swatches**: Sketch, Figma, Adobe Creative Suite palettes
- **Typography**: Font files and web font implementations
- **Icon Library**: Complete set in multiple formats and sizes
- **Templates**: Social media, presentation, email templates

### Photography Style

- **Subject Matter**: Real plants, gardens, people caring for plants
- **Lighting**: Natural, bright, optimistic lighting
- **Composition**: Clean, uncluttered, focus on plant health
- **Color Grading**: Enhance natural greens, warm and inviting tones
- **Style**: Authentic, aspirational but achievable

### Illustration Style

- **Approach**: Friendly, approachable, slightly stylized
- **Color Palette**: Brand colors with natural earth tones
- **Subject Matter**: Plant care activities, seasonal changes, growth
- **Usage**: Onboarding, empty states, educational content

---

## 📋 Brand Maintenance

### Governance Structure

- **Brand Manager**: Overall brand strategy and guideline enforcement
- **Design Team**: Asset creation and guideline implementation
- **Marketing Team**: Brand application across campaigns and content
- **Product Team**: Brand integration in app and digital experiences

### Training & Education

- **New Employee Onboarding**: Brand guidelines and voice training
- **Regular Workshops**: Quarterly brand consistency sessions
- **Resource Access**: Shared brand asset library and guidelines
- **Feedback Channels**: Regular brand usage review and improvement

### Legal Protection

- **Trademark Registration**: Logo and brand name protection
- **Usage Monitoring**: Regular checks for brand misuse
- **Partner Guidelines**: Clear brand usage rules for partnerships
- **Enforcement**: Process for addressing brand violations

---

_Last Updated: January 2025_
_Document Owner: Brand & Design Team_
_Review Cycle: Quarterly with annual comprehensive review_
