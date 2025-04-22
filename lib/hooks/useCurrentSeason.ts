import { useState, useEffect } from 'react';
import { Season } from '@/types/weather';

/**
 * Hook to determine the current season based on the date
 * Uses meteorological seasons:
 * - Spring: March, April, May (months 2-4)
 * - Summer: June, July, August (months 5-7)
 * - Fall: September, October, November (months 8-10)
 * - Winter: December, January, February (months 11, 0, 1)
 */
export function useCurrentSeason(): Season {
  const [season, setSeason] = useState<Season>(() => {
    // Initialize with the current season on mount
    return determineSeasonFromDate(new Date());
  });

  // This is a one-time effect on mount - season won't change during a session
  // If you want to update the season on day change (unlikely to be needed), 
  // you can add a useEffect with a timer or date comparison
  
  return season;
}

/**
 * Helper function to determine the season from a date
 * Exported for reuse in other components if needed
 */
export function determineSeasonFromDate(date: Date = new Date()): Season {
  const month = date.getMonth();

  // Meteorological seasons
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export default useCurrentSeason; 