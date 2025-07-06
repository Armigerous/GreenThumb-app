import type { Database } from "./supabase";

/**
 * --- DB-ALIGNED TYPES (canonical, from Supabase) ---
 * Use these for anything that directly maps to Supabase tables or views.
 * Do NOT redefine these types elsewhere in the codebase.
 */
export type Garden = Database["public"]["Views"]["user_gardens_full_data"]["Row"];
export type GardenDashboard = Database["public"]["Views"]["user_gardens_dashboard"]["Row"];
export type GardenDatabase = Database["public"]["Tables"]["user_gardens"]["Row"];
export type GardenTaskSummary = Database["public"]["Views"]["garden_tasks_summary"]["Row"];

/**
 * Type alias for UUID strings to make the intent clearer
 *
 * NOTE: All fields in this file must match the Supabase schema as generated in types/supabase.ts.
 *       Remove or update any fields that are not present in the current database schema.
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


