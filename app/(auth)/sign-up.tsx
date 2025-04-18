import * as React from "react";
import {
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { GoogleIcon, AppleIcon, FacebookIcon } from "@/components/icons";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/components/UI/PageContainer";

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

        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-primary text-base">Sign In</Text>
              <Ionicons name="log-in-outline" size={16} color="#5E994B" />
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 p-5">
        <View className="w-full h-64 justify-center items-center">
          <Image
            source={require("@/assets/images/sign-up-replace.png")}
            className="w-1/2 h-full rounded-2xl overflow-hidden"
            style={{ aspectRatio: 1 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-foreground text-center mb-5">
          Let's begin something meaningful together!
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
                  onPress={() => toggleIdentifierType(false)}
                  className={`py-2 px-4 rounded-lg ${
                    !isPhone ? "bg-primary" : "bg-transparent"
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
                  onPress={() => toggleIdentifierType(true)}
                  className={`py-2 px-4 rounded-lg ${
                    isPhone ? "bg-primary" : "bg-transparent"
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

              {isPhone ? (
                <>
                  <Text className="text-foreground mb-1 text-sm">
                    Phone Number
                  </Text>
                  <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
                    <View className="p-3 justify-center">
                      <Ionicons name="call-outline" size={20} color="#2e2c29" />
                    </View>
                    <TextInput
                      className="flex-1 p-3 text-foreground"
                      autoCapitalize="none"
                      value={phoneNumber}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#999"
                      onChangeText={(text) => setPhoneNumber(text)}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-foreground mb-1 text-sm">Email</Text>
                  <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
                    <View className="p-3 justify-center">
                      <Ionicons name="mail-outline" size={20} color="#2e2c29" />
                    </View>
                    <TextInput
                      className="flex-1 p-3 text-foreground"
                      autoCapitalize="none"
                      value={emailAddress}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      onChangeText={(email) => setEmailAddress(email)}
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </View>
                </>
              )}

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

              <TouchableOpacity
                className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
                onPress={onSignUpPress}
                disabled={isLoading || !isLoaded}
              >
                <Text className="text-primary-foreground font-bold text-base mr-2">
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Text>
                {!isLoading && (
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>

            <View className="items-center my-4">
              <View className="flex-row items-center w-full mb-4">
                <View className="flex-1 h-[1px] bg-cream-300" />
                <Text className="text-foreground text-sm mx-4">
                  Or sign up with
                </Text>
                <View className="flex-1 h-[1px] bg-cream-300" />
              </View>
              <View className="flex-row justify-between w-full gap-4">
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignUpWithGoogle}
                  disabled={isLoading}
                >
                  <GoogleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignUpWithApple}
                  disabled={isLoading}
                >
                  <AppleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-300 flex-1 h-12 items-center justify-center"
                  onPress={onSignUpWithFacebook}
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
              We've sent a verification code to your{" "}
              {isPhone ? "phone" : "email"}. Please enter it below.
            </Text>
            <View className="flex-row items-center bg-cream-50 border-2 border-foreground rounded-lg mb-4 overflow-hidden">
              <View className="p-3 justify-center">
                <Ionicons name="keypad-outline" size={20} color="#2e2c29" />
              </View>
              <TextInput
                className="flex-1 p-3 text-foreground"
                value={verificationCode}
                placeholder="Verification code"
                placeholderTextColor="#2e2c29"
                onChangeText={(code) => setVerificationCode(code)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
              onPress={onPressVerify}
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
          <Text className="text-foreground">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary mr-1">Sign in</Text>
              <Ionicons name="log-in-outline" size={16} color="#5E994B" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </PageContainer>
  );
}
