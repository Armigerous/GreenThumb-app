import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import OverdueTasksModal from "@/components/UI/OverdueTasksModal";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import { useUser } from "@clerk/clerk-expo";

// Simple tab configuration
const tabs = [
  {
    name: "gardens",
    title: "Gardens",
    icon: "leaf",
    href: "/(home)/gardens",
  },
  {
    name: "calendar", 
    title: "Calendar",
    icon: "calendar",
    href: "/(home)/calendar",
  },
  {
    name: "index",
    title: "Home", 
    icon: "home",
    href: "/(home)",
  },
  {
    name: "plants",
    title: "Plants",
    icon: "book", 
    href: "/(home)/plants",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person",
    href: "/(home)/profile",
  },
];

// Custom tab bar component using only Expo Router
function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      className="flex-row bg-cream-800"
      style={{
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 15,
        height: 70 + (insets.bottom > 0 ? insets.bottom : 0) + 15,
      }}
    >
      {tabs.map((tab) => {
        // Determine if this tab is focused based on current pathname
        const isFocused = 
          pathname === tab.href || 
          (tab.name === "index" && pathname === "/(home)") ||
          pathname.startsWith(`/(home)/${tab.name}`);

        const onPress = () => {
          try {
            if (!isFocused) {
              router.push(tab.href);
            } else if (tab.name === "gardens") {
              // For gardens tab, refresh to index if already focused
              router.push("/(home)/gardens");
            }
          } catch (error) {
            console.warn("Navigation error:", error);
          }
        };

        return (
          <Pressable
            key={tab.name}
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
              <Ionicons 
                name={tab.icon as any}
                size={24}
                color={isFocused ? "#5E994B" : "#6b7280"}
              />
            </View>

            {isFocused && (
              <Text className="text-xs font-medium text-primary mt-1">
                {tab.title}
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
        tabBar={() => <CustomTabBar />}
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
