export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {};
    Views: {
      plant_card_data: {
        Row: {
          description: string | null;
          common_name: string | null;
          first_image: string | null;
          first_image_alt_text: string | null;
          first_tag: string | null;
          id: number | null;
          scientific_name: string | null;
          slug: string | null;
        };
      };
      plant_common_card_data: {
        Row: {
          common_name: string | null;
          description: string | null;
          first_image: string | null;
          first_image_alt_text: string | null;
          first_tag: string | null;
          id: number | null;
          scientific_name: string | null;
          scientific_slug: string | null;
          slug: string | null;
        };
      };
      plant_full_data: {
        Row: {
          attracts: Json | null;
          available_space_to_plant: Json | null;
          bark_attachment: Json | null;
          bark_color: Json | null;
          bark_description: string | null;
          bark_plate_shape: Json | null;
          common_names: string[] | null;
          cultivars: Json | null;
          description: string | null;
          design_feature: Json | null;
          distribution: string | null;
          edibility: string | null;
          family: string | null;
          fire_risk: string | null;
          flower_bloom_time: Json | null;
          flower_colors: Json | null;
          flower_description: string | null;
          flower_inflorescence: Json | null;
          flower_petals: Json | null;
          flower_shape: Json | null;
          flower_size: string | null;
          flower_value_to_gardener: Json | null;
          fruit_color: Json | null;
          fruit_description: string | null;
          fruit_display_harvest_time: Json | null;
          fruit_length: string | null;
          fruit_type: Json | null;
          fruit_value_to_gardener: Json | null;
          fruit_width: string | null;
          garden_spaces: string | null;
          genus: string | null;
          growth_rate: string | null;
          height_max: number | null;
          height_min: number | null;
          id: number | null;
          images: Json | null;
          landscape_location: Json | null;
          landscape_theme: Json | null;
          leaf_arrangement: Json | null;
          leaf_characteristics: Json | null;
          leaf_color: Json | null;
          leaf_description: string | null;
          leaf_fall_color: Json | null;
          leaf_feel: Json | null;
          leaf_hairs_present: string | null;
          leaf_length: string | null;
          leaf_margin: Json | null;
          leaf_shape: Json | null;
          leaf_type: Json | null;
          leaf_value_to_gardener: Json | null;
          leaf_width: string | null;
          life_cycle: Json | null;
          light_requirements: Json | null;
          maintenance: Json | null;
          nc_regions: Json | null;
          origin: string | null;
          phonetic_spelling: string | null;
          plant_habit: Json | null;
          plant_types: Json | null;
          poison_dermatitis: string | null;
          poison_parts: Json | null;
          poison_severity: string | null;
          poison_symptoms: string | null;
          poison_toxic_principle: string | null;
          problems: Json | null;
          profile_video: string | null;
          propagation: Json | null;
          resistance_to_challenges: Json | null;
          scientific_name: string | null;
          slug: string | null;
          soil_drainage: Json | null;
          soil_ph: Json | null;
          soil_texture: Json | null;
          sound_file: string | null;
          species: string | null;
          stem_aromatic: string | null;
          stem_bud_scale: string | null;
          stem_bud_terminal: string | null;
          stem_buds: string | null;
          stem_color: Json | null;
          stem_cross_section: string | null;
          stem_description: string | null;
          stem_form: string | null;
          stem_leaf_scar_shape: string | null;
          stem_lenticels: string | null;
          stem_pith: string | null;
          stem_surface: string | null;
          synonyms: string[] | null;
          tags: Json | null;
          texture: string | null;
          usda_zones: Json | null;
          uses: string | null;
          width_max: number | null;
          width_min: number | null;
          wildlife_value: string | null;
        };
      };
    };
  };
};
