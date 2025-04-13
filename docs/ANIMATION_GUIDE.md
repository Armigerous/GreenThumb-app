# Animation Guide for TheGreenThumb App

This guide explains how to implement smooth animations in TheGreenThumb App to improve the user experience.

## Core Animation Components

### 1. PageContainer

The `PageContainer` component has been enhanced to support smooth animations. It is the recommended way to wrap your pages for consistent layout and animations.

```jsx
import { PageContainer } from "@/components/UI/PageContainer";

export default function MyScreen() {
  // Your component's logic here

  return (
    <PageContainer animate={true}>{/* Your page content */}</PageContainer>
  );
}
```

**Props:**

- `animate` (boolean): Whether to animate the content (default: true)
- `scroll` (boolean): Whether the content should be scrollable (default: true)
- `padded` (boolean): Whether to add standard padding (default: true)
- `safeArea` (boolean): Whether to use SafeAreaView (default: true)
- `gradientColors`: Custom gradient colors (optional)
- `style`: Additional styles for the container (optional)

### 2. AnimatedTransition

For custom animations of specific elements, use the `AnimatedTransition` component:

```jsx
import AnimatedTransition from "@/components/UI/AnimatedTransition";

// Inside your component's render:
<AnimatedTransition delay={200} initialY={15}>
  <YourComponent />
</AnimatedTransition>;
```

**Props:**

- `delay` (number): Milliseconds to delay animation start (default: 150)
- `duration` (number): Animation duration in milliseconds (default: 400)
- `initialY` (number): Initial vertical offset in pixels (default: 10)
- `enabled` (boolean): Whether animation is enabled (default: true)
- `className` (string): Tailwind classes to apply
- `style` (object): React Native style object

### 3. LoadingSpinner

For displaying loading states, use the custom plant-themed `LoadingSpinner`:

```jsx
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

// For full-screen loading (initial data fetch only):
if (isLoading && !data) {
  return <LoadingSpinner message="Loading your plants..." />;
}

// For inline loading indicators:
<CompactSpinner />;
```

**Props:**

- `message` (string): Text to display below the spinner (default: "Loading...")
- `color` (string): Color of the animation (default: brand green)
- `backgroundColor` (string): Background color class (default: transparent)
- `animated` (boolean): Whether to animate the entrance (default: true)

## Best Practices

1. **Use PageContainer as your base**:
   Always start with `PageContainer` for page-level components.

2. **Only show loading spinners for initial data fetch**:

   - Use conditional rendering to show the loading spinner ONLY when:
     - Data is being loaded for the first time
     - There's no cached data available to display
   - Example: `if (isLoading && !data) return <LoadingSpinner />;`

3. **Refresh data in the background**:

   - Use `useFocusEffect` to silently refresh data when a screen comes into focus
   - Don't show loading spinners for these background refreshes

4. **Stagger animations for lists**:
   Use incremental delays for list items to create a staggered effect:

   ```jsx
   {
     items.map((item, index) => (
       <AnimatedTransition key={item.id} delay={150 + index * 50} initialY={10}>
         <ItemComponent item={item} />
       </AnimatedTransition>
     ));
   }
   ```

5. **Keep animations subtle**:

   - Use small initialY values (5-15px)
   - Keep durations between 300-500ms
   - Use appropriate delays (100-250ms)

6. **Performance considerations**:
   - All animations use `useNativeDriver: true` for hardware acceleration
   - Avoid animating too many elements at once
   - Use staggered animations for lists with many items

## Example: List Screen with Optimized Loading

```jsx
import { useCallback } from "react";
import { Text, FlatList } from "react-native";
import { PageContainer } from "@/components/UI/PageContainer";
import AnimatedTransition from "@/components/UI/AnimatedTransition";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";

export default function PlantsListScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["plants"],
    queryFn: fetchPlants,
  });

  // Silently refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        refetch();
      }
    }, [refetch, isLoading])
  );

  // Show loading spinner only for initial data fetch
  if (isLoading && !data) {
    return <LoadingSpinner message="Loading plants..." />;
  }

  return (
    <PageContainer animate={true}>
      <AnimatedTransition delay={150} initialY={10}>
        <Text className="text-xl font-bold mb-4">My Plants</Text>
      </AnimatedTransition>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <AnimatedTransition delay={200 + index * 50} initialY={10}>
            <PlantCard plant={item} />
          </AnimatedTransition>
        )}
      />
    </PageContainer>
  );
}
```

## Example: Detail Screen

```jsx
import { View, Text, Image } from "react-native";
import { PageContainer } from "@/components/UI/PageContainer";
import AnimatedTransition from "@/components/UI/AnimatedTransition";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useGardenDetails } from "@/lib/queries";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function GardenDetailScreen({ route }) {
  const { id } = route.params;
  const { data, isLoading, refetch } = useGardenDetails(id);

  // Silently refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        refetch();
      }
    }, [refetch, isLoading])
  );

  // Show loading spinner only for initial data fetch
  if (isLoading && !data) {
    return <LoadingSpinner message="Loading garden details..." />;
  }

  return (
    <PageContainer animate={true} padded={false}>
      {data && (
        <>
          {/* Hero image */}
          <View className="h-48 w-full">
            <Image source={{ uri: data.imageUrl }} className="w-full h-full" />
          </View>

          {/* Content with staggered animations */}
          <View className="px-5 py-4">
            <AnimatedTransition delay={150} initialY={10}>
              <Text className="text-2xl font-bold">{data.name}</Text>
            </AnimatedTransition>

            <AnimatedTransition delay={200} initialY={10}>
              <Text className="text-gray-600">{data.description}</Text>
            </AnimatedTransition>

            <AnimatedTransition delay={250} initialY={10}>
              {/* Stats section */}
            </AnimatedTransition>
          </View>
        </>
      )}
    </PageContainer>
  );
}
```

## Troubleshooting

If animations aren't working as expected:

1. Make sure `animate={true}` is set on PageContainer
2. For list animations, ensure each item has a unique key
3. Verify that transitions have enough vertical space to animate
4. If animations feel janky, reduce the number of animated components
5. Ensure loading spinners only show during initial data loads
