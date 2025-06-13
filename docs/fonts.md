# Font System

The Green Thumb app uses a consistent font system with two primary font families:

1. **Mali** - Used for titles, headings, and emphasis
2. **Nunito** - Used for paragraphs, labels, and most text content

## Available Classes

### Title Font (Mali)

- `font-title` - Regular weight
- `font-title-medium` - Medium weight
- `font-title-semibold` - Semi-bold weight
- `font-title-bold` - Bold weight

### Paragraph Font (Nunito)

- `font-paragraph` - Regular weight
- `font-paragraph-medium` - Medium weight
- `font-paragraph-semibold` - Semi-bold weight
- `font-paragraph-bold` - Bold weight

## Custom Text Components

For better font rendering and consistent styling, use these pre-built components:

- `<TitleText>` - Bold title text with Mali font and enhanced weight
- `<SubtitleText>` - Semibold subtitle text with Mali font
- `<BodyText>` - Body text with Nunito font and medium weight
- `<Text>` - Regular text with Nunito font

### Usage Example:

```tsx
import { TitleText, SubtitleText, BodyText, Text } from "@/components/UI/Text";

// For titles and headings
<TitleText className="text-3xl">This is a title</TitleText>
<SubtitleText className="text-xl">This is a subtitle</SubtitleText>

// For body text and paragraphs
<BodyText>This is body text with medium weight</BodyText>
<Text>This is regular text</Text>
```

## Direct CSS Class Usage

If you prefer using the standard React Native Text component:

```tsx
// For titles and headings
<Text className="font-title text-2xl">This is a title</Text>
<Text className="font-title-bold text-xl">This is a bold title</Text>

// For paragraphs and content
<Text className="font-paragraph">This is a paragraph text</Text>
<Text className="font-paragraph-medium">This is medium weight text</Text>
```

## Font Weights

Both fonts are available in multiple weights:

- **Regular** (400)
- **Medium** (500)
- **Semi-Bold** (600)
- **Bold** (700/800/900 for extra emphasis)

## Implementation Details

The font system uses Expo Google Fonts for loading and managing fonts. The fonts are loaded in the root layout file and made available throughout the application.

- Font constants are defined in `constants/fonts.ts`
- Font CSS classes are defined in `app/fonts.css`
- Font loading happens in `app/_layout.tsx`
- Custom text components are in `components/UI/Text.tsx`

## Enhanced Font Rendering

The custom text components apply additional styling for better font weight, including subtle text shadow effects to make text appear bolder on certain platforms where needed.

## Design Aesthetic

The Mali/Nunito font combination creates a soft, organic, storybook-esque feel that complements the app's natural, watercolor aesthetic. Mali's handwritten quality brings warmth to titles, while Nunito's rounded letterforms provide excellent readability for body text.

## Testing

You can view a demonstration of all available fonts by visiting the `/font-test` route in the app.
