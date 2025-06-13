import NameToggle from "@/components/Database/NameToggle";
import SearchBar from "@/components/Database/SearchBar";
import SearchResults from "@/components/Database/SearchResults";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { activeFiltersAtom } from "@/atoms/filters";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, BodyText } from "@/components/UI/Text";

export default function PlantDatabaseScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // State for filter selection
  const [activeFilters] = useAtom(activeFiltersAtom);
  const [useCommonNames, setUseCommonNames] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle name type toggle
  const handleNameTypeToggle = useCallback((useCommon: boolean) => {
    setUseCommonNames(useCommon);
    setPage(1); // Reset to first page on name type change
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    // Scroll to top of the screen when changing pages
    StatusBar.currentHeight && window.scrollTo(0, StatusBar.currentHeight);
  }, []);

  // Handle opening filter modal
  const handleOpenFilter = useCallback(() => {
    router.push("/plants/filter");
  }, [router]);

  return (
    <PageContainer scroll={false} padded={false}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="pt-5 px-5">
            <TitleText className="text-2xl text-foreground font-bold mb-4">
              Plant Database
            </TitleText>

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search plants..."
            />

            {/* Name Toggle and Filter Selector in a row */}
            <View className="flex-row justify-between items-center">
              <NameToggle
                useCommonNames={useCommonNames}
                onToggle={handleNameTypeToggle}
              />
              <TouchableOpacity
                className="flex-row items-center justify-center bg-primary px-3 py-2 rounded-lg"
                onPress={handleOpenFilter}
              >
                <Feather name="filter" color="#fffefa" size={16} />
                <BodyText className="ml-2 text-sm font-medium text-primary-foreground">
                  Filter
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results */}
          <SearchResults
            query={debouncedQuery}
            page={page}
            filters={activeFilters}
            nameType={useCommonNames ? "common" : "scientific"}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
