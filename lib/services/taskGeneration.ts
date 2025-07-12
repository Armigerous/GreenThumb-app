import { z } from "zod";
import { PlantTask, UserPlant } from "@/types/garden";
import { supabase } from "@/lib/supabaseClient";
import { getWeatherAndSeason } from "./weather";

// Define the task schema using Zod
const TaskSchema = z.object({
  user_plant_id: z.string().describe("The UUID of the user's plant"),
  // Reason: Updated to support all 11 core task types for validation
  task_type: z
    .enum([
      "Water",
      "Fertilize",
      "Prune",
      "Inspect",
      "Mulch",
      "Weed",
      "Amend Soil",
      "Propagate",
      "Transplant",
      "Log",
      "Winterize"
    ])
    .describe("Type of care task"),
  due_date: z.string().describe("Due date in YYYY-MM-DD HH:mm:ss+00 format"),
  completed: z.boolean().describe("Whether the task is completed"),
});

const TaskArraySchema = z.object({
  tasks: z.array(TaskSchema),
});

/**
 * Generates plant care tasks using the Supabase Edge Function
 */
export async function generatePlantTasks(
  userPlant: UserPlant
): Promise<Omit<PlantTask, "id">[]> {
  try {
    console.log("Sending plant data to Edge Function:", {
      id: userPlant.id,
      garden_id: userPlant.garden_id,
      plant_id: userPlant.plant_id,
    });

    // Send only the userPlant data to the Edge Function
    const { data, error } = await supabase.functions.invoke("generate-plant-tasks", {
      body: { userPlant },
    });

    if (error) {
      console.error("Error in generatePlantTasks:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    if (!data?.tasks) {
      console.error("No tasks returned from Edge Function");
      throw new Error("No tasks were generated");
    }

    console.log("Tasks generated successfully:", data.tasks.length);
    // The Edge Function already stored these tasks in the database
    // So we just return them without trying to insert them again
    return data.tasks;
  } catch (error) {
    console.error("Error in generatePlantTasks:", error);
    throw error;
  }
}

/**
 * Stores the generated tasks in the database and returns the inserted tasks with their IDs
 */
export async function storePlantTasks(
  tasks: Omit<PlantTask, "id">[]
): Promise<PlantTask[]> {
  try {
    const { data, error } = await supabase
      .from("plant_tasks")
      .insert(tasks)
      .select();

    if (error) {
      console.error("Error storing tasks:", error);
      throw error;
    }

    return data as PlantTask[];
  } catch (error) {
    console.error("Error in storePlantTasks:", error);
    throw error;
  }
}

/**
 * Gets the current weather and season for task generation
 */
export async function getCurrentWeatherAndSeason(gardenId: string) {
  return await getWeatherAndSeason(gardenId);
}


// Edge function deployed to Supabase

// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "jsr:@supabase/supabase-js@2";
// import { Configuration, OpenAIApi } from "npm:openai@3.2.1";
// import { z } from "npm:zod";

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Access-Control-Allow-Methods': 'POST, OPTIONS',
// };

// // Schema definitions (matching your client-side schemas)
// const TaskSchema = z.object({
//   user_plant_id: z.string(),
//   task_type: z.enum(["Water", "Fertilize", "Harvest"]),
//   due_date: z.string(),
//   completed: z.boolean(),
// });

// const TaskArraySchema = z.object({
//   tasks: z.array(TaskSchema),
// });

// // Initialize clients
// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
// const openai = new OpenAIApi(new Configuration({ apiKey: openaiApiKey }));

// Deno.serve(async (req: Request) => {
//   // Handle CORS preflight
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     if (req.method !== "POST") {
//       throw new Error('Method not allowed');
//     }

//     const { userPlant } = await req.json();
//     if (!userPlant?.id || !userPlant?.garden_id || !userPlant?.plant_id) {
//       throw new Error('Missing required user plant data');
//     }

//     // Get plant data
//     const { data: plant, error: plantError } = await supabase
//       .from("plant_full_data")
//       .select("*")
//       .eq("id", userPlant.plant_id)
//       .single();

//     if (plantError) throw new Error(`Failed to fetch plant data: ${plantError.message}`);

//     // Get garden data
//     const { data: garden, error: gardenError } = await supabase
//       .from("user_gardens_flat")
//       .select("*")
//       .eq("id", userPlant.garden_id)
//       .single();

//     if (gardenError) throw new Error(`Failed to fetch garden data: ${gardenError.message}`);

//     // Generate tasks using OpenAI
//     const completion = await openai.createChatCompletion({
//       model: "gpt-4",
//       messages: [{
//         role: "system",
//         content: "You are a plant care expert that generates specific care tasks."
//       }, {
//         role: "user",
//         content: `Generate tasks in the exact format specified.
        
// Generate a 90-day plant care schedule based on:

// Plant Basic Information:
// - Scientific Name: ${plant.scientific_name}
// - Common Names: ${plant.common_names?.join(", ") || "No common name"}
// - Description: ${plant.description || "No description available"}
// - Water Requirements: ${plant.water_requirements || "Not specified"}
// - Light Requirements: ${plant.light_requirements || plant.light?.join(", ") || "Not specified"}
// - Maintenance Needs: ${plant.maintenance?.join(", ") || "Not specified"}

// Garden Environment:
// - Soil Conditions:
//   * Textures: ${garden.soil_textures?.join(", ") || "Not specified"}
//   * Drainage: ${garden.soil_drainage?.join(", ") || "Not specified"}
// - Light Conditions: ${garden.sunlight?.join(", ") || "Not specified"}
// - Maintenance Level: ${garden.maintenance || "Not specified"}

// Current Plant Status:
// - Nickname: ${userPlant.nickname}
// - Time in Garden: Since ${new Date(userPlant.created_at).toLocaleDateString()}
// - Care Notes: Plant health is automatically tracked through task completion

// Please generate a JSON array of tasks following this exact schema:
// {
//   "tasks": [
//     {
//       "user_plant_id": "${userPlant.id}",
//       "task_type": "Water" | "Fertilize" | "Harvest",
//       "due_date": "YYYY-MM-DD HH:mm:ss+00",
//       "completed": false
//     }
//   ]
// }`
//       }],
//       temperature: 0.7,
//       max_tokens: 2000,
//     });

//     // Parse and validate OpenAI response
//     const generatedTasks = JSON.parse(completion.data.choices[0].message?.content || '{"tasks": []}');
//     const validatedTasks = TaskArraySchema.parse(generatedTasks);

//     // Store tasks in database
//     const { data: storedTasks, error: insertError } = await supabase
//       .from("plant_tasks")
//       .insert(validatedTasks.tasks)
//       .select();

//     if (insertError) throw new Error(`Failed to store tasks: ${insertError.message}`);

//     return new Response(
//       JSON.stringify({ tasks: storedTasks }),
//       { 
//         headers: { 
//           ...corsHeaders,
//           'Content-Type': 'application/json',
//         } 
//       }
//     );

//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//     return new Response(
//       JSON.stringify({ error: errorMessage }), 
//       { 
//         status: 500,
//         headers: {
//           ...corsHeaders,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//   }
// });