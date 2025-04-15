import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import OverdueTasksModal from "@/components/UI/OverdueTasksModal";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import { useUser } from "@clerk/clerk-expo";

// Custom tab bar component
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

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
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Special case for gardens tab - always navigate to index
            if (route.name === "gardens") {
              // Reset the gardens stack to just the index screen
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: route.name,
                    params: { screen: "index" },
                  },
                ],
              });
            } else {
              navigation.navigate(route.name);
            }
          } else if (isFocused && route.name === "gardens") {
            // Get the current route information to check if we're already on index
            const currentRoute = state.routes[state.index];
            const childState = currentRoute.state as any;

            // Only reset if we're not already on gardens/index
            if (
              childState &&
              (childState.index !== 0 || childState.routes[0].name !== "index")
            ) {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: route.name,
                    params: { screen: "index" },
                  },
                ],
              });
            }
            // Otherwise, do nothing if already on gardens/index to prevent flickering
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
