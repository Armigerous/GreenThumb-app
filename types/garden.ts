/**
 * Represents a log entry for plant care activities.
 *
 * This interface maps to the `plant_care_logs` table, which stores structured logs
 * of plant care activities such as watering, fertilizing, pruning, etc.
 */
export interface PlantCareLog {
  /** Unique identifier for the care log (primary key) */
  id: number;
  /** Foreign key referencing the specific plant instance (user_plants) */
  user_plant_id: string;
  /** Type of care activity performed */
  care_type: "Watered" | "Fertilized" | "Harvested" | "Other";
  /** Optional notes about the care activity */
  care_notes?: string;
  /** Timestamp when this care activity was performed */
  taken_care_at: string;
}

/**
 * Represents a task for maintaining a specific plant.
 *
 * This interface maps to the `plant_tasks` table, which tracks essential care tasks
 * such as watering, fertilizing, and harvesting. These tasks are automatically generated
 * based on plant data from `user_plants` and `PlantData`.
 */
export interface PlantTask {
  /** Unique identifier for the plant task (primary key) */
  id: number;
  /** Foreign key referencing the specific plant instance in `user_plants` */
  user_plant_id: string;
  /** Type of task to be performed (MVP version only supports core tasks) */
  task_type: "Water" | "Fertilize" | "Harvest";
  /** The due date for the task, based on plant care recommendations */
  due_date: string;
  /** Whether the task has been completed */
  completed: boolean;
}

/**
 * Represents a plant in a user's garden.
 *
 * This interface maps to the `user_plants` table in the database, which stores
 * information about a specific plant instance within a user's garden, including
 * its nickname, status, images, and references to its care history.
 */
export interface UserPlant {
  /** Unique identifier for the user plant (primary key) */
  id: string;
  /** Foreign key referencing the garden this plant belongs to */
  garden_id: number;
  /** Foreign key referencing the plant in main_plant_data */
  plant_id: number;
  /** User-defined name for this specific plant */
  nickname: string;
  /** Current health status of the plant */
  status: "Healthy" | "Needs Water" | "Wilting" | "Dormant" | "Dead";
  /** Array of image URLs or references for this plant */
  images: string[];
  /** List of care logs associated with this plant */
  care_logs?: PlantCareLog[];
  /** List of tasks associated with this plant */
  plant_tasks?: PlantTask[];
  /** Timestamp when this plant was added to the garden */
  created_at: string;
  /** Timestamp when this plant was last updated */
  updated_at: string;
}

/**
 * Represents plant health statistics for a garden.
 *
 * This interface maps to the `garden_health_stats` view in the database,
 * which provides aggregate statistics on plant health within a garden.
 */
export interface GardenHealthStats {
  /** Foreign key referencing the garden these stats apply to */
  garden_id: number;
  /** Total number of plants in the garden */
  total_plants: number;
  /** Number of plants with 'Healthy' status */
  healthy_plants: number;
  /** Number of plants needing care (not 'Healthy') */
  plants_needing_care: number;
  /** Percentage of healthy plants (0-100) */
  health_percentage: number;
}

/**
 * Represents a summary of pending tasks for a garden.
 *
 * This interface maps to the `garden_tasks_summary` view in the database,
 * which provides information about incomplete tasks for plants in a garden.
 */
export interface GardenTaskSummary {
  /** Foreign key referencing the garden this task belongs to */
  garden_id: number;
  /** Unique identifier for the task */
  task_id: number;
  /** Type of task to be performed */
  task_type: string;
  /** The due date for the task */
  due_date: string;
  /** Whether the task has been completed */
  completed: boolean;
  /** ID of the plant this task is for */
  plant_id: string;
  /** Nickname of the plant this task is for */
  plant_nickname: string;
  /** Current health status of the plant */
  plant_status: string;
  /** Name of the garden this task belongs to (added for UI display) */
  garden_name?: string;
}

/**
 * Represents a user's garden.
 *
 * This interface maps to the `user_gardens_full_data` materialized view,
 * which stores aggregated information about a user's garden including
 * its name, preferences, conditions, and associated plants.
 */
export interface Garden {
  /** Unique identifier for the garden (primary key) */
  id: number;
  /** Foreign key referencing the user who owns this garden */
  user_id: string;
  /** Name of the garden */
  name: string;
  /** Whether the user wants plant recommendations for this garden */
  wants_recommendations?: boolean;
  /** Whether the user wants plants that provide interest throughout the year */
  year_round_interest?: boolean;
  /** Timestamp when this garden was created */
  created_at: string;
  /** Timestamp when this garden was last updated */
  updated_at: string;

  // Values instead of IDs
  /** Growth rate preference for plants in this garden */
  growth_rate?: string;
  /** Maintenance level preference for plants in this garden */
  maintenance_level?: string;
  /** Texture preference for plants in this garden */
  texture_preference?: string;

  // Arrays of values instead of ID arrays
  /** Locations where the garden is situated */
  locations?: string[];
  /** Available space sizes in the garden */
  available_space?: string[];
  /** Sunlight conditions in the garden */
  sunlight?: string[];
  /** Soil texture types in the garden */
  soil_texture?: string[];
  /** Soil drainage conditions in the garden */
  soil_drainage?: string[];
  /** Soil pH levels in the garden */
  soil_ph?: string[];
  /** Garden themes or styles */
  garden_themes?: string[];
  /** Wildlife the garden should attract */
  wildlife_attractions?: string[];
  /** Environmental challenges plants should resist */
  resistance_challenges?: string[];
  /** Plant problems to avoid in this garden */
  problems_to_exclude?: string[];
  /** USDA hardiness zones of the garden */
  usda_zones?: string[];
  /** Array of plants in this garden */
  user_plants?: UserPlant[];

  /** Health statistics for the garden from garden_health_stats view */
  health_stats?: GardenHealthStats;
  /** Pending tasks for plants in the garden from garden_tasks_summary view */
  pending_tasks?: GardenTaskSummary[];

  /** Total number of plants in the garden from user_gardens_dashboard view */
  total_plants?: number;
}
