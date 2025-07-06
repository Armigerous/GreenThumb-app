import React from "react";
import { View, TouchableOpacity } from "react-native";
import { BodyText } from "./Text";

// Tab definition type
export type TabItem = {
  key: string;
  label: string;
};

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string; // Optional for extra styling
}

/**
 * TabNavigation - A simple, accessible tab bar for mobile.
 * Used for switching between filter sections in the Filter Modal.
 *
 * Props:
 * - tabs: Array of { key, label }
 * - activeTab: The key of the currently active tab
 * - onTabChange: Callback when a tab is selected
 * - className: Optional extra styling
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <View
      className={`flex-row bg-cream-100 rounded-xl p-1 ${className}`}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 items-center py-2 rounded-lg mx-1 ${
              isActive ? "bg-brand-600" : "bg-transparent"
            }`}
            style={{ minWidth: 80 }}
          >
            <BodyText
              className={`text-base font-medium ${
                isActive ? "text-white" : "text-brand-700"
              }`}
            >
              {tab.label}
            </BodyText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabNavigation;
