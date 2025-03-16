export interface PlantCardData {
  id: number;
  slug: string;
  scientific_name: string;
  common_name?: string;
  first_image?: string;
  first_tag?: string;
  description?: string;
}

export interface PlantData extends PlantCardData {
  family?: string;
  genus?: string;
  species?: string;
  care_level?: string;
  light_requirements?: string;
  water_requirements?: string;
  temperature_range?: string;
  humidity_requirements?: string;
  soil_type?: string;
  growth_rate?: string;
  mature_size?: string;
  bloom_time?: string;
  flower_color?: string;
  propagation_methods?: string;
  common_pests?: string;
  toxicity?: string;
  origin?: string;
  additional_info?: string;
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
