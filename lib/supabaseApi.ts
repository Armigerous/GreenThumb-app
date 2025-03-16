import { supabase } from "./supabaseClient";
import { ApiResponse, PlantCardData, PlantData } from "@/types/plant";

/**
 * Fetches plant card data with pagination support
 */
export async function fetchPlantCards(
  page: number = 1,
  limit: number = 28,
  query: string = "",
  filters: string = "",
  nameType: string = "scientific"
): Promise<ApiResponse> {
  try {
    const offset = (page - 1) * limit;
    const tableName =
      nameType === "common" ? "plant_common_card_data" : "plant_card_data";
    const orderColumn =
      nameType === "common" ? "common_name" : "scientific_name";

    // Start building the query
    let queryBuilder = supabase
      .from(tableName)
      .select(
        "id, slug, scientific_name, common_name, description, first_tag, first_image",
        { count: "exact" }
      )
      .order(orderColumn, { ascending: true });

    // Add search filter if query is provided
    if (query) {
      const searchColumn =
        nameType === "common" ? "common_name" : "scientific_name";
      queryBuilder = queryBuilder.ilike(searchColumn, `%${query}%`);
    }

    // Add filters if provided
    if (filters && filters !== "all") {
      // For plant types, we need to check if the plant_types_ids array contains the filter
      // Since plant_types are stored in the main_plant_data table, we need to join with it
      // This is a simplification - in a real implementation, you might need to adjust this
      // based on your exact database structure
      queryBuilder = queryBuilder.ilike("first_tag", `%${filters}%`);
    }

    // Add pagination
    const { data, error, count } = await queryBuilder.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    // Process the data
    const processedData = processPlantData(data || [], nameType);

    return {
      results: processedData,
      count: count || processedData.length,
    };
  } catch (error) {
    console.error("Error fetching plant cards:", error);
    throw error;
  }
}

/**
 * Fetches plant search results for autocomplete
 */
export async function searchPlants(
  query: string = "",
  nameType: string = "scientific",
  limit: number = 7
): Promise<PlantCardData[]> {
  try {
    if (!query) return [];

    const tableName =
      nameType === "common" ? "plant_common_card_data" : "plant_card_data";
    const searchColumn =
      nameType === "common" ? "common_name" : "scientific_name";

    const { data, error } = await supabase
      .from(tableName)
      .select(
        "id, slug, scientific_name, common_name, description, first_tag, first_image"
      )
      .ilike(searchColumn, `%${query}%`)
      .order(searchColumn, { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase search error:", error);
      throw new Error(error.message);
    }

    return processPlantData(data || [], nameType);
  } catch (error) {
    console.error("Error searching plants:", error);
    return [];
  }
}

/**
 * Fetches detailed information about a specific plant
 */
export async function getPlantDetails(slug: string): Promise<PlantData> {
  try {
    // For detailed plant information, we should use the plant_full_data view
    const { data, error } = await supabase
      .from("plant_full_data")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Plant with slug "${slug}" not found`);
    }

    return data as unknown as PlantData;
  } catch (error) {
    console.error("Error fetching plant details:", error);
    throw error;
  }
}

/**
 * Process and validate plant data
 */
function processPlantData(
  data: any[],
  nameType: string = "scientific"
): PlantCardData[] {
  return data
    .filter((item) => item && item.slug)
    .map((item) => ({
      id: item.id || 0,
      slug: item.slug,
      scientific_name: item.scientific_name || "",
      common_name: item.common_name || "",
      description: item.description || "",
      first_image: item.first_image || "",
      first_tag: item.first_tag || "",
    }));
}

/**
 * Test function to verify Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("plant_card_data")
      .select("id, scientific_name")
      .limit(1);

    if (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }

    console.log("Supabase connection successful:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection test exception:", error);
    return false;
  }
}
