import * as React from "react";
import {
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { GoogleIcon, AppleIcon, FacebookIcon } from "@/components/icons";

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-5 pt-5">
        <Text className="text-foreground text-base">Welcome</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/welcome")}>
          <Text className="text-foreground text-base">Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="w-full h-[150px] justify-center items-center">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-1/2 h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-foreground text-center mb-5">
          The GreenThumb
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
                  onPress={() => toggleIdentifierType(true)}
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

              {isPhone ? (
                <>
                  <Text className="text-foreground mb-1 text-sm">
                    Phone Number
                  </Text>
                  <TextInput
                    className="bg-cream-50 border-2 border-foreground rounded-lg p-3 text-foreground mb-4"
                    autoCapitalize="none"
                    value={phoneNumber}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    onChangeText={(text) => setPhoneNumber(text)}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </>
              ) : (
                <>
                  <Text className="text-foreground mb-1 text-sm">Email</Text>
                  <TextInput
                    className="bg-cream-50 border-2 border-foreground rounded-lg p-3 text-foreground mb-4"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    onChangeText={(email) => setEmailAddress(email)}
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </>
              )}

              <Text className="text-foreground mb-1 text-sm">Password</Text>
              <TextInput
                className="bg-cream-50 border-2 border-foreground rounded-lg p-3 text-foreground mb-4"
                value={password}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                onChangeText={(text) => setPassword(text)}
                editable={!isLoading}
              />

              <TouchableOpacity
                className="bg-primary py-4 rounded-lg items-center"
                onPress={onSignUpPress}
                disabled={isLoading || !isLoaded}
              >
                <Text className="text-primary-foreground font-bold text-base">
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Text>
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
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-400 flex-1 h-12 items-center justify-center"
                  onPress={onSignUpWithGoogle}
                  disabled={isLoading}
                >
                  <GoogleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-400 flex-1 h-12 items-center justify-center"
                  onPress={onSignUpWithApple}
                  disabled={isLoading}
                >
                  <AppleIcon size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cream-50 p-3 rounded-lg shadow-sm border border-cream-400 flex-1 h-12 items-center justify-center"
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
            <TextInput
              className="bg-cream-50 border-2 border-foreground rounded-lg p-3 text-foreground mb-4"
              value={verificationCode}
              placeholder="Verification code"
              placeholderTextColor="#999"
              onChangeText={(code) => setVerificationCode(code)}
              keyboardType="number-pad"
              editable={!isLoading}
            />

            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center"
              onPress={onPressVerify}
              disabled={isLoading || !isLoaded}
            >
              <Text className="text-primary-foreground font-bold text-base">
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && <ActivityIndicator className="mt-4" color="#4CAF50" />}

        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-foreground">Already have an account? </Text>
          <Link href="/sign-in">
            <Text className="text-primary">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
