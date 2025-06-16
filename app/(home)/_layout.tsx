import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import OverdueTasksModal from "@/components/UI/OverdueTasksModal";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import { useUser } from "@clerk/clerk-expo";

// Define tab bar props interface for Expo Router
interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
    }>;
  };
  descriptors: Record<string, {
    options: {
      title?: string;
      tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    };
  }>;
}

// Custom tab bar component for Expo Router
function CustomTabBar({ state, descriptors }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row bg-cream-800"
      style={{
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 15,
        height: 70 + (insets.bottom > 0 ? insets.bottom : 0) + 15,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            // Map route names to their paths
            const routeMap: Record<string, string> = {
              'index': '/(home)/',
              'gardens': '/(home)/gardens',
              'calendar': '/(home)/calendar',
              'plants': '/(home)/plants',
              'profile': '/(home)/profile',
            };

            const targetPath = routeMap[route.name];
            if (targetPath) {
              router.push(targetPath);
            }
          } else if (isFocused && route.name === "gardens") {
            // If already on gardens, navigate to gardens index
            router.push('/(home)/gardens/');
          }
        };

        // Get the icon component from options
        const IconComponent = options.tabBarIcon;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center"
          >
            <View
              className={`items-center justify-center p-2 ${
                isFocused ? "border-2 border-brand-800/50 rounded-md" : ""
              }`}
              style={{
                width: 50,
                height: 50,
                backgroundColor: isFocused
                  ? "rgba(94, 153, 75, 0.1)"
                  : "transparent",
              }}
            >
              {IconComponent &&
                IconComponent({
                  focused: isFocused,
                  color: isFocused ? "#5E994B" : "#6b7280",
                  size: 24,
                })}
            </View>

            {isFocused && (
              <Text className="text-xs font-medium text-primary mt-1">
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HomeLayout() {
  // Track if this is the first render to disable animations on first load
  const [isInitialRender, setIsInitialRender] = useState(true);
  const { user } = useUser();

  // Get overdue task notifications
  const { notifications, showModal, setShowModal, checkNotifications } =
    useOverdueTasksNotifications();

  useEffect(() => {
    // After first render, enable animations for future tab changes
    if (isInitialRender) {
      const timer = setTimeout(() => {
        setIsInitialRender(false);
      }, 300); // Short delay to ensure first screen renders completely

      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  // For debugging, log whenever the modal state changes
  useEffect(() => {
    console.log("Modal visible state changed:", showModal);
    console.log("Notifications:", notifications);
  }, [showModal, notifications]);

  return (
    <>
      {/* Debug Button - only in development */}
      {process.env.NODE_ENV === "development" && (
        <TouchableOpacity
          className="bg-black/50 rounded-lg mt-safe z-1000 px-4 py-2"
          onPress={() => {
            console.log("Forcing notification check...");
            checkNotifications();
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            Check Notifications
          </Text>
        </TouchableOpacity>
      )}

      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="gardens"
          options={{
            title: "Gardens",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="plants"
          options={{
            title: "Plants",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Overdue Tasks Notification Modal */}
      {user && notifications.length > 0 && (
        <OverdueTasksModal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          notifications={notifications}
        />
      )}
    </>
  );
}
