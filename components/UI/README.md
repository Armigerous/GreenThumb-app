# UI Components

## Loading Animation

The app now has a standardized gardening-themed loading animation that shows a plant growing from seed to flower. This provides a consistent and thematically appropriate loading experience across the app.

### Usage

#### Full-screen loading:

```tsx
import { LoadingSpinner } from "../components/UI/LoadingSpinner";

// Default usage
<LoadingSpinner />

// With custom message and background
<LoadingSpinner
  message="Watering plants..."
  backgroundColor="bg-cream-50"
/>

// With custom color
<LoadingSpinner color="#047857" />
```

#### Compact inline loading:

```tsx
import { CompactSpinner } from "../components/UI/LoadingSpinner";

// Default usage (small size)
<CompactSpinner />

// With custom size and color
<CompactSpinner size={32} color="#047857" />
```

### Implementation Details

The loading animation consists of a sequence showing:

1. A seed
2. A sprout
3. A leaf/plant
4. A flower (with gentle swaying)

The animation then repeats in a loop, creating a smooth and engaging loading experience that fits the garden theme of the app.

### Direct Component Access

If needed, you can also import the actual animation components directly:

```tsx
import { PlantGrowthLoader, CompactPlantLoader } from "../components/UI/PlantGrowthLoader";

// Full screen version with custom color and background
<PlantGrowthLoader
  color="#047857"
  message="Growing..."
  backgroundColor="bg-cream-50"
/>

// Compact version
<CompactPlantLoader size={40} color="#047857" />
```

### Color Standards

The app uses a consistent color scheme for loading states:

- Primary brand green: `#047857`
- Background colors:
  - Transparent (default): `bg-transparent`
  - Light cream: `bg-cream-50`
  - White: `bg-white`
