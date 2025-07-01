# New Garden Form Steps

This directory contains the modular step components for the NewGardenForm wizard. Each step is a self-contained component that handles a specific part of the garden creation flow.

## Components

### GardenNameStep

- **Purpose**: Collects the garden name from the user
- **Features**:
  - Text input with validation and required field indicator
  - Personalized suggestions with interactive suggestion chips
  - Auto-focus on input for better UX
  - Help icon with contextual explanation
- **Props**:
  - `name: string` - Current garden name value
  - `onNameChange: (name: string) => void` - Handler for name changes
  - `gardenNameSuggestions: string[]` - Array of suggested names

### LocationStep

- **Purpose**: Collects the user's ZIP code for North Carolina weather integration
- **Features**:
  - NC-specific ZIP code validation using ZipCodeInput component
  - Privacy notice with shield icon
  - Real-time location display when ZIP code is validated
  - Help icon explaining privacy policy
- **Props**:
  - `zipCode: string` - Current ZIP code value
  - `city: string` - Resolved city name from ZIP code
  - `onZipCodeChange: (text: string) => void` - Handler for ZIP code changes
  - `onLocationSelect: (locationData: LocationData) => void` - Handler for location selection

### GrowingConditionsStep

- **Purpose**: Collects the 5 essential growing conditions using the Selector component
- **Features**:
  - **Light exposure** - Single selection, required (filters out "none" option)
  - **Soil texture** - Single selection, required (filters out "none" option)
  - **Available space** - Single selection, required (filters out "none" option)
  - **Maintenance level** - Single selection, required (filters out "none" option)
  - **Growth rate** - Multiple selection, required (filters out "none" option)
  - Each selector includes help explanations for user guidance
- **Props**: Individual condition values and their respective change handlers:
  - `lightId: number | null`, `onLightChange: (value: number | null) => void`
  - `soilTextureId: number | null`, `onSoilTextureChange: (value: number | null) => void`
  - `availableSpaceToPlantId: number | null`, `onAvailableSpaceChange: (value: number | null) => void`
  - `maintenanceId: number | null`, `onMaintenanceChange: (value: number | null) => void`
  - `growthRateIds: number[]`, `onGrowthRateChange: (value: number[]) => void`

### StyleStep

- **Purpose**: Optional garden style/theme selection for plant recommendations
- **Features**:
  - Landscape theme selector (multiple selection allowed)
  - Clearly marked as optional with visual indicator
  - Advanced options callout with green accent styling
  - Help icon with style explanation
- **Props**:
  - `landscapeThemeIds: number[]` - Selected landscape theme IDs
  - `onLandscapeThemeChange: (value: number[]) => void` - Handler for theme changes

## Design Principles

1. **Single Responsibility**: Each step handles one logical part of the form
2. **Controlled Components**: All state is managed by the parent NewGardenForm
3. **Consistent Styling**: Uses shared UI components (TitleText, BodyText, Selector, ZipCodeInput, HelpIcon)
4. **Type Safety**: Full TypeScript support with proper prop types
5. **Accessibility**: Includes help icons, proper labeling, and visual indicators for required fields
6. **Brand Compliance**: Uses brand color tokens (brand-_, cream-_, destructive) for consistent theming
7. **Progressive Disclosure**: Complex options are mentioned but deferred to post-creation editing

## Key UI Components Used

- **TitleText** - For section headings and labels
- **BodyText** - For descriptions and help text
- **Selector** - For dropdown selections with help explanations
- **ZipCodeInput** - Specialized input for ZIP code validation
- **HelpIcon** - Contextual help with modal explanations
- **TextInput** - Standard React Native input with brand styling

## Data Integration

- Uses `LOOKUP_TABLES` from `@/lib/gardenHelpers` for selector options
- Filters out "none" options from lookup tables where appropriate
- Supports both single and multiple selection patterns via the Selector component

## Usage

```tsx
import {
  GardenNameStep,
  LocationStep,
  GrowingConditionsStep,
  StyleStep
} from "./NewGardenFormSteps";

// Example usage in parent form
<GardenNameStep
  name={formValues.name}
  onNameChange={(name: string) => updateFormValues("name", name)}
  gardenNameSuggestions={gardenNameSuggestions}
/>

<LocationStep
  zipCode={formValues.zipCode}
  city={formValues.city}
  onZipCodeChange={(zipCode: string) => updateFormValues("zipCode", zipCode)}
  onLocationSelect={(locationData) => handleLocationSelect(locationData)}
/>
```

## Benefits of This Structure

- **Maintainability**: Easier to modify individual steps without affecting others
- **Reusability**: Steps can be reused in other garden creation flows
- **Testing**: Each step can be tested in isolation with mock props
- **Code Organization**: Reduces complexity of the main NewGardenForm component
- **Readability**: Clear separation of concerns with descriptive component names
- **Consistency**: Shared design patterns and component usage across all steps
