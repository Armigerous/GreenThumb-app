// Centralized list of cute/random plant nicknames for use in forms and UI.
// Reason: Single source of truth for plant nickname suggestions (used in PlantForm and PlantDetailsStep)
// If you update this list, both the initial nickname and the randomizer will reflect the change.

export const plantNicknames = [
  "Milo",
  "Oliver",
  "Charlie",
  "Sophie",
  "Ruby",
  "Bella",
  "Toby",
  "Emma",
  "Lucy",
  "Finn",
  "Rosie",
  "Lola",
  "Zoe",
  "Tommy",
  "Chloe",
  "Leo",
  "Ellie",
  "Felix",
  "Poppy",
  "Buddy",
  "Molly",
  "Oscar",
  "Teddy",
  "Penny",
  "Jasper",
  "Chorizo",
  "Monday",
  "Colby",
  "Brie",
  "Cheddar",
  "Gracie Moon",
  "Moonpie",
  "Pumpkin",
  "Chunky",
  "Bubbles",
  "Heath",
];

/**
 * Returns a random nickname from the plantNicknames list.
 */
export function getRandomPlantNickname(): string {
  const idx = Math.floor(Math.random() * plantNicknames.length);
  return plantNicknames[idx];
} 