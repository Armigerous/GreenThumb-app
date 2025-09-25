import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";

export default function AuthRoutesLayout() {
	const { isSignedIn, isLoaded } = useAuth();
	const [navigationReady, setNavigationReady] = useState(false);

	useEffect(() => {
		console.log(
			"📱 Auth Layout: Component mounted - Auth routes layout initialized"
		);
		console.log(
			"🔍 Auth Layout: isLoaded:",
			isLoaded,
			"isSignedIn:",
			isSignedIn
		);
	}, [isLoaded, isSignedIn]);

	useEffect(() => {
		if (isLoaded) {
			if (isSignedIn) {
				console.log(
					"🚀 Auth Layout: User is signed in - will redirect to home"
				);
			} else {
				console.log(
					"📋 Auth Layout: User not signed in - staying in auth flow"
				);
			}
		}
	}, [isLoaded, isSignedIn]);

	// Add a small delay to prevent immediate redirects that cause loops
	useEffect(() => {
		if (isLoaded) {
			const timer = setTimeout(() => {
				setNavigationReady(true);
			}, 200); // Slightly longer delay to ensure stable state
			return () => clearTimeout(timer);
		}
	}, [isLoaded]);

	if (!isLoaded) {
		console.log("⏳ Auth Layout: Auth state loading...");
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" color="#5E994B" />
			</View>
		);
	}

	if (isSignedIn && navigationReady) {
		console.log("📍 Auth Layout: Redirecting signed-in user to home");
		return <Redirect href={"/(tabs)"} />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
				gestureEnabled: true,
				gestureDirection: "horizontal",
				animationDuration: 250,
				presentation: "card",
			}}
			screenListeners={{
				transitionStart: (e) => {
					// Optional: Handle transition start if needed
				},
				transitionEnd: (e) => {
					// Optional: Handle transition end if needed
				},
			}}
			initialRouteName="welcome"
		>
			<Stack.Screen
				name="welcome"
				options={{
					animation: "slide_from_left",
				}}
			/>
			<Stack.Screen
				name="auth"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="oauth-native-callback"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
