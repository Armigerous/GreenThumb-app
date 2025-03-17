import { Feather } from "@expo/vector-icons";

// Define a type for Feather icon names
type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

export type PremadeFilter = {
  id: string;
  name: string;
  description: string;
  icon: FeatherIconName;
  filters: string[];
};

export const premadeFilters: PremadeFilter[] = [
  {
    id: "beginner-friendly",
    name: "Beginner Friendly",
    description: "Easy-to-grow plants perfect for beginners",
    icon: "git-branch",
    filters: [
      "maintenance|Low",
      "resistance-to-challenges|Drought",
      "resistance-to-challenges|Poor Soil",
    ],
  },
  {
    id: "butterfly-garden",
    name: "Butterfly Garden",
    description: "Create a beautiful butterfly sanctuary",
    icon: "heart",
    filters: [
      "landscape-theme|Butterfly Garden",
      "attracts|Butterflies",
      "attracts|Pollinators",
      "light|Full Sun (6 or more hours of direct sunlight a day)",
    ],
  },
  {
    id: "drought-resistant",
    name: "Drought Resistant",
    description: "Low-water plants for dry conditions",
    icon: "sun",
    filters: [
      "resistance-to-challenges|Drought",
      "resistance-to-challenges|Dry Soil",
      "resistance-to-challenges|Heat",
      "landscape-theme|Drought Tolerant Garden",
    ],
  },
  {
    id: "pollinator-friendly",
    name: "Pollinator Friendly",
    description: "Support local pollinators",
    icon: "aperture",
    filters: [
      "attracts|Bees",
      "attracts|Butterflies",
      "attracts|Hummingbirds",
      "attracts|Moths",
      "attracts|Pollinators",
      "attracts|Specialized Bees",
    ],
  },
  {
    id: "low-maintenance",
    name: "Low Maintenance",
    description: "Easy-care plants for busy gardeners",
    icon: "shield",
    filters: [
      "maintenance|Low",
      "resistance-to-challenges|Drought",
      "resistance-to-challenges|Poor Soil",
      "resistance-to-challenges|Urban Conditions",
    ],
  },
  {
    id: "native-garden",
    name: "Native Garden",
    description: "Local plants for your region",
    icon: "feather",
    filters: ["plant-type|Native Plant", "landscape-theme|Native Garden"],
  },
  {
    id: "indoor-plants",
    name: "Indoor Plants",
    description: "Plants that thrive indoors",
    icon: "home",
    filters: ["plant-type|Houseplant"],
  },
  {
    id: "shade-loving",
    name: "Shade Loving",
    description: "Plants that thrive in shade",
    icon: "umbrella",
    filters: ["light|Deep shade (Less than 2 hours to no direct sunlight)"],
  },
];
