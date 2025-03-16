import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GardensScreen() {
  const { user } = useUser();
  const router = useRouter();

  // Mock data for gardens - in a real app, this would come from your database
  const gardens = [
    {
      id: 1,
      name: "Front Yard Flower Bed",
      location: "Front Yard",
      conditions: "Full Sun, Clay Soil",
      plantCount: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Kitchen Herb Garden",
      location: "Indoor",
      conditions: "Partial Sun, Potting Soil",
      plantCount: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Backyard Vegetable Patch",
      location: "Backyard",
      conditions: "Full Sun, Loamy Soil",
      plantCount: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1598880513676-056a3a1a8918?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-foreground">My Gardens</Text>
        <TouchableOpacity
          className="bg-emerald-500 p-2 rounded-full"
          onPress={() => {}}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {gardens.map((garden) => (
          <TouchableOpacity
            key={garden.id}
            className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
            onPress={() => {}}
          >
            <Image
              source={{ uri: garden.thumbnail }}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-4">
              <Text className="text-lg font-bold text-foreground mb-1">
                {garden.name}
              </Text>
              <Text className="text-sm text-cream-500 mb-2">
                {garden.location} • {garden.conditions}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="leaf" size={16} color="#10b981" />
                <Text className="text-sm text-emerald-600 ml-1 font-medium">
                  {garden.plantCount} Plants
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="bg-cream-50 rounded-xl p-4 items-center justify-center mb-8 border border-dashed border-cream-300"
          onPress={() => {}}
        >
          <Ionicons name="add-circle-outline" size={32} color="#6b7280" />
          <Text className="text-base text-cream-500 mt-2">Add New Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
