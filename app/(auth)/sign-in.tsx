import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { GoogleIcon, AppleIcon, FacebookIcon } from "@/components/icons";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";

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

  return (
    <PageContainer scroll={false} padded={false}>
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Link href="/(auth)/welcome" asChild>
          <TouchableOpacity>
            <View className="flex-row items-center">
              <Ionicons name="chevron-back" size={20} color="#2e2c29" />
              <Text className="text-foreground text-base ml-1">Back</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-primary mr-1">Sign up</Text>
              <Ionicons name="person-add-outline" size={16} color="#5E994B" />
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 p-5">
        <View className="w-full h-44 justify-center items-center">
          <Image
            source={require("@/assets/images/sign-in.png")}
            className="w-1/2 h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-foreground text-center mb-5">
          Welcome Back!
        </Text>

        {error && (
          <View className="bg-destructive/10 border border-destructive rounded-lg p-3 mb-4">
            <Text className="text-destructive text-center">{error}</Text>
          </View>
        )}

        {!pendingVerification ? (
          <>
            <View className="w-full mb-5">
              <View className="flex-row justify-between mb-2">
                <TouchableOpacity
                  onPress={() => handleIdentifierTypeChange(false)}
                  className={`py-2 px-4 rounded-lg ${
                    !isPhone ? "bg-primary" : "bg-cream-200"
                  }`}
                >
                  <Text
                    className={
                      !isPhone ? "text-primary-foreground" : "text-foreground"
                    }
                  >
                    {isPhone ? "Use Email" : "Email"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleIdentifierTypeChange(true)}
                  className={`py-2 px-4 rounded-lg ${
                    isPhone ? "bg-primary" : "bg-cream-200"
                  }`}
                >
                  <Text
                    className={
                      isPhone ? "text-primary-foreground" : "text-foreground"
                    }
                  >
                    {!isPhone ? "Use Phone" : "Phone"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-foreground mb-1 text-sm">
                {isPhone ? "Phone Number" : "Email"}
              </Text>
              <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
                <View className="p-3 justify-center">
                  <Ionicons
                    name={isPhone ? "call-outline" : "mail-outline"}
                    size={20}
                    color="#2e2c29"
                  />
                </View>
                <TextInput
                  className="flex-1 p-3 text-foreground"
                  autoCapitalize="none"
                  value={identifier}
                  placeholder={
                    isPhone ? "Enter your phone number" : "Enter your email"
                  }
                  placeholderTextColor="#2e2c29"
                  onChangeText={(text) => setIdentifier(text)}
                  keyboardType={isPhone ? "phone-pad" : "email-address"}
                  editable={!isLoading}
                />
              </View>

              <Text className="text-foreground mb-1 text-sm">Password</Text>
              <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
                <View className="p-3 justify-center">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#2e2c29"
                  />
                </View>
                <TextInput
                  className="flex-1 p-3 text-foreground"
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                  onChangeText={(text) => setPassword(text)}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity onPress={() => {}} className="mb-5">
                <Text className="text-primary text-right text-sm font-semibold">
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
                onPress={onSignInPress}
                disabled={isLoading || !isLoaded}
              >
                <Text className="text-primary-foreground font-bold text-base mr-2">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
                {!isLoading && (
                  <Ionicons name="log-in-outline" size={20} color="#fffefa" />
                )}
              </TouchableOpacity>
            </View>

            <View className="items-center my-4">
              <View className="flex-row items-center w-full mb-4">
                <View className="flex-1 h-[1px] bg-cream-300" />
                <Text className="text-foreground text-sm mx-4">
                  Or sign in with
                </Text>
                <View className="flex-1 h-[1px] bg-cream-300" />
              </View>
              <View className="flex-row justify-between w-full gap-4">
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignInWithGoogle}
                  disabled={isLoading}
                >
                  <GoogleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignInWithApple}
                  disabled={isLoading}
                >
                  <AppleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignInWithFacebook}
                  disabled={isLoading}
                >
                  <FacebookIcon size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View className="w-full mb-5">
            <Text className="text-foreground mb-5 text-center">
              We've sent a verification code to your phone. Please enter it
              below.
            </Text>
            <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
              <View className="p-3 justify-center">
                <Ionicons name="keypad-outline" size={20} color="#2e2c29" />
              </View>
              <TextInput
                className="flex-1 p-3 text-foreground"
                value={verificationCode}
                placeholder="Verification code"
                placeholderTextColor="#999"
                onChangeText={(code) => setVerificationCode(code)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
              onPress={onVerifyPress}
              disabled={isLoading || !isLoaded}
            >
              <Text className="text-primary-foreground font-bold text-base mr-2">
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
              {!isLoading && (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {isLoading && (
          <View className="mt-4 items-center">
            <CompactSpinner size={32} color="#5E994B" />
          </View>
        )}

        <View className="flex-row justify-center mt-auto mb-8">
          <Text className="text-foreground">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary mr-1">Sign up</Text>
              <Ionicons name="person-add-outline" size={16} color="#5E994B" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </PageContainer>
  );
}
