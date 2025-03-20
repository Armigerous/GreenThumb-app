import { PlantData } from "./plant";

/**
 * Represents a plant in a user's garden
 *
 * This interface maps to the user_plants table in the database, which stores
 * information about a specific plant instance within a user's garden, including
 * its nickname, status, care history, and associated plant data.
 */
export interface UserPlant {
  /** Unique identifier for the user plant (primary key) */
  id: string;
  /** Foreign key referencing the garden this plant belongs to */
  garden_id: number;
  /** User-defined name for this specific plant */
  nickname: string;
  /** Foreign key referencing plant_id in the main_plant_data table */
  plant_id: number;
  /** Current health status of the plant */
  status: "healthy" | "needs_attention" | "critical";
  /** JSON array of care activities performed on this plant */
  care_logs: any[];
  /** Array of image URLs or references for this plant */
  images: string[];
  /** Optional tags indicating where this plant is located */
  location_tags?: string[];
  /** Timestamp when this plant was added to the garden */
  created_at: string;
  /** Timestamp when this plant was last updated */
  updated_at: string;

  /**
   * Optional: Related botanical plant data from main_plant_data table
   * This field is populated after fetching from the database by joining
   * with the plant data table using plant_id
   */
  plantData?: PlantData;
}

/**
 * Represents a user's garden
 *
 * This interface maps to the user_gardens table and associated views, storing
 * information about a user's garden including its name, preferences, conditions,
 * and associated plants.
 */
export interface Garden {
  /** Unique identifier for the garden (primary key) */
  id: number;
  /** Foreign key referencing the user who owns this garden */
  user_id: string;
  /** Name of the garden */
  name: string;
  /** Whether the user wants plant recommendations for this garden */
  wants_recommendations?: boolean;
  /** Whether the user wants plants that provide interest throughout the year */
  year_round_interest?: boolean;
  /** Timestamp when this garden was created */
  created_at: string;
  /** Timestamp when this garden was last updated */
  updated_at: string;

  // Values instead of IDs
  /** Growth rate preference for plants in this garden */
  growth_rate?: string;
  /** Maintenance level preference for plants in this garden */
  maintenance_level?: string;
  /** Texture preference for plants in this garden */
  texture_preference?: string;

  // Arrays of values instead of ID arrays
  /** Locations where the garden is situated */
  locations?: string[];
  /** Available space sizes in the garden */
  available_space?: string[];
  /** Sunlight conditions in the garden */
  sunlight?: string[];
  /** Soil texture types in the garden */
  soil_texture?: string[];
  /** Soil drainage conditions in the garden */
  soil_drainage?: string[];
  /** Soil pH levels in the garden */
  soil_ph?: string[];
  /** Garden themes or styles */
  garden_themes?: string[];
  /** Wildlife the garden should attract */
  wildlife_attractions?: string[];
  /** Environmental challenges plants should resist */
  resistance_challenges?: string[];
  /** Plant problems to avoid in this garden */
  problems_to_exclude?: string[];
  /** North Carolina regions where the garden is located */
  nc_regions?: string[];
  /** USDA hardiness zones of the garden */
  usda_zones?: string[];
  /** Flower colors preferred in the garden */
  flower_colors?: string[];
  /** Preferred flowering seasons */
  flower_bloom_times?: string[];
  /** Valued flower characteristics */
  flower_values?: string[];
  /** Leaf colors preferred in the garden */
  leaf_colors?: string[];
  /** Leaf textures preferred in the garden */
  leaf_feels?: string[];
  /** Valued leaf characteristics */
  leaf_values?: string[];
  /** Fall foliage colors preferred in the garden */
  fall_colors?: string[];
  /** Plant growth habits or forms preferred */
  habit_forms?: string[];
  /** Types of plants preferred in the garden */
  plant_types?: string[];
  /** Design features preferred for plants */
  design_features?: string[];

  /** Array of plants in this garden */
  plants?: UserPlant[];

  // Keep the old field names for backward compatibility
  /** Legacy field for location IDs */
  location_ids?: string[];
  /** Legacy field for available space IDs */
  space_available_ids?: string[];
  /** Legacy field for sunlight condition IDs */
  sunlight_ids?: string[];
  /** Legacy field for soil texture IDs */
  soil_texture_ids?: string[];
  /** Legacy field for soil drainage IDs */
  soil_drainage_ids?: string[];
  /** Legacy field for soil pH IDs */
  soil_ph_ids?: string[];
  /** Legacy field for garden theme IDs */
  garden_theme_ids?: string[];
  /** Legacy field for wildlife attraction IDs */
  wildlife_attraction_ids?: string[];
  /** Legacy field for resistance challenge IDs */
  resistance_challenge_ids?: string[];
  /** Legacy field for problems to exclude IDs */
  problems_to_exclude_ids?: string[];
  /** Legacy field for growth rate ID */
  growth_rate_id?: number;
  /** Legacy field for maintenance level ID */
  maintenance_level_id?: number;
  /** Legacy field for texture preference ID */
  texture_preference_id?: number;
  /** Legacy field for user plants */
  user_plants?: UserPlant[];
  /** Legacy field for NC region IDs */
  nc_regions_ids?: string[];
  /** Legacy field for USDA zone IDs */
  usda_zones_ids?: string[];
  /** Legacy field for flower color IDs */
  flower_color_ids?: string[];
  /** Legacy field for flower bloom time IDs */
  flower_bloom_time_ids?: string[];
  /** Legacy field for flower value IDs */
  flower_value_ids?: string[];
  /** Legacy field for leaf color IDs */
  leaf_color_ids?: string[];
  /** Legacy field for leaf feel IDs */
  leaf_feel_ids?: string[];
  /** Legacy field for leaf value IDs */
  leaf_value_ids?: string[];
  /** Legacy field for fall color IDs */
  fall_color_ids?: string[];
  /** Legacy field for habit form IDs */
  habit_form_ids?: string[];
  /** Legacy field for plant type IDs */
  plant_type_ids?: string[];
  /** Legacy field for design feature IDs */
  design_feature_ids?: string[];
}
