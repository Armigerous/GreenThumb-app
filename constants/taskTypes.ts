// Task type metadata for UI display (icon, color, label)
// Reason: Centralizes all task type display logic for consistency and maintainability.
// Update this if Supabase adds/removes task types.

import type { TaskType } from "@/types/garden";

export interface TaskTypeMeta {
  label: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  color: string; // Brand-compliant hex or Tailwind color
  description: string; // Short instruction for the user
}

export const TASK_TYPE_META: Record<TaskType, TaskTypeMeta> = {
  Water: {
    label: "Water",
    icon: "water",
    color: "#3b82f6", // Blue (brand-compliant for water)
    description: "Give your plant the recommended amount of water.",
  },
  Fertilize: {
    label: "Fertilize",
    icon: "leaf",
    color: "#5E994B", // Brand green
    description: "Apply fertilizer as directed for healthy growth.",
  },
  Prune: {
    label: "Prune",
    icon: "cut",
    color: "#8B5CF6", // Purple (distinct for pruning)
    description: "Trim dead or overgrown parts to encourage new growth.",
  },
  Inspect: {
    label: "Inspect",
    icon: "search",
    color: "#F59E42", // Orange (alert/inspection)
    description: "Check for pests, disease, or other issues.",
  },
  Mulch: {
    label: "Mulch",
    icon: "layers",
    color: "#A16207", // Brown/gold (mulch/soil)
    description: "Add or refresh mulch to retain moisture and suppress weeds.",
  },
  Weed: {
    label: "Weed",
    icon: "remove-circle",
    color: "#16A34A", // Green (distinct from fertilize)
    description: "Remove unwanted plants from your garden.",
  },
  Propagate: {
    label: "Propagate",
    icon: "git-branch",
    color: "#0EA5E9", // Cyan (growth/branching)
    description: "Start new plants from cuttings, seeds, or divisions.",
  },
  Transplant: {
    label: "Transplant",
    icon: "swap-horizontal",
    color: "#636059", // Neutral (move)
    description: "Move your plant to a new location or container.",
  },
  Log: {
    label: "Log",
    icon: "document-text",
    color: "#64748B", // Slate (journal)
    description: "Record notes or observations about your plant.",
  },
  Winterize: {
    label: "Winterize",
    icon: "snow",
    color: "#60A5FA", // Light blue (cold)
    description: "Prepare your plant for winter conditions.",
  },
}; 