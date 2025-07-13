// Supabase Edge Function: Generate Plant Tasks (Climate‑Aware v2)
// Deno runtime – deploy with `supabase functions deploy generate-plant-tasks`
// ---------------------------------------------------------------------------
// 2025‑07‑08  ‑  Fully rewritten according to NC climate research + user specs
// ---------------------------------------------------------------------------
// @ts-expect-error Supabase Edge import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Supabase Edge import
import { z } from "npm:zod";
// --- CORS ------------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
// --- Schemas ---------------------------------------------------------------
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
      "Weed",
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
// --- Constants -------------------------------------------------------------
const WATER_INTERVALS = {
  Low: 7,
  Medium: 4,
  High: 2
};
const FERTILIZE_BUFFER_DAYS = 10; // safety buffer for mulch + prune ops
const FERTILIZE_FREQ_MONTHS = {
  Fast: 1,
  Slow: 3
};
const LOG_INTERVAL_DAYS = 7;
const INSPECT_INTERVAL_DAYS = {
  Default: 14,
  WithProblems: 7
};
// Region‑based first‑fertilize delay after last frost (days)
const FIRST_FEED_DELAY: Record<string, number> = {
  none: 0,
  Coastal: 14,
  Mountains: 28,
  Piedmont: 21
}; // 'none' fallback

const WEED_INTERVAL_DAYS: Record<string, number> = {
  Low: 21,
  Medium: 14,
  High: 7
};

// --- Date helpers ----------------------------------------------------------
const addDays = (d, n)=>{
  const dt = new Date(d);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt;
};
const addMonths = (d, n)=>{
  const dt = new Date(d);
  dt.setUTCMonth(dt.getUTCMonth() + n);
  return dt;
};
const formatUTC = (d)=>d.toISOString();
const midOfMonth = (m, y)=>new Date(Date.UTC(y, m, 15, 10));
// Convert day‑of‑year (DOY) → Date in `year` (UTC)
function doyToDate(doy, year) {
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(date.getUTCDate() + doy - 1);
  return date;
}
// Seasonal windows derived from frost DOY values
function getSeasonWindows(climate, year) {
  const last = doyToDate(climate.last_spring_frost_doy, year);
  const first = doyToDate(climate.first_fall_frost_doy, year);
  return {
    springCool: [
      addDays(last, -45),
      addDays(last, 30)
    ],
    warm: [
      addDays(last, 31),
      addDays(first, -45)
    ],
    fallCool: [
      addDays(first, -44),
      addDays(first, 15)
    ],
    dormant: [
      addDays(first, 16),
      addDays(last, -46 + 365)
    ] // Nov‑Jan
  };
}
// --- Default Climate Fallback ----------------------------------------------
/**
 * DEFAULT_CLIMATE is used for gardens without location info (no zip/county).
 * Values represent a typical NC Piedmont climate, safe for generic task gen.
 */
const DEFAULT_CLIMATE = {
  region: "Piedmont",
  county_name: "Wake",
  last_spring_frost_doy: 110, // ~April 20
  first_fall_frost_doy: 300,  // ~Oct 27
  avg_annual_precip_mm: 1200,
  zone_min: "7a",
  zone_max: "8a"
};
// --- Supabase client -------------------------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env vars");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
// --- Task Generators -------------------------------------------------------
// Util to decide if a date falls inside a window
const within = (d, w)=>d >= w[0] && d <= w[1];
function generateWaterTasks(up, plant, garden, climate, windows, today, microAdj) {
  let maintenance = plant.maintenance?.[0] ?? "Medium";
  if (![
    "Low",
    "Medium",
    "High"
  ].includes(maintenance)) maintenance = "Medium";
  let interval = WATER_INTERVALS[maintenance];
  const avgAnnualPrecip = typeof climate.avg_annual_precip_mm === "number" ? climate.avg_annual_precip_mm : 1200;
  const avgMonthlyRain = avgAnnualPrecip / 12;
  if (avgMonthlyRain < 80) interval += 1;
  else if (avgMonthlyRain > 120) interval -= 1;
  if (garden.soil_texture === "Sand") interval += 1;
  // Extra evapotranspiration hit in warm window (esp. coast sands)
  const extraSummer = within(today, windows.warm) ? climate.region === "Coastal" ? 2 : 1 : 0;
  interval += extraSummer;
  if (!within(today, windows.warm)) interval += -1; // cooler seasons slightly slower drying
  interval = Math.max(1, interval);
  const tasks = [];
  let wDate = addDays(today, interval + microAdj);
  const end = addDays(today, 365);
  while(wDate <= end){
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
function generateFertilizeTasks(up, plant, climate, windows, today, microAdj) {
  const freqMonths = plant.growth_rate === "Fast" ? FERTILIZE_FREQ_MONTHS.Fast : FERTILIZE_FREQ_MONTHS.Slow;
  // region-specific delay after last frost
  const regionDelay = FIRST_FEED_DELAY[climate.region] ?? 14;
  let fDate = addDays(windows.springCool[0], regionDelay);
  // 🔑  Skip any fertilize dates that are already in the past
  while(fDate <= today){
    fDate = addMonths(fDate, freqMonths);
  }
  const end = addDays(today, 365);
  const tasks = [];
  const isCoolSeason = Boolean(plant.prefers_cool);
  while(fDate <= end){
    // Skip cool-season plants during hot summer window
    if (!(isCoolSeason && within(fDate, windows.warm))) {
      tasks.push({
        user_plant_id: up.id,
        task_type: "Fertilize",
        due_date: formatUTC(addDays(fDate, microAdj)),
        completed: false
      });
    }
    fDate = addMonths(fDate, freqMonths);
  }
  return tasks;
}
function generateHarvestTasks(up, plant, today, microAdj) {
  const tasks = [];
  for (const m of plant.fruit_display_harvest_time ?? []){
    const monthIdx = new Date(Date.parse(`${m} 1, 2000`)).getUTCMonth();
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
function generatePruneTasks(up, plant, climate, windows, today, microAdj) {
  const tasks = [];
  const year = today.getUTCFullYear();
  // Post‑bloom prune (+7 days after bloom month mid‑point)
  for (const bt of plant.flower_bloom_time ?? []){
    const monthIdx = new Date(Date.parse(`${bt} 1, 2000`)).getUTCMonth();
    const base = addDays(midOfMonth(monthIdx, year), 7);
    if (within(base, windows.warm) && base > today) {
      tasks.push({
        user_plant_id: up.id,
        task_type: "Prune",
        due_date: formatUTC(addDays(base, microAdj)),
        completed: false
      });
    }
  }
  // Pre‑frost prune for zone >= 7 – use zone_min/zone_max as text
  // If either zone_min or zone_max starts with '7' or higher, allow pre-frost prune
  const zoneMin = typeof climate.zone_min === "string" ? climate.zone_min : "7a";
  const zoneMax = typeof climate.zone_max === "string" ? climate.zone_max : "7a";
  // Helper to extract numeric part from zone string
  const getZoneNumber = (z: string) => parseInt(z, 10);
  const zoneMinNum = getZoneNumber(zoneMin);
  const zoneMaxNum = getZoneNumber(zoneMax);
  const zoneThreshold = 7;
  if (zoneMinNum >= zoneThreshold || zoneMaxNum >= zoneThreshold) {
    const base = addDays(doyToDate(climate.first_fall_frost_doy, year), -30);
    if (base > today) tasks.push({
      user_plant_id: up.id,
      task_type: "Prune",
      due_date: formatUTC(addDays(base, microAdj)),
      completed: false
    });
  }
  // Dormant structural prune (Dec‑Jan for most counties)
  const dormantCenter = midOfMonth(0, year + 1); // Jan 15 next year
  if (dormantCenter > today && within(dormantCenter, windows.dormant)) {
    tasks.push({
      user_plant_id: up.id,
      task_type: "Prune",
      due_date: formatUTC(addDays(dormantCenter, microAdj)),
      completed: false
    });
  }
  return tasks;
}
function generateInspectTasks(up, plant, windows, today, microAdj) {
  const hasProblems = Boolean(plant.problems?.length);
  const endHighDisease = addDays(new Date(Date.UTC(today.getUTCFullYear(), 8, 30)), 0); // 30 Sept
  const interval = hasProblems ? INSPECT_INTERVAL_DAYS.WithProblems : within(today, [
    windows.warm[0],
    endHighDisease
  ]) ? 10 : INSPECT_INTERVAL_DAYS.Default;
  const tasks = [];
  let iDate = addDays(today, interval + microAdj);
  const end = addDays(today, 365);
  while(iDate <= end){
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
function generateMulchTasks(up, garden, climate, windows, today, microAdj) {
  const tasks = [];
  // Spring application
  const spring = addDays(doyToDate(climate.last_spring_frost_doy, today.getUTCFullYear()), FERTILIZE_BUFFER_DAYS);
  if (spring > today) tasks.push({
    user_plant_id: up.id,
    task_type: "Mulch",
    due_date: formatUTC(addDays(spring, microAdj)),
    completed: false
  });
  // Fall application
  const fall = addDays(doyToDate(climate.first_fall_frost_doy, today.getUTCFullYear()), -FERTILIZE_BUFFER_DAYS);
  if (fall > today) tasks.push({
    user_plant_id: up.id,
    task_type: "Mulch",
    due_date: formatUTC(addDays(fall, microAdj)),
    completed: false
  });
  // Summer top‑up for coastal sandy soils
  if (climate.region === "Coastal" && garden.soil_texture === "Sand") {
    const summer = new Date(Date.UTC(today.getUTCFullYear(), 6, 15, 10)); // 15 July
    if (summer > today && within(summer, windows.warm)) {
      tasks.push({
        user_plant_id: up.id,
        task_type: "Mulch",
        due_date: formatUTC(addDays(summer, microAdj)),
        completed: false
      });
    }
  }
  return tasks;
}
function generatePropagateTasks(up, plant, windows, today, microAdj) {
  const tasks = [];
  for (const method of plant.propagation ?? []){
    let targetWindow;
    switch(method){
      case "Division":
        targetWindow = windows.springCool;
        break;
      case "Cuttings":
        targetWindow = windows.warm;
        break;
      default:
        targetWindow = windows.fallCool;
    }
    // Choose mid‑point of window
    const mid = new Date((targetWindow[0].getTime() + targetWindow[1].getTime()) / 2);
    if (mid > today) tasks.push({
      user_plant_id: up.id,
      task_type: "Propagate",
      due_date: formatUTC(addDays(mid, microAdj)),
      completed: false
    });
  }
  return tasks;
}
function generateTransplantTasks(up, windows, today, microAdj) {
  let base = addDays(new Date(up.created_at), 28);
  if (base < windows.springCool[0]) base = windows.springCool[0];
  if (base > windows.warm[1]) base = addDays(windows.springCool[0], 365); // push to next spring
  return [
    {
      user_plant_id: up.id,
      task_type: "Transplant",
      due_date: formatUTC(addDays(base, microAdj)),
      completed: false
    }
  ];
}
function generateLogTasks(up, windows, today, microAdj) {
  const tasks = [];
  let lDate = addDays(today, LOG_INTERVAL_DAYS + microAdj);
  const end = addDays(today, 365);
  while(lDate <= end){
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

function generateWeedTasks(up, garden, windows, today, microAdj) {
  // Determine interval from maintenance level (default to Medium)
  const maintenance = ["Low","Medium","High"].includes(garden.maintenance_level)
    ? garden.maintenance_level
    : "Medium";
  let interval = WEED_INTERVAL_DAYS[maintenance];
  
  // Optionally speed up weeding during peak growing season
  if (within(today, windows.warm)) {
    interval = Math.max(3, Math.floor(interval * 0.75));
  }
  
  const tasks = [];
  let wDate = addDays(today, interval + microAdj);
  const end = addDays(today, 365);

  while (wDate <= end) {
    tasks.push({
      user_plant_id: up.id,
      task_type: "Weed",
      due_date: formatUTC(wDate),
      completed: false
    });
    wDate = addDays(wDate, interval);
  }
  return tasks;
}

function dedupeTasks(tasks) {
  return tasks.filter((t, i, a)=>i === a.findIndex((u)=>u.user_plant_id === t.user_plant_id && u.task_type === t.task_type && u.due_date === t.due_date));
}
async function generateTasks(up, plant, garden, climate, today) {
  // Micro‑adjustment (elevation + urban heat island)
  const microAdj = (garden.elevation_ft || 0) / 1000 * 3 + (garden.urban_index || 0) * 5;
  const windows = getSeasonWindows(climate, today.getUTCFullYear());
  const all = [
    ...generateWaterTasks(up, plant, garden, climate, windows, today, microAdj),
    ...generateFertilizeTasks(up, plant, climate, windows, today, microAdj),
    ...generateHarvestTasks(up, plant, today, microAdj),
    ...generatePruneTasks(up, plant, climate, windows, today, microAdj),
    ...generateInspectTasks(up, plant, windows, today, microAdj),
    ...generateMulchTasks(up, garden, climate, windows, today, microAdj),
    ...generatePropagateTasks(up, plant, windows, today, microAdj),
    ...generateTransplantTasks(up, windows, today, microAdj),
    ...generateLogTasks(up, windows, today, microAdj),
    ...generateWeedTasks(up, garden, windows, today, microAdj)
  ];
  // Sort chronologically
  return dedupeTasks(all).sort((a, b)=>a.due_date.localeCompare(b.due_date));
}
// --- Edge handler ----------------------------------------------------------
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  try {
    const { userPlant } = await req.json();
    const up = UserPlantSchema.parse(userPlant);
    // Fetch plant
    const { data: plant, error: pErr } = await supabase.from("plant_full_data").select("*").eq("id", up.plant_id).single();
    if (pErr || !plant) throw new Error("Plant not found");
    // Fetch garden
    const { data: garden, error: gErr } = await supabase.from("user_gardens_flat").select("*").eq("id", up.garden_id).single();
    if (gErr || !garden) throw new Error("Garden not found");
    // --- Climate fallback logic ---
    // If garden.county is missing, use DEFAULT_CLIMATE
    let climate;
    if (garden.county) {
      const { data: c, error: cErr } = await supabase.from("nc_climate_county_flat").select("*").eq("county_name", garden.county).single();
      if (cErr || !c) climate = DEFAULT_CLIMATE; // fallback if fetch fails
      else climate = c;
    } else {
      climate = DEFAULT_CLIMATE;
    }
    const today = new Date();
    // --- Fallbacks for garden fields ---
    // These are used throughout task generation logic
    const safeGarden = {
      ...garden,
      soil_texture: garden.soil_texture ?? "Loam",
      elevation_ft: garden.elevation_ft ?? 0,
      urban_index: garden.urban_index ?? 0,
      maintenance_level: garden.maintenance_level ?? "Medium"
    };
    const tasks = await generateTasks(up, plant, safeGarden, climate, today);
    const valid = TasksArray.parse({
      tasks
    });
    const { data: inserted, error: iErr } = await supabase.from("plant_tasks").insert(valid.tasks).select();
    if (iErr) throw iErr;
    return new Response(JSON.stringify({
      tasks: inserted
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("[EdgeFn] Error:", e, e?.stack);
    return new Response(JSON.stringify({
      error: e.message,
      stack: e.stack,
      code: e.code,
      details: e.details,
      hint: e.hint
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
