import {
  AuthError,
  AuthFooter,
  AuthGreeting,
  AuthHeader,
  AuthInputSection,
  AuthSocialOptions,
  VerificationInput,
} from "@/components/Auth";
import { PageContainer } from "@/components/UI/PageContainer";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Optimized animation config to match native keyboard animation speed
const ANIMATION_CONFIG = {
  duration: 220, // Faster to match native keyboard speed
  easing: Easing.bezier(0.16, 1, 0.3, 1), // Fast at start, slower at end
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignUpScreen() {
  useWarmUpBrowser();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Animation related values
  const keyboardVisible = useSharedValue(0);

  // Listen for keyboard events with optimized immediate response
  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      // Update immediately when keyboard starts showing
      keyboardVisible.value = withTiming(1, ANIMATION_CONFIG);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      // Update immediately when keyboard starts hiding
      keyboardVisible.value = withTiming(0, ANIMATION_CONFIG);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Optimized animated styles for faster response
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // Apply directly without extra interpolation to avoid delay
    return {
      transform: [
        {
          translateY: withTiming(
            interpolate(
              keyboardVisible.value,
              [0, 0.7], // React earlier in the animation
              [0, -90],
              Extrapolation.CLAMP
            ),
            ANIMATION_CONFIG
          ),
        },
      ],
    };
  });

  const socialOptionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(
          keyboardVisible.value,
          [0, 0.5], // Fade out faster for smoother transition
          [1, 0],
          Extrapolation.CLAMP
        ),
        ANIMATION_CONFIG
      ),
      transform: [
        {
          translateY: withTiming(
            interpolate(
              keyboardVisible.value,
              [0, 0.7], // React earlier
              [0, 20],
              Extrapolation.CLAMP
            ),
            ANIMATION_CONFIG
          ),
        },
      ],
    };
  });

  const footerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(
          keyboardVisible.value,
          [0, 0.5], // Fade out faster
          [1, 0],
          Extrapolation.CLAMP
        ),
        ANIMATION_CONFIG
      ),
    };
  });

  // Authentication states
  const [isPhone, setIsPhone] = React.useState(false);
  const [emailAddress, setEmailAddress] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");

  // Helper function to get user-friendly error messages
  const getFriendlyErrorMessage = (err: any): string => {
    // Check if it's a Clerk error
    if (err.clerkError) {
      // Handle specific error codes
      const errorCode = err.errors?.[0]?.code;

      switch (errorCode) {
        case "form_param_format_invalid":
          if (err.errors?.[0]?.meta?.paramName === "email_address") {
            return "The email address format is invalid. Please check and try again.";
          }
          if (err.errors?.[0]?.meta?.paramName === "phone_number") {
            return "The phone number format is invalid. Please check and try again.";
          }
          return "One of the provided fields has an invalid format.";
        case "form_identifier_exists":
          return isPhone
            ? "An account with this phone number already exists. Try signing in instead."
            : "An account with this email already exists. Try signing in instead.";
        case "form_password_pwned":
          return "This password has been compromised in a data breach. Please choose a more secure password.";
        case "form_password_validation_failed":
          return "Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.";
        case "network_failure":
          return "Network connection issue. Please check your internet connection and try again.";
        default:
          // Return the actual error message if available
          return err.errors?.[0]?.message || "An error occurred during sign up";
      }
    }

    // Generic error handling
    return err.message || "An unexpected error occurred. Please try again.";
  };

  // Social sign-up handlers
  const onSignUpWithGoogle = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_google",
        });

      if (createdSessionId) {
        setActiveSession!({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      console.error("Google Sign Up Error:", err);
      setError(
        getFriendlyErrorMessage(err) ||
          "An error occurred during Google sign up"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSignUpWithApple = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_apple",
        });

      if (createdSessionId) {
        setActiveSession!({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      console.error("Apple Sign Up Error:", err);
      setError(
        getFriendlyErrorMessage(err) || "An error occurred during Apple sign up"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSignUpWithFacebook = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_facebook",
        });

      if (createdSessionId) {
        setActiveSession!({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      console.error("Facebook Sign Up Error:", err);
      setError(
        getFriendlyErrorMessage(err) ||
          "An error occurred during Facebook sign up"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Email/Phone sign-up handler
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    // Basic validation
    if (isPhone && !phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    if (!isPhone && !emailAddress.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isPhone) {
        // Phone sign up
        await signUp.create({
          phoneNumber,
          password,
        });

        await signUp.preparePhoneNumberVerification({
          strategy: "phone_code",
        });
      } else {
        // Email sign up
        await signUp.create({
          emailAddress,
          password,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }

      setPendingVerification(true);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Verification handler
  const onPressVerify = async () => {
    if (!isLoaded || !verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let completeSignUp;

      if (isPhone) {
        // Verify phone
        completeSignUp = await signUp.attemptPhoneNumberVerification({
          code: verificationCode,
        });
      } else {
        // Verify email
        completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });
      }

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace("/");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between email and phone sign-up
  const toggleIdentifierType = (usePhone: boolean) => {
    setIsPhone(usePhone);
    setEmailAddress("");
    setPhoneNumber("");
    setError(null);
  };

  // Function to dismiss keyboard when clicking outside input areas
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    // Immediately start the animation without waiting for keyboardDidHide event
    keyboardVisible.value = withTiming(0, ANIMATION_CONFIG);
  };

  const getEmailOrPhone = () => (isPhone ? phoneNumber : emailAddress);
  const setEmailOrPhone = (value: string) => {
    if (isPhone) {
      setPhoneNumber(value);
    } else {
      setEmailAddress(value);
    }
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1">
          <AuthHeader
            backPath="/(auth)/welcome"
            alternateAuthPath="/(auth)/sign-in"
            alternateAuthText="Sign In"
            alternateAuthIcon="log-in-outline"
          />

          <View className="flex-1 px-5 pb-2">
            {/* Flex container for top and bottom content */}
            <Animated.View
              style={contentAnimatedStyle}
              className="flex-1 flex-col justify-between"
            >
              {/* Top content - will take available space but not push bottom content */}
              <View className="flex-1 flex-col justify-between">
                <AuthGreeting
                  imageSource={require("@/assets/images/sign-up-replace.png")}
                  title="Create an Account"
                  subtitle="Let's begin something meaningful"
                  keyboardVisible={keyboardVisible}
                />
                <AuthError error={error} />
              </View>

              {/* Bottom content - will stay at the bottom */}
              <View className="mt-auto">
                {!pendingVerification ? (
                  <>
                    <AuthInputSection
                      isPhone={isPhone}
                      toggleIdentifierType={toggleIdentifierType}
                      emailOrPhone={getEmailOrPhone()}
                      setEmailOrPhone={setEmailOrPhone}
                      password={password}
                      setPassword={setPassword}
                      onSubmit={onSignUpPress}
                      isLoading={isLoading}
                      isSignUp={true}
                      animatedStyle={contentAnimatedStyle}
                    />

                    <Animated.View style={socialOptionsAnimatedStyle}>
                      <AuthSocialOptions
                        onGooglePress={onSignUpWithGoogle}
                        onApplePress={onSignUpWithApple}
                        onFacebookPress={onSignUpWithFacebook}
                        isLoading={isLoading}
                        title="Or sign up with"
                      />
                    </Animated.View>
                  </>
                ) : (
                  <VerificationInput
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    onVerify={onPressVerify}
                    isLoading={isLoading}
                    isPhone={isPhone}
                  />
                )}

                <Animated.View style={footerAnimatedStyle}>
                  <AuthFooter isSignUp={true} linkPath="/(auth)/sign-in" />
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
