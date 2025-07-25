export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attracts_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      available_space_to_plant_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      bark_attachment_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      bark_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      bark_plate_shape_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      cached_responses: {
        Row: {
          context: string | null
          created_at: string | null
          embedding: string | null
          id: number
          query: string
          response: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          query: string
          response: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          query?: string
          response?: string
        }
        Relationships: []
      }
      cultivars: {
        Row: {
          description: string | null
          id: number
          name: string | null
          plant_id: number | null
        }
        Insert: {
          description?: string | null
          id?: number
          name?: string | null
          plant_id?: number | null
        }
        Update: {
          description?: string | null
          id?: number
          name?: string | null
          plant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cultivars_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "main_plant_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivars_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivars_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivars_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_name_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivars_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_full_data"
            referencedColumns: ["id"]
          },
        ]
      }
      design_feature_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string
          embedding: string
          id: string
          resource_id: string | null
        }
        Insert: {
          content: string
          embedding: string
          id: string
          resource_id?: string | null
        }
        Update: {
          content?: string
          embedding?: string
          id?: string
          resource_id?: string | null
        }
        Relationships: []
      }
      fire_risk_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_bloom_time_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_inflorescence_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_petals_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_shape_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_size_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      flower_value_to_gardener_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_display_harvest_time_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_length_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_type_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_value_to_gardener_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      fruit_width_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      garden_spaces_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      garden_theme_lookup: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      growth_rate_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      habit_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      landscape_location_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      landscape_theme_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_arrangement_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_characteristics_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_fall_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_feel_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_hairs_present_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_length_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_margin_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_shape_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_type_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_value_to_gardener_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      leaf_width_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      life_cycle_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      light_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      main_plant_data: {
        Row: {
          appendage: string | null
          attracts_ids: Json | null
          available_space_to_plant_ids: Json | null
          bark_attachment_ids: Json | null
          bark_color_ids: Json | null
          bark_description: string | null
          bark_plate_shape_ids: Json | null
          bulb_storage: string | null
          common_disease_problems: string | null
          common_insect_problems: string | null
          common_names: Json | null
          confused_with: string | null
          description: string | null
          design_feature_ids: Json | null
          distribution: string | null
          edibility: string | null
          family: string | null
          fire_risk_id: number | null
          flower_bloom_time_ids: Json | null
          flower_color_ids: Json | null
          flower_description: string | null
          flower_inflorescence_ids: Json | null
          flower_petals_ids: Json | null
          flower_shape_ids: Json | null
          flower_size_id: number | null
          flower_value_to_gardener_ids: Json | null
          fruit_color_ids: Json | null
          fruit_description: string | null
          fruit_display_harvest_time_ids: Json | null
          fruit_length_id: number | null
          fruit_type_ids: Json | null
          fruit_value_to_gardener_ids: Json | null
          fruit_width_id: number | null
          garden_spaces_id: number | null
          genus: string | null
          growth_rate_id: number | null
          habit_ids: Json | null
          height_max: number | null
          height_min: number | null
          id: number
          landscape_location_ids: Json | null
          landscape_theme_ids: Json | null
          leaf_arrangement_ids: Json | null
          leaf_characteristics_ids: Json | null
          leaf_color_ids: Json | null
          leaf_description: string | null
          leaf_fall_color_ids: Json | null
          leaf_feel_ids: Json | null
          leaf_hairs_present_id: number | null
          leaf_length_id: number | null
          leaf_margin_ids: Json | null
          leaf_shape_ids: Json | null
          leaf_type_ids: Json | null
          leaf_value_to_gardener_ids: Json | null
          leaf_width_id: number | null
          life_cycle_ids: Json | null
          light_ids: Json | null
          maintenance_ids: Json | null
          native_alternative: string | null
          nc_region_ids: Json | null
          origin: string | null
          other_plant_problems: string | null
          phonetic_spelling: string | null
          plant_types_ids: Json | null
          poison_dermatitis_id: number | null
          poison_part_ids: Json | null
          poison_severity_id: number | null
          poison_symptoms: string | null
          poison_toxic_principle: string | null
          problems_ids: Json | null
          profile_video: string | null
          propagation_ids: Json | null
          resistance: Json | null
          scientific_name: string
          similar: number[] | null
          slug: string
          soil_drainage_ids: Json | null
          soil_ph_ids: Json | null
          soil_texture_ids: Json | null
          sound_file: string | null
          species: string | null
          stem_aromatic_id: number | null
          stem_bud_scale_id: number | null
          stem_bud_terminal_id: number | null
          stem_buds_id: number | null
          stem_color_ids: Json | null
          stem_cross_section_id: number | null
          stem_description: string | null
          stem_form_id: number | null
          stem_leaf_scar_shape_id: number | null
          stem_lenticels_id: number | null
          stem_pith_id: number | null
          stem_surface_id: number | null
          synonyms: Json | null
          tags_ids: Json | null
          texture_id: number | null
          usda_zone_ids: Json | null
          uses: string | null
          width_max: number | null
          width_min: number | null
          wildlife_value: string | null
        }
        Insert: {
          appendage?: string | null
          attracts_ids?: Json | null
          available_space_to_plant_ids?: Json | null
          bark_attachment_ids?: Json | null
          bark_color_ids?: Json | null
          bark_description?: string | null
          bark_plate_shape_ids?: Json | null
          bulb_storage?: string | null
          common_disease_problems?: string | null
          common_insect_problems?: string | null
          common_names?: Json | null
          confused_with?: string | null
          description?: string | null
          design_feature_ids?: Json | null
          distribution?: string | null
          edibility?: string | null
          family?: string | null
          fire_risk_id?: number | null
          flower_bloom_time_ids?: Json | null
          flower_color_ids?: Json | null
          flower_description?: string | null
          flower_inflorescence_ids?: Json | null
          flower_petals_ids?: Json | null
          flower_shape_ids?: Json | null
          flower_size_id?: number | null
          flower_value_to_gardener_ids?: Json | null
          fruit_color_ids?: Json | null
          fruit_description?: string | null
          fruit_display_harvest_time_ids?: Json | null
          fruit_length_id?: number | null
          fruit_type_ids?: Json | null
          fruit_value_to_gardener_ids?: Json | null
          fruit_width_id?: number | null
          garden_spaces_id?: number | null
          genus?: string | null
          growth_rate_id?: number | null
          habit_ids?: Json | null
          height_max?: number | null
          height_min?: number | null
          id?: number
          landscape_location_ids?: Json | null
          landscape_theme_ids?: Json | null
          leaf_arrangement_ids?: Json | null
          leaf_characteristics_ids?: Json | null
          leaf_color_ids?: Json | null
          leaf_description?: string | null
          leaf_fall_color_ids?: Json | null
          leaf_feel_ids?: Json | null
          leaf_hairs_present_id?: number | null
          leaf_length_id?: number | null
          leaf_margin_ids?: Json | null
          leaf_shape_ids?: Json | null
          leaf_type_ids?: Json | null
          leaf_value_to_gardener_ids?: Json | null
          leaf_width_id?: number | null
          life_cycle_ids?: Json | null
          light_ids?: Json | null
          maintenance_ids?: Json | null
          native_alternative?: string | null
          nc_region_ids?: Json | null
          origin?: string | null
          other_plant_problems?: string | null
          phonetic_spelling?: string | null
          plant_types_ids?: Json | null
          poison_dermatitis_id?: number | null
          poison_part_ids?: Json | null
          poison_severity_id?: number | null
          poison_symptoms?: string | null
          poison_toxic_principle?: string | null
          problems_ids?: Json | null
          profile_video?: string | null
          propagation_ids?: Json | null
          resistance?: Json | null
          scientific_name: string
          similar?: number[] | null
          slug: string
          soil_drainage_ids?: Json | null
          soil_ph_ids?: Json | null
          soil_texture_ids?: Json | null
          sound_file?: string | null
          species?: string | null
          stem_aromatic_id?: number | null
          stem_bud_scale_id?: number | null
          stem_bud_terminal_id?: number | null
          stem_buds_id?: number | null
          stem_color_ids?: Json | null
          stem_cross_section_id?: number | null
          stem_description?: string | null
          stem_form_id?: number | null
          stem_leaf_scar_shape_id?: number | null
          stem_lenticels_id?: number | null
          stem_pith_id?: number | null
          stem_surface_id?: number | null
          synonyms?: Json | null
          tags_ids?: Json | null
          texture_id?: number | null
          usda_zone_ids?: Json | null
          uses?: string | null
          width_max?: number | null
          width_min?: number | null
          wildlife_value?: string | null
        }
        Update: {
          appendage?: string | null
          attracts_ids?: Json | null
          available_space_to_plant_ids?: Json | null
          bark_attachment_ids?: Json | null
          bark_color_ids?: Json | null
          bark_description?: string | null
          bark_plate_shape_ids?: Json | null
          bulb_storage?: string | null
          common_disease_problems?: string | null
          common_insect_problems?: string | null
          common_names?: Json | null
          confused_with?: string | null
          description?: string | null
          design_feature_ids?: Json | null
          distribution?: string | null
          edibility?: string | null
          family?: string | null
          fire_risk_id?: number | null
          flower_bloom_time_ids?: Json | null
          flower_color_ids?: Json | null
          flower_description?: string | null
          flower_inflorescence_ids?: Json | null
          flower_petals_ids?: Json | null
          flower_shape_ids?: Json | null
          flower_size_id?: number | null
          flower_value_to_gardener_ids?: Json | null
          fruit_color_ids?: Json | null
          fruit_description?: string | null
          fruit_display_harvest_time_ids?: Json | null
          fruit_length_id?: number | null
          fruit_type_ids?: Json | null
          fruit_value_to_gardener_ids?: Json | null
          fruit_width_id?: number | null
          garden_spaces_id?: number | null
          genus?: string | null
          growth_rate_id?: number | null
          habit_ids?: Json | null
          height_max?: number | null
          height_min?: number | null
          id?: number
          landscape_location_ids?: Json | null
          landscape_theme_ids?: Json | null
          leaf_arrangement_ids?: Json | null
          leaf_characteristics_ids?: Json | null
          leaf_color_ids?: Json | null
          leaf_description?: string | null
          leaf_fall_color_ids?: Json | null
          leaf_feel_ids?: Json | null
          leaf_hairs_present_id?: number | null
          leaf_length_id?: number | null
          leaf_margin_ids?: Json | null
          leaf_shape_ids?: Json | null
          leaf_type_ids?: Json | null
          leaf_value_to_gardener_ids?: Json | null
          leaf_width_id?: number | null
          life_cycle_ids?: Json | null
          light_ids?: Json | null
          maintenance_ids?: Json | null
          native_alternative?: string | null
          nc_region_ids?: Json | null
          origin?: string | null
          other_plant_problems?: string | null
          phonetic_spelling?: string | null
          plant_types_ids?: Json | null
          poison_dermatitis_id?: number | null
          poison_part_ids?: Json | null
          poison_severity_id?: number | null
          poison_symptoms?: string | null
          poison_toxic_principle?: string | null
          problems_ids?: Json | null
          profile_video?: string | null
          propagation_ids?: Json | null
          resistance?: Json | null
          scientific_name?: string
          similar?: number[] | null
          slug?: string
          soil_drainage_ids?: Json | null
          soil_ph_ids?: Json | null
          soil_texture_ids?: Json | null
          sound_file?: string | null
          species?: string | null
          stem_aromatic_id?: number | null
          stem_bud_scale_id?: number | null
          stem_bud_terminal_id?: number | null
          stem_buds_id?: number | null
          stem_color_ids?: Json | null
          stem_cross_section_id?: number | null
          stem_description?: string | null
          stem_form_id?: number | null
          stem_leaf_scar_shape_id?: number | null
          stem_lenticels_id?: number | null
          stem_pith_id?: number | null
          stem_surface_id?: number | null
          synonyms?: Json | null
          tags_ids?: Json | null
          texture_id?: number | null
          usda_zone_ids?: Json | null
          uses?: string | null
          width_max?: number | null
          width_min?: number | null
          wildlife_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "main_plant_data_fire_risk_id_fkey"
            columns: ["fire_risk_id"]
            isOneToOne: false
            referencedRelation: "fire_risk_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_flower_size_id_fkey"
            columns: ["flower_size_id"]
            isOneToOne: false
            referencedRelation: "flower_size_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_fruit_length_id_fkey"
            columns: ["fruit_length_id"]
            isOneToOne: false
            referencedRelation: "fruit_length_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_fruit_width_id_fkey"
            columns: ["fruit_width_id"]
            isOneToOne: false
            referencedRelation: "fruit_width_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_garden_spaces_id_fkey"
            columns: ["garden_spaces_id"]
            isOneToOne: false
            referencedRelation: "garden_spaces_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_growth_rate_id_fkey"
            columns: ["growth_rate_id"]
            isOneToOne: false
            referencedRelation: "growth_rate_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_leaf_hairs_present_id_fkey"
            columns: ["leaf_hairs_present_id"]
            isOneToOne: false
            referencedRelation: "leaf_hairs_present_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_leaf_length_id_fkey"
            columns: ["leaf_length_id"]
            isOneToOne: false
            referencedRelation: "leaf_length_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_leaf_width_id_fkey"
            columns: ["leaf_width_id"]
            isOneToOne: false
            referencedRelation: "leaf_width_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_poison_dermatitis_id_fkey"
            columns: ["poison_dermatitis_id"]
            isOneToOne: false
            referencedRelation: "poison_dermatitis_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_poison_severity_id_fkey"
            columns: ["poison_severity_id"]
            isOneToOne: false
            referencedRelation: "poison_severity_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_aromatic_id_fkey"
            columns: ["stem_aromatic_id"]
            isOneToOne: false
            referencedRelation: "stem_aromatic_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_bud_scale_id_fkey"
            columns: ["stem_bud_scale_id"]
            isOneToOne: false
            referencedRelation: "stem_bud_scales_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_bud_terminal_id_fkey"
            columns: ["stem_bud_terminal_id"]
            isOneToOne: false
            referencedRelation: "stem_bud_terminal_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_buds_id_fkey"
            columns: ["stem_buds_id"]
            isOneToOne: false
            referencedRelation: "stem_buds_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_cross_section_id_fkey"
            columns: ["stem_cross_section_id"]
            isOneToOne: false
            referencedRelation: "stem_cross_section_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_form_id_fkey"
            columns: ["stem_form_id"]
            isOneToOne: false
            referencedRelation: "stem_form_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_leaf_scar_shape_id_fkey"
            columns: ["stem_leaf_scar_shape_id"]
            isOneToOne: false
            referencedRelation: "stem_leaf_scar_shape_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_lenticels_id_fkey"
            columns: ["stem_lenticels_id"]
            isOneToOne: false
            referencedRelation: "stem_lenticels_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_pith_id_fkey"
            columns: ["stem_pith_id"]
            isOneToOne: false
            referencedRelation: "stem_pith_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_stem_surface_id_fkey"
            columns: ["stem_surface_id"]
            isOneToOne: false
            referencedRelation: "stem_surface_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "main_plant_data_texture_id_fkey"
            columns: ["texture_id"]
            isOneToOne: false
            referencedRelation: "texture_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      nc_climate_county: {
        Row: {
          avg_annual_precip_mm: number
          county_id: number
          first_fall_frost_doy: number
          last_spring_frost_doy: number
          notes: string | null
          region_id: number | null
          snowfall_cm: number | null
          soil_texture_id: number
          zone_max_id: number
          zone_min_id: number
        }
        Insert: {
          avg_annual_precip_mm: number
          county_id: number
          first_fall_frost_doy: number
          last_spring_frost_doy: number
          notes?: string | null
          region_id?: number | null
          snowfall_cm?: number | null
          soil_texture_id: number
          zone_max_id: number
          zone_min_id: number
        }
        Update: {
          avg_annual_precip_mm?: number
          county_id?: number
          first_fall_frost_doy?: number
          last_spring_frost_doy?: number
          notes?: string | null
          region_id?: number | null
          snowfall_cm?: number | null
          soil_texture_id?: number
          zone_max_id?: number
          zone_min_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "nc_climate_county_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: true
            referencedRelation: "nc_counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nc_climate_county_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "nc_region_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nc_climate_county_soil_texture_id_fkey"
            columns: ["soil_texture_id"]
            isOneToOne: false
            referencedRelation: "soil_texture_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nc_climate_county_zone_max_id_fkey"
            columns: ["zone_max_id"]
            isOneToOne: false
            referencedRelation: "usda_zone_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nc_climate_county_zone_min_id_fkey"
            columns: ["zone_min_id"]
            isOneToOne: false
            referencedRelation: "usda_zone_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
      nc_counties: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      nc_region_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
          user_subscription_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
          user_subscription_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
          user_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_care_logs: {
        Row: {
          care_notes: string | null
          id: number
          image: string
          taken_care_at: string
          user_plant_id: string | null
        }
        Insert: {
          care_notes?: string | null
          id?: number
          image: string
          taken_care_at?: string
          user_plant_id?: string | null
        }
        Update: {
          care_notes?: string | null
          id?: number
          image?: string
          taken_care_at?: string
          user_plant_id?: string | null
        }
        Relationships: []
      }
      plant_images: {
        Row: {
          alt_text: string | null
          attribution: string | null
          caption: string | null
          id: number
          img: string | null
          plant_id: number | null
        }
        Insert: {
          alt_text?: string | null
          attribution?: string | null
          caption?: string | null
          id?: number
          img?: string | null
          plant_id?: number | null
        }
        Update: {
          alt_text?: string | null
          attribution?: string | null
          caption?: string | null
          id?: number
          img?: string | null
          plant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "main_plant_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_name_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_images_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_full_data"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_missing_details: {
        Row: {
          appendage: string | null
          bulb_storage: string | null
          common_disease_problems: string | null
          common_insect_problems: string | null
          confused_with: string | null
          id: number
          native_alternative: string | null
          other_plant_problems: string | null
          resistance: string | null
          similar: string | null
        }
        Insert: {
          appendage?: string | null
          bulb_storage?: string | null
          common_disease_problems?: string | null
          common_insect_problems?: string | null
          confused_with?: string | null
          id: number
          native_alternative?: string | null
          other_plant_problems?: string | null
          resistance?: string | null
          similar?: string | null
        }
        Update: {
          appendage?: string | null
          bulb_storage?: string | null
          common_disease_problems?: string | null
          common_insect_problems?: string | null
          confused_with?: string | null
          id?: number
          native_alternative?: string | null
          other_plant_problems?: string | null
          resistance?: string | null
          similar?: string | null
        }
        Relationships: []
      }
      plant_similarities: {
        Row: {
          plant_id: number
          similar_plant_id: number
        }
        Insert: {
          plant_id: number
          similar_plant_id: number
        }
        Update: {
          plant_id?: number
          similar_plant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plant_similarities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "main_plant_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_name_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_full_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_similar_plant_id_fkey"
            columns: ["similar_plant_id"]
            isOneToOne: false
            referencedRelation: "main_plant_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_similar_plant_id_fkey"
            columns: ["similar_plant_id"]
            isOneToOne: false
            referencedRelation: "plant_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_similar_plant_id_fkey"
            columns: ["similar_plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_similar_plant_id_fkey"
            columns: ["similar_plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_name_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_similarities_similar_plant_id_fkey"
            columns: ["similar_plant_id"]
            isOneToOne: false
            referencedRelation: "plant_full_data"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_tasks: {
        Row: {
          completed: boolean
          due_date: string
          id: number
          metadata: Json | null
          task_type: string
          user_plant_id: string
        }
        Insert: {
          completed?: boolean
          due_date: string
          id?: number
          metadata?: Json | null
          task_type: string
          user_plant_id: string
        }
        Update: {
          completed?: boolean
          due_date?: string
          id?: number
          metadata?: Json | null
          task_type?: string
          user_plant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_plant"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "garden_tasks_summary"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "fk_user_plant"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_type_lookup: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      plant_types_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      poison_dermatitis_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      poison_part_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      poison_severity_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string | null
          category: string | null
          description: string | null
          id: number
          slug: string | null
          title: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          description?: string | null
          id?: number
          slug?: string | null
          title: string
        }
        Update: {
          body?: string | null
          category?: string | null
          description?: string | null
          id?: number
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      problems_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      propagation_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      resistance_to_challenges_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      soil_drainage_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      soil_ph_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      soil_texture_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_aromatic_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_bud_scales_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_bud_terminal_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_buds_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_color_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_cross_section_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_form_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_leaf_scar_shape_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_lenticels_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_pith_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      stem_surface_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      subscription_addons: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interval_count: number
          interval_type: string
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id: string
          interval_count?: number
          interval_type: string
          is_active?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval_count?: number
          interval_type?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      texture_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      tips_tricks: {
        Row: {
          author_id: string
          body: Json | null
          created_at: string | null
          description: string | null
          id: number
          main_image_url: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          body?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          main_image_url?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          body?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          main_image_url?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      usda_zone_lookup: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      user_gardens: {
        Row: {
          attracts_ids: Json
          available_space_to_plant_id: number
          city: string | null
          county_id: number | null
          created_at: string
          design_feature_ids: Json
          elevation: number | null
          fall_color_ids: Json
          flower_bloom_time_ids: Json
          flower_color_ids: Json
          flower_value_to_gardener_ids: Json
          growth_rate_ids: Json
          habit_form_ids: Json
          id: number
          landscape_location_ids: Json
          landscape_theme_ids: Json
          leaf_color_ids: Json
          leaf_feel_ids: Json
          leaf_value_ids: Json
          light_id: number
          maintenance_id: number
          name: string
          nc_region_ids: Json
          plant_type_ids: Json
          problems_ids: Json
          resistance_to_challenges_ids: Json
          soil_drainage_ids: Json
          soil_ph_ids: Json
          soil_texture_id: number
          texture_id: number | null
          updated_at: string
          urban_index: number | null
          usda_zone_ids: Json
          user_id: string
          wants_recommendations: boolean | null
          zip_code: string | null
        }
        Insert: {
          attracts_ids?: Json
          available_space_to_plant_id: number
          city?: string | null
          county_id?: number | null
          created_at?: string
          design_feature_ids?: Json
          elevation?: number | null
          fall_color_ids?: Json
          flower_bloom_time_ids?: Json
          flower_color_ids?: Json
          flower_value_to_gardener_ids?: Json
          growth_rate_ids?: Json
          habit_form_ids?: Json
          id?: number
          landscape_location_ids?: Json
          landscape_theme_ids?: Json
          leaf_color_ids?: Json
          leaf_feel_ids?: Json
          leaf_value_ids?: Json
          light_id: number
          maintenance_id: number
          name: string
          nc_region_ids?: Json
          plant_type_ids?: Json
          problems_ids?: Json
          resistance_to_challenges_ids?: Json
          soil_drainage_ids?: Json
          soil_ph_ids?: Json
          soil_texture_id: number
          texture_id?: number | null
          updated_at?: string
          urban_index?: number | null
          usda_zone_ids?: Json
          user_id?: string
          wants_recommendations?: boolean | null
          zip_code?: string | null
        }
        Update: {
          attracts_ids?: Json
          available_space_to_plant_id?: number
          city?: string | null
          county_id?: number | null
          created_at?: string
          design_feature_ids?: Json
          elevation?: number | null
          fall_color_ids?: Json
          flower_bloom_time_ids?: Json
          flower_color_ids?: Json
          flower_value_to_gardener_ids?: Json
          growth_rate_ids?: Json
          habit_form_ids?: Json
          id?: number
          landscape_location_ids?: Json
          landscape_theme_ids?: Json
          leaf_color_ids?: Json
          leaf_feel_ids?: Json
          leaf_value_ids?: Json
          light_id?: number
          maintenance_id?: number
          name?: string
          nc_region_ids?: Json
          plant_type_ids?: Json
          problems_ids?: Json
          resistance_to_challenges_ids?: Json
          soil_drainage_ids?: Json
          soil_ph_ids?: Json
          soil_texture_id?: number
          texture_id?: number | null
          updated_at?: string
          urban_index?: number | null
          usda_zone_ids?: Json
          user_id?: string
          wants_recommendations?: boolean | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_county_id"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "nc_counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_gardens_available_space_id"
            columns: ["available_space_to_plant_id"]
            isOneToOne: false
            referencedRelation: "available_space_to_plant_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_gardens_light_id"
            columns: ["light_id"]
            isOneToOne: false
            referencedRelation: "light_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_gardens_soil_texture_id"
            columns: ["soil_texture_id"]
            isOneToOne: false
            referencedRelation: "soil_texture_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gardens_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gardens_texture_id_fkey"
            columns: ["texture_id"]
            isOneToOne: false
            referencedRelation: "texture_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gardens_flat: {
        Row: {
          available_space: string | null
          city: string | null
          county: string | null
          created_at: string | null
          design_features: Json | null
          elevation: number | null
          fall_colors: Json | null
          flower_bloom_times: Json | null
          flower_colors: Json | null
          flower_values: Json | null
          garden_themes: Json | null
          growth_rates: Json | null
          habit_forms: Json | null
          id: number
          landscape_locations: Json | null
          leaf_colors: Json | null
          leaf_feels: Json | null
          leaf_values: Json | null
          maintenance_level: string | null
          name: string | null
          nc_regions: Json | null
          plant_types: Json | null
          plants: Json | null
          problems: Json | null
          resistance_challenges: Json | null
          soil_drainage: Json | null
          soil_ph: Json | null
          soil_texture: string | null
          sunlight: string | null
          texture_preference: string | null
          updated_at: string | null
          urban_index: number | null
          usda_zones: Json | null
          user_id: string
          wants_recommendations: boolean | null
          wildlife_attractions: Json | null
          zip_code: string | null
        }
        Insert: {
          available_space?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          design_features?: Json | null
          elevation?: number | null
          fall_colors?: Json | null
          flower_bloom_times?: Json | null
          flower_colors?: Json | null
          flower_values?: Json | null
          garden_themes?: Json | null
          growth_rates?: Json | null
          habit_forms?: Json | null
          id: number
          landscape_locations?: Json | null
          leaf_colors?: Json | null
          leaf_feels?: Json | null
          leaf_values?: Json | null
          maintenance_level?: string | null
          name?: string | null
          nc_regions?: Json | null
          plant_types?: Json | null
          plants?: Json | null
          problems?: Json | null
          resistance_challenges?: Json | null
          soil_drainage?: Json | null
          soil_ph?: Json | null
          soil_texture?: string | null
          sunlight?: string | null
          texture_preference?: string | null
          updated_at?: string | null
          urban_index?: number | null
          usda_zones?: Json | null
          user_id: string
          wants_recommendations?: boolean | null
          wildlife_attractions?: Json | null
          zip_code?: string | null
        }
        Update: {
          available_space?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          design_features?: Json | null
          elevation?: number | null
          fall_colors?: Json | null
          flower_bloom_times?: Json | null
          flower_colors?: Json | null
          flower_values?: Json | null
          garden_themes?: Json | null
          growth_rates?: Json | null
          habit_forms?: Json | null
          id?: number
          landscape_locations?: Json | null
          leaf_colors?: Json | null
          leaf_feels?: Json | null
          leaf_values?: Json | null
          maintenance_level?: string | null
          name?: string | null
          nc_regions?: Json | null
          plant_types?: Json | null
          plants?: Json | null
          problems?: Json | null
          resistance_challenges?: Json | null
          soil_drainage?: Json | null
          soil_ph?: Json | null
          soil_texture?: string | null
          sunlight?: string | null
          texture_preference?: string | null
          updated_at?: string | null
          urban_index?: number | null
          usda_zones?: Json | null
          user_id?: string
          wants_recommendations?: boolean | null
          wildlife_attractions?: Json | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_plants: {
        Row: {
          care_logs: Json
          created_at: string
          garden_id: number
          id: string
          images: Json
          nickname: string
          plant_id: number
          updated_at: string
        }
        Insert: {
          care_logs?: Json
          created_at?: string
          garden_id: number
          id: string
          images?: Json
          nickname: string
          plant_id: number
          updated_at?: string
        }
        Update: {
          care_logs?: Json
          created_at?: string
          garden_id?: number
          id?: string
          images?: Json
          nickname?: string
          plant_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_plant_tracking_garden_id"
            columns: ["garden_id"]
            isOneToOne: false
            referencedRelation: "user_gardens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_plant_tracking_garden_id"
            columns: ["garden_id"]
            isOneToOne: false
            referencedRelation: "user_gardens_dashboard"
            referencedColumns: ["garden_id"]
          },
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "main_plant_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_card_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_common_name_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_full_data"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscription_addons: {
        Row: {
          addon_id: string
          created_at: string | null
          id: string
          quantity: number | null
          stripe_subscription_item_id: string | null
          updated_at: string | null
          user_subscription_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          stripe_subscription_item_id?: string | null
          updated_at?: string | null
          user_subscription_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          stripe_subscription_item_id?: string | null
          updated_at?: string | null
          user_subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscription_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "subscription_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscription_addons_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          created_at: string | null
          gardens_count: number | null
          id: string
          last_reset_date: string | null
          photos_uploaded_this_month: number | null
          plants_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gardens_count?: number | null
          id?: string
          last_reset_date?: string | null
          photos_uploaded_this_month?: number | null
          plants_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gardens_count?: number | null
          id?: string
          last_reset_date?: string | null
          photos_uploaded_this_month?: number | null
          plants_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      garden_tasks_summary: {
        Row: {
          completed: boolean | null
          due_date: string | null
          garden_id: number | null
          plant_id: string | null
          plant_nickname: string | null
          task_id: number | null
          task_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_plant_tracking_garden_id"
            columns: ["garden_id"]
            isOneToOne: false
            referencedRelation: "user_gardens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_plant_tracking_garden_id"
            columns: ["garden_id"]
            isOneToOne: false
            referencedRelation: "user_gardens_dashboard"
            referencedColumns: ["garden_id"]
          },
        ]
      }
      nc_climate_county_flat: {
        Row: {
          avg_annual_precip_mm: number | null
          county_id: number | null
          county_name: string | null
          first_fall_frost_doy: number | null
          last_spring_frost_doy: number | null
          notes: string | null
          region: string | null
          snowfall_cm: number | null
          soil_texture: string | null
          zone_max: string | null
          zone_min: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nc_climate_county_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: true
            referencedRelation: "nc_counties"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_autocomplete: {
        Row: {
          scientific_name: string | null
          slug: string | null
        }
        Relationships: []
      }
      plant_card_data: {
        Row: {
          common_name: string | null
          description: string | null
          first_image: string | null
          first_image_alt_text: string | null
          first_tag: string | null
          id: number | null
          scientific_name: string | null
          slug: string | null
        }
        Relationships: []
      }
      plant_common_card_data: {
        Row: {
          common_name: string | null
          description: string | null
          first_image: string | null
          first_image_alt_text: string | null
          first_tag: string | null
          id: number | null
          scientific_name: string | null
          scientific_slug: string | null
          slug: string | null
        }
        Relationships: []
      }
      plant_common_name_data: {
        Row: {
          attracts: Json | null
          available_space_to_plant: Json | null
          bark_attachment: Json | null
          bark_color: Json | null
          bark_description: string | null
          bark_plate_shape: Json | null
          common_name: string | null
          common_names: string[] | null
          cultivars: Json | null
          description: string | null
          design_feature: Json | null
          distribution: string | null
          edibility: string | null
          family: string | null
          fire_risk: string | null
          flower_bloom_time: Json | null
          flower_colors: Json | null
          flower_description: string | null
          flower_inflorescence: Json | null
          flower_petals: Json | null
          flower_shape: Json | null
          flower_size: string | null
          flower_value_to_gardener: Json | null
          fruit_color: Json | null
          fruit_description: string | null
          fruit_display_harvest_time: Json | null
          fruit_length: string | null
          fruit_type: Json | null
          fruit_value_to_gardener: Json | null
          fruit_width: string | null
          garden_spaces: string | null
          genus: string | null
          growth_rate: string | null
          height_max: number | null
          height_min: number | null
          id: number | null
          images: Json | null
          landscape_location: Json | null
          landscape_theme: Json | null
          leaf_arrangement: Json | null
          leaf_characteristics: Json | null
          leaf_color: Json | null
          leaf_description: string | null
          leaf_fall_color: Json | null
          leaf_feel: Json | null
          leaf_hairs_present: string | null
          leaf_length: string | null
          leaf_margin: Json | null
          leaf_shape: Json | null
          leaf_type: Json | null
          leaf_value_to_gardener: Json | null
          leaf_width: string | null
          life_cycle: Json | null
          light_requirements: Json | null
          maintenance: Json | null
          nc_regions: Json | null
          origin: string | null
          phonetic_spelling: string | null
          plant_habit: Json | null
          plant_types: Json | null
          poison_dermatitis: string | null
          poison_parts: Json | null
          poison_severity: string | null
          poison_symptoms: string | null
          poison_toxic_principle: string | null
          problems: Json | null
          profile_video: string | null
          propagation: Json | null
          resistance_to_challenges: Json | null
          scientific_name: string | null
          slug: string | null
          soil_drainage: Json | null
          soil_ph: Json | null
          soil_texture: Json | null
          sound_file: string | null
          species: string | null
          stem_aromatic: string | null
          stem_bud_scale: string | null
          stem_bud_terminal: string | null
          stem_buds: string | null
          stem_color: Json | null
          stem_cross_section: string | null
          stem_description: string | null
          stem_form: string | null
          stem_leaf_scar_shape: string | null
          stem_lenticels: string | null
          stem_pith: string | null
          stem_surface: string | null
          synonyms: string[] | null
          tags: Json | null
          texture: string | null
          usda_zones: Json | null
          uses: string | null
          width_max: number | null
          width_min: number | null
          wildlife_value: string | null
        }
        Relationships: []
      }
      plant_full_data: {
        Row: {
          attracts: Json | null
          available_space_to_plant: Json | null
          bark_attachment: Json | null
          bark_color: Json | null
          bark_description: string | null
          bark_plate_shape: Json | null
          common_names: string[] | null
          cultivars: Json | null
          description: string | null
          design_feature: Json | null
          distribution: string | null
          edibility: string | null
          family: string | null
          fire_risk: string | null
          flower_bloom_time: Json | null
          flower_colors: Json | null
          flower_description: string | null
          flower_inflorescence: Json | null
          flower_petals: Json | null
          flower_shape: Json | null
          flower_size: string | null
          flower_value_to_gardener: Json | null
          fruit_color: Json | null
          fruit_description: string | null
          fruit_display_harvest_time: Json | null
          fruit_length: string | null
          fruit_type: Json | null
          fruit_value_to_gardener: Json | null
          fruit_width: string | null
          garden_spaces: string | null
          genus: string | null
          growth_rate: string | null
          height_max: number | null
          height_min: number | null
          id: number | null
          images: Json | null
          landscape_location: Json | null
          landscape_theme: Json | null
          leaf_arrangement: Json | null
          leaf_characteristics: Json | null
          leaf_color: Json | null
          leaf_description: string | null
          leaf_fall_color: Json | null
          leaf_feel: Json | null
          leaf_hairs_present: string | null
          leaf_length: string | null
          leaf_margin: Json | null
          leaf_shape: Json | null
          leaf_type: Json | null
          leaf_value_to_gardener: Json | null
          leaf_width: string | null
          life_cycle: Json | null
          light_requirements: Json | null
          maintenance: Json | null
          nc_regions: Json | null
          origin: string | null
          phonetic_spelling: string | null
          plant_habit: Json | null
          plant_types: Json | null
          poison_dermatitis: string | null
          poison_parts: Json | null
          poison_severity: string | null
          poison_symptoms: string | null
          poison_toxic_principle: string | null
          problems: Json | null
          profile_video: string | null
          propagation: Json | null
          resistance_to_challenges: Json | null
          scientific_name: string | null
          slug: string | null
          soil_drainage: Json | null
          soil_ph: Json | null
          soil_texture: Json | null
          sound_file: string | null
          species: string | null
          stem_aromatic: string | null
          stem_bud_scale: string | null
          stem_bud_terminal: string | null
          stem_buds: string | null
          stem_color: Json | null
          stem_cross_section: string | null
          stem_description: string | null
          stem_form: string | null
          stem_leaf_scar_shape: string | null
          stem_lenticels: string | null
          stem_pith: string | null
          stem_surface: string | null
          synonyms: string[] | null
          tags: Json | null
          texture: string | null
          usda_zones: Json | null
          uses: string | null
          width_max: number | null
          width_min: number | null
          wildlife_value: string | null
        }
        Relationships: []
      }
      user_gardens_dashboard: {
        Row: {
          garden_id: number | null
          name: string | null
          overdue_tasks_count: number | null
          plants: Json | null
          plants_with_overdue_tasks: number | null
          plants_with_urgent_tasks: number | null
          total_plants: number | null
          upcoming_tasks: Json | null
          upcoming_tasks_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_plant: {
        Args:
          | {
              p_garden_id: number
              p_plant_id: number
              p_nickname: string
              p_images: Json
              p_care_logs: Json
            }
          | {
              p_id: string
              p_garden_id: number
              p_plant_id: number
              p_nickname: string
              p_images: Json
              p_care_logs: Json
            }
        Returns: {
          care_logs: Json
          created_at: string
          garden_id: number
          id: string
          images: Json
          nickname: string
          plant_id: number
          updated_at: string
        }[]
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      convert_to_uuid: {
        Args: { input_value: string }
        Returns: string
      }
      get_overdue_task_notifications: {
        Args: { p_user_id: string }
        Returns: {
          garden_id: number
          garden_name: string
          overdue_tasks_count: number
          overdue_tasks: Json
        }[]
      }
      get_sorted_plants: {
        Args:
          | {
              p_limit: number
              p_offset: number
              p_sort_field: string
              p_sort_direction: string
              p_query: string
              p_filters: string
            }
          | {
              query_embedding: string
              match_threshold: number
              match_count: number
            }
        Returns: {
          slug: string
          description: string
          scientificname: string
          commonname: string
          tag: string
          img: string
          alttext: string
          caption: string
          attribution: string
        }[]
      }
      get_tasks_for_date: {
        Args: { target_date: string; requesting_user_id?: string }
        Returns: {
          id: number
          user_plant_id: string
          task_type: string
          due_date: string
          completed: boolean
          plant: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_usage: {
        Args: { p_user_id: string; p_field: string; p_increment?: number }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_cached_responses: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          response: string
          context: string
          similarity: number
        }[]
      }
      refresh_user_gardens_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_user_gardens_full_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_user_plant: {
        Args: { p_id: string; p_nickname: string; p_status: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
