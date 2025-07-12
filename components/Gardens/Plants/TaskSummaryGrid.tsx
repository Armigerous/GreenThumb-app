import { Ionicons } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";
import { View, TouchableOpacity } from "react-native";
import React from "react";
import type { TaskWithDetails } from "@/types/garden";

// Reason: TaskTimePeriod is a local type in the plant detail screen, not exported from types/garden.
// Define it here for type safety and consistency.
type TaskTimePeriod =
  | "missed"
  | "today"
  | "tomorrow"
  | "this_week"
  | "next_week"
  | "this_month"
  | "later";

// Props for the summary grid
interface TaskSummaryGridProps {
  groupedTasks: Record<TaskTimePeriod, TaskWithDetails[]>;
  activePeriod: TaskTimePeriod;
  onSelectPeriod: (period: TaskTimePeriod) => void;
}

// Reason: Icon and color mapping for each period, using brand tokens
const PERIOD_META: Record<
  TaskTimePeriod,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  missed: {
    icon: "alert-circle",
    color: "#E50000", // destructive
    label: "Missed",
  },
  today: {
    icon: "today",
    color: "#f97316", // orange-500 (accent)
    label: "Today",
  },
  tomorrow: {
    icon: "calendar",
    color: "#f97316",
    label: "Tomorrow",
  },
  this_week: {
    icon: "calendar-outline",
    color: "#eab308", // yellow-500 (accent)
    label: "This Week",
  },
  next_week: {
    icon: "calendar-number",
    color: "#77B860", // brand-500
    label: "Next Week",
  },
  this_month: {
    icon: "calendar-number-outline",
    color: "#5E994B", // brand-600
    label: "This Month",
  },
  later: {
    icon: "time",
    color: "#6b7280", // gray-500
    label: "Later",
  },
};

/**
 * TaskSummaryGrid
 * Responsive, branded grid of summary pills for task periods.
 * Each pill is a button: shows icon, label, count, and highlights if active.
 *
 * Reason: Extracted for reusability, clarity, and brand alignment.
 */
export default function TaskSummaryGrid({
  groupedTasks,
  activePeriod,
  onSelectPeriod,
}: TaskSummaryGridProps) {
  // Only show periods with tasks
  const periods = (Object.keys(groupedTasks) as TaskTimePeriod[]).filter(
    (period) => groupedTasks[period].length > 0
  );

  return (
    <View className="flex-row flex-wrap gap-3 justify-between">
      {periods.map((period) => {
        const { icon, color, label } = PERIOD_META[period];
        const count = groupedTasks[period].length;
        const isActive = activePeriod === period;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => onSelectPeriod(period)}
            className={`min-w-[44%] max-w-[49%] flex-1 mb-2 rounded-xl flex-row items-center px-3 py-2 ${
              isActive
                ? "bg-brand-100 border-2 border-brand-600"
                : "bg-cream-50 border border-cream-200"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Show ${label} tasks (${count})`}
            activeOpacity={0.85}
            style={{ minHeight: 48 }} // Ensures touch target ≥44px
          >
            <View
              className="w-7 h-7 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: color + "20" }}
            >
              <Ionicons
                name={icon}
                size={16}
                color={color}
                accessibilityElementsHidden // Icon is decorative
              />
            </View>
            <BodyText
              className={`text-base font-paragraph-semibold ${
                isActive ? "text-brand-600" : "text-cream-700"
              }`}
            >
              {label}:{" "}
              <BodyText className="font-paragraph-bold">{count}</BodyText>
            </BodyText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
