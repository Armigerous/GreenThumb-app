import OverdueTasksModal from "@/components/UI/OverdueTasksModal";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // Get overdue task notifications using the correct hook
  const { loading, notifications, showModal, setShowModal } =
    useOverdueTasksNotifications();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#22c55e",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
          headerShown: false,
        }}
      >
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
          name="plants"
          options={{
            title: "Plants",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flower" size={size} color={color} />
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

        {/* Hidden subscription screens - no tab bar icons */}
        <Tabs.Screen
          name="pricing"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="checkout"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="subscription"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="subscription-success"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
      </Tabs>

      {/* Overdue Tasks Modal */}
      <OverdueTasksModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        notifications={notifications}
      />
    </>
  );
}
