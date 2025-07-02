/**
 * Type alias for UUID strings to make the intent clearer
 */
export type UUID = string;

/**
 * Represents a log entry for plant care activities.
 *
 * This interface maps to the `plant_care_logs` table, which stores structured logs
 * of plant care activities.
 * 
 * A free-form plant diary, not a checklist.

 */
export interface PlantCareLog {
  /** Unique identifier for the care log (primary key) */
  id: number;
  /** Foreign key referencing the specific plant instance (user_plants) */
  user_plant_id: UUID;
  /** The image uploaded for this care log */
  image: string;
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
  user_plant_id: UUID;
  /** Type of task to be performed */
  task_type: "Water" | "Fertilize" | "Harvest";
  /** The due date for the task */
  due_date: string;
  /** Whether the task has been completed */
  completed: boolean;
}

export interface TaskWithDetails extends PlantTask {
  plant: {
    nickname: string;
    garden: {
      name: string;
    };
  };
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
  id: UUID;
  /** Foreign key referencing the garden this plant belongs to */
  garden_id: number;
  /** Foreign key referencing the plant in main_plant_data */
  plant_id: number;
  /** User-defined name for this specific plant */
  nickname: string;
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
 * Represents plant care statistics for a garden.
 *
 * This interface maps to the `garden_health_stats` view in the database,
 * which provides aggregate statistics on plant care within a garden.
 * Health is calculated based on task completion, not user-inputted status.
 */
export interface GardenHealthStats {
  /** Foreign key referencing the garden these stats apply to */
  garden_id: number;
  /** Total number of plants in the garden */
  total_plants: number;
  /** Number of plants with overdue tasks */
  plants_with_overdue_tasks: number;
  /** Number of plants with upcoming tasks due soon */
  plants_with_urgent_tasks: number;
  /** Health percentage based on task completion (0-100) */
  health_percentage: number;
}

/**
 * Represents a plant summary from the user_gardens_dashboard view
 */
interface DashboardPlantSummary {
  /** Unique identifier for the plant */
  id: UUID;
  /** User-defined name for this specific plant */
  nickname: string;
  /** Array of image URLs or references for this plant */
  images: string[];
  /** Foreign key referencing the plant in main_plant_data */
  plant_id: number;
  /** Scientific name of the plant */
  scientific_name: string;
  /** Common names of the plant */
  common_names: string[];
}

/**
 * Represents an upcoming task from the dashboard view
 */
export interface UpcomingTask {
  /** Unique identifier for the task */
  task_id: number;
  /** ID of the plant this task is for */
  plant_id: UUID;
  /** Nickname of the plant this task is for */
  plant_nickname: string;
  /** Type of task to be performed */
  task_type: string;
  /** The due date for the task */
  due_date: string;
  /** Whether the task has been completed */
  completed: boolean;
}

/**
 * Represents a garden from the user_gardens_dashboard materialized view.
 *
 * This interface maps to the `user_gardens_dashboard` materialized view,
 * which provides aggregated information about a garden's health, plants,
 * and upcoming tasks.
 */
export interface GardenDashboard {
  /** Unique identifier for the garden */
  garden_id: number;
  /** Foreign key referencing the user who owns this garden */
  user_id: string;
  /** Name of the garden */
  name: string;
  /** Timestamp when this garden was last updated */
  updated_at: string;
  /** Total number of plants in the garden */
  total_plants: number;
  /** Number of plants with overdue tasks requiring immediate attention */
  plants_with_overdue_tasks: number;
  /** Number of plants with tasks due within the next 2 days */
  plants_with_urgent_tasks: number;
  /** Health percentage based on overdue tasks (0-100), null if no plants */
  health_percentage: number | null;
  /** Count of overdue tasks affecting health */
  overdue_tasks_count: number;
  /** Array of upcoming tasks for plants in this garden */
  upcoming_tasks: UpcomingTask[] | null;
  /** Count of upcoming tasks */
  upcoming_tasks_count: number;
  /** Array of plants in this garden with their details */
  plants: DashboardPlantSummary[] | null;
}

/**
 * Represents a garden from the user_gardens_full_data materialized view.
 *
 * This interface maps to the `user_gardens_full_data` materialized view,
 * which provides the garden data with all IDs resolved to their human-readable values
 * from their respective lookup tables.
 */
export interface Garden {
  /** Unique identifier for the garden (primary key) */
  id: number;
  /** Foreign key referencing the user who owns this garden */
  user_id: string;
  /** Name of the garden */
  name: string;
  /** Whether the user wants plant recommendations */
  wants_recommendations: boolean | null;
  /** Whether the garden should have year-round interest */
  year_round_interest: boolean | null;
  /** Array of growth rate preferences (multiple selection) */
  growth_rates: string[];
  /** Maintenance level preference */
  maintenance: string | null;
  /** Alternate field for maintenance from the materialized view */
  maintenance_level?: string | null;
  /** Texture preference */
  texture: string | null;
  /** Alternate field for texture from the materialized view */
  texture_preference?: string | null;
  /** Array of location names */
  landscape_locations: string[];
  /** Alternate field for locations from the materialized view */
  locations?: string[];
  /** Single available space option (single selection) */
  available_space: string | null;
  /** Single sunlight condition description (single selection) */
  sunlight: string | null;
  /** Single soil texture type (single selection) */
  soil_texture: string | null;
  /** Array of soil drainage descriptions */
  soil_drainage: string[];
  /** Array of soil pH ranges */
  soil_ph_ranges: string[];
  /** Alternate field for soil_ph from the materialized view */
  soil_ph?: string[];
  /** Array of garden theme names */
  garden_themes: string[];
  /** Array of wildlife attraction descriptions */
  wildlife_attractions: string[];
  /** Array of resistance challenge descriptions */
  resistance_challenges: string[];
  /** Array of problem descriptions to exclude */
  problems: string[];
  /** Array of NC region names */
  nc_regions: string[];
  /** Array of USDA zone descriptions */
  usda_zones: string[];
  /** Array of flower colors */
  flower_colors: string[];
  /** Array of flower bloom time descriptions */
  flower_bloom_times: string[];
  /** Array of flower value descriptions */
  flower_values: string[];
  /** Array of leaf colors */
  leaf_colors: string[];
  /** Array of leaf feel descriptions */
  leaf_feels: string[];
  /** Array of leaf value descriptions */
  leaf_values: string[];
  /** Array of fall colors */
  fall_colors: string[];
  /** Array of habit/form descriptions */
  habit_forms: string[];
  /** Array of plant type descriptions */
  plant_types: string[];
  /** Array of design feature descriptions */
  design_features: string[];
  /** Timestamp when this garden was created */
  created_at: string;
  /** Timestamp when this garden was last updated */
  updated_at: string;
  /** Optional latitude coordinate of the garden location */
  latitude?: number;
  /** Optional longitude coordinate of the garden location */
  longitude?: number;
}

/**
 * Represents a user's garden from the user_gardens table.
 *
 * This interface maps directly to the `user_gardens` table in the database,
 * storing the raw garden data including preference IDs and settings.
 */
export interface GardenDatabase {
  /** Unique identifier for the garden (primary key) */
  id: number;
  /** Foreign key referencing the user who owns this garden */
  user_id: string;
  /** Name of the garden */
  name: string;
  /** JSON array of location IDs - actual database field */
  landscape_location_ids: number[];
  /** Alternate form field for landscape_location_ids - not in database */
  location_ids?: number[];
  /** Single space availability ID (single selection) */
  available_space_to_plant_id: number | null;
  /** Single light condition ID (single selection) */
  light_id: number | null;
  /** Single soil texture ID (single selection) */
  soil_texture_id: number | null;
  /** JSON array of soil drainage IDs */
  soil_drainage_ids: number[];
  /** JSON array of soil pH IDs */
  soil_ph_ids: number[];
  /** JSON array of garden theme IDs */
  landscape_theme_ids: number[];
  /** JSON array of wildlife attraction IDs */
  attracts_ids: number[];
  /** JSON array of resistance challenge IDs */
  resistance_to_challenges_ids: number[];
  /** JSON array of problem IDs to exclude */
  problems_ids: number[];
  /** JSON array of growth rate preference IDs (multiple selection) */
  growth_rate_ids: number[];
  /** Maintenance level preference ID - actual database field */
  maintenance_id: number | null;
  /** Form field alias for maintenance_id - not in database */
  maintenance_level_id?: number | null;
  /** Texture preference ID - actual database field */
  texture_id: number | null;
  /** Form field alias for texture_id - not in database */
  texture_preference_id?: number | null;
  /** Whether the user wants plant recommendations */
  wants_recommendations: boolean | null;
  /** Whether the garden should have plants with year-round interest */
  year_round_interest: boolean | null;
  /** JSON array of NC region IDs */
  nc_region_ids: number[];
  /** JSON array of USDA zone IDs */
  usda_zone_ids: number[];
  /** JSON array of flower color IDs */
  flower_color_ids: number[];
  /** JSON array of flower bloom time IDs */
  flower_bloom_time_ids: number[];
  /** JSON array of flower value IDs */
  flower_value_to_gardener_ids: number[];
  /** JSON array of leaf color IDs */
  leaf_color_ids: number[];
  /** JSON array of leaf feel IDs */
  leaf_feel_ids: number[];
  /** JSON array of leaf value IDs */
  leaf_value_ids: number[];
  /** JSON array of fall color IDs */
  fall_color_ids: number[];
  /** JSON array of plant habit/form IDs */
  habit_form_ids: number[];
  /** JSON array of plant type IDs */
  plant_type_ids: number[];
  /** JSON array of design feature IDs */
  design_feature_ids: number[];
  /** Timestamp when this garden was created */
  created_at: string;
  /** Timestamp when this garden was last updated */
  updated_at: string;
  /** Optional latitude coordinate of the garden location */
  latitude?: number;
  /** Optional longitude coordinate of the garden location */
  longitude?: number;
}

/**
 * Represents a task summary from the garden_tasks_summary view
 */
export interface GardenTaskSummary {
  /** ID of the garden this task belongs to */
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
}
