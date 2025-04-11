import React, { memo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "default" | "compact" | "simple";
  showPageNumbers?: boolean;
  className?: string;
}

const Pagination = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    variant = "default",
    showPageNumbers = true,
    className = "",
  }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Generate page numbers to display
    const getPageNumbers = () => {
      const pages = [];

      // For compact variant, show fewer pages
      if (variant === "compact") {
        // Always show current page
        pages.push(currentPage);

        // Show one page before and after if available
        if (currentPage > 1) pages.unshift(currentPage - 1);
        if (currentPage < totalPages) pages.push(currentPage + 1);

        return pages;
      }

      // Default variant with more comprehensive pagination
      // Always show first page
      if (currentPage > 3) {
        pages.push(1);
      }

      // Show ellipsis if needed
      if (currentPage > 4) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 3) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      if (currentPage < totalPages - 2) {
        pages.push(totalPages);
      }

      return pages;
    };

    // Simple variant just shows prev/next buttons
    if (variant === "simple") {
      return (
        <View
          className={`py-3 px-4 flex-row justify-between items-center ${className}`}
        >
          <TouchableOpacity
            onPress={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isFirstPage ? "opacity-40" : ""
            }`}
            accessibilityLabel="Previous page"
          >
            <Ionicons name="chevron-back" size={18} color="#047857" />
            <Text className="text-brand-700 ml-1 font-medium">Previous</Text>
          </TouchableOpacity>

          <Text className="text-cream-600">
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isLastPage ? "opacity-40" : ""
            }`}
            accessibilityLabel="Next page"
          >
            <Text className="text-brand-700 mr-1 font-medium">Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#047857" />
          </TouchableOpacity>
        </View>
      );
    }

    const pageNumbers = getPageNumbers();

    return (
      <View className={`py-4 px-4 bg-white rounded-lg ${className}`}>
        <View className="flex-row items-center justify-center">
          {/* Previous button */}
          <TouchableOpacity
            onPress={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isFirstPage ? "opacity-40" : ""
            }`}
            accessibilityLabel="Previous page"
          >
            <Ionicons name="chevron-back" size={20} color="#047857" />
            <Text className="text-brand-700 ml-1 font-medium">Prev</Text>
          </TouchableOpacity>

          {/* Page numbers */}
          {showPageNumbers && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              className="flex-row mx-2"
            >
              {pageNumbers.map((page, index) => {
                if (page < 0) {
                  // Render ellipsis
                  return (
                    <View key={`ellipsis-${index}`} className="px-2 py-1">
                      <Text className="text-cream-500">...</Text>
                    </View>
                  );
                }

                const isActive = page === currentPage;

                return (
                  <TouchableOpacity
                    key={`page-${page}`}
                    onPress={() => onPageChange(page)}
                    className={`mx-1 px-3 py-1.5 rounded-lg ${
                      isActive
                        ? "bg-brand-600"
                        : "bg-brand-50 border border-brand-100"
                    }`}
                    accessibilityLabel={`Page ${page}`}
                  >
                    <Text
                      className={`${
                        isActive ? "text-white font-medium" : "text-brand-700"
                      }`}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Next button */}
          <TouchableOpacity
            onPress={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isLastPage ? "opacity-40" : ""
            }`}
            accessibilityLabel="Next page"
          >
            <Text className="text-brand-700 mr-1 font-medium">Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#047857" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
