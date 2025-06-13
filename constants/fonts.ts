/**
 * Font constants for the application
 * 
 * This file defines the font families and font weights used throughout the app.
 * To be used with Tailwind CSS classes.
 */

export const FONTS = {
  TITLE: {
    FAMILY: 'Mali',
    REGULAR: 'Mali_400Regular',
    MEDIUM: 'Mali_500Medium',
    SEMIBOLD: 'Mali_600SemiBold',
    BOLD: 'Mali_700Bold',
    ITALIC: 'Mali_400Regular_Italic',
    MEDIUM_ITALIC: 'Mali_500Medium_Italic',
    SEMIBOLD_ITALIC: 'Mali_600SemiBold_Italic',
    BOLD_ITALIC: 'Mali_700Bold_Italic',
  },
  PARAGRAPH: {
    FAMILY: 'Nunito',
    REGULAR: 'Nunito_400Regular',
    MEDIUM: 'Nunito_500Medium',
    SEMIBOLD: 'Nunito_600SemiBold',
    BOLD: 'Nunito_700Bold',
    ITALIC: 'Nunito_400Regular_Italic',
    MEDIUM_ITALIC: 'Nunito_500Medium_Italic',
    SEMIBOLD_ITALIC: 'Nunito_600SemiBold_Italic',
    BOLD_ITALIC: 'Nunito_700Bold_Italic',
  },
};

/**
 * Helper to resolve the correct font name for React Native style objects
 * Using this will help ensure the correct font name is used for various platforms
 */
export const resolveFont = (fontName: string) => {
  // On some platforms, font family name only is needed
  // while on others, the full font name is required
  return fontName;
};

/**
 * Helpers to construct font family strings for React Native
 */
export const getFontFamily = (fontFamily: string, weight: string, isItalic: boolean = false) => {
  return {
    fontFamily,
    fontWeight: weight,
    fontStyle: isItalic ? 'italic' : 'normal',
  };
};

// Tailwind specific font constants for typescript intellisense
export const TAILWIND_FONTS = {
  TITLE: 'font-title',
  PARAGRAPH: 'font-paragraph',
}; 