export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_gardens: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          location_ids: Json;
          space_available_ids: Json;
          sunlight_ids: Json;
          soil_texture_ids: Json;
          soil_drainage_ids: Json;
          soil_ph_ids: Json;
          garden_theme_ids: Json;
          wildlife_attraction_ids: Json;
          resistance_challenge_ids: Json;
          problems_to_exclude_ids: Json;
          growth_rate_id: number | null;
          maintenance_level_id: number | null;
          texture_preference_id: number | null;
          user_plants_id: Json;
          wants_recommendations: boolean | null;
          nc_regions_ids: Json;
          usda_zones_ids: Json;
          flower_color_ids: Json;
          flower_bloom_time_ids: Json;
          flower_value_ids: Json;
          leaf_color_ids: Json;
          leaf_feel_ids: Json;
          leaf_value_ids: Json;
          fall_color_ids: Json;
          habit_form_ids: Json;
          plant_type_ids: Json;
          year_round_interest: boolean | null;
          design_feature_ids: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
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
      user_plants: {
        Row: {
          id: string;
          garden_id: number;
          custom_name: string;
          botanical_name: string;
          status: string;
          care_logs: Json;
          images: Json;
          location_tags: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          garden_id: number;
          custom_name: string;
          botanical_name: string;
          status: string;
          care_logs?: Json;
          images?: Json;
          location_tags?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          garden_id?: number;
          custom_name?: string;
          botanical_name?: string;
          status?: string;
          care_logs?: Json;
          images?: Json;
          location_tags?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
