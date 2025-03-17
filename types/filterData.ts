import { Feather } from "@expo/vector-icons";

// Define a type for Feather icon names
type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

export type FilterCategory = {
  /**
   * Unique ID for your UI to distinguish categories
   * (like "nc-regions" or "soil-texture").
   */
  id: string;
  /** The label to show in your UI, e.g. "NC Regions" */
  name: string;
  /** The actual Postgres column name in plant_full_data. */
  dbColumn: string;
  /** The list of possible user-selectable values. */
  options: string[];
  /** Whether this category should only be shown in advanced mode */
  isAdvanced?: boolean;
  icon: FeatherIconName;
};

export type FilterSection = {
  id: string;
  name: string;
  isAdvanced?: boolean;
  categories: FilterCategory[];
  icon: FeatherIconName;
};

// Map from Lucide icons to Feather icons
const iconMap: Record<string, FeatherIconName> = {
  Sun: "sun",
  Leaf: "feather",
  Droplet: "droplet",
  TreePine: "git-branch",
  TreeDeciduous: "git-branch",
  Ruler: "maximize",
  MapPin: "map-pin",
  Flower: "aperture",
  Eye: "eye",
  Heart: "heart",
  ShieldCheck: "shield",
  AlertTriangle: "alert-triangle",
  Shield: "shield",
  Star: "star",
  Clock: "clock",
  Paintbrush: "edit-2",
  Sprout: "feather",
  Palette: "feather",
  Pipette: "droplet",
  Mountain: "triangle",
  Map: "map",
  MapPinHouse: "home",
  Activity: "activity",
  Hand: "thumbs-up",
};

export const allFilters: FilterSection[] = [
  /* ------------------ BASIC SECTIONS ------------------ */
  {
    id: "cultural-conditions",
    name: "Cultural Conditions",
    icon: "map",
    categories: [
      {
        id: "light",
        name: "Light",
        dbColumn: "light_requirements", // JSONB in your table
        options: [
          "Dappled Sunlight (Shade through upper canopy all day)",
          "Deep shade (Less than 2 hours to no direct sunlight)",
          "Full Sun (6 or more hours of direct sunlight a day)",
          "Partial Shade (2-6 hours of direct sunlight)",
        ],
        icon: "sun",
      },
      {
        id: "soil-texture",
        name: "Soil Texture",
        dbColumn: "soil_texture", // JSONB
        options: [
          "Clay",
          "Loam (Silt)",
          "Sand",
          "High Organic Matter",
          "Shallow Rocky",
        ],
        icon: "feather",
      },
      {
        id: "soil-ph",
        name: "Soil pH",
        dbColumn: "soil_ph", // JSONB
        options: ["Acid (<6.0)", "Neutral (6.0-8.0)", "Alkaline (>8.0)"],
        icon: "droplet",
      },
      {
        id: "soil-drainage",
        name: "Soil Drainage",
        dbColumn: "soil_drainage", // JSONB
        options: [
          "Frequent Standing Water",
          "Good Drainage",
          "Moist",
          "Occasional Flooding",
          "Occasionally Dry",
          "Occasionally Wet",
          "Very Dry",
        ],
        icon: "droplet",
      },
      {
        id: "available-space-to-plant",
        name: "Available Space To Plant",
        dbColumn: "available_space_to_plant", // JSONB
        options: [
          "Less than 12 inches",
          "12 inches-3 feet",
          "3 feet-6 feet",
          "6 feet-12 feet",
          "12-24 feet",
          "24-60 feet",
          "more than 60 feet",
        ],
        icon: "maximize",
      },
      {
        id: "nc-regions",
        name: "NC Regions",
        dbColumn: "nc_regions", // JSONB
        options: ["Coastal", "Mountains", "Piedmont"],
        icon: "triangle",
      },
      {
        id: "usda-zone",
        name: "USDA Zone",
        dbColumn: "usda_zones", // JSONB
        options: [
          "1a",
          "1b",
          "2a",
          "2b",
          "3a",
          "3b",
          "4a",
          "4b",
          "5a",
          "5b",
          "6a",
          "6b",
          "7a",
          "7b",
          "8a",
          "8b",
          "9a",
          "9b",
          "10a",
          "10b",
          "11a",
          "11b",
          "12a",
          "12b",
          "13a",
          "13b",
        ],
        icon: "map-pin",
      },
    ],
  },
  {
    id: "landscape",
    name: "Landscape",
    icon: "git-branch",
    categories: [
      {
        id: "location",
        name: "Location",
        dbColumn: "landscape_location", // JSONB
        options: [
          "Coastal",
          "Container",
          "Hanging Baskets",
          "Houseplants",
          "Lawn",
          "Meadow",
          "Naturalized Area",
          "Near Septic",
          "Patio",
          "Pond",
          "Pool/Hardscape",
          "Recreational Play Area",
          "Riparian",
          "Rock Wall",
          "Slope/Bank",
          "Small Space",
          "Vertical Spaces",
          "Walkways",
          "Woodland",
        ],
        icon: "home",
      },
      {
        id: "landscape-theme",
        name: "Landscape Theme",
        dbColumn: "landscape_theme", // JSONB
        isAdvanced: true,
        options: [
          "Asian Garden",
          "Butterfly Garden",
          "Children's Garden",
          "Cottage Garden",
          "Cutting Garden",
          "Drought Tolerant Garden",
          "Edible Garden",
          "English Garden",
          "Fairy Garden",
          "Garden for the Blind",
          "Native Garden",
          "Nighttime Garden",
          "Pollinator Garden",
          "Rain Garden",
          "Rock Garden",
          "Shade Garden",
          "Water Garden",
          "Winter Garden",
        ],
        icon: "aperture",
      },
      {
        id: "design-feature",
        name: "Design Feature",
        dbColumn: "design_feature", // JSONB
        isAdvanced: true,
        options: [
          "Accent",
          "Barrier",
          "Border",
          "Flowering Tree",
          "Foundation Planting",
          "Hedge",
          "Mass Planting",
          "Screen/Privacy",
          "Security",
          "Shade Tree",
          "Small groups",
          "Small Tree",
          "Specimen",
          "Street Tree",
          "Understory Tree",
        ],
        icon: "eye",
      },
    ],
  },

  /* ------------------ ADVANCED SECTIONS ------------------ */
  {
    id: "wildlife-and-resistance",
    name: "Wildlife and Resistance",
    isAdvanced: true,
    icon: "shield",
    categories: [
      {
        id: "attracts",
        name: "Attracts",
        dbColumn: "attracts", // JSONB
        options: [
          "Bats",
          "Bees",
          "Butterflies",
          "Frogs",
          "Hummingbirds",
          "Moths",
          "Pollinators",
          "Predatory Insects",
          "Reptiles",
          "Small Mammals",
          "Songbirds",
          "Specialized Bees",
        ],
        icon: "heart",
      },
      {
        id: "resistance-to-challenges",
        name: "Resistance To Challenges",
        dbColumn: "resistance_to_challenges", // JSONB
        options: [
          "Black Walnut",
          "Compaction",
          "Deer",
          "Diseases",
          "Drought",
          "Dry Soil",
          "Erosion",
          "Fire",
          "Foot Traffic",
          "Heat",
          "Heavy Shade",
          "Humidity",
          "Insect Pests",
          "Pollution",
          "Poor Soil",
          "Rabbits",
          "Salt",
          "Slugs",
          "Squirrels",
          "Storm Damage",
          "Urban Conditions",
          "Voles",
          "Wet Soil",
          "Wind",
        ],
        icon: "shield",
      },
      {
        id: "problems-to-exclude",
        name: "Problems to Exclude",
        dbColumn: "problems", // JSONB
        options: [
          "Allelopathic",
          "Contact Dermatitis",
          "Frequent Disease Problems",
          "Frequent Insect Problems",
          "Invasive Species",
          "Malodorous",
          "Messy",
          "Poisonous to Humans",
          "Problem for Cats",
          "Problem for Children",
          "Problem for Dogs",
          "Problem for Horses",
          "Short-lived",
          "Spines/Thorns",
          "Weak Wood",
          "Weedy",
        ],
        icon: "alert-triangle",
      },
    ],
  },
  {
    id: "whole-plant-traits",
    name: "Whole Plant Traits",
    isAdvanced: true,
    icon: "feather",
    categories: [
      {
        id: "plant-type",
        name: "Plant Type",
        dbColumn: "plant_types", // JSONB
        options: [
          "Annual",
          "Bulb",
          "Carnivorous",
          "Cool Season Vegetable",
          "Edible",
          "Epiphyte",
          "Fern",
          "Ground Cover",
          "Herb",
          "Herbaceous Perennial",
          "Houseplant",
          "Mushroom",
          "Native Plant",
          "Ornamental Grasses and Sedges",
          "Perennial",
          "Poisonous",
          "Rose",
          "Shrub",
          "Succulent",
          "Tree",
          "Turfgrass",
          "Vegetable",
          "Vine",
          "Warm Season Vegetable",
          "Water Plant",
          "Weed",
          "Wildflower",
        ],
        icon: "git-branch",
      },
      {
        id: "woody-plant-leaf-characteristics",
        name: "Woody Plant Leaf Characteristics",
        dbColumn: "leaf_characteristics", // JSONB
        options: [
          "Broadleaf Evergreen",
          "Deciduous",
          "Needled Evergreen",
          "Semi-evergreen",
        ],
        icon: "feather",
      },
      {
        id: "habit-form",
        name: "Habit/Form",
        dbColumn: "plant_habit", // JSONB
        options: [
          "Arching",
          "Ascending",
          "Broad",
          "Cascading",
          "Climbing",
          "Clumping",
          "Columnar",
          "Conical",
          "Creeping",
          "Dense",
          "Erect",
          "Horizontal",
          "Irregular",
          "Mounding",
          "Multi-stemmed",
          "Multi-trunked",
          "Open",
          "Oval",
          "Prostrate",
          "Pyramidal",
          "Rounded",
          "Spreading",
          "Vase",
          "Weeping",
        ],
        icon: "star",
      },
      {
        id: "growth-rate",
        name: "Growth Rate",
        dbColumn: "growth_rate", // text or JSONB
        options: ["Slow", "Medium", "Rapid"],
        icon: "clock",
      },
      {
        id: "maintenance",
        name: "Maintenance",
        dbColumn: "maintenance", // JSONB
        options: ["High", "Low", "Medium"],
        icon: "activity",
      },
      {
        id: "texture",
        name: "Texture",
        dbColumn: "texture", // text or JSONB
        options: ["Fine", "Medium", "Coarse"],
        icon: "thumbs-up",
      },
    ],
  },
  {
    id: "flowers",
    name: "Flowers",
    isAdvanced: true,
    icon: "aperture",
    categories: [
      {
        id: "flower-color",
        name: "Flower Color",
        dbColumn: "flower_colors", // JSONB
        options: [
          "Black",
          "Blue",
          "Brown/Copper",
          "Cream/Tan",
          "Gold/Yellow",
          "Gray/Silver",
          "Green",
          "Insignificant",
          "Orange",
          "Pink",
          "Purple/Lavender",
          "Red/Burgundy",
          "Variegated",
          "White",
        ],
        icon: "edit-2",
      },
      {
        id: "flower-value-to-gardener",
        name: "Flower Value To Gardener",
        dbColumn: "flower_value_to_gardener", // JSONB
        options: [
          "Edible",
          "Fragrant",
          "Good Cut",
          "Good Dried",
          "Long Bloom Season",
          "Long-lasting",
          "Showy",
        ],
        icon: "heart",
      },
      {
        id: "flower-bloom-time",
        name: "Flower Bloom Time",
        dbColumn: "flower_bloom_time", // JSONB
        options: ["Fall", "Spring", "Summer", "Winter"],
        icon: "feather",
      },
    ],
  },
  {
    id: "leaves",
    name: "Leaves",
    isAdvanced: true,
    icon: "feather",
    categories: [
      {
        id: "leaf-color",
        name: "Leaf Color",
        dbColumn: "leaf_color", // JSONB
        options: [
          "Black",
          "Blue",
          "Brown/Copper",
          "Cream/Tan",
          "Gold/Yellow",
          "Gray/Silver",
          "Green",
          "Insignificant",
          "Orange",
          "Pink",
          "Purple/Lavender",
          "Red/Burgundy",
          "Variegated",
          "White",
        ],
        icon: "edit-2",
      },
      {
        id: "leaf-texture",
        name: "Leaf Texture",
        dbColumn: "leaf_feel", // JSONB or text, whichever is correct
        options: [
          "Fleshy",
          "Glossy",
          "Leathery",
          "Papery",
          "Prickly",
          "Rough",
          "Rubbery",
          "Slippery",
          "Smooth",
          "Soft",
          "Velvety",
          "Waxy",
        ],
        icon: "thumbs-up",
      },
      {
        id: "leaf-value-to-gardener",
        name: "Leaf Value To Gardener",
        dbColumn: "leaf_value_to_gardener", // JSONB
        options: [
          "Edible",
          "Fragrant",
          "Good Cut",
          "Good Dried",
          "Long-lasting",
          "Showy",
        ],
        icon: "heart",
      },
      {
        id: "deciduous-leaf-fall-color",
        name: "Deciduous Leaf Fall Color",
        dbColumn: "leaf_fall_color", // JSONB
        options: [
          "Brown/Copper",
          "Cream/Tan",
          "Gold/Yellow",
          "Gray/Silver",
          "Insignificant",
          "Orange",
          "Pink",
          "Purple/Lavender",
          "Red/Burgundy",
        ],
        icon: "feather",
      },
    ],
  },
];
