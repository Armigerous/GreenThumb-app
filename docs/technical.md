# 🔧 GreenThumb Technical Implementation Guide

> **Last Updated:** January 2025  
> **App Version:** 1.0.0  
> **Target Launch:** January 27, 2025

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [UI/UX Patterns](#uiux-patterns)
- [Animation Guidelines](#animation-guidelines)
- [Data Management](#data-management)
- [Authentication Implementation](#authentication-implementation)
- [Performance Patterns](#performance-patterns)
- [Error Handling](#error-handling)
- [Testing Approach](#testing-approach)
- [Build & Deployment](#build--deployment)

## 🚀 Development Setup

### Environment Requirements

```bash
# Required versions
Node.js >= 18.0.0
npm >= 9.0.0
Expo CLI >= 6.0.0

# Install global dependencies
npm install -g @expo/cli eas-cli

# Platform-specific tools
iOS: Xcode 15+ (Mac only)
Android: Android Studio + SDK
```

### Project Setup

```bash
# Clone and install
git clone <repository-url>
cd GreenThumb-app
npm install

# Environment configuration
cp .env.example .env
# Configure API keys (see README.md)

# Start development
npm start
```

### VS Code Configuration

**Recommended Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "expo.vscode-expo-tools"
  ]
}
```

**Settings (.vscode/settings.json):**
```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*[\"']([^\"']*)[\"']", "\"([^\"]*)\""]
  ]
}
```

## 📝 Code Standards

### TypeScript Guidelines

1. **Strict Type Safety**
   ```typescript
   // ✅ Good - Explicit typing
   interface PlantTaskProps {
     task: TaskWithDetails;
     onComplete: (taskId: number) => void;
     loading?: boolean;
   }
   
   // ❌ Avoid - Any types
   function updatePlant(data: any) { }
   ```

2. **Type Organization**
   ```typescript
   // types/garden.ts - Domain-specific types
   export interface Garden {
     id: number;
     name: string;
     user_id: string;
     // ... other fields
   }
   
   // types/api.ts - API-specific types
   export interface CreateGardenRequest {
     name: string;
     preferences: GardenPreferences;
   }
   ```

3. **Generic Patterns**
   ```typescript
   // Reusable generic patterns
   export interface ApiResponse<T> {
     data: T;
     error?: string;
     loading: boolean;
   }
   
   export function useApiQuery<T>(
     queryFn: () => Promise<T>
   ): ApiResponse<T> {
     // Implementation
   }
   ```

### Naming Conventions

```typescript
// Files: PascalCase for components, camelCase for utilities
components/TaskList.tsx
utils/dateHelpers.ts
hooks/useGardenData.ts

// Components: PascalCase
export function TaskCompletionModal() {}

// Variables & Functions: camelCase
const handleTaskComplete = () => {};
const isTaskOverdue = true;

// Constants: SCREAMING_SNAKE_CASE
const MAX_GARDENS_PER_USER = 10;
const API_ENDPOINTS = {
  GARDENS: '/gardens',
  PLANTS: '/plants'
};

// Types & Interfaces: PascalCase
interface GardenFormData {}
type TaskStatus = 'pending' | 'completed' | 'overdue';
```

### File Organization

```
components/
├── UI/                    # Base design system components
│   ├── Button.tsx         # Generic button component
│   ├── Input.tsx          # Form input component
│   └── index.ts           # Barrel exports
├── Gardens/               # Garden-specific components
│   ├── GardenCard.tsx     # Garden display card
│   ├── GardenForm.tsx     # Garden creation/edit form
│   └── index.ts           # Feature exports
└── Home/                  # Home screen components
    ├── HomeHeader.tsx     # Dashboard header
    ├── TasksSection.tsx   # Tasks overview
    └── index.ts           # Section exports
```

## 🎨 UI/UX Patterns

### Design System Implementation

**Color System:**
```typescript
// constants/colors.ts
export const colors = {
  primary: {
    50: '#f0f9f0',
    500: '#77B860',
    600: '#5c8f47',
    // ... full scale
  },
  semantic: {
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  }
};
```

**Component Patterns:**
```typescript
// Base component with variants
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  loading = false,
  children,
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    ghost: 'bg-transparent text-foreground hover:bg-accent'
  };
  
  return (
    <TouchableOpacity 
      className={cn(baseClasses, variantClasses[variant])}
      disabled={loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : children}
    </TouchableOpacity>
  );
}
```

### Layout Patterns

**Page Container:**
```typescript
// Standard page wrapper with consistent spacing
export function PageContainer({ 
  children, 
  scroll = true,
  padded = true,
  animate = true 
}: PageContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {scroll ? (
        <ScrollView 
          className={cn(padded && "px-5")}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn("flex-1", padded && "px-5")}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
```

**Card Patterns:**
```typescript
// Consistent card styling across the app
export function Card({ children, className, ...props }: CardProps) {
  return (
    <View 
      className={cn(
        "bg-card rounded-lg p-4 border border-border shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
```

### Form Patterns

**Form State Management:**
```typescript
// Using Zod for validation with TypeScript inference
const gardenSchema = z.object({
  name: z.string().min(1, "Garden name is required"),
  location: z.string().optional(),
  preferences: z.object({
    sunlight: z.array(z.string()),
    soilType: z.array(z.string())
  })
});

type GardenFormData = z.infer<typeof gardenSchema>;

export function GardenForm() {
  const [formData, setFormData] = useState<GardenFormData>({
    name: '',
    location: '',
    preferences: { sunlight: [], soilType: [] }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = () => {
    const result = gardenSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }
    
    // Submit valid data
    createGarden(result.data);
  };
}
```

## 🎬 Animation Guidelines

### Moti Animation Patterns

**Page Transitions:**
```typescript
import { MotiView } from 'moti';

// Standard page entrance animation
export function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      {children}
    </MotiView>
  );
}
```

**Task Completion Animation:**
```typescript
// Celebratory animation for task completion
export function TaskCompletionCelebration({ visible }: { visible: boolean }) {
  return (
    <MotiView
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
      }}
    >
      {/* Celebration content */}
    </MotiView>
  );
}
```

### React Native Reanimated Patterns

**Layout Animations:**
```typescript
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable layout animations on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Configure smooth layout transitions
const configureLayoutAnimation = () => {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      300,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    )
  );
};
```

**Gesture Handling:**
```typescript
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedGestureHandler } from 'react-native-reanimated';

export function SwipeableCard({ onSwipe }: { onSwipe: () => void }) {
  const translateX = useSharedValue(0);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > 100) {
        runOnJS(onSwipe)();
      }
      translateX.value = withSpring(0);
    },
  });
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[animatedStyle]}>
        {/* Card content */}
      </Animated.View>
    </PanGestureHandler>
  );
}
```

### Performance Guidelines

**Animation Best Practices:**
```typescript
// ✅ Good - Use native driver when possible
const fadeAnim = useRef(new Animated.Value(0)).current;

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Only for transform and opacity
}).start();

// ❌ Avoid - Layout properties with native driver
Animated.timing(fadeAnim, {
  toValue: 100,
  duration: 300,
  useNativeDriver: true, // Don't use with width, height, etc.
}).start();
```

## 📊 Data Management

### TanStack Query Implementation

**Query Patterns:**
```typescript
// lib/queries.ts
export function useGardenDashboard(userId?: string) {
  return useQuery({
    queryKey: ['gardenDashboard', userId],
    queryFn: () => supabaseApi.getGardenDashboard(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Custom retry logic
      return failureCount < 3 && error.status !== 404;
    }
  });
}
```

**Mutation Patterns:**
```typescript
export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, completed }: CompleteTaskInput) => {
      const { error } = await supabase
        .from('plant_tasks')
        .update({ completed })
        .eq('id', taskId);
      
      if (error) throw error;
      return { taskId, completed };
    },
    
    // Optimistic updates
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries(['tasks']);
      
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: TaskWithDetails[]) =>
        old?.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      );
      
      return { previousTasks };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['gardenDashboard']);
    }
  });
}
```

### Supabase Integration

**Database Operations:**
```typescript
// lib/supabaseApi.ts
export const gardenApi = {
  async create(gardenData: CreateGardenInput): Promise<Garden> {
    const { data, error } = await supabase
      .from('user_gardens')
      .insert(gardenData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async list(userId: string): Promise<Garden[]> {
    const { data, error } = await supabase
      .from('user_gardens_dashboard')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  },
  
  async update(id: number, updates: UpdateGardenInput): Promise<Garden> {
    const { data, error } = await supabase
      .from('user_gardens')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};
```

**Real-time Subscriptions:**
```typescript
export function useTaskSubscription(userId?: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel('task_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plant_tasks',
        filter: `user_plant_id=eq.${userId}`
      }, () => {
        // Invalidate relevant queries when tasks change
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['gardenDashboard']);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}
```

### Image Management

**Cached Image Component:**
```typescript
// components/CachedImage.tsx
export function CachedImage({ 
  source, 
  placeholder, 
  className,
  ...props 
}: CachedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <View className={cn("relative overflow-hidden", className)}>
      <Image
        source={{ uri: source }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        cachePolicy="memory-disk"
        className="w-full h-full"
        {...props}
      />
      
      {loading && (
        <View className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </View>
      )}
      
      {error && placeholder && (
        <View className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <Image source={placeholder} className="w-full h-full opacity-50" />
        </View>
      )}
    </View>
  );
}
```

## 🔐 Authentication Implementation

### Clerk Integration

**Custom Auth Hook:**
```typescript
// lib/hooks/useSupabaseAuth.ts
export function useSupabaseAuth() {
  const { getToken, userId } = useAuth();
  
  useEffect(() => {
    const syncSupabaseAuth = async () => {
      if (!userId) {
        // Clear Supabase session
        await supabase.auth.signOut();
        return;
      }
      
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          // Set Supabase session with Clerk token
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
        }
      } catch (error) {
        console.error('Error syncing auth:', error);
      }
    };
    
    syncSupabaseAuth();
  }, [userId, getToken]);
}
```

**Protected Route Pattern:**
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClient>
        <AuthSync /> {/* Initialize auth sync */}
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
        </Stack>
      </QueryClient>
    </ClerkProvider>
  );
}

function AuthSync() {
  useSupabaseAuth(); // Sync Clerk with Supabase
  return null;
}
```

### Security Patterns

**Row Level Security (RLS):**
```sql
-- Supabase RLS policies
CREATE POLICY "Users can only see their own gardens" ON user_gardens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own plants" ON user_plants
  FOR ALL USING (
    garden_id IN (
      SELECT id FROM user_gardens WHERE user_id = auth.uid()
    )
  );
```

**API Key Management:**
```typescript
// app.config.js - Environment variable handling
export default {
  expo: {
    extra: {
      CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};

// Access in app
import Constants from 'expo-constants';
const { CLERK_PUBLISHABLE_KEY } = Constants.expoConfig.extra;
```

## ⚡ Performance Patterns

### Memory Management

**Image Optimization:**
```typescript
// Optimized image loading with proper cleanup
export function OptimizedImage({ source, ...props }: ImageProps) {
  const [imageSource, setImageSource] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const loadImage = async () => {
      try {
        // Pre-process image if needed
        const optimizedSource = await processImage(source);
        if (!cancelled) {
          setImageSource(optimizedSource);
        }
      } catch (error) {
        console.error('Image loading error:', error);
      }
    };
    
    loadImage();
    
    return () => {
      cancelled = true;
    };
  }, [source]);
  
  if (!imageSource) return <ImagePlaceholder />;
  
  return <Image source={{ uri: imageSource }} {...props} />;
}
```

**List Optimization:**
```typescript
// Efficient list rendering with FlashList
import { FlashList } from '@shopify/flash-list';

export function TaskList({ tasks }: { tasks: TaskWithDetails[] }) {
  const renderTask = useCallback(({ item }: { item: TaskWithDetails }) => (
    <TaskItem key={item.id} task={item} />
  ), []);
  
  const getItemType = useCallback((item: TaskWithDetails) => {
    return item.task_type; // Different types for different layouts
  }, []);
  
  return (
    <FlashList
      data={tasks}
      renderItem={renderTask}
      getItemType={getItemType}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id.toString()}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}
```

### Bundle Optimization

**Lazy Loading:**
```typescript
// Lazy load heavy screens
const GardenDetails = lazy(() => import('../screens/GardenDetails'));
const PlantDatabase = lazy(() => import('../screens/PlantDatabase'));

// Use with Suspense
function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Router />
    </Suspense>
  );
}
```

**Asset Optimization:**
```typescript
// Optimize static assets
import { Asset } from 'expo-asset';

// Pre-load critical images
const preloadAssets = async () => {
  const imageAssets = [
    require('../assets/images/logo.png'),
    require('../assets/images/welcome-bg.jpg'),
  ];
  
  await Asset.loadAsync(imageAssets);
};
```

## 🚨 Error Handling

### Error Boundary Pattern

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to crash reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Optional: Send to error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-lg font-semibold mb-4">Something went wrong</Text>
          <Text className="text-gray-600 text-center mb-6">
            We're sorry, but something unexpected happened. Please try restarting the app.
          </Text>
          <Button 
            onPress={() => this.setState({ hasError: false, error: null })}
            title="Try Again"
          />
        </View>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Centralized error handling for API calls
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle Supabase errors
    if (error.message) {
      throw new ApiError(error.message, error.status || 500, error.code);
    }
    
    // Generic error
    throw new ApiError('An unexpected error occurred', 500);
  }
}

// Usage in queries
export function useGardens(userId?: string) {
  return useQuery({
    queryKey: ['gardens', userId],
    queryFn: () => handleApiCall(() => gardenApi.list(userId!)),
    enabled: !!userId,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    }
  });
}
```

## 🧪 Testing Approach

### Unit Testing Patterns

```typescript
// __tests__/components/TaskItem.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { TaskItem } from '../../components/TaskItem';

const mockTask = {
  id: 1,
  task_type: 'Water' as const,
  due_date: '2025-01-15',
  completed: false,
  plant: {
    nickname: 'Basil',
    garden: { name: 'Kitchen Garden' }
  }
};

describe('TaskItem', () => {
  it('renders task information correctly', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} onComplete={jest.fn()} />
    );
    
    expect(getByText('Water Basil')).toBeTruthy();
    expect(getByText('Kitchen Garden')).toBeTruthy();
  });
  
  it('calls onComplete when pressed', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <TaskItem task={mockTask} onComplete={onComplete} />
    );
    
    fireEvent.press(getByTestId('complete-button'));
    expect(onComplete).toHaveBeenCalledWith(1);
  });
});
```

### Hook Testing

```typescript
// __tests__/hooks/useGardens.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGardens } from '../../lib/queries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useGardens', () => {
  it('fetches gardens successfully', async () => {
    const { result } = renderHook(
      () => useGardens('user-123'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

## 🚀 Build & Deployment

### EAS Build Configuration

**Development Build:**
```bash
# Create development build
eas build --profile development --platform ios

# Install on device
eas build:run --profile development --platform ios
```

**Production Build:**
```bash
# Build for app stores
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios --path ./build.ipa
eas submit --platform android --path ./build.aab
```

### Environment-Specific Configurations

```typescript
// lib/config.ts
const isDev = __DEV__;
const isPreview = process.env.EAS_BUILD_PROFILE === 'preview';
const isProduction = process.env.EAS_BUILD_PROFILE === 'production';

export const config = {
  apiUrl: isDev 
    ? 'http://localhost:3000' 
    : isPreview 
    ? 'https://staging-api.example.com'
    : 'https://api.example.com',
    
  enableLogging: isDev || isPreview,
  enableAnalytics: isProduction,
  
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  }
};
```

### Over-the-Air Updates

```typescript
// lib/updates.ts
import * as Updates from 'expo-updates';

export async function checkForUpdates() {
  if (__DEV__) return; // Skip in development
  
  try {
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// In App.tsx
useEffect(() => {
  checkForUpdates();
}, []);
```

---

**📅 Last Updated:** January 2025  
**🎯 Launch Target:** January 27, 2025  
**📱 Ready for:** iOS App Store & Google Play Store