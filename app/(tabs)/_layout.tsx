import OverdueTasksModal from "@/components/UI/OverdueTasksModal";
import { useOverdueTasksNotifications } from "@/lib/hooks/useOverdueTasksNotifications";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useNavigationReady } from "@/lib/hooks/useNavigationReady";

export default function TabsLayout() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const navigationReady = useNavigationReady();

  // Get overdue task notifications using the correct hook
  const { loading, notifications, showModal, setShowModal } =
    useOverdueTasksNotifications();

  if (!navigationReady) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          // Brand colors according to BRAND_IDENTITY.md
          tabBarActiveTintColor: "#5E994B", // brand-600 - Primary brand color
          tabBarInactiveTintColor: "#636059", // cream-600 - Medium-dark text with good contrast
          tabBarStyle: {
            backgroundColor: "#fffefa", // cream-50 - Background color
            borderTopWidth: 1,
            borderTopColor: "#ded8ca", // cream-300 - Border color
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600", // Nunito SemiBold for UI elements
            fontFamily: "Nunito_600SemiBold", // Brand typography - Nunito for UI
          },
          headerShown: false,
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
