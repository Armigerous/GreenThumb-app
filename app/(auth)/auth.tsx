import {
  AuthSocialOptions,
  PhoneCollectionScreen,
  VerificationInput,
  AuthInput,
  AuthButton,
} from "@/components/Auth";
import {
  validateFieldOnSubmit,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateVerificationCode,
} from "@/lib/validation";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, BodyText } from "@/components/UI/Text";
import { useSignIn, useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Pressable,
  Alert,
  KeyboardEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

// Warm up the android browser to improve UX
const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

type AuthMode = "signin" | "signup" | "oauth_completion";
type OnboardingStep = "auth" | "phone" | "verification";

export default function UnifiedAuthScreen() {
  useWarmUpBrowser();
  const {
    signIn,
    setActive: setActiveSignIn,
    isLoaded: isSignInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setActiveSignUp,
    isLoaded: isSignUpLoaded,
  } = useSignUp();
  const { startSSOFlow } = useSSO();

  // Log component mount
  React.useEffect(() => {
    console.log(
      "📱 Auth Screen: Component mounted - User arrived at unified auth screen"
    );
  }, []);

  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State management
  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>("auth");
  const [authMode, setAuthMode] = React.useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form data
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("+1 ");
  const [password, setPassword] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");

  // Smart validation states
  const [shouldValidatePasswordStrength, setShouldValidatePasswordStrength] =
    React.useState(false);
  const [shouldValidateEmailStrength, setShouldValidateEmailStrength] =
    React.useState(false);

  // OAuth completion data
  const [oauthEmail, setOauthEmail] = React.useState("");
  const [oauthFirstName, setOauthFirstName] = React.useState("");

  // Animation values
  const slideAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(1);

  // Keyboard animation values
  const keyboardHeight = useSharedValue(0);
  const imageScale = useSharedValue(1);
  const textScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const socialOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);

  // Input positioning values
  const inputContainerTranslateY = useSharedValue(0);

  // Screen dimensions as shared values to avoid accessing during render
  const screenWidth = useSharedValue(width);
  const screenHeight = useSharedValue(height);
  const safeAreaTop = useSharedValue(insets.top);
  const safeAreaBottom = useSharedValue(insets.bottom);

  // Update shared values when dimensions change
  React.useEffect(() => {
    screenWidth.value = width;
    screenHeight.value = height;
    safeAreaTop.value = insets.top;
    safeAreaBottom.value = insets.bottom;
  }, [width, height, insets.top, insets.bottom]);

  // Clear any stale state when component mounts
  React.useEffect(() => {
    // Only reset if we're not in the middle of a flow
    if (currentStep === "auth" && !email && !phoneNumber) {
      resetAuthState();
    }
  }, []);

  // Calculate base image size using derived value to avoid render-time access
  const baseImageSize = useDerivedValue(() => {
    const availableHeight =
      screenHeight.value - safeAreaTop.value - safeAreaBottom.value;
    return Math.min(
      Math.max(availableHeight * 0.4, 200),
      screenWidth.value * 0.8,
      350
    );
  });

  // Function to dismiss keyboard when clicking outside input areas
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Reset all auth state to initial values
  const resetAuthState = () => {
    setEmail("");
    setPhoneNumber("+1 ");
    setPassword("");
    setVerificationCode("");
    setOauthEmail("");
    setOauthFirstName("");
    setAuthMode("signin");
    setCurrentStep("auth");
    setError(null);
    setShouldValidatePasswordStrength(false);
    setShouldValidateEmailStrength(false);

    // Reset animations to initial state
    slideAnimation.value = 0;
    fadeAnimation.value = 1;
    socialOpacity.value = 1;

    console.log("Auth state reset to initial values");
  };

  // Smart email validation logic
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);

    // Enable email validation if:
    // 1. We're already in signup mode (user tried to sign in and it failed)
    // 2. User is typing a longer email (likely being careful with new account)
    // 3. Email shows signs of being newly created (uncommon domains, plus signs, etc.)
    if (
      authMode === "signup" ||
      newEmail.length >= 25 ||
      (newEmail.includes("+") && newEmail.includes("@")) || // Email aliasing (power users)
      /\.(dev|test|temp|new|fresh)@/.test(newEmail) || // Development/temp domains
      newEmail.split("@")[0]?.length >= 15 // Long local part (careful typing)
    ) {
      setShouldValidateEmailStrength(true);
    }
  };

  // Smart password validation logic
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);

    // Enable password strength validation if:
    // 1. We're already in signup mode (user tried to sign in and it failed)
    // 2. User is typing a longer password (>= 10 chars, likely creating new one)
    // 3. Password shows signs of being newly created (mixed case + numbers + symbols)
    if (
      authMode === "signup" ||
      newPassword.length >= 10 ||
      (newPassword.length >= 8 &&
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword))
    ) {
      setShouldValidatePasswordStrength(true);
    }
  };

  const isSmallDevice = width < 380;

  // Keyboard event handlers
  React.useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      const keyboardHeightValue = event.endCoordinates.height;
      keyboardHeight.value = keyboardHeightValue;

      // Calculate precise positioning for input fields above keyboard
      const buttonHeight = 56; // AuthButton height
      const inputHeight = 56; // AuthInput height (each field)
      const emailLabelHeight = 24; // Email label height
      const passwordLabelHeight = 24; // Password label height
      const forgotPasswordHeight = 24; // "Forgot password" link height
      const inputSpacing = 16; // Space between email input and password label (mb-2 = 8px + natural spacing)
      const errorSpacing = 40; // Space for potential error message
      const inputButtonSpacing = 24; // Space between password input and button (mt-6 = 24px)
      const keyboardSpacing = 20; // Desired space above keyboard
      const headerHeight = 60; // Back button header height

      // Calculate total height needed for all input elements
      const totalInputAreaHeight =
        emailLabelHeight +
        inputHeight + // email input
        inputSpacing +
        passwordLabelHeight +
        inputHeight + // password input
        errorSpacing +
        inputButtonSpacing +
        buttonHeight;

      // Calculate the total screen space available above keyboard (from top of screen)
      const screenSpaceAboveKeyboard = height - keyboardHeightValue;

      // Where should the button be? (20px above keyboard)
      const targetButtonBottom = screenSpaceAboveKeyboard - keyboardSpacing;

      // Where should the email label start? (work backwards from button)
      const targetEmailLabelTop = targetButtonBottom - totalInputAreaHeight;

      // The input container is currently positioned after the header and image/text area
      // When keyboard is hidden, it sits in the flex-1 area after the image
      // We need to calculate how much to move it up to reach our target position

      // Estimate current position: safe area + header + scaled image + text + some spacing
      const scaledImageHeight = baseImageSize.value * 0.4; // Image scales to 0.4
      const textHeight = 80; // Approximate text height (title + subtitle)
      const imageTextSpacing = 16; // mb-4 spacing after image
      const contentTopSpacing = 16; // pt-4 spacing in header container
      const textBottomSpacing = 24; // mb-6 spacing after text

      const currentInputTop =
        insets.top +
        headerHeight +
        contentTopSpacing +
        scaledImageHeight +
        imageTextSpacing +
        textHeight +
        textBottomSpacing;

      // Calculate the translation needed
      const translationNeeded = targetEmailLabelTop - currentInputTop;

      inputContainerTranslateY.value = withSpring(translationNeeded, {
        damping: 20,
        stiffness: 300,
      });

      // Animate image and text shrinking
      imageScale.value = withSpring(0.4, {
        damping: 20,
        stiffness: 300,
      });

      textScale.value = withSpring(0.7, {
        damping: 20,
        stiffness: 300,
      });

      headerOpacity.value = withTiming(0.3, {
        duration: 300,
      });

      textOpacity.value = withTiming(0.3, {
        duration: 300,
      });

      // Hide social options completely
      socialOpacity.value = withTiming(0, {
        duration: 200,
      });
    };

    const keyboardWillHide = () => {
      keyboardHeight.value = 0;

      // Reset input container position
      inputContainerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });

      // Restore image and text
      imageScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });

      textScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });

      headerOpacity.value = withTiming(1, {
        duration: 300,
      });

      textOpacity.value = withTiming(1, {
        duration: 300,
      });

      // Show social options again (only on auth step)
      if (currentStep === "auth") {
        socialOpacity.value = withTiming(1, {
          duration: 300,
        });
      }
    };

    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardWillHide",
      keyboardWillHide
    );

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [
    currentStep,
    keyboardHeight,
    imageScale,
    textScale,
    headerOpacity,
    socialOpacity,
    textOpacity,
    inputContainerTranslateY,
    height,
    insets.top,
    baseImageSize,
  ]);

  const handleBackPress = () => {
    if (currentStep === "auth") {
      console.log(
        "🔙 Auth Screen: Back button pressed - returning to welcome screen"
      );
      console.log(
        "📍 Navigation triggered from: Auth Screen -> Welcome Screen (Back)"
      );
      router.push("/(auth)/welcome");
    } else {
      // Go back to auth step
      console.log(
        `🔙 Auth Screen: Back button pressed - returning to auth step from ${currentStep}`
      );
      console.log(`📍 Step transition: ${currentStep} -> auth (Back)`);
      animateToStep("auth");
      setError(null);
    }
  };

  // Animation for step transitions
  const animateToStep = (step: OnboardingStep) => {
    fadeAnimation.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setCurrentStep)(step);
      fadeAnimation.value = withTiming(1, { duration: 150 });

      // Reset social options visibility based on step
      if (step === "auth") {
        socialOpacity.value = withTiming(1, { duration: 300 });
      } else {
        socialOpacity.value = withTiming(0, { duration: 200 });
      }
    });
  };

  const stepAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
    };
  });

  // Keyboard-aware animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = imageScale.value;
    // Calculate the translation needed to make the image scale from the top
    // To keep the top edge fixed, we need to move up by the full height difference
    const originalHeight = baseImageSize.value;
    const scaledHeight = originalHeight * scale;
    const heightDifference = originalHeight - scaledHeight;
    // Move up by the full height difference to keep top edge in place
    const translateY = -heightDifference;

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const headerContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const imageScaleValue = imageScale.value;
    const textScaleValue = textScale.value;
    const originalHeight = baseImageSize.value;
    const scaledHeight = originalHeight * imageScaleValue;

    // Since the image now scales from the top (keeping top edge fixed),
    // the text needs to move up by the amount the image has shrunk
    // to maintain the same spacing from the bottom of the image
    const originalSpacing = 16; // mb-4 = 16px spacing in the original design
    const heightDifference = originalHeight - scaledHeight;

    // Move text up by the height difference, but add dynamic spacing
    // When image is full size (scale=1), use original spacing (0 offset)
    // When image is shrunk (scale=0.4), add more spacing (20px offset)
    const dynamicOffset = interpolate(
      imageScaleValue,
      [1, 0.4], // From full size to shrunk
      [0, 20], // From no offset to 20px offset
      Extrapolation.CLAMP
    );
    const translateY = -heightDifference + dynamicOffset;

    return {
      opacity: textOpacity.value,
      transform: [{ translateY }, { scale: textScaleValue }],
    };
  });

  const socialAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: socialOpacity.value,
      transform: [
        {
          translateY: interpolate(
            socialOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const scale = imageScale.value;
    // Calculate additional upward movement for content based on image shrinking
    const originalHeight = baseImageSize.value;
    const scaledHeight = originalHeight * scale;
    const heightDifference = originalHeight - scaledHeight;
    // Move content up by a portion of the space freed up by image shrinking
    const imageShrinkOffset = -heightDifference * 0.4;

    // Additional keyboard-based movement
    const keyboardOffset = interpolate(
      keyboardHeight.value,
      [0, 300],
      [0, -30],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        {
          translateY: imageShrinkOffset + keyboardOffset,
        },
      ],
    };
  });

  // Animated style specifically for input container positioning
  const inputContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: inputContainerTranslateY.value,
        },
      ],
    };
  });

  // OAuth handlers
  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple" | "oauth_facebook"
  ) => {
    if (!isSignInLoaded || !isSignUpLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({ strategy });

      if (createdSessionId && setActive) {
        // Existing user - complete sign in
        console.log("🚀 Auth Screen: OAuth existing user - navigating to home");
        console.log(
          "📍 Navigation triggered from: OAuth Social Auth -> Existing User"
        );
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      } else if (signUp?.emailAddress) {
        // New user - need phone number
        console.log(
          "🔄 Auth Screen: OAuth new user - moving to phone collection step"
        );
        console.log(
          "📍 Step transition: OAuth Social Auth -> Phone Collection"
        );
        setOauthEmail(signUp.emailAddress);
        setOauthFirstName(signUp.firstName || "");
        setAuthMode("oauth_completion");
        animateToStep("phone");
      } else if (signIn && setActiveSignIn) {
        // OAuth sign-in - complete directly
        console.log(
          "🚀 Auth Screen: OAuth sign-in complete - navigating to home"
        );
        console.log(
          "📍 Navigation triggered from: OAuth Social Auth -> Direct Sign-in"
        );
        await setActiveSignIn({ session: signIn.createdSessionId! });
        router.replace("/(tabs)");
      } else {
        // OAuth was cancelled or failed - reset state and stay on auth screen
        console.log("OAuth cancelled or failed - no session or signup created");
        resetAuthState();
      }
    } catch (err: any) {
      console.log("OAuth error:", err);
      const providerName = strategy.replace("oauth_", "");

      // Check if this is a user cancellation (common error messages)
      const errorMessage = err.errors?.[0]?.message || err.message || "";
      const isCancellation =
        errorMessage.includes("cancelled") ||
        errorMessage.includes("canceled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user_cancelled") ||
        err.code === "user_cancelled";

      if (isCancellation) {
        // User cancelled - reset state silently and stay on auth screen
        console.log("User cancelled OAuth - resetting state");
        resetAuthState();
      } else {
        // Actual error - show error message
        setError(errorMessage || `${providerName} sign-in failed`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => handleSocialAuth("oauth_google");
  const handleAppleAuth = () => handleSocialAuth("oauth_apple");
  const handleFacebookAuth = () => handleSocialAuth("oauth_facebook");

  // Manual auth handler - validates email + password, then proceeds to phone
  const handleManualAuth = async () => {
    // Validate email and password
    const emailValidation = validateFieldOnSubmit("email", email);
    // For password validation, we'll be more lenient initially since we try sign-in first
    // If sign-in fails and we need to create an account, Clerk will enforce its own password requirements
    const passwordValidation = validateFieldOnSubmit("password", password, {
      isSignUp: false,
    });

    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Please enter a valid email address");
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Please enter a valid password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to sign in first
      if (signIn && isSignInLoaded) {
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
            password,
          });

          if (signInAttempt?.status === "complete") {
            // Existing user with complete sign in - go directly to home
            console.log(
              "🚀 Auth Screen: Manual sign-in complete - navigating to home"
            );
            console.log(
              "📍 Navigation triggered from: Manual Auth -> Existing User Sign-in"
            );
            await setActiveSignIn({ session: signInAttempt.createdSessionId });
            router.replace("/(tabs)");
            return;
          } else if (signInAttempt?.status === "needs_second_factor") {
            // Needs verification
            console.log(
              "🔄 Auth Screen: Manual sign-in needs verification - moving to verification step"
            );
            console.log(
              "📍 Step transition: Manual Auth -> Verification (2FA)"
            );
            setAuthMode("signin");
            animateToStep("verification");
            return;
          }
        } catch (signInError: any) {
          // Sign in failed, try sign up
          if (signUp && isSignUpLoaded) {
            // Enable validation since we're now creating an account
            setShouldValidatePasswordStrength(true);
            setShouldValidateEmailStrength(true);

            const signUpAttempt = await signUp.create({
              emailAddress: email,
              password,
            });

            if (signUpAttempt?.status === "missing_requirements") {
              // New user - proceed to phone step
              console.log(
                "🔄 Auth Screen: Manual sign-up needs requirements - moving to phone step"
              );
              console.log(
                "📍 Step transition: Manual Auth -> Phone Collection (New User)"
              );
              setAuthMode("signup");
              animateToStep("phone");
              return;
            } else if (signUpAttempt?.status === "complete") {
              // Account created successfully - go to phone step
              console.log(
                "🔄 Auth Screen: Manual sign-up complete - moving to phone step"
              );
              console.log(
                "📍 Step transition: Manual Auth -> Phone Collection (Account Created)"
              );
              setAuthMode("signup");
              animateToStep("phone");
              return;
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Phone step handler
  const handlePhoneSubmit = async () => {
    // Validate phone number
    const phoneValidation = validateFieldOnSubmit("phone", phoneNumber, {
      isRequired: true,
    });
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (authMode === "oauth_completion" || authMode === "signup") {
        // Add phone number to signup and prepare for verification
        const signUpAttempt = await signUp?.update({
          phoneNumber: phoneNumber,
        });

        if (signUpAttempt?.status === "complete" && setActiveSignUp) {
          // Account is complete, no verification needed
          console.log(
            "🚀 Auth Screen: Phone collection complete - navigating to home"
          );
          console.log(
            "📍 Navigation triggered from: Phone Collection -> Account Complete"
          );
          await setActiveSignUp({ session: signUpAttempt.createdSessionId });
          router.replace("/(tabs)");
        } else if (
          signUpAttempt?.status === "missing_requirements" ||
          signUpAttempt?.unverifiedFields?.includes("phone_number")
        ) {
          // Phone verification is required
          console.log(
            "🔄 Auth Screen: Phone verification required - moving to verification step"
          );
          console.log("📍 Step transition: Phone Collection -> Verification");
          await signUp?.preparePhoneNumberVerification({
            strategy: "phone_code",
          });
          animateToStep("verification");
        } else {
          // Unexpected status, try to proceed to verification anyway
          console.log(
            "🔄 Auth Screen: Unexpected phone status - proceeding to verification"
          );
          console.log(
            "📍 Step transition: Phone Collection -> Verification (Fallback)"
          );
          await signUp?.preparePhoneNumberVerification({
            strategy: "phone_code",
          });
          animateToStep("verification");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to add phone number");
    } finally {
      setIsLoading(false);
    }
  };

  // Verification handler
  const handleVerificationSubmit = async () => {
    // Validate verification code
    const codeValidation = validateFieldOnSubmit(
      "verification",
      verificationCode
    );
    if (!codeValidation.isValid) {
      setError(
        codeValidation.error || "Please enter a valid verification code"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (authMode === "signin") {
        // For sign-in, verify the second factor (phone code)
        const signInAttempt = await signIn?.attemptSecondFactor({
          strategy: "phone_code",
          code: verificationCode,
        });

        if (signInAttempt?.status === "complete" && setActiveSignIn) {
          console.log(
            "🚀 Auth Screen: Verification complete (sign-in) - navigating to home"
          );
          console.log(
            "📍 Navigation triggered from: Verification -> Sign-in Complete"
          );
          await setActiveSignIn({ session: signInAttempt.createdSessionId });
          router.replace("/(tabs)");
        }
      } else {
        // For signup (both manual and oauth_completion), verify the phone number
        const signUpAttempt = await signUp?.attemptPhoneNumberVerification({
          code: verificationCode,
        });

        if (signUpAttempt?.status === "complete" && setActiveSignUp) {
          console.log(
            "🚀 Auth Screen: Verification complete (sign-up) - navigating to home"
          );
          console.log(
            "📍 Navigation triggered from: Verification -> Sign-up Complete"
          );
          await setActiveSignUp({ session: signUpAttempt.createdSessionId });
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "auth":
        return (
          <Animated.View
            style={stepAnimatedStyle}
            className="w-full px-4 h-full flex-1"
          >
            {/* Manual auth inputs - positioned with keyboard awareness */}
            <Animated.View style={inputContainerAnimatedStyle}>
              <View className="mb-1">
                <BodyText className="text-lg font-paragraph-medium text-foreground">
                  Email
                </BodyText>
              </View>
              <AuthInput
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                validationType="email"
                error={error}
                showValidation={true}
                showValidationIndicator={shouldValidateEmailStrength}
              />
              <View className="mb-1 flex-row justify-between">
                <BodyText className="text-lg font-paragraph-medium text-foreground">
                  Password
                </BodyText>
                <TouchableOpacity>
                  <BodyText className="text-lg font-paragraph-medium text-primary">
                    Forgot your password?
                  </BodyText>
                </TouchableOpacity>
              </View>
              <AuthInput
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                textContentType="password"
                autoCapitalize="none"
                validationType="password"
                error={error}
                showValidation={true}
                showValidationIndicator={shouldValidatePasswordStrength}
                showPasswordToggle={true}
                isSignUp={shouldValidatePasswordStrength}
              />

              <AuthButton
                label="Continue Manually"
                icon="arrow-forward-outline"
                onPress={handleManualAuth}
                loading={isLoading}
                disabled={!email || !password || isLoading}
                loadingLabel="Authenticating..."
              />
            </Animated.View>

            {/* Social options positioned higher */}
            <Animated.View style={socialAnimatedStyle}>
              <AuthSocialOptions
                onGooglePress={handleGoogleAuth}
                onApplePress={handleAppleAuth}
                onFacebookPress={handleFacebookAuth}
                isLoading={isLoading}
                title="Or continue with"
              />
            </Animated.View>
          </Animated.View>
        );

      case "phone":
        return (
          <PhoneCollectionScreen
            emailAddress={authMode === "oauth_completion" ? oauthEmail : email}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onComplete={handlePhoneSubmit}
            isLoading={isLoading}
            error={error}
            animatedStyle={stepAnimatedStyle}
          />
        );

      case "verification":
        return (
          <VerificationInput
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            onVerify={handleVerificationSubmit}
            isLoading={isLoading}
            isPhone={true}
            phoneNumber={phoneNumber}
            emailAddress={authMode === "oauth_completion" ? oauthEmail : email}
            error={error}
            animatedStyle={stepAnimatedStyle}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer scroll={false} padded={false}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1">
          {/* Header with back button */}
          <View
            className={`flex-row justify-between items-start ${
              isSmallDevice ? "px-3" : "px-5"
            }`}
          >
            <TouchableOpacity onPress={handleBackPress}>
              <View className="flex-row items-center">
                <Ionicons
                  name="arrow-back-outline"
                  size={isSmallDevice ? 18 : 20}
                  color="#2e2c29"
                />
                <BodyText
                  className={`text-foreground ${
                    isSmallDevice ? "text-sm" : "text-base"
                  } ml-1`}
                >
                  Back
                </BodyText>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {/* Top area with image and text (only show on auth step) */}
            {currentStep === "auth" && (
              <Animated.View
                style={headerContainerStyle}
                className="items-center px-4 pt-4"
              >
                <Animated.View style={imageAnimatedStyle}>
                  <Image
                    source={require("@/assets/images/sign-in-replace.png")}
                    className="rounded-2xl overflow-hidden mb-4"
                    style={{
                      width: baseImageSize.value,
                      height: baseImageSize.value,
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Animated.View style={textAnimatedStyle}>
                  <TitleText className="text-center mb-2 text-3xl">
                    Welcome to GreenThumb!
                  </TitleText>
                  <BodyText className="text-lg text-center mb-2">
                    Sign in or create your account
                  </BodyText>
                </Animated.View>
              </Animated.View>
            )}

            {/* Current step content */}
            <Animated.View
              style={contentAnimatedStyle}
              className={`${
                currentStep === "auth" ? "flex-1" : "flex-1 justify-center"
              }`}
            >
              {renderCurrentStep()}
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
