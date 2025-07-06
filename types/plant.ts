import type { Database } from "./supabase";

/**
 * --- DB-ALIGNED TYPES (canonical, from Supabase) ---
 * Use these for anything that directly maps to Supabase tables or views.
 * Do NOT redefine these types elsewhere in the codebase.
 */
export type PlantCardData = Database["public"]["Views"]["plant_card_data"]["Row"];
export type PlantCommonCardData = Database["public"]["Views"]["plant_common_card_data"]["Row"];
export type PlantFullData = Database["public"]["Views"]["plant_full_data"]["Row"];
export type MainPlantData = Database["public"]["Tables"]["main_plant_data"]["Row"];
export type UserPlant = Database["public"]["Tables"]["user_plants"]["Row"];

// --- UI/Derived Types (not direct DB rows) ---
// (Keep these as interfaces/types, but document if they are not DB-aligned)

// PlantImage, ApiResponse, SearchParams are UI/utility types, not DB-aligned.
export interface PlantImage {
  id: number | null;
  img: string | null;
  caption?: string | null;
  alt_text?: string | null;
  attribution?: string | null;
}

export interface ApiResponse {
  results: PlantFullData[];
  count: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  filters?: string;
  nameType?: string;
}

// PlantData is now replaced by PlantFullData/MainPlantData from Supabase. If you need a UI-only type, define it below with a clear comment.
