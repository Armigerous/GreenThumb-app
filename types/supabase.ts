/**
 * Represents JSON data types that can be stored in Supabase
 *
 * This type allows for storing various data types as JSON in the database,
 * including strings, numbers, booleans, null values, and nested objects/arrays.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Represents the Supabase database schema
 *
 * This interface defines the structure of the database, including
 * all tables, views, functions, and enums in the public schema.
 */
export interface Database {
  public: {
    Tables: {
      /**
       * User gardens table
       *
       * Stores information about gardens created by users, including
       * garden preferences, conditions, and references to plants.
       */
      user_gardens: {
        Row: {
          /** Unique identifier for the garden (primary key) */
          id: number;
          /** Foreign key reference to the user who owns this garden */
          user_id: string;
          /** Name of the garden */
          name: string;
          /** JSON array of location IDs associated with this garden */
          location_ids: Json;
          /** JSON array of space availability IDs for this garden */
          space_available_ids: Json;
          /** JSON array of sunlight condition IDs for this garden */
          sunlight_ids: Json;
          /** JSON array of soil texture IDs for this garden */
          soil_texture_ids: Json;
          /** JSON array of soil drainage IDs for this garden */
          soil_drainage_ids: Json;
          /** JSON array of soil pH IDs for this garden */
          soil_ph_ids: Json;
          /** JSON array of garden theme IDs for this garden */
          garden_theme_ids: Json;
          /** JSON array of wildlife attraction IDs for this garden */
          wildlife_attraction_ids: Json;
          /** JSON array of resistance challenge IDs for this garden */
          resistance_challenge_ids: Json;
          /** JSON array of problem IDs to exclude from this garden */
          problems_to_exclude_ids: Json;
          /** Growth rate preference ID */
          growth_rate_id: number | null;
          /** Maintenance level preference ID */
          maintenance_level_id: number | null;
          /** Texture preference ID */
          texture_preference_id: number | null;
          /** JSON array of plant IDs in this garden */
          user_plants_id: Json;
          /** Whether the user wants recommendations for this garden */
          wants_recommendations: boolean | null;
          /** JSON array of North Carolina region IDs for this garden */
          nc_regions_ids: Json;
          /** JSON array of USDA zone IDs for this garden */
          usda_zones_ids: Json;
          /** JSON array of flower color IDs for this garden */
          flower_color_ids: Json;
          /** JSON array of flower bloom time IDs for this garden */
          flower_bloom_time_ids: Json;
          /** JSON array of flower value IDs for this garden */
          flower_value_ids: Json;
          /** JSON array of leaf color IDs for this garden */
          leaf_color_ids: Json;
          /** JSON array of leaf feel IDs for this garden */
          leaf_feel_ids: Json;
          /** JSON array of leaf value IDs for this garden */
          leaf_value_ids: Json;
          /** JSON array of fall color IDs for this garden */
          fall_color_ids: Json;
          /** JSON array of plant habit/form IDs for this garden */
          habit_form_ids: Json;
          /** JSON array of plant type IDs for this garden */
          plant_type_ids: Json;
          /** Whether the garden should have plants with year-round interest */
          year_round_interest: boolean | null;
          /** JSON array of design feature IDs for this garden */
          design_feature_ids: Json;
          /** Timestamp when this garden was created */
          created_at: string;
          /** Timestamp when this garden was last updated */
          updated_at: string;
        };
        /** Shape of the data for inserting a new garden */
        Insert: {
          /** Optional: ID will be auto-generated if not provided */
          id?: number;
          /** Required: ID of the user who owns this garden */
          user_id: string;
          /** Required: Name of the garden */
          name: string;
          /** Optional: JSON array of location IDs */
          location_ids?: Json;
          /** Optional: JSON array of space availability IDs */
          space_available_ids?: Json;
          /** Optional: JSON array of sunlight condition IDs */
          sunlight_ids?: Json;
          /** Optional: JSON array of soil texture IDs */
          soil_texture_ids?: Json;
          /** Optional: JSON array of soil drainage IDs */
          soil_drainage_ids?: Json;
          /** Optional: JSON array of soil pH IDs */
          soil_ph_ids?: Json;
          /** Optional: JSON array of garden theme IDs */
          garden_theme_ids?: Json;
          /** Optional: JSON array of wildlife attraction IDs */
          wildlife_attraction_ids?: Json;
          /** Optional: JSON array of resistance challenge IDs */
          resistance_challenge_ids?: Json;
          /** Optional: JSON array of problem IDs to exclude */
          problems_to_exclude_ids?: Json;
          /** Optional: Growth rate preference ID */
          growth_rate_id?: number | null;
          /** Optional: Maintenance level preference ID */
          maintenance_level_id?: number | null;
          /** Optional: Texture preference ID */
          texture_preference_id?: number | null;
          /** Optional: JSON array of plant IDs */
          user_plants_id?: Json;
          /** Optional: Whether to provide plant recommendations */
          wants_recommendations?: boolean | null;
          /** Optional: JSON array of NC region IDs */
          nc_regions_ids?: Json;
          /** Optional: JSON array of USDA zone IDs */
          usda_zones_ids?: Json;
          /** Optional: JSON array of flower color IDs */
          flower_color_ids?: Json;
          /** Optional: JSON array of flower bloom time IDs */
          flower_bloom_time_ids?: Json;
          /** Optional: JSON array of flower value IDs */
          flower_value_ids?: Json;
          /** Optional: JSON array of leaf color IDs */
          leaf_color_ids?: Json;
          /** Optional: JSON array of leaf feel IDs */
          leaf_feel_ids?: Json;
          /** Optional: JSON array of leaf value IDs */
          leaf_value_ids?: Json;
          /** Optional: JSON array of fall color IDs */
          fall_color_ids?: Json;
          /** Optional: JSON array of habit form IDs */
          habit_form_ids?: Json;
          /** Optional: JSON array of plant type IDs */
          plant_type_ids?: Json;
          /** Optional: Whether to focus on year-round interest */
          year_round_interest?: boolean | null;
          /** Optional: JSON array of design feature IDs */
          design_feature_ids?: Json;
          /** Optional: Creation timestamp (defaults to now()) */
          created_at?: string;
          /** Optional: Update timestamp (defaults to now()) */
          updated_at?: string;
        };
        /** Shape of the data for updating an existing garden */
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          location_ids?: Json;
          space_available_ids?: Json;
          sunlight_ids?: Json;
          soil_texture_ids?: Json;
          soil_drainage_ids?: Json;
          soil_ph_ids?: Json;
          garden_theme_ids?: Json;
          wildlife_attraction_ids?: Json;
          resistance_challenge_ids?: Json;
          problems_to_exclude_ids?: Json;
          growth_rate_id?: number | null;
          maintenance_level_id?: number | null;
          texture_preference_id?: number | null;
          user_plants_id?: Json;
          wants_recommendations?: boolean | null;
          nc_regions_ids?: Json;
          usda_zones_ids?: Json;
          flower_color_ids?: Json;
          flower_bloom_time_ids?: Json;
          flower_value_ids?: Json;
          leaf_color_ids?: Json;
          leaf_feel_ids?: Json;
          leaf_value_ids?: Json;
          fall_color_ids?: Json;
          habit_form_ids?: Json;
          plant_type_ids?: Json;
          year_round_interest?: boolean | null;
          design_feature_ids?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * User plants table
       *
       * Stores information about specific plant instances in user gardens,
       * including their nickname, status, care history, and references to
       * plant data in the main_plant_data table.
       */
      user_plants: {
        Row: {
          /** Unique identifier for the user plant (primary key) */
          id: string;
          /** Foreign key reference to the garden this plant belongs to */
          garden_id: number;
          /** User-defined name for this specific plant */
          nickname: string;
          /** Foreign key reference to the plant in main_plant_data */
          plant_id: number;
          /** Current health status of the plant */
          status: string;
          /** JSON array of care activities performed on this plant */
          care_logs: Json;
          /** JSON array of image URLs or references for this plant */
          images: Json;
          /** Timestamp when this plant was added to the garden */
          created_at: string;
          /** Timestamp when this plant was last updated */
          updated_at: string;
        };
        /** Shape of the data for inserting a new plant */
        Insert: {
          /** Required: Unique identifier for the plant */
          id: string;
          /** Required: ID of the garden this plant belongs to */
          garden_id: number;
          /** Required: User-defined name for this plant */
          nickname: string;
          /** Required: ID of the plant in main_plant_data */
          plant_id: number;
          /** Required: Current health status of the plant */
          status: string;
          /** Optional: JSON array of care logs (defaults to []) */
          care_logs?: Json;
          /** Optional: JSON array of images (defaults to []) */
          images?: Json;
          /** Optional: Creation timestamp (defaults to now()) */
          created_at?: string;
          /** Optional: Update timestamp (defaults to now()) */
          updated_at?: string;
        };
        /** Shape of the data for updating an existing plant */
        Update: {
          id?: string;
          garden_id?: number;
          nickname?: string;
          plant_id?: number;
          status?: string;
          care_logs?: Json;
          images?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    /** Database views */
    Views: {
      [_ in never]: never;
    };
    /** Database functions */
    Functions: {
      [_ in never]: never;
    };
    /** Database enums */
    Enums: {
      [_ in never]: never;
    };
  };
}
