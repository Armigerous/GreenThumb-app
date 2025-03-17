export interface UserPlant {
  id: string;
  garden_id: number;
  custom_name: string;
  botanical_name: string;
  status: "healthy" | "needs_attention" | "critical";
  care_logs?: any[];
  images?: string[];
  location_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Garden {
  id: number;
  user_id: string;
  name: string;
  location_ids?: string[];
  space_available_ids?: string[];
  sunlight_ids?: string[];
  soil_texture_ids?: string[];
  soil_drainage_ids?: string[];
  soil_ph_ids?: string[];
  garden_theme_ids?: string[];
  wildlife_attraction_ids?: string[];
  resistance_challenge_ids?: string[];
  problems_to_exclude_ids?: string[];
  growth_rate_id?: number;
  maintenance_level_id?: number;
  texture_preference_id?: number;
  user_plants?: UserPlant[];
  wants_recommendations?: boolean;
  nc_regions_ids?: string[];
  usda_zones_ids?: string[];
  flower_color_ids?: string[];
  flower_bloom_time_ids?: string[];
  flower_value_ids?: string[];
  leaf_color_ids?: string[];
  leaf_feel_ids?: string[];
  leaf_value_ids?: string[];
  fall_color_ids?: string[];
  habit_form_ids?: string[];
  plant_type_ids?: string[];
  year_round_interest?: boolean;
  design_feature_ids?: string[];
  created_at: string;
  updated_at: string;
}
