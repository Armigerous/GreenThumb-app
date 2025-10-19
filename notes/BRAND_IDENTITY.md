# 🎨 GreenThumb - Brand Identity & Design Guidelines

## 🌱 Brand Overview

### Mission Statement

Empowering North Carolina plant enthusiasts to cultivate thriving gardens through intelligent, personalized plant care management that transforms uncertainty into confidence and growth.

### Brand Positioning

GreenThumb is the intelligent plant care companion that bridges the gap between plant care anxiety and gardening success. We combine cutting-edge AI technology with nurturing guidance to help every plant parent—from nervous beginners to pro gardeners—achieve their green-thumb dreams.

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

Picture the cozy pages of a well-loved children's book: everything is painted in soft gouache and watery-light watercolor on textured paper, so the colors feel sun-aged and nostalgic—never harsh, never neon. Each scene is washed in a single seasonal hue (buttery spring yellows, honey-amber autumns, slate-blue winters) that glows gently around rounded, outline-less shapes. You see visible paper grain and a few speckles of "pollen dust," as if the image itself has been living in someone's garden journal. The mood is always warm, calm, and a little whimsical—friendly enough that a five-year-old would feel at home, yet sophisticated enough for adults to feel a tug of nostalgia. That's GreenThumb Pastel-Gouache vibe we want every new illustration to breathe.

#### Technical Specifications

**Design Token Structure (Actual Implementation):**

```javascript
// Brand colors (from tailwind.config.js)
brand: {
  600: "#5E994B", // Primary brand color - main buttons, links
  700: "#4A7A3B", // Hover states, darker accents
  500: "#77B860", // Regular accent, secondary actions
  100: "#D6E8CC", // Light backgrounds, borders
  50: "#ECF4E7", // Very light backgrounds
}

cream: {
  50: "#fffefa", // Primary background (bg-background)
  800: "#2e2c29", // Primary text (text-foreground)
  300: "#ded8ca", // Standard borders
  200: "#fff8e8", // Light borders
}

accent: {
  200: "#FDFD96", // Badge background
}
```

**Typography Classes (from app/fonts.css):**

- `.font-title` // Mali Regular (400) - headers
- `.font-title-bold` // Mali Bold (700) - main headlines
- `.font-paragraph` // Nunito Regular (400) - body text
- `.font-paragraph-semibold` // Nunito SemiBold (600) - buttons, emphasis

**Asset Requirements:**

- App Icons: iOS (multiple sizes), Android (adaptive icon)
- Splash Screen: Centered logo on white background
- Illustrations: Seasonal artwork following gouache style guide
- Component Icons: Ionicons library + custom additions

**Illustration Technical Specs (for external assets):**

- Canvas Texture: Cold-press paper grain
- Working Resolution: 300 DPI minimum
- Base Resolution: 4096×2730 minimum
- Layering Structure:
  - Watery wash layer (Multiply, 100%)
  - Gouache detail layer (Normal, 100%)
  - Paper grain overlay (Multiply, 35%)
  - Speckle dust layer (Screen, 5-8%)

**Seasonal Color Palette (Aligned with Brand Colors):**

- Spring Wash: (brand-50 - extremely light background)
- Summer Wash: (brand-100 - light background)
- Autumn Wash: #F2E46B (accent-300 - light amber)
- Winter Wash: light white/blue

**Accent Colors (From Brand Palette):**

- Brand Green: #5E994B (brand-600 - primary)
- Garden Green: #77B860 (brand-500 - regular accent)
- Earth Brown: #484540 (cream-700 - dark text)
- Shadow Neutral: #636059 (cream-600 - medium-dark text)

**Core Principles:**

1. Soft gouache + watercolor look on lightly-toothed cold-press paper
2. Single season-tinted wash; very low global contrast; gentle highlight bloom
3. Muted pastel palette (never pure white or jet black)
4. Rounded silhouettes with no hard outlines; edges feather into background
5. Visible paper grain (≈35% overlay) and subtle pigment speckles (≈5%)
6. Cozy, gentle, memory-like mood suitable for a five-year-old audience

#### Character Design Guidelines

**Proportions:**

- Head-to-body ratio: 0.25 (child-friendly proportions)
- Eye shape: Bean or dot; no pupils unless needed
- Mouth shape: Small curved line or wedge
- Animal rules: Anatomically plausible with light anthropomorphism

#### Composition Rules

**Layout:**

- Rule of thirds composition
- Natural vignette framing (branches, snow flurries, fences)
- Three distinct depth planes
- Foreground blur: 10%
- Background saturation drop: 35%

**Lighting:**

- Dominant wash usage: Scene-wide color grade; shadows inherit wash hue
- Highlight handling: Soft bloom, no pure white
- Contrast level: Low throughout

#### AI Generation Blueprint

**Positive Prompt Template:**

```
"A [subject] in GreenThumb Pastel-Gouache style: soft gouache + watercolor on textured cold-press paper, nostalgic pastel palette dominated by [season wash color], diffused back-lighting with gentle bloom, rounded forms, no hard outlines, visible brush granulation and paper grain overlay, whimsical child-friendly proportions, cozy and serene mood, low contrast, vignette composition, subtle pigment speckles"
```

**Negative Prompt:**

```
"vector, neon, photorealism, comic ink, hard edges, modern plastic props"
```

**Quality Checklist:**

- Reads instantly as gouache-watercolor painting
- Muted, sun-aged palette with zero pure white/black
- Rounded, feathered edges with no crisp outlines
- Visible paper grain and light speckles present
- Overall mood feels cozy, nostalgic, low-contrast
- Suitable for a five-year-old audience

---

### Logo & Brand Assets

#### Current Implementation Status

**App Icon:**

- Current implementation uses `assets/images/logo.png`

**Splash Screen:**

- The screen is full of clouds. On top of the clouds is our transparent logo. The logo disappears and we dive into the clouds.

#### Icon System: "Plant Care Symbols"

- **Elements**: Watering can, sun, calendar, growth chart, community
- **Style**: Consistent line weight, rounded corners, friendly appearance
- **Usage**: App navigation, feature illustrations, marketing graphics
- **Implementation**: Ionicons library with custom additions as needed

---

## Color Palette

### Primary Colors - Brand Green Scale

Based on the actual implementation in `tailwind.config.js` and component usage:

**Brand 600: #5E994B (Primary brand color)**

- Usage: Primary buttons, active states, success states, main CTAs, secondary actions, plant health indicators, positive states
- Psychology: Growth, nature, success, harmony
- Accessibility: WCAG AA compliant with text-primary-foreground
- Implementation: `bg-brand-600`, `text-brand-600`, `border-brand-600`
- Component Usage: AuthButton, SubmitButton primary variant

**Brand 700: #4A7A3B (Hover state)**

- Usage: Button hover states, darker accents, pressed states
- Implementation: `hover:bg-brand-700`, `text-brand-700`
- Component Usage: Interactive button states

**Brand 100: #D6E8CC (Light backgrounds)**

- Usage: Light accent backgrounds, subtle highlights
- Implementation: `bg-brand-100`, `border-brand-100`
- Component Usage: Completed task backgrounds, success states

#### Brand Color Scale (Complete Palette)

```javascript
brand: {
  25: "#F7FAF5", // Extremely light background
  50: "#ECF4E7", // Light background
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

### Neutral Colors - Cream Scale

**Cream 50: #fffefa (Background color)**

- Usage: Primary app background, primary foreground text color
- Implementation: `bg-cream-50`, `bg-background`, `text-primary-foreground`

**Cream 800: #2e2c29 (Foreground text)**

- Usage: Primary text color, dark colored text
- Implementation: `text-cream-800`, `text-foreground`

**Cream 200: #fff8e8 (borders)**

- Usage: borders and dividers
- Implementation: `border-cream-200`

#### Cream Color Scale (Complete Palette)

```javascript
cream: {
  50: "#fffefa", // Background color ⭐
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

### Accent Colors - Yellow Scale

**Accent 200: #FDFD96 (Badge background)**

- Usage: Warning badges, highlights
- Implementation: `bg-accent-200`

#### Accent Color Scale (Complete Palette)

```javascript
accent: {
  50: "#FFFEF3", // whisper yellow
  100: "#FFF9C2", // pale banana
  200: "#FDFD96", // Badge background ⭐
  300: "#F2E46B", // soft lemon
  400: "#D4B200", // warm gold
  500: "#9E8600", // maybe other option ⭐
  600: "#7E6B00", // deep mustard
  700: "#5E5100", // olive-brown
  900: "#302700", // near-black with warm cast
}
```

### Semantic Colors

- **Background**: #fffefa (Cream 50)
- **Foreground**: #2e2c29 (Cream 800)
- **Primary**: #5E994B (Brand 600)
- **Primary Foreground**: #fffefa (Cream 50)
- **Destructive**: #E50000 (Red)
- **Destructive Foreground**: #fffefa (Cream 50) (text for on top of red background)

### Color Accessibility

- **Contrast Ratios**: Minimum 4:5:1 for normal text, 3:1 for large text
- **Color Blindness**: Don't rely solely on color to convey information
- **Accessibility Idea**: We could turn every page to listenable for people that don't want to read. So they can click a button to listen to the whole page. (Maybe store the readings of the pages as files and upload them to Spotify too.)

---

## Typography

### Implementation in App

**Font Configuration (from tailwind.config.js):**

```javascript
fontFamily: {
  title: ["Mali_400Regular", "Mali_700Bold", "serif"],
  paragraph: ["Nunito_400Regular", "Nunito_600SemiBold", "sans-serif"],
}
```

**CSS Classes (from app/fonts.css):**

```css
.font-title          // Mali Regular (400)
.font-title-medium   // Mali Medium (500)
.font-title-semibold // Mali SemiBold (600)
.font-title-bold     // Mali Bold (700)

.font-paragraph          // Nunito Regular (400)
.font-paragraph-medium   // Nunito Medium (500)
.font-paragraph-semibold // Nunito SemiBold (600)
.font-paragraph-bold     // Nunito Bold (700);
```

### Primary Typeface: "Nunito" (Google Fonts)

- **Usage**: Body text, UI elements, most content
- **Implementation**: `font-paragraph` class family
- **Characteristics**:
  - Friendly, rounded sans-serif
  - Excellent readability on mobile devices
  - Multiple weights available (400, 500, 600, 700)
  - Supports international characters

**Weight Guidelines:**

- **Regular (400)**: `font-paragraph` - Body text, standard content
- **Medium (500)**: `font-paragraph-medium` - Secondary emphasis
- **SemiBold (600)**: `font-paragraph-semibold` - Subheadings, buttons
- **Bold (700)**: `font-paragraph-bold` - Strong emphasis, headers

### Secondary Typeface: "Mali" (Google Fonts)

- **Usage**: Headlines, decorative elements, seasonal content
- **Implementation**: `font-title` class family
- **Characteristics**:
  - Handwritten, organic feel
  - Adds personality and warmth
  - Use for headings and special content

**Weight Guidelines:**

- **Regular (400)**: `font-title` - Regular headers
- **Medium (500)**: `font-title-medium` - Medium emphasis headers
- **SemiBold (600)**: `font-title-semibold` - Strong headers
- **Bold (700)**: `font-title-bold` - Main headlines, hero text

### System Fallbacks

- **iOS**: San Francisco (SF Pro)
- **Android**: Roboto
- **Web**: -apple-system, BlinkMacSystemFont, "Segoe UI"

---

## Iconography Style

### Design Principles

- **Consistent Line Weight**: 2px stroke for all icons
- **Rounded Corners**: 2px radius for friendly appearance
- **Minimal Detail**: Clear at 16px size
- **Organic Inspiration**: Nature-inspired but geometric

### Icon Categories

1. **Plant Care Actions**
2. **Plant Health**
3. **Garden Management**: Add, edit, organize, analyze
4. **Community**: Share, comment, like, expert advice (idea about this: Create a platform where professionals' responses are monetized through a revenue-sharing model.)
5. **Navigation**: Home, gardens, calendar, profile, settings

---

🗣️ Brand Voice & Messaging

Core Communication Philosophy

Simple Language First

GreenThumb Rule: If a 12-year-old can’t understand it, we rewrite it.

Core Principles:
• Clarity Over Cleverness: Simple words beat sophisticated ones
• Plain English Always: No jargon, no industry speak, no complex terms
• One Idea Per Sentence: Break down complex thoughts into digestible pieces
• Conversation, Not Marketing: Talk like a helpful friend, not a salesperson
• Show Don’t Tell: Use concrete examples instead of abstract concepts

Examples of Simple vs Complex:
• ✅ “Your plants will thrive” vs ❌ “Optimize plant survivability outcomes”
• ✅ “Water when dry” vs ❌ “Monitor soil moisture parameters”
• ✅ “We help plants grow” vs ❌ “We facilitate horticultural success”
• ✅ “Your plant needs water” vs ❌ “Hydration intervention required”

Authentic Outcome Focus

Balancing Results with Authenticity

The Challenge: We want to be outcome-focused without sounding “markety” or inauthentic.

Our Approach:
• Honest Enthusiasm: We’re genuinely excited about helping plants thrive
• Real Stories: Use actual user experiences instead of hypothetical scenarios
• Humble Confidence: We know we work, but we’re not arrogant about it
• Address Doubts: Acknowledge that some people have been disappointed before
• No Hype: Avoid superlatives like “amazing,” “incredible,” “revolutionary”

Authentic Outcome Language:
• ✅ “Your plants will do better” vs ❌ “Revolutionary plant transformation”
• ✅ “Most people see healthier plants” vs ❌ “Guaranteed miraculous results”
• ✅ “It works for most plants” vs ❌ “Works for every plant, every time”
• ✅ “You’ll worry less about your plants” vs ❌ “Eliminate all plant anxiety forever”

Brand Personality

Core Traits:
• Simple: We explain things clearly without dumbing them down
• Honest: We admit when something is hard or might not work
• Helpful: We genuinely want your plants to succeed
• Patient: We understand plant care is confusing and take time to explain
• Real: We talk like actual people, no corporate jargon

Voice Characteristics:
• Conversational: Like talking to a knowledgeable neighbor
• Patient: Never rushed, always willing to explain again
• Encouraging: Optimistic without being unrealistic
• Plain-Spoken: Simple words, clear explanations
• Empathetic: We understand plant care frustration because we turn messy, conflicting advice into clear next steps.

Messaging Framework

Problem Agitation

“Tired of killing plants? Frustrated with generic advice that doesn’t work? Anxious every time you look at your struggling plants?”

Solution Presentation

“GreenThumb’s AI learns your specific conditions and creates personalized care plans that actually work. No more guesswork, no more dead plants.”

Proof & Credibility

Indoor (90-day):

“84% plant survival rate vs. 62% industry average. Over 4,000 plants saved. Thousands of before/after transformations.”

Indoor (6-month):

“76% plant survival rate vs. 55% industry average. Over 4,000 plants saved. Thousands of before/after transformations.”

Outdoor/Landscape (first season):

“93% plant survival rate vs. 86% industry average. Over 4,000 plants saved. Thousands of before/after transformations.”

Risk Reversal

“Try it completely risk-free. If your plants don’t thrive, get every penny back. What do you have to lose except plant anxiety?”

Content Tone Guidelines

Language We Use
• Simple & Direct: “Your plants will do better”
• Honest Encouragement: “Most people find this helps”
• Specific Examples: “Water your fiddle leaf fig once a week”
• Real Outcomes: “Sarah’s snake plant hasn’t died in 6 months”
• Plain Speaking: “This tells you when to water”

Language We Avoid
• Marketing Hype: “Revolutionary,” “game-changing,” “incredible”
• Overpromises: “Never lose a plant again,” “guaranteed success”
• Technical Jargon: “AI algorithms,” “machine learning optimization”
• Vague Benefits: “Enhanced plant performance,” “improved outcomes”
• Corporate Speak: “Leverage synergies,” “optimize plant care solutions”

Simple Language Standards

Sentence Structure:
• Keep sentences under 20 words when possible
• Use active voice: “We help your plants” vs “Your plants are helped by us”
• Lead with the benefit: “Your plant lives longer” vs “Our system increases longevity”

Word Choice:
• Use common words: “help” not “facilitate,” “use” not “utilize”
• Avoid compound words when simple ones work: “care” not “maintenance”
• Choose specific over general: “water” not “hydrate,” “grow” not “develop”

Authenticity Markers:
• Admit limitations: “This works for most plants, but not all”
• Use real numbers: “84% of users see improvement” not “most users see amazing results”
• Include normal experiences: “It takes about 2 weeks to see changes”

Authentic Conversation Approach

Opening (Natural & Friendly)

Problem Recognition (Empathetic)

Simple Solution Explanation

Honest Proof

“Most people see their plants doing better pretty quickly. Not perfect - plant care takes time - but better. About 84% of plants survive their first year with us.”

Genuine Invitation

“Want to try it? It costs less than replacing a few dead plants. And if it doesn’t help your plants, just stop using it.”

Simple Message Hierarchy

Primary Message (What We Do)

“We help your plants live longer”

Secondary Messages (How & Why)
• “Simple care reminders for each plant”
• “Most plants survive their first year with us”
• “Thousands of people use this to keep plants alive”
• “Costs less than replacing dead plants”
• “Try it risk-free”

Supporting Details (When Asked)
• “Works with most common houseplants”
• “Tells you when to water, fertilize, and repot”
• “Takes photos to track progress”
• “Get help from plant experts when needed”
• “Manage multiple plants in different gardens”

Financial Confidence Messaging

Why We Can Guarantee Success:
• “Every dollar you pay goes toward making your plants thrive”

Simple Communication Checklist

Before Publishing Any Content, Ask:
• Can a 12-year-old understand this?
• Am I using the simplest words possible?
• Does this sound like how I’d actually talk to a friend?
• Am I being honest about what we can and can’t do?
• Is this helpful, not just promotional?

Red Flags to Avoid:
• Sentences longer than 25 words
• Industry jargon or buzzwords
• Superlatives like “best,” “perfect,” “ultimate”
• Complex explanations when simple ones work
• Promises that sound too good to be true

GreenThumb Test: If you wouldn’t say it to your neighbor while chatting over the fence about plants, don’t put it in our marketing.

⸻

📱 Digital Applications (kept core, trimmed)

Interface Principles
• Clean & Uncluttered: Generous white space, clear hierarchy
• Touch-Friendly: Minimum 44px touch targets, easy navigation
• Consistent Patterns: Reusable components, predictable interactions
• Accessible Design: High contrast, screen reader support, scalable text

Component System

Base Components:
• PageContainer, BackgroundGradient, LoadingSpinner / PlantGrowthLoader, SubmitButton, AnimatedTransition

Color Implementation:
• Primary buttons: bg-brand-600 text-primary-foreground
• Background: bg-cream-50 or bg-background
• Text: text-cream-800 or text-foreground
• Borders: border-cream-200 or border-cream-300

⸻

Last Updated: September 2025 • Document Owner: Eren Kahveci

---

## 🎨 Complete AI Art Generation Prompt

### Style Configuration

```json
{
  "style_name": "GreenThumb Pastel‑Gouache",
  "purpose": "Ensure every new illustration for The GreenThumb brand follows the same nostalgic, children’s‑storybook aesthetic.",
  "core_principles": [
    "Soft gouache + watercolor look on lightly‑toothed cold‑press paper",
    "Single season‑tinted wash; very low global contrast; gentle highlight bloom",
    "Muted pastel palette (never pure white or jet black)",
    "Rounded silhouettes with no hard outlines; edges feather into background",
    "Visible paper grain (≈35 % overlay) and subtle pigment speckles (≈5 %)",
    "Cozy, gentle, memory‑like mood suitable for a five‑year‑old audience"
  ],
  "medium": {
    "canvas_texture": "cold‑press paper grain",
    "working_resolution_dpi": 300,
    "base_resolution_min": "4096×2730",
    "layering": [
      "Watery wash layer (Multiply, 100 %)",
      "Gouache detail layer (Normal, 100 %)",
      "Paper grain overlay (Multiply, 35 %)",
      "Speckle dust layer (Screen, 5‑8 %)"
    ]
  },
  "palette": {
    "season_washes": {
      "spring": "#F7E9AA",
      "summer": "#CDE3B4",
      "autumn": "#E6B06A",
      "winter": "#AFC5D6"
    },
    "accents": {
      "red": "#E26B5A",
      "green": "#769E6E",
      "brown": "#8C6F55"
    },
    "shadow_neutral": "#5E5B5A",
    "saturation_shift_percent": 10,
    "value_shift_percent": 5
  },
  "lighting": {
    "dominant_wash_usage": "scene‑wide color grade; shadows inherit wash hue",
    "highlight_handling": "soft bloom, no pure white",
    "contrast_level": "low"
  },
  "edges": {
    "outline_style": "implied with darker local color, never inked",
    "edge_softness": "Gaussian‑like feather, radius ≈2‑4 px @4K"
  },
  "texture": {
    "paper_grain_opacity": 0.35,
    "speckle_strength": 0.05,
    "speckle_distribution": "random scatter, 1 px diameter, 900 scatter"
  },
  "character_model_sheet": {
    "head_to_body_ratio": 0.25,
    "eye_shape": "bean or dot; no pupils unless needed",
    "mouth_shape": "small curved line / wedge",
    "animal_rules": "anatomically plausible with light anthropomorphism"
  },
  "composition": {
    "rule_of_thirds": true,
    "vignette": "natural framing (branches, snow flurries, fences)",
    "planes": 3,
    "depth_of_field": {
      "foreground_blur_percent": 10,
      "background_saturation_drop_percent": 35
    }
  },
  "brush_presets": [
    {
      "name": "Round Gouache",
      "size_px": "30‑60",
      "opacity_jitter_percent": "0‑25"
    },
    {
      "name": "Watery Wash",
      "flow_percent": 10,
      "wet_edge_percent": 40
    },
    {
      "name": "Speckle Scatter",
      "size_px": 1,
      "scatter": 900,
      "flow_percent": 2
    }
  ],
  "ai_prompt_blueprint": {
    "positive_prompt": "A [subject] in the GreenThumb Pastel‑Gouache style: soft gouache + watercolor on textured cold‑press paper, nostalgic pastel palette dominated by [season wash color], diffused back‑lighting with gentle bloom, rounded forms, no hard outlines, visible brush granulation and paper grain overlay, whimsical child‑friendly proportions, cozy and serene mood, low contrast, vignette composition, subtle pigment speckles",
    "negative_prompt": "vector, neon, photorealism, comic ink, hard edges, modern plastic props",
    "default_params": {
      "aspect_ratio": "3:2",
      "version": "v6",
      "style": "raw"
    }
  },
  "motion_guidelines": {
    "frame_rate_fps": 12,
    "animation_curve": "ease‑in‑ease‑out cubic",
    "particle_effects": {
      "max_rate_pps": 15,
      "opacity": 0.4
    },
    "loop_duration_seconds": "3‑5"
  },
  "usage_guardrails": {
    "dark_theme_handling": "shift wash hue deeper, keep pastel softness; never switch to black background",
    "close_up_rule": "add grain, avoid sharp lines",
    "ui_icon_rule": "2‑layer gouache blobs, retain palette; avoid flat vectors"
  },
  "quality_checklist": [
    "Reads instantly as gouache‑watercolor painting",
    "Muted, sun‑aged palette with zero pure white/black",
    "Rounded, feathered edges with no crisp outlines",
    "Visible paper grain and light speckles present",
    "Overall mood feels cozy, nostalgic, low‑contrast",
    "Suitable for a five‑year‑old audience"
  ]
}
```

---
