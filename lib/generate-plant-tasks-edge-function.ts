// Supabase Edge Function: Generate Plant Tasks
// This file is intended for deployment as a Supabase Edge Function (Deno runtime).
// The imports below are valid in the Supabase Edge environment.
// @ts-expect-error Supabase Edge import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-expect-error Supabase Edge import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Supabase Edge import
import { z } from "npm:zod";

// --- CORS Headers ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// --- Zod Schemas ---
const UserPlantSchema = z.object({
  id: z.string(),
  garden_id: z.number(),
  plant_id: z.number(),
  nickname: z.string(),
  created_at: z.string()
});
const TasksArray = z.object({
  tasks: z.array(z.object({
    user_plant_id: z.string(),
    task_type: z.enum([
      "Water",
      "Fertilize",
      "Harvest",
      "Prune",
      "Inspect",
      "Mulch",
      "Propagate",
      "Transplant",
      "Log"
    ]),
    due_date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/),
    completed: z.boolean()
  }))
});

// --- Constants ---
const WATER_INTERVALS = { Low: 7, Medium: 4, High: 2 };
const FERTILIZE_BUFFER_DAYS = 10;
const FERTILIZE_FREQ_MONTHS = { Fast: 1, Slow: 3 };
const LOG_INTERVAL_DAYS = 7;
const INSPECT_INTERVAL_DAYS = { Default: 14, WithProblems: 7 };

// --- Date Utilities ---
const addDays = (d: Date, n: number): Date => {
  const dt = new Date(d);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt;
};
const addMonths = (d: Date, n: number): Date => {
  const dt = new Date(d);
  dt.setUTCMonth(dt.getUTCMonth() + n);
  return dt;
};
const formatUTC = (d: Date): string => d.toISOString();
const midOfMonth = (m: number, y: number): Date => new Date(Date.UTC(y, m, 15, 10, 0, 0));
// Utility: Convert day-of-year (DOY) to Date in a given year
function doyToDate(doy: number, year: number): Date {
  // January 1st is DOY 1
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(date.getUTCDate() + doy - 1);
  return date;
}

// --- Supabase Client ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required environment variables");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Task Generators (with microclimate baked in) ---
function generateWaterTasks(up: any, plant: any, garden: any, climate: any, today: Date, microAdj: number) {
  // --- Robust Logging for Supabase Edge Function ---
  console.log(`[EdgeFn] generateWaterTasks: plant_id=${plant.id}, garden_id=${garden.id}`);
  console.log(`[EdgeFn] Raw plant.maintenance=`, JSON.stringify(plant.maintenance), "type=", typeof plant.maintenance);
  console.log(`[EdgeFn] Raw garden=`, JSON.stringify(garden));
  console.log(`[EdgeFn] Raw climate=`, JSON.stringify(climate));

  let maintenance = plant.maintenance?.[0] ?? "Medium";
  console.log(`[EdgeFn] Computed maintenance=`, maintenance);

  if (!["Low", "Medium", "High"].includes(maintenance)) {
    // Reason: Defensive fallback for unexpected maintenance values
    console.warn(
      `[EdgeFn] Unexpected maintenance value for plant_id=${plant.id}:`,
      maintenance,
      "plant.maintenance=",
      JSON.stringify(plant.maintenance)
    );
    maintenance = "Medium";
  }
  const baseInterval = WATER_INTERVALS[maintenance];

  // --- Updated: Use avg_annual_precip_mm from nc_climate_county ---
  // Estimate monthly rainfall as avg_annual_precip_mm / 12 (mm)
  // If missing, fallback to 1200mm/year (100mm/month)
  if (typeof climate.avg_annual_precip_mm !== "number") {
    console.error(`[EdgeFn] plant_id=${plant.id} garden_id=${garden.id} ERROR: climate.avg_annual_precip_mm is missing or not a number. climate=`, JSON.stringify(climate));
  }
  const avgAnnualPrecip = climate.avg_annual_precip_mm ?? 1200;
  const avgMonthlyRain = avgAnnualPrecip / 12;
  console.log(`[EdgeFn] avgAnnualPrecip=`, avgAnnualPrecip, `avgMonthlyRain=`, avgMonthlyRain);

  // Use rainfall to adjust interval: if <80mm/month, +1 day; if >120mm/month, -1 day
  if (typeof garden.soil_texture !== "string") {
    console.warn(`[EdgeFn] plant_id=${plant.id} garden_id=${garden.id} WARNING: garden.soil_texture is missing or not a string. garden=`, JSON.stringify(garden));
  }
  let interval = baseInterval + (avgMonthlyRain < 80 ? 1 : avgMonthlyRain > 120 ? -1 : 0) + (garden.soil_texture === "Sand" ? 1 : 0);
  interval = Math.max(1, interval);
  console.log(`[EdgeFn] Computed interval=`, interval);
  const tasks = [];
  let wDate = addDays(today, interval + microAdj);
  while (wDate <= addDays(today, 365)) {
    tasks.push({
      user_plant_id: up.id,
      task_type: "Water",
      due_date: formatUTC(wDate),
      completed: false
    });
    wDate = addDays(wDate, interval);
  }
  return tasks;
}
function generateFertilizeTasks(up: any, plant: any, climate: any, today: Date, microAdj: number) {
  const frostStart = new Date(`${today.getUTCFullYear()}-${climate.last_frost}T00:00:00.000Z`);
  const frostEnd = new Date(`${today.getUTCFullYear()}-${climate.first_frost}T00:00:00.000Z`);
  const freqMonths = plant.growth_rate === "Fast" ? FERTILIZE_FREQ_MONTHS.Fast : FERTILIZE_FREQ_MONTHS.Slow;
  const tasks = [];
  let fDate = addMonths(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 10)), 1);
  while (fDate <= addDays(today, 365)) {
    if (fDate >= addDays(frostStart, FERTILIZE_BUFFER_DAYS) && fDate <= addDays(frostEnd, -FERTILIZE_BUFFER_DAYS)) {
      const adj = addDays(fDate, microAdj);
      tasks.push({
        user_plant_id: up.id,
        task_type: "Fertilize",
        due_date: formatUTC(adj),
        completed: false
      });
    }
    fDate = addMonths(fDate, freqMonths);
  }
  return tasks;
}
function generateHarvestTasks(up: any, plant: any, today: Date, microAdj: number) {
  const tasks = [];
  for (const m of plant.fruit_display_harvest_time ?? []) {
    const monthIdx = new Date(Date.parse(m + " 1, 2000")).getUTCMonth();
    const base = midOfMonth(monthIdx, today.getUTCFullYear());
    const adjDate = addDays(base, microAdj);
    if (adjDate > today) tasks.push({
      user_plant_id: up.id,
      task_type: "Harvest",
      due_date: formatUTC(adjDate),
      completed: false
    });
  }
  return tasks;
}
function generatePruneTasks(up: any, plant: any, climate: any, today: Date, microAdj: number) {
  const frostStart = new Date(`${today.getUTCFullYear()}-${climate.last_frost}T00:00:00.000Z`);
  const frostEnd = new Date(`${today.getUTCFullYear()}-${climate.first_frost}T00:00:00.000Z`);
  const zone = climate.zone ?? 7;
  const tasks = [];
  for (const bt of plant.flower_bloom_time ?? []) {
    const monthIdx = new Date(Date.parse(bt + " 1, 2000")).getUTCMonth();
    const base = addDays(midOfMonth(monthIdx, today.getUTCFullYear()), 7);
    if (base >= frostStart) {
      const adjDate = addDays(base, microAdj);
      tasks.push({
        user_plant_id: up.id,
        task_type: "Prune",
        due_date: formatUTC(adjDate),
        completed: false
      });
    }
  }
  if (zone >= 7) {
    const base = addDays(frostEnd, -30);
    if (base > today) tasks.push({
      user_plant_id: up.id,
      task_type: "Prune",
      due_date: formatUTC(addDays(base, microAdj)),
      completed: false
    });
  }
  return tasks;
}
function generateInspectTasks(up: any, plant: any, today: Date, microAdj: number) {
  const hasProblems = Boolean(plant.problems?.length);
  const interval = hasProblems ? INSPECT_INTERVAL_DAYS.WithProblems : INSPECT_INTERVAL_DAYS.Default;
  const tasks = [];
  let iDate = addDays(today, interval + microAdj);
  while (iDate <= addDays(today, 365)) {
    tasks.push({
      user_plant_id: up.id,
      task_type: "Inspect",
      due_date: formatUTC(iDate),
      completed: false
    });
    iDate = addDays(iDate, interval);
  }
  return tasks;
}
function generateMulchTasks(up: any, climate: any, today: Date, microAdj: number) {
  // Use last_spring_frost_doy and first_fall_frost_doy (day-of-year fields)
  const year = today.getUTCFullYear();
  const { last_spring_frost_doy, first_fall_frost_doy } = climate;
  if (typeof last_spring_frost_doy !== "number" || typeof first_fall_frost_doy !== "number") {
    console.error(`[EdgeFn] generateMulchTasks: Missing or invalid frost DOY values for climate:`, JSON.stringify(climate));
    return [];
  }
  const frostStart = doyToDate(last_spring_frost_doy, year);
  const frostEnd = doyToDate(first_fall_frost_doy, year);
  // Log computed dates for debugging
  console.log(`[EdgeFn] generateMulchTasks: frostStart=`, frostStart.toISOString(), `frostEnd=`, frostEnd.toISOString());
  if (isNaN(frostStart.getTime()) || isNaN(frostEnd.getTime())) {
    console.error(`[EdgeFn] generateMulchTasks: Computed invalid frost dates. frostStart=`, frostStart, `frostEnd=`, frostEnd);
    return [];
  }
  return [
    {
      user_plant_id: up.id,
      task_type: "Mulch",
      due_date: formatUTC(addDays(addDays(frostStart, FERTILIZE_BUFFER_DAYS), microAdj)),
      completed: false
    },
    {
      user_plant_id: up.id,
      task_type: "Mulch",
      due_date: formatUTC(addDays(addDays(frostEnd, -FERTILIZE_BUFFER_DAYS), microAdj)),
      completed: false
    }
  ];
}
function generatePropagateTasks(up: any, plant: any, climate: any, today: Date, microAdj: number) {
  const zone = climate.zone ?? 7;
  const tasks = [];
  for (const method of plant.propagation ?? []) {
    let offset = method === "Division" ? 15 : 60;
    if (zone <= 6) offset += 21;
    tasks.push({
      user_plant_id: up.id,
      task_type: "Propagate",
      due_date: formatUTC(addDays(addDays(today, offset), microAdj)),
      completed: false
    });
  }
  return tasks;
}
function generateTransplantTasks(up: any, today: Date, microAdj: number) {
  const base = addDays(new Date(up.created_at), 28);
  return [
    {
      user_plant_id: up.id,
      task_type: "Transplant",
      due_date: formatUTC(addDays(base, microAdj)),
      completed: false
    }
  ];
}
function generateLogTasks(up: any, today: Date, microAdj: number) {
  const tasks = [];
  let lDate = addDays(today, LOG_INTERVAL_DAYS + microAdj);
  while (lDate <= addDays(today, 365)) {
    tasks.push({
      user_plant_id: up.id,
      task_type: "Log",
      due_date: formatUTC(lDate),
      completed: false
    });
    lDate = addMonths(lDate, 1);
  }
  return tasks;
}
function dedupeTasks(tasks: any[]): any[] {
  return tasks.filter((t, i, a) =>
    i === a.findIndex((u) =>
      u.user_plant_id === t.user_plant_id &&
      u.task_type === t.task_type &&
      u.due_date === t.due_date
    )
  );
}
async function generateTasks(up: any, plant: any, garden: any, climate: any, today: Date): Promise<any[]> {
  // compute microclimate adjustment once
  const elevFt = garden.elevation_ft || 0;
  const urbanIdx = garden.urban_index || 0;
  const elevationAdj = elevFt / 1000 * 3;
  const urbanAdj = urbanIdx * 5;
  const microAdj = elevationAdj + urbanAdj;
  const all = [
    ...generateWaterTasks(up, plant, garden, climate, today, microAdj),
    ...generateFertilizeTasks(up, plant, climate, today, microAdj),
    ...generateHarvestTasks(up, plant, today, microAdj),
    ...generatePruneTasks(up, plant, climate, today, microAdj),
    ...generateInspectTasks(up, plant, today, microAdj),
    ...generateMulchTasks(up, climate, today, microAdj),
    ...generatePropagateTasks(up, plant, climate, today, microAdj),
    ...generateTransplantTasks(up, today, microAdj),
    ...generateLogTasks(up, today, microAdj)
  ];
  return dedupeTasks(all);
}

// --- Edge Function Handler ---
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { userPlant } = await req.json();
    const up = UserPlantSchema.parse(userPlant);

    // Fetch plant data
    const { data: plant, error: pErr } = await supabase
      .from("plant_full_data")
      .select("*")
      .eq("id", up.plant_id)
      .single();
    if (pErr || !plant) throw new Error("Plant not found");

    // Fetch garden data
    const { data: garden, error: gErr } = await supabase
      .from("user_gardens_flat")
      .select("*")
      .eq("id", up.garden_id)
      .single();
    if (gErr || !garden) throw new Error("Garden not found");

    // Fetch climate data from the materialized view using county_name
    // Reason: Use denormalized materialized view for performance and reliability in edge functions
    const countyName: string = garden.county; // user_gardens_flat.county is the county name
    const { data: climate, error: cErr } = await supabase
      .from("nc_climate_county_flat")
      .select("*")
      .eq("county_name", countyName)
      .single();
    if (cErr || !climate) throw new Error("Climate data not found for county: " + countyName);

    // --- Log all fetched data for traceability ---
    console.log(`[EdgeFn] Handler: up=`, JSON.stringify(up));
    console.log(`[EdgeFn] Handler: plant=`, JSON.stringify(plant));
    console.log(`[EdgeFn] Handler: garden=`, JSON.stringify(garden));
    console.log(`[EdgeFn] Handler: climate=`, JSON.stringify(climate));

    // Generate and validate tasks
    const today = new Date();
    const tasks = await generateTasks(up, plant, garden, climate, today);
    const valid = TasksArray.parse({ tasks });

    // Insert tasks into plant_tasks table
    const { data: inserted, error: iErr } = await supabase
      .from("plant_tasks")
      .insert(valid.tasks)
      .select();
    if (iErr) throw iErr;

    // Success response
    return new Response(JSON.stringify({ tasks: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    // Log and return full error details for debugging
    console.error("[EdgeFn] Error:", e, e?.stack);
    return new Response(JSON.stringify({
      error: e.message,
      stack: e.stack,
      code: e.code,
      details: e.details,
      hint: e.hint
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}); 