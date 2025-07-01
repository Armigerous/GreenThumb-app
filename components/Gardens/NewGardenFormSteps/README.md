# New Garden Form Steps

This directory contains the modular step components for the NewGardenForm wizard. Each step is a self-contained component that handles a specific part of the garden creation flow.

## Components

### GardenNameStep

- **Purpose**: Collects the garden name from the user
- **Features**:
  - Text input with validation
  - Personalized suggestions based on user's name
  - Quick-select suggestion buttons
- **Props**: `name`, `onNameChange`, `gardenNameSuggestions`

### LocationStep

- **Purpose**: Collects the user's ZIP code for weather integration
- **Features**:
  - ZIP code validation
  - Location privacy notice
  - Real-time location display when validated
- **Props**: `zipCode`, `city`, `onZipCodeChange`, `onLocationSelect`

### GrowingConditionsStep

- **Purpose**: Collects the 5 essential growing conditions
- **Features**:
  - Light requirements selector
  - Soil texture selector
  - Available space selector
  - Maintenance level selector
  - Growth rate preference selector
- **Props**: All condition values and their respective change handlers

### StyleStep

- **Purpose**: Optional garden style/theme selection
- **Features**:
  - Landscape theme selector
  - Advanced options callout
  - Optional field (can be skipped)
- **Props**: `landscapeThemeIds`, `onLandscapeThemeChange`

## Design Principles

1. **Single Responsibility**: Each step handles one logical part of the form
2. **Controlled Components**: All state is managed by the parent NewGardenForm
3. **Consistent Styling**: Uses shared UI components (TitleText, BodyText, BetterSelector, etc.)
4. **Type Safety**: Full TypeScript support with proper prop types
5. **Accessibility**: Maintains focus management and help text

## Usage

```tsx
import { GardenNameStep } from "./NewGardenFormSteps";

<GardenNameStep
  name={formValues.name}
  onNameChange={(name: string) => updateFormValues("name", name)}
  gardenNameSuggestions={gardenNameSuggestions}
/>;
```

## Benefits of This Structure

- **Maintainability**: Easier to modify individual steps
- **Reusability**: Steps can be reused in other forms if needed
- **Testing**: Each step can be tested in isolation
- **Code Organization**: Reduces the size of the main NewGardenForm component
- **Readability**: Clear separation of concerns
