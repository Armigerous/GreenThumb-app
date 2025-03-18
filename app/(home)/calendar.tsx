import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface Reminder {
  id: number;
  plantName: string;
  gardenName: string;
  task: string;
  time: string;
  completed: boolean;
}

export default function CalendarScreen() {
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  // Generate days for the week view
  const generateWeekDays = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();

    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const weekDays = generateWeekDays();

  // Format date for display
  const formatDay = (date: Date): number => {
    return date.getDate();
  };

  const formatWeekday = (date: Date): string => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    return (
      date.getDate() === selectedDay.getDate() &&
      date.getMonth() === selectedDay.getMonth() &&
      date.getFullYear() === selectedDay.getFullYear()
    );
  };

  // Mock data for reminders - in a real app, this would come from your database
  const reminders: Reminder[] = [
    {
      id: 1,
      plantName: "Monstera",
      gardenName: "Living Room",
      task: "Water",
      time: "9:00 AM",
      completed: false,
    },
    {
      id: 2,
      plantName: "Snake Plant",
      gardenName: "Bedroom",
      task: "Fertilize",
      time: "10:30 AM",
      completed: true,
    },
    {
      id: 3,
      plantName: "Fiddle Leaf Fig",
      gardenName: "Office",
      task: "Mist leaves",
      time: "2:00 PM",
      completed: false,
    },
    {
      id: 4,
      plantName: "Pothos",
      gardenName: "Kitchen",
      task: "Check soil",
      time: "4:30 PM",
      completed: false,
    },
    {
      id: 5,
      plantName: "Aloe Vera",
      gardenName: "Bathroom",
      task: "Rotate",
      time: "5:00 PM",
      completed: false,
    },
  ];

  // Function to handle marking a reminder as complete
  const handleToggleComplete = (id: number): void => {
    // In a real app, you would update your database here
    console.log(`Toggled reminder ${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Care Calendar
        </Text>
      </View>

      {/* Week View */}
      <View className="px-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              className={`items-center justify-center mx-2 w-12 h-16 rounded-full ${
                isSelected(day)
                  ? "bg-brand-500"
                  : isToday(day)
                  ? "bg-brand-100"
                  : "bg-cream-50"
              }`}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                className={`text-xs font-medium ${
                  isSelected(day)
                    ? "text-white"
                    : isToday(day)
                    ? "text-brand-600"
                    : "text-cream-500"
                }`}
              >
                {formatWeekday(day)}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelected(day)
                    ? "text-white"
                    : isToday(day)
                    ? "text-brand-600"
                    : "text-foreground"
                }`}
              >
                {formatDay(day)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reminders for selected day */}
      <View className="px-5 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-foreground">
            Care Reminders
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="add-circle-outline" size={20} color="#10b981" />
            <Text className="text-sm text-brand-600 font-medium ml-1">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {reminders.length > 0 ? (
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {reminders.map((reminder, index) => (
              <View
                key={reminder.id}
                className={`p-4 flex-row items-center justify-between ${
                  index < reminders.length - 1
                    ? "border-b border-cream-100"
                    : ""
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <TouchableOpacity
                    className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                      reminder.completed
                        ? "bg-brand-500 border-brand-500"
                        : "border-cream-300"
                    }`}
                    onPress={() => handleToggleComplete(reminder.id)}
                  >
                    {reminder.completed && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-medium ${
                        reminder.completed
                          ? "text-cream-400 line-through"
                          : "text-foreground"
                      }`}
                    >
                      {reminder.task} {reminder.plantName}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-xs text-cream-500">
                        {reminder.time} • {reminder.gardenName}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-cream-50 rounded-xl p-8 items-center justify-center">
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text className="text-base text-cream-500 mt-4 text-center">
              No care reminders for this day
            </Text>
            <TouchableOpacity className="mt-4 bg-brand-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-medium">Add Reminder</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
