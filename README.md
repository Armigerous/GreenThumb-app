# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# The Green Thumb App - Filter System

## Overview

The Green Thumb App now features a comprehensive filter system for the Plant Database, allowing users to filter plants by various criteria such as:

- Plant types (Houseplant, Succulent, Vine, etc.)
- Light requirements
- Soil conditions
- And more

## Implementation Details

### Filter Modal

The filter system uses a modal-based approach:

1. Users tap a "Filter" button to open a full-screen modal
2. The modal displays filter categories in collapsible sections
3. Users can select multiple filter options across different categories
4. The modal includes:
   - Search functionality to find specific filters
   - Quick filters for common use cases
   - Advanced filter toggle for more specific options

### Technical Structure

The filter system consists of several components:

- `FilterSelector.tsx`: The main button that opens the filter modal
- `FilterModal.tsx`: The full-screen modal with all filter options
- `filterData.ts`: Data structure defining all available filters

### Using NativeWind

The filter system is styled using NativeWind (TailwindCSS for React Native), providing a consistent and responsive UI.

## How to Use

1. Tap the "Filter" button on the Plant Database screen
2. Browse through filter categories or use the search to find specific filters
3. Select the desired filter options
4. Tap "Apply Filters" to see filtered results

## Future Enhancements

- Save favorite filter combinations
- More advanced filter logic (AND/OR operations)
- Filter history
