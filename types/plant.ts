export interface PlantCardData {
  id: number;
  slug: string;
  scientific_name: string;
  common_name?: string;
  first_image?: string;
  first_tag?: string;
  description?: string;
  first_image_alt_text?: string;
}

export interface PlantData extends PlantCardData {
  id: number;
  slug: string;
  genus?: string | null;
  common_names?: (string | null)[];
  species?: string | null;
  scientific_name: string;
  family?: string | null;
  sound_file?: string | null;
  phonetic_spelling?: string | null;
  description?: string;
  profile_video?: string | null;
  height_max?: number | null;
  height_min?: number | null;
  width_max?: number | null;
  width_min?: number | null;
  origin?: string | null;
  distribution?: string | null;
  uses?: string | null;
  images: PlantImage[] | undefined | null;
  wildlife_value?: string | null;
  edibility?: string | null;
  flower_description?: string | null;
  leaf_description?: string | null;
  fruit_description?: string | null;
  stem_description?: string | null;
  bark_description?: string | null;
  poison_symptoms?: string | null;
  poison_toxic_principle?: string | null;
  fire_risk?: string | null;
  flower_size?: string | null;
  fruit_length?: string | null;
  fruit_width?: string | null;
  garden_spaces?: string | null;
  growth_rate?: string | null;
  leaf_hairs_present?: string | null;
  leaf_length?: string | null;
  leaf_width?: string | null;
  poison_dermatitis?: string | null;
  poison_severity?: string | null;
  stem_aromatic?: string | null;
  stem_bud_scale?: string | null;
  stem_bud_terminal?: string | null;
  stem_buds?: string | null;
  stem_cross_section?: string | null;
  stem_form?: string | null;
  stem_leaf_scar_shape?: string | null;
  stem_lenticels?: string | null;
  stem_pith?: string | null;
  stem_surface?: string | null;
  texture?: string | null;
  tags?: (string | null)[];
  attracts?: (string | null)[];
  available_space_to_plant?: (string | null)[];
  bark_attachment?: (string | null)[];
  bark_color?: (string | null)[];
  bark_plate_shape?: (string | null)[];
  design_features?: (string | null)[];
  flower_bloom_time?: (string | null)[];
  flower_color?: (string | null)[];
  flower_inflorescence?: (string | null)[];
  flower_petals?: (string | null)[];
  flower_shape?: (string | null)[];
  flower_value_to_gardener?: (string | null)[];
  fruit_color?: (string | null)[];
  fruit_display_harvest_time?: (string | null)[];
  fruit_type?: (string | null)[];
  fruit_value_to_gardener?: (string | null)[];
  habit?: (string | null)[];
  landscape_location?: (string | null)[];
  landscape_theme?: (string | null)[];
  leaf_arrangement?: (string | null)[];
  leaf_characteristics?: (string | null)[];
  leaf_color?: (string | null)[];
  leaf_fall_color?: (string | null)[];
  leaf_feel?: (string | null)[];
  leaf_margin?: (string | null)[];
  leaf_shape?: (string | null)[];
  leaf_type?: (string | null)[];
  leaf_value_to_gardener?: (string | null)[];
  life_cycle?: (string | null)[];
  light?: (string | null)[];
  maintenance?: (string | null)[];
  nc_region?: (string | null)[];
  plant_types?: (string | null)[];
  poison_part?: (string | null)[];
  problems?: (string | null)[];
  propagation?: (string | null)[];
  resistance_to_challenges?: (string | null)[];
  soil_drainage?: (string | null)[];
  soil_ph?: (string | null)[];
  soil_texture?: (string | null)[];
  stem_color?: (string | null)[];
  usda_zones?: (string | null)[];
  light_requirements?: string | null;
  water_requirements?: string | null;
  usda_hardiness_zones?: string | null;
}

export interface PlantImage {
  id: number | null;
  img: string | null;
  caption?: string | null;
  alt_text?: string | null;
  attribution?: string | null;
}

export interface ApiResponse {
  results: PlantData[];
  count: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  filters?: string;
  nameType?: string;
}
