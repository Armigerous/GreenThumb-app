import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Image,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useSubscriptionSummary } from "@/lib/subscriptionQueries";
import type { UserSubscriptionWithAddons } from "@/types/subscription";

// Components
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";
import SubmitButton from "@/components/UI/SubmitButton";

// Types
interface ProfileSectionProps {
  children: React.ReactNode;
  className?: string;
}

// Profile Section Component
function ProfileSection({ children, className = "" }: ProfileSectionProps) {
  return (
    <View
      className={`bg-cream-100 border border-cream-300 rounded-lg p-4 mb-4 shadow-sm ${className}`}
    >
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showHelpContent, setShowHelpContent] = useState(false);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);

  // Subscription summary (premium status, plan, etc.)
  const {
    data: subscriptionSummary,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
  } = useSubscriptionSummary(user?.id);

  // Check notification status on load
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (!Device.isDevice) return;

        const { status } = await Notifications.getPermissionsAsync();
        const savedPreference = await AsyncStorage.getItem(
          `notifications_${user?.id}`
        );

        if (savedPreference !== null) {
          setNotificationsEnabled(savedPreference === "true");
        } else {
          setNotificationsEnabled(status === "granted");
        }
      } catch (error) {
        console.error("Failed to check notification status:", error);
      }
    };

    checkNotificationStatus();
  }, [user?.id]);

  // Handlers
  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await signOut();
            router.replace("/(auth)/welcome");
          } catch (error) {
            Alert.alert("Error", "Failed to log out. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          "Notifications",
          "Notifications are not available on simulator."
        );
        return;
      }

      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive plant care reminders.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      setNotificationsEnabled(value);
      if (user?.id) {
        await AsyncStorage.setItem(
          `notifications_${user.id}`,
          value.toString()
        );
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      Alert.alert("Error", "Failed to update notification settings.");
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing will be available soon!", [
      { text: "OK", style: "default" },
    ]);
  };

  const handleContactSupport = () => {
    Linking.openURL(
      "mailto:info@theofficialgreenthumb.com?subject=GreenThumb Support"
    );
  };

  const handleManageSubscription = () => {
    router.push("/(tabs)/subscription");
  };

  const handleRequestExpertAdvice = () => {
    Alert.alert(
      "Expert Advice",
      "Expert consultation is available for Premium members. This feature will be available soon!",
      [{ text: "OK", style: "default" }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert("Privacy Policy", "Privacy policy will be available soon!");
  };

  const handleTerms = () => {
    Alert.alert("Terms of Service", "Terms of service will be available soon!");
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Data export will be available soon!");
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete Data",
      "This will permanently delete all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive" },
      ]
    );
  };

  const handleFeedback = () => {
    Linking.openURL(
      "mailto:feedback@theofficialgreenthumb.com?subject=GreenThumb Feedback"
    );
  };

  // Get user's first name for greeting
  const firstName = user?.firstName || "Plant Parent";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  return (
    <PageContainer scroll={false} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-5 pb-4">
          <TitleText className="text-3xl text-cream-800">Profile</TitleText>
        </View>

        <View className="px-5 pb-8">
          {/* User Identity Section - Improved layout */}
          <View className="mb-4">
            <View className="flex-row items-center gap-x-4">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-brand-100 border-2 border-brand-200 items-center justify-center">
                  <Ionicons
                    name="person"
                    size={32}
                    color="#5E994B" /* brand-600 */
                  />
                </View>
              )}

              <View className="flex-1 justify-center">
                <SubtitleText className="text-xl text-cream-800 mb-1">
                  {user?.firstName} {user?.lastName}
                </SubtitleText>
                <BodyText className="text-sm text-cream-600 mb-2">
                  {userEmail}
                </BodyText>
                <TouchableOpacity onPress={handleEditProfile}>
                  <BodyText className="text-sm text-brand-700 font-paragraph-semibold underline">
                    Edit Profile
                  </BodyText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting - no background for visual simplicity, but using darker text for contrast */}
            <View className="my-6">
              <BodyText className="text-base text-cream-800 text-center">
                Hi {firstName}! 🌱
              </BodyText>
              <BodyText className="text-sm text-cream-700 text-center mt-1">
                Your plants are lucky to have you.
              </BodyText>
            </View>
          </View>

          {/* Subscription Status Section */}
          {isSubscriptionLoading ? (
            // Loading state for subscription info
            <ProfileSection>
              <BodyText className="text-sm text-cream-700">
                Loading subscription status...
              </BodyText>
            </ProfileSection>
          ) : subscriptionError ? (
            // Error state for subscription info
            <ProfileSection>
              <BodyText className="text-sm text-destructive">
                Failed to load subscription status.
              </BodyText>
            </ProfileSection>
          ) : subscriptionSummary?.is_premium ? (
            // Premium member UI
            <ProfileSection>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons
                    name="star"
                    size={20}
                    color="#5E994B" /* brand-600 */
                  />
                  <SubtitleText className="text-lg text-cream-800 ml-2">
                    Premium Member
                  </SubtitleText>
                </View>
                <TouchableOpacity onPress={handleManageSubscription}>
                  <BodyText className="text-sm text-primary-foreground font-paragraph-semibold px-4 py-2 rounded-lg bg-brand-600">
                    Manage
                  </BodyText>
                </TouchableOpacity>
              </View>
              {/* Triple Guarantee Badge */}
              <View className="bg-accent-200 border border-accent-300 rounded-lg p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color="#483b00" /* accent-800 */
                  />
                  <BodyText className="text-sm font-paragraph-semibold text-accent-800 ml-2">
                    Triple Guarantee
                  </BodyText>
                </View>
                <BodyText className="text-xs text-accent-800">
                  Service, money-back, and plant replacement guarantees
                </BodyText>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setShowSubscriptionDetails(!showSubscriptionDetails)
                }
                className="flex-row items-center justify-center"
              >
                <BodyText className="text-sm text-brand-600 mr-1">
                  {showSubscriptionDetails ? "Hide details" : "Show details"}
                </BodyText>
                <Ionicons
                  name={showSubscriptionDetails ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#5E994B"
                />
              </TouchableOpacity>
              {showSubscriptionDetails && (
                <View className="mt-3 bg-white border border-cream-200 rounded-lg p-3">
                  <BodyText className="text-sm text-cream-700 mb-2">
                    Your subscription includes:
                  </BodyText>
                  <View className="space-y-1">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#5E994B"
                      />
                      <BodyText className="text-xs text-cream-700 ml-2">
                        Expert plant care guidance
                      </BodyText>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#5E994B"
                      />
                      <BodyText className="text-xs text-cream-700 ml-2">
                        Advanced plant health tracking
                      </BodyText>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#5E994B"
                      />
                      <BodyText className="text-xs text-cream-700 ml-2">
                        Priority customer support
                      </BodyText>
                    </View>
                  </View>
                  {/* List add-ons if present */}
                  {(
                    subscriptionSummary.subscription as UserSubscriptionWithAddons
                  )?.addons &&
                    (
                      subscriptionSummary.subscription as UserSubscriptionWithAddons
                    ).addons.length > 0 && (
                      <View className="mt-3">
                        <BodyText className="text-sm text-cream-700 mb-1">
                          Add-ons:
                        </BodyText>
                        {(
                          subscriptionSummary.subscription as UserSubscriptionWithAddons
                        ).addons.map((addon) => (
                          <View
                            key={addon.userAddon.id}
                            className="flex-row items-center mb-1"
                          >
                            <Ionicons
                              name="add-circle"
                              size={14}
                              color="#5E994B" /* brand-600 */
                            />
                            <BodyText className="text-xs text-cream-700 ml-2">
                              {addon.addon?.name}
                            </BodyText>
                          </View>
                        ))}
                      </View>
                    )}
                </View>
              )}
            </ProfileSection>
          ) : (
            // Not premium: show upgrade prompt
            <ProfileSection>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons
                    name="star-outline"
                    size={20}
                    color="#5E994B" /* brand-600 */
                  />
                  <SubtitleText className="text-lg text-cream-800 ml-2">
                    Free Member
                  </SubtitleText>
                </View>
                <TouchableOpacity onPress={handleManageSubscription}>
                  <BodyText className="text-sm text-primary-foreground font-paragraph-semibold px-4 py-2 rounded-lg bg-brand-600">
                    Upgrade
                  </BodyText>
                </TouchableOpacity>
              </View>
              <BodyText className="text-sm text-cream-700">
                Unlock premium features and expert support by upgrading to
                Premium.
              </BodyText>
            </ProfileSection>
          )}

          {/* Notification Preferences - Redesigned */}
          <View className="bg-brand-50 border border-brand-100 rounded-lg p-4 mb-4 shadow-sm flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="notifications"
                  size={22}
                  color="#5E994B" /* brand-600 */
                />
                <SubtitleText className="text-lg text-cream-800 ml-2">
                  Notifications
                </SubtitleText>
              </View>
              <BodyText className="text-sm text-cream-700 mb-0.5">
                Remind me to care for my plants
              </BodyText>
              <BodyText className="text-xs text-cream-600">
                We&apos;ll send gentle reminders—never spam.
              </BodyText>
            </View>
            <Switch
              trackColor={{ false: "#ded8ca", true: "#77B860" }} // brand-500 for true, cream-300 for false
              thumbColor={notificationsEnabled ? "#5E994B" : "#fffefa"} // brand-600 for true, cream-50 for false
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }} // Reason: Larger, more accessible switch
            />
          </View>

          {/* Help & Support - Redesigned */}
          <View className="bg-cream-100 border border-cream-300 rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="help-circle"
                size={20}
                color="#5E994B" /* brand-600 */
              />
              <SubtitleText className="text-lg text-cream-800 ml-2">
                Help & Support
              </SubtitleText>
            </View>
            <View className="divide-y divide-cream-200">
              <TouchableOpacity
                onPress={handleContactSupport}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="mail"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Contact Support
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestExpertAdvice}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="person"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Request Expert Advice
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFeedback}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="chatbubble"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Share Feedback
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy & Legal - Redesigned */}
          <View className="bg-cream-100 border border-cream-300 rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#5E994B" /* brand-600 */
              />
              <SubtitleText className="text-lg text-cream-800 ml-2">
                Privacy & Legal
              </SubtitleText>
            </View>
            <View className="divide-y divide-cream-200">
              <TouchableOpacity
                onPress={handlePrivacyPolicy}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="document-text"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Privacy Policy
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTerms}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="document"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Terms of Service
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExportData}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="cloud-download"
                  size={18}
                  color="#5E994B" /* brand-600 */
                />
                <BodyText className="text-base text-cream-800 ml-3 flex-1">
                  Export My Data
                </BodyText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#A5D196" /* brand-300 */
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteData}
                className="flex-row items-center py-3 active:bg-brand-50 rounded-lg"
              >
                <Ionicons
                  name="trash"
                  size={18}
                  color="#E50000" /* destructive */
                />
                <BodyText className="text-base text-destructive ml-3 flex-1">
                  Delete My Data
                </BodyText>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color="#E50000" /* destructive */
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className="mt-6">
            <SubmitButton
              onPress={handleLogout}
              isLoading={isLoading}
              loadingLabel="Logging out..."
              color="primary"
              type="solid"
              iconName="log-out-outline"
              iconPosition="left"
              width="full"
              className="bg-brand-600 text-primary-foreground border-none"
            >
              Log Out
            </SubmitButton>
          </View>

          {/* App Version */}
          <View className="mt-8 items-center">
            <BodyText className="text-xs text-cream-500">
              Version 1.0.0
            </BodyText>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
}
