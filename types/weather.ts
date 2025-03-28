/**
 * Represents the current season
 */
export type Season = "spring" | "summer" | "fall" | "winter";

export type WeatherData = {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
};

export type WeatherAndSeasonData = {
  weather: WeatherData;
  season: Season;
};
