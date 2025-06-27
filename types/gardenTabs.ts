/**
 * Garden Editor Tab Definitions
 * 
 * This file defines the structure and organization of the garden settings tabs
 * for both mobile and web interfaces.
 */

import { IconName } from './icon';

/**
 * Tab definition for garden settings
 */
export interface GardenTab {
  /** Unique ID for the tab */
  id: string;
  /** Display name shown to users */
  label: string;
  /** Short description of the tab content */
  description: string;
  /** Icon for the tab (using Ionicons) */
  icon: IconName;
  /** Order of importance (lower numbers appear first) */
  order: number;
}

/**
 * Organized tabs with logical grouping
 */
export const GARDEN_TABS: GardenTab[] = [
  // Basic information about the garden
  {
    id: 'basic-info',
    label: 'Basic Info',
    description: 'Garden name, location, and region',
    icon: 'information-circle-outline',
    order: 1
  },
  
  // Environment conditions and requirements
  {
    id: 'environment',
    label: 'Environment',
    description: 'Sunlight, soil, and other environmental factors',
    icon: 'sunny-outline',
    order: 2
  },
  
  // Design aspects of the garden
  {
    id: 'design',
    label: 'Design',
    description: 'Garden themes, styles, and features',
    icon: 'grid-outline',
    order: 3
  },
  
  // Plant characteristics and preferences
  {
    id: 'plants',
    label: 'Plants',
    description: 'Plant types, forms, and growth characteristics',
    icon: 'leaf-outline',
    order: 4
  },
  
  // Visual aesthetics like colors and textures
  {
    id: 'aesthetics',
    label: 'Aesthetics',
    description: 'Colors, textures, and visual elements',
    icon: 'color-palette-outline',
    order: 5
  },
  
  // Preferences for recommendations and maintenance
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Recommendations and maintenance levels',
    icon: 'options-outline',
    order: 6
  }
];

/**
 * Maps database fields to specific tabs for better organization
 */
export const FIELD_TO_TAB_MAPPING = {
  // Basic Info Tab
  'name': 'basic-info',
  'ncRegionsIds': 'basic-info',
  'usda_zones_ids': 'basic-info',
  
  // Environment Tab
  'lightIds': 'environment',
  'soilTextureIds': 'environment',
  'soilPhIds': 'environment',
  'soilDrainageIds': 'environment',
  'spaceAvailableIds': 'environment',
  
  // Design Tab
  'locationIds': 'design',
  'gardenThemeIds': 'design',
  'designFeatureIds': 'design',
  
  // Plants Tab
  'plantTypeIds': 'plants',
  'habitFormIds': 'plants',
  'growthRateId': 'plants',
  'wildlifeAttractionIds': 'plants',
  'resistanceChallengeIds': 'plants',
  'problemsToExcludeIds': 'plants',
  
  // Aesthetics Tab
  'flowerColorIds': 'aesthetics',
  'flowerBloomTimeIds': 'aesthetics',
  'flowerValueIds': 'aesthetics',
  'leafColorIds': 'aesthetics',
  'leafFeelIds': 'aesthetics',
  'leafValueIds': 'aesthetics',
  'fallColorIds': 'aesthetics',
  'texturePreferenceId': 'aesthetics',
  
  // Preferences Tab
  'maintenanceLevelId': 'preferences',
  'yearRoundInterest': 'preferences',
  'wantsRecommendations': 'preferences'
};

/**
 * Type definition with clearer organization for UserGardens
 */
export interface UserGardens {
  /** Unique identifier for the garden */
  id?: number;
  /** Name of the garden */
  name: string;
  
  // Region & Basic Info
  /** Array of North Carolina region IDs */
  ncRegionsIds?: string[];
  /** Array of USDA hardiness zone IDs */
  usda_zones_ids?: string[];
  
  // Environment
  /** Array of sunlight condition IDs */
  lightIds?: string[];
  /** Array of soil texture type IDs */
  soilTextureIds?: string[];
  /** Array of soil pH range IDs */
  soilPhIds?: string[];
  /** Array of soil drainage type IDs */
  soilDrainageIds?: string[];
  /** Array of available space IDs */
  spaceAvailableIds?: string[];
  
  // Design
  /** Array of garden location IDs */
  locationIds?: string[];
  /** Array of garden theme IDs */
  gardenThemeIds?: string[];
  /** Array of design feature IDs */
  designFeatureIds?: string[];
  
  // Plants
  /** Array of plant type IDs */
  plantTypeIds?: string[];
  /** Array of plant habit/form IDs */
  habitFormIds?: string[];
  /** Growth rate preference ID */
  growthRateId?: number;
  /** Array of wildlife attraction IDs */
  wildlifeAttractionIds?: string[];
  /** Array of resistance challenge IDs */
  resistanceChallengeIds?: string[];
  /** Array of problem IDs to exclude */
  problemsToExcludeIds?: string[];
  
  // Aesthetics
  /** Array of flower color IDs */
  flowerColorIds?: string[];
  /** Array of flower bloom time IDs */
  flowerBloomTimeIds?: string[];
  /** Array of flower value IDs */
  flowerValueIds?: string[];
  /** Array of leaf color IDs */
  leafColorIds?: string[];
  /** Array of leaf feel IDs */
  leafFeelIds?: string[];
  /** Array of leaf value IDs */
  leafValueIds?: string[];
  /** Array of fall color IDs */
  fallColorIds?: string[];
  /** Texture preference ID */
  texturePreferenceId?: number;
  
  // Preferences
  /** Maintenance level preference ID */
  maintenanceLevelId?: number;
  /** Whether the garden should have plants with year-round interest */
  yearRoundInterest?: boolean;
  /** Whether the user wants plant recommendations */
  wantsRecommendations?: boolean;
}

/**
 * Helper function to get completion percentage for each tab
 */
export function getTabCompletionPercentage(garden: UserGardens, tabId: string): number {
  const tabFields = Object.entries(FIELD_TO_TAB_MAPPING)
    .filter(([_, tab]) => tab === tabId)
    .map(([field]) => field);
  
  const filledFields = tabFields.filter(field => {
    const value = garden[field as keyof UserGardens];
    if (Array.isArray(value)) {
      return value && value.length > 0;
    }
    return value !== undefined && value !== null;
  });
  
  return tabFields.length ? (filledFields.length / tabFields.length) * 100 : 0;
} 