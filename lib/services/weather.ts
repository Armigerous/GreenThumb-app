import { WeatherData, Season, WeatherAndSeasonData } from "@/types/weather";
import { supabase } from "@/lib/supabaseClient";
import Constants from "expo-constants";
import ncZipDensity from "@/assets/data/nc_zip_density_with_index.json";

// Add debug log
console.log(
  "API Key available:",
  !!Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENWEATHER_API_KEY
);

// In Expo, we should use Constants
const OPENWEATHER_API_KEY =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENWEATHER_API_KEY;

async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeather API key is not configured");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  return {
    temperature: Math.round(data.main.temp),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    windSpeed: Math.round(data.wind.speed),
  };
}

function determineSeasonFromDate(date: Date = new Date()): Season {
  const month = date.getMonth();

  // Meteorological seasons
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export async function getWeatherAndSeason(
  gardenId: string
): Promise<WeatherAndSeasonData> {
  // Fetch garden coordinates from the materialized view
  const { data: garden, error } = await supabase
    .from("user_gardens_flat")
    .select("latitude, longitude")
    .eq("id", gardenId)
    .single();

  if (error) {
    throw new Error("Failed to fetch garden coordinates");
  }

  if (!garden || garden.latitude == null || garden.longitude == null) {
    throw new Error("Garden coordinates not found");
  }

  const [weather, season] = await Promise.all([
    fetchWeatherData(garden.latitude, garden.longitude),
    Promise.resolve(determineSeasonFromDate()),
  ]);

  return {
    weather,
    season,
  };
}

/**
 * Fetch elevation (in meters) for a given latitude and longitude using Open-Elevation API (free, no key).
 * @param latitude number
 * @param longitude number
 * @returns Promise<number> Elevation in meters
 */
export async function getElevation(latitude: number, longitude: number): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
    );
    if (!response.ok) throw new Error("Failed to fetch elevation");
    const data = await response.json();
    if (data && data.results && data.results.length > 0) {
      return data.results[0].elevation;
    }
    return null;
  } catch (err) {
    console.warn("Elevation fetch error:", err);
    return null;
  }
}

// Build a lookup map for fast access
const ncZipDensityMap: Record<string, { density: number; urban_index: number }> = {};
ncZipDensity.forEach((entry: { zip: string; density: number; urban_index: number }) => {
  ncZipDensityMap[entry.zip] = { density: entry.density, urban_index: entry.urban_index };
});

/**
 * Get urban index (0 = rural, 1 = urban) for a given NC ZIP code using local file.
 * @param zip string - 5-digit ZIP code
 * @returns number | null
 */
export function getUrbanIndexForZip(zip: string): number | null {
  // Reason: Use local file for instant lookup, avoid normalization math
  const entry = ncZipDensityMap[zip];
  return entry ? entry.urban_index : null;
}

