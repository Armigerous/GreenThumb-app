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
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
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
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function Page() {
  useWarmUpBrowser();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Animation related values
  const keyboardVisible = useSharedValue(0);

  // Listen for keyboard events with optimized immediate response
  useEffect(() => {
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPhone, setIsPhone] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Helper function to get user-friendly error messages
  const getFriendlyErrorMessage = (err: any): string => {
    // Check if it's a Clerk error
    if (err.clerkError) {
      // Handle specific error codes
      const errorCode = err.errors?.[0]?.code;

      switch (errorCode) {
        case "form_param_format_invalid":
          if (err.errors?.[0]?.meta?.paramName === "identifier") {
            return isPhone
              ? "The phone number format is invalid. Please check and try again."
              : "The email address format is invalid. Please check and try again.";
          }
          return "One of the provided fields has an invalid format.";
        case "form_identifier_not_found":
          return isPhone
            ? "We couldn't find an account with that phone number. Please check your number or sign up."
            : "We couldn't find an account with that email. Please check your email or sign up.";
        case "form_password_incorrect":
          return "Incorrect password. Please try again or use 'Forgot password'.";
        case "form_identifier_email_address_verification_required":
          return "Please verify your email address before signing in.";
        case "form_identifier_phone_number_verification_required":
          return "Please verify your phone number before signing in.";
        case "network_failure":
          return "Network connection issue. Please check your internet connection and try again.";
        default:
          // Return the actual error message if available
          return err.errors?.[0]?.message || "An error occurred during sign in";
      }
    }

    // Generic error handling
    return err.message || "An unexpected error occurred. Please try again.";
  };

  // Social sign-in handlers
  const onSignInWithGoogle = useCallback(async () => {
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
      console.error("Google Sign In Error:", err);
      setError(
        getFriendlyErrorMessage(err) ||
          "An error occurred during Google sign in"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSignInWithApple = useCallback(async () => {
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
      console.error("Apple Sign In Error:", err);
      setError(
        getFriendlyErrorMessage(err) || "An error occurred during Apple sign in"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSignInWithFacebook = useCallback(async () => {
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
      console.error("Facebook Sign In Error:", err);
      setError(
        getFriendlyErrorMessage(err) ||
          "An error occurred during Facebook sign in"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Email/Phone sign-in handler
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Basic validation
    if (!identifier.trim()) {
      setError(
        isPhone
          ? "Please enter your phone number"
          : "Please enter your email address"
      );
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else if (signInAttempt.status === "needs_first_factor") {
        // Handle phone verification if needed
        if (
          isPhone &&
          signInAttempt.firstFactorVerification.strategy === "phone_code"
        ) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: signInAttempt.supportedFirstFactors?.find(
              (factor) => factor.strategy === "phone_code"
            )?.phoneNumberId as string,
          });
          setPendingVerification(true);
        } else {
          setError("Please complete all required steps to sign in.");
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } else {
        setError("Please complete all required steps to sign in.");
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Verification handler for phone sign-in
  const onVerifyPress = async () => {
    if (!isLoaded || !verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clear input when switching between email and phone
  const handleIdentifierTypeChange = (usePhone: boolean) => {
    setIsPhone(usePhone);
    setIdentifier("");
    setError(null);
  };

  // Function to dismiss keyboard when clicking outside input areas
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    // Immediately start the animation without waiting for keyboardDidHide event
    keyboardVisible.value = withTiming(0, ANIMATION_CONFIG);
  };

  // Function to handle forgot password
  const handleForgotPassword = () => {
    // Implement forgot password functionality
    console.log("Forgot password pressed");
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1">
          <AuthHeader
            backPath="/(auth)/welcome"
            alternateAuthPath="/(auth)/sign-up"
            alternateAuthText="Sign up"
            alternateAuthIcon="person-add-outline"
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
                  imageSource={require("@/assets/images/sign-in-replace.png")}
                  title="Welcome Back!"
                  subtitle="Your gardens missed you"
                  keyboardVisible={keyboardVisible}
                />
                <AuthError error={error} />
              </View>

              {/* Bottom content - will stay at the bottom */}
              <View className="mt-auto">
                {!pendingVerification ? (
                  <AuthInputSection
                    isPhone={isPhone}
                    toggleIdentifierType={handleIdentifierTypeChange}
                    emailOrPhone={identifier}
                    setEmailOrPhone={setIdentifier}
                    password={password}
                    setPassword={setPassword}
                    onSubmit={onSignInPress}
                    isLoading={isLoading}
                    isSignUp={false}
                    showForgotPassword={true}
                    onForgotPasswordPress={handleForgotPassword}
                    animatedStyle={contentAnimatedStyle}
                  />
                ) : (
                  <VerificationInput
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    onVerify={onVerifyPress}
                    isLoading={isLoading}
                    isPhone={isPhone}
                  />
                )}

                {!pendingVerification && (
                  <Animated.View style={socialOptionsAnimatedStyle}>
                    <AuthSocialOptions
                      onGooglePress={onSignInWithGoogle}
                      onApplePress={onSignInWithApple}
                      onFacebookPress={onSignInWithFacebook}
                      isLoading={isLoading}
                      title="Or sign in with"
                    />
                  </Animated.View>
                )}

                <Animated.View style={footerAnimatedStyle}>
                  <AuthFooter isSignUp={false} linkPath="/(auth)/sign-up" />
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
