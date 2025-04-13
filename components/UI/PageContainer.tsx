import React, { ReactNode, useEffect } from "react";
import { ViewStyle, ScrollView, View, SafeAreaView } from "react-native";
import { BackgroundGradient } from "./BackgroundGradient";
import AnimatedTransition from "./AnimatedTransition";

/**
 * PageContainer component
 *
 * A consistent container for pages that applies the background gradient.
 * This component should be used at the root of each page instead of applying
 * BackgroundGradient in the layout files, as it works more reliably on individual pages.
 *
 * @param children - The page content
 * @param scroll - Whether the content should be scrollable (defaults to true)
 * @param style - Additional styles to apply to the container
 * @param gradientColors - Custom gradient colors
 * @param padded - Whether to add standard padding to the content (defaults to true)
 * @param safeArea - Whether to use SafeAreaView (defaults to true)
 * @param isLoading - Whether data is loading (only used for rare full-screen loading situations)
 * @param animate - Whether to animate the content (defaults to true)
 */
interface PageContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  gradientColors?: [string, string] | [string, string, ...string[]];
  padded?: boolean;
  safeArea?: boolean;
  isLoading?: boolean;
  animate?: boolean;
}

export function PageContainer({
  children,
  scroll = true,
  style,
  gradientColors,
  padded = true,
  safeArea = true,
  isLoading = false,
  animate = true,
}: PageContainerProps) {
  // Determine the inner content container based on whether scrolling is enabled
  const ContentContainer = scroll ? ScrollView : View;

  // Determine the padding class based on the padded prop
  const paddingClass = padded ? "px-5 py-4" : "";

  // The wrapped content with or without padding
  const content = (
    <ContentContainer className={`flex-1 ${paddingClass}`} style={style}>
      {children}
    </ContentContainer>
  );

  // Apply the BackgroundGradient and optionally the SafeAreaView with animation
  const animatedContent = animate ? (
    <AnimatedTransition
      initialY={10}
      duration={300}
      delay={100}
      enabled={animate}
      className="flex-1"
    >
      {content}
    </AnimatedTransition>
  ) : (
    content
  );

  return (
    <BackgroundGradient customColors={gradientColors}>
      {safeArea ? (
        <SafeAreaView className="flex-1">{animatedContent}</SafeAreaView>
      ) : (
        animatedContent
      )}
    </BackgroundGradient>
  );
}
