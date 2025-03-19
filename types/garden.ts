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
  wants_recommendations?: boolean;
  year_round_interest?: boolean;
  created_at: string;
  updated_at: string;

  // Values instead of IDs
  growth_rate?: string;
  maintenance_level?: string;
  texture_preference?: string;

  // Arrays of values instead of ID arrays
  locations?: string[];
  available_space?: string[];
  sunlight?: string[];
  soil_texture?: string[];
  soil_drainage?: string[];
  soil_ph?: string[];
  garden_themes?: string[];
  wildlife_attractions?: string[];
  resistance_challenges?: string[];
  problems_to_exclude?: string[];
  nc_regions?: string[];
  usda_zones?: string[];
  flower_colors?: string[];
  flower_bloom_times?: string[];
  flower_values?: string[];
  leaf_colors?: string[];
  leaf_feels?: string[];
  leaf_values?: string[];
  fall_colors?: string[];
  habit_forms?: string[];
  plant_types?: string[];
  design_features?: string[];

  // Actual plants data instead of just IDs
  plants?: UserPlant[];

  // Keep the old field names for backward compatibility
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
  design_feature_ids?: string[];
}
