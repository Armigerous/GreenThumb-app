import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function PlantDatabaseScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for plant database - in a real app, this would come from your database
  const plants = [
    {
      id: 1,
      commonName: "Monstera",
      scientificName: "Monstera deliciosa",
      category: "Houseplant",
      thumbnail:
        "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      commonName: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      category: "Succulent",
      thumbnail:
        "https://images.unsplash.com/photo-1572688484438-313a6e50c333?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      commonName: "Fiddle Leaf Fig",
      scientificName: "Ficus lyrata",
      category: "Houseplant",
      thumbnail:
        "https://images.unsplash.com/photo-1597055181449-9d2b9152f558?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      commonName: "Peace Lily",
      scientificName: "Spathiphyllum",
      category: "Houseplant",
      thumbnail:
        "https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 5,
      commonName: "Aloe Vera",
      scientificName: "Aloe barbadensis miller",
      category: "Succulent",
      thumbnail:
        "https://images.unsplash.com/photo-1596547609652-9cf5d8c6a5f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 6,
      commonName: "Pothos",
      scientificName: "Epipremnum aureum",
      category: "Vine",
      thumbnail:
        "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    },
  ];

  // Filter plants based on search query
  const filteredPlants = plants.filter(
    (plant) =>
      plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories for filter buttons
  const categories = ["All", "Houseplant", "Succulent", "Vine", "Herb"];
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter plants by category
  const categoryFilteredPlants =
    activeCategory === "All"
      ? filteredPlants
      : filteredPlants.filter((plant) => plant.category === activeCategory);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Plant Database
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-foreground"
            placeholder="Search plants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`px-4 py-2 mr-2 rounded-full ${
                activeCategory === category ? "bg-emerald-500" : "bg-gray-100"
              }`}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                className={`${
                  activeCategory === category ? "text-white" : "text-gray-700"
                } font-medium`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5">
        <View className="flex-row flex-wrap justify-between">
          {categoryFilteredPlants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              className="bg-white rounded-xl overflow-hidden mb-4 w-[48%] shadow-sm"
              onPress={() => {}}
            >
              <Image
                source={{ uri: plant.thumbnail }}
                className="w-full h-24"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="text-base font-bold text-foreground">
                  {plant.commonName}
                </Text>
                <Text className="text-xs text-gray-500 italic mb-1">
                  {plant.scientificName}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full">
                    {plant.category}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {categoryFilteredPlants.length === 0 && (
          <View className="items-center justify-center py-8">
            <Ionicons name="leaf" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-2 text-center">
              No plants found. Try a different search.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
