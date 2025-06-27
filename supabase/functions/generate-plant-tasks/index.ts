import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "npm:openai@3.2.1";
import { z } from "npm:zod@3";
// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Schema definitions
const TaskSchema = z.object({
  user_plant_id: z.string().uuid(),
  task_type: z.enum([
    "Water",
    "Fertilize",
    "Harvest"
  ]),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+00$/),
  completed: z.boolean()
});
const TaskArraySchema = z.object({
  tasks: z.array(TaskSchema)
});
const UserPlantSchema = z.object({
  id: z.string(),
  garden_id: z.number(),
  plant_id: z.number(),
  nickname: z.string(),
  status: z.string(),
  created_at: z.string()
});
// Initialize clients
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const openai = new OpenAIApi(new Configuration({
  apiKey: openaiApiKey
}));
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    if (req.method !== "POST") {
      console.error("Method not allowed:", req.method);
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Parse and validate request body
    const body = await req.json();
    if (!body.userPlant) {
      console.error("Missing userPlant data in request body");
      return new Response(JSON.stringify({
        error: 'Missing userPlant data in request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate userPlant data
    try {
      UserPlantSchema.parse(body.userPlant);
    } catch (validationError) {
      console.error("Invalid userPlant data:", validationError.errors);
      return new Response(JSON.stringify({
        error: 'Invalid userPlant data',
        details: validationError.errors
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { userPlant } = body;
    // Get plant data
    const { data: plant, error: plantError } = await supabase.from("plant_full_data").select("*").eq("id", userPlant.plant_id).single();
    if (plantError) {
      console.error("Failed to fetch plant data:", plantError.message);
      return new Response(JSON.stringify({
        error: 'Failed to fetch plant data',
        details: plantError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Get garden data
    const { data: garden, error: gardenError } = await supabase.from("user_gardens_full_data").select("*").eq("id", userPlant.garden_id).single();
    if (gardenError) {
      console.error("Failed to fetch garden data:", gardenError.message);
      return new Response(JSON.stringify({
        error: 'Failed to fetch garden data',
        details: gardenError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Generate tasks using OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a plant care expert that generates specific care tasks. CRITICAL REQUIREMENTS:
1. Return ONLY raw JSON. DO NOT use markdown code blocks, backticks, or any formatting
2. The response must be PURE JSON that can be parsed directly
3. Follow the exact format for dates ("YYYY-MM-DD HH:mm:ss+00")
4. Use only allowed task types: "Water", "Fertilize", or "Harvest"
5. Generate appropriate tasks for a 90-day period based on plant needs
6. NO explanations, NO text before or after the JSON`
        },
        {
          role: "user",
          content: `Based on the following plant information, generate a 90-day care schedule starting from today (${new Date().toISOString().split('T')[0]}):

Plant Basic Information:
- Scientific Name: ${plant.scientific_name}
- Common Names: ${plant.common_names?.join(", ") || "No common name"}
- Description: ${plant.description || "No description available"}
- Water Requirements: ${plant.water_requirements || "Not specified"}
- Light Requirements: ${plant.light_requirements || plant.light?.join(", ") || "Not specified"}
- Maintenance Needs: ${plant.maintenance?.join(", ") || "Not specified"}

Garden Environment:
- Soil Conditions:
  * Textures: ${garden.soil_textures?.join(", ") || "Not specified"}
  * Drainage: ${garden.soil_drainage?.join(", ") || "Not specified"}
- Light Conditions: ${garden.sunlight?.join(", ") || "Not specified"}
- Maintenance Level: ${garden.maintenance || "Not specified"}

Current Plant Status:
- Nickname: ${userPlant.nickname}
- Health Status: ${userPlant.status}
- Time in Garden: Since ${new Date(userPlant.created_at).toLocaleDateString()}

Return ONLY a JSON object with this EXACT structure (no additional text):
{
  "tasks": [
    {
      "user_plant_id": "${userPlant.id}",
      "task_type": "Water",
      "due_date": "2024-03-24 10:00:00+00",
      "completed": false
    }
  ]
}`
        }
      ],
      temperature: 0.7
    });
    if (!completion.data.choices[0].message?.content) {
      console.error("No response from OpenAI");
      return new Response(JSON.stringify({
        error: 'No response from OpenAI'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Clean and parse OpenAI response
    try {
      console.log("Raw OpenAI response:", completion.data.choices[0].message.content);
      const responseContent = completion.data.choices[0].message.content.trim() // Remove any markdown code block syntax
      .replace(/^```[\w]*\s*/g, '') // Remove opening code block
      .replace(/\s*```\s*$/g, '') // Remove closing code block
      .trim();
      console.log("Cleaned response content:", responseContent);
      // Validate the string is pure JSON
      if (!responseContent.startsWith('{')) {
        console.error("Response does not start with {:", responseContent.substring(0, 50));
        throw new Error('Response is not a valid JSON object');
      }
      const generatedTasks = JSON.parse(responseContent);
      console.log("Parsed tasks:", JSON.stringify(generatedTasks, null, 2));
      // Validate tasks array exists and has items
      if (!Array.isArray(generatedTasks?.tasks) || generatedTasks.tasks.length === 0) {
        console.error("Invalid tasks structure:", generatedTasks);
        throw new Error('OpenAI response missing valid tasks array');
      }
      // Validate tasks
      const validatedTasks = TaskArraySchema.parse(generatedTasks);
      console.log("Validated tasks:", JSON.stringify(validatedTasks, null, 2));
      // Store tasks in database, ensuring no duplicates
      const uniqueTasks = validatedTasks.tasks.filter((task, index, self)=>index === self.findIndex((t)=>t.user_plant_id === task.user_plant_id && t.task_type === task.task_type && t.due_date === task.due_date));
      const { data: storedTasks, error: insertError } = await supabase.from("plant_tasks").insert(uniqueTasks).select();
      if (insertError) {
        console.error("Failed to store tasks:", insertError);
        return new Response(JSON.stringify({
          error: 'Failed to store tasks',
          details: insertError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({
        tasks: storedTasks,
        debug: {
          rawResponse: completion.data.choices[0].message.content,
          cleanedResponse: responseContent,
          parsedTasks: generatedTasks,
          validatedTasks: validatedTasks,
          uniqueTasks: uniqueTasks
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (parseError) {
      console.error("Failed to parse or validate tasks:", parseError.message);
      return new Response(JSON.stringify({
        error: 'Failed to parse or validate tasks',
        details: parseError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
