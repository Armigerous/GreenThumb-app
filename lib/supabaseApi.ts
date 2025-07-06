import { supabase } from "./supabaseClient";
import { ApiResponse, PlantCardData, PlantData } from "@/types/plant";
import { allFilters } from "@/types/filterData";

/**
 * Build a Map from each filter category's "id" (like "nc-regions")
 * to its actual Postgres column name ("nc_region").
 */
function buildFilterIdToDbColumnMap() {
  const map = new Map<string, string>();
  for (const section of allFilters) {
    for (const category of section.categories) {
      map.set(category.id, category.dbColumn);
    }
  }
  return map;
}

/**
 * Fetches plant card data with pagination support
 */
export async function fetchPlantCards(
  page: number = 1,
  limit: number = 28,
  query: string = "",
  filters: string = "all",
  nameType: string = "scientific"
): Promise<ApiResponse> {
  try {
    const offset = (page - 1) * limit;

    // 1) Convert filters string into { dbColumn: string[] }
    //    e.g. "nc-regions|Coastal,soil-ph|Neutral (6.0-8.0)"
    const filterMap = buildFilterIdToDbColumnMap();
    const groupedFilters: Record<string, string[]> = {};

    if (filters && filters !== "all") {
      const filterPairs = filters.split(",");
      for (const pair of filterPairs) {
        const [filterId, filterValue] = pair.split("|");
        if (!filterId || !filterValue) continue;

        const dbColumn = filterMap.get(filterId);
        if (!dbColumn) {
          console.warn(
            `Warning: Unrecognized filter ID "${filterId}". Skipping.`
          );
          continue;
        }
        if (!groupedFilters[dbColumn]) {
          groupedFilters[dbColumn] = [];
        }
        groupedFilters[dbColumn].push(filterValue);
      }
    }

    // 2) If we have any filters, query plant_full_data first to get matching IDs
    let matchingIds: number[] | null = null;
    if (Object.keys(groupedFilters).length > 0) {
      let supabaseFilterQuery = supabase
        .from("plant_full_data")
        .select("id", { count: "exact" });

      for (const [dbColumn, values] of Object.entries(groupedFilters)) {
        // Determine operator based on column type
        // List of text columns (must match schema and filterData.ts comments)
        const textColumns = [
          "texture",
          "leaf_feel"
        ];
        // Special handling for growth_rate - use OR logic for multiple values
        if (dbColumn === "growth_rate") {
          if (values.length === 1) {
            // Single value - use eq
            supabaseFilterQuery = supabaseFilterQuery.filter(
              dbColumn,
              "eq",
              values[0]
            );
          } else {
            // Multiple values - use OR logic with in operator
            // PostgREST expects format: in.(value1,value2,value3)
            const inValues = `(${values.join(',')})`;
            supabaseFilterQuery = supabaseFilterQuery.filter(
              dbColumn,
              "in",
              inValues
            );
          }
        } else if (textColumns.includes(dbColumn)) {
          // Only support single-value filters for other text columns
          supabaseFilterQuery = supabaseFilterQuery.filter(
            dbColumn,
            "eq",
            values[0]
          );
        } else {
          // JSON.stringify(values) converts the JS array into a valid JSON array literal,
          // e.g. [ 'Coastal', 'Mountains' ] becomes '["Coastal","Mountains"]'
          supabaseFilterQuery = supabaseFilterQuery.filter(
            dbColumn,
            "cs",
            JSON.stringify(values)
          );
        }
      }

      // Execute filter query
      const { data: filteredData, error: filterError } =
        await supabaseFilterQuery;

      if (filterError) {
        console.error("Filter query failed:", filterError);
        throw new Error(filterError.message);
      }

      if (!filteredData || filteredData.length === 0) {
        console.log("No results found for the applied filters");
        return { results: [], count: 0 };
      }

      matchingIds = filteredData.map((row: any) => row.id);
      console.log(`Found ${matchingIds.length} matching plants`);
    }

    // 3) Now query the appropriate materialized view based on nameType
    const tableName =
      nameType === "common" ? "plant_common_card_data" : "plant_card_data";

    let orderColumn: string;
    let selectColumns: string;
    if (nameType === "common") {
      orderColumn = "common_name";
      selectColumns =
        "id, slug, scientific_slug, common_name, description, scientific_name, first_tag, first_image, first_image_alt_text";
    } else {
      orderColumn = "scientific_name";
      selectColumns =
        "id, slug, scientific_name, description, common_name , first_tag, first_image, first_image_alt_text";
    }

    let supabaseQuery = supabase
      .from(tableName)
      .select(selectColumns, { count: "exact" })
      .order(orderColumn, { ascending: true })
      .range(offset, offset + limit - 1);

    if (matchingIds) {
      supabaseQuery = supabaseQuery.in("id", matchingIds);
    }

    // Apply search filter across multiple columns
    if (query) {
      let orFilter: string;
      if (nameType === "common") {
        orFilter = `scientific_name.ilike.%${query}%,common_name.ilike.%${query}%,description.ilike.%${query}%`;
      } else {
        orFilter = `scientific_name.ilike.%${query}%,common_name.ilike.%${query}%,description.ilike.%${query}%`;
      }
      supabaseQuery = supabaseQuery.or(orFilter);
    }

    // Execute final query
    const { data, error, count } = await supabaseQuery;

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
        nameType === "common"
          ? "id, slug, scientific_slug, scientific_name, common_name, description, first_tag, first_image"
          : "id, slug, scientific_name, common_name, description, first_tag, first_image"
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
      scientific_slug: nameType === "common" ? item.scientific_slug : undefined,
      scientific_name: item.scientific_name || "",
      common_name: item.common_name || "",
      description: item.description || "",
      first_image: item.first_image || "",
      first_tag: item.first_tag || "",
      first_image_alt_text: item.first_image_alt_text || "",
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
