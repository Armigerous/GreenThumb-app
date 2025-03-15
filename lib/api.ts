import { ApiResponse, PlantCardData, PlantData } from "../types/plant";

// Update the API base URL to your actual API endpoint
const API_BASE_URL = "http://theofficialgreenthumb.com/api";

/**
 * Fetches plant search results
 */
export async function searchPlants(
  query: string = "",
  page: number = 1,
  filters: string = "",
  nameType: string = "scientific"
): Promise<ApiResponse> {
  const limit = 28;
  const offset = (page - 1) * limit;

  // Construct the URL with the correct endpoint structure
  let url = `${API_BASE_URL}/plants/search?limit=${limit}&page=${page}`;
  if (query) url += `&query=${encodeURIComponent(query)}`;
  if (filters) url += `&filters=${encodeURIComponent(filters)}`;
  if (nameType) url += `&nameType=${encodeURIComponent(nameType)}`;

  console.log("Fetching plants from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return {
    results: data.results || [],
    count: data.count || 0,
  };
}

/**
 * Fetches autocomplete suggestions for plant search
 */
export async function getPlantSuggestions(
  query: string = "",
  nameType: string = "scientific"
): Promise<PlantCardData[]> {
  const url =
    query.trim() === ""
      ? `${API_BASE_URL}/plants/search?nameType=${nameType}&limit=7`
      : `${API_BASE_URL}/plants/search?query=${encodeURIComponent(
          query.trim()
        )}&nameType=${nameType}&limit=7`;

  console.log("Fetching suggestions from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Fetches detailed information about a specific plant
 */
export async function getPlantDetails(slug: string): Promise<PlantData> {
  const url = `${API_BASE_URL}/plants/${slug}`;

  console.log("Fetching plant details from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.plant;
}
