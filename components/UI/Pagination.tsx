import React, { memo } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText, Text } from "./Text";

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
          className={`py-4 px-4 flex-row justify-between items-center bg-cream-50 rounded-lg border border-cream-200 ${className}`}
        >
          <TouchableOpacity
            onPress={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-4 py-2.5 rounded-lg flex-row items-center ${
              isFirstPage
                ? "opacity-40 bg-cream-200"
                : "bg-brand-600 active:bg-brand-700"
            }`}
            accessibilityLabel="Previous page"
            accessibilityRole="button"
            accessibilityState={{ disabled: isFirstPage }}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={isFirstPage ? "#636059" : "#fffefa"}
            />
            <BodyText
              className={`ml-2 font-paragraph-semibold ${
                isFirstPage ? "text-cream-600" : "text-primary-foreground"
              }`}
            >
              Previous
            </BodyText>
          </TouchableOpacity>

          <Text className="text-cream-700 font-paragraph-medium">
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-4 py-2.5 rounded-lg flex-row items-center ${
              isLastPage
                ? "opacity-40 bg-cream-200"
                : "bg-brand-600 active:bg-brand-700"
            }`}
            accessibilityLabel="Next page"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLastPage }}
          >
            <BodyText
              className={`mr-2 font-paragraph-semibold ${
                isLastPage ? "text-cream-600" : "text-primary-foreground"
              }`}
            >
              Next
            </BodyText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isLastPage ? "#636059" : "#fffefa"}
            />
          </TouchableOpacity>
        </View>
      );
    }

    const pageNumbers = getPageNumbers();

    return (
      <View
        className={`py-4 px-4 bg-cream-50 rounded-lg border border-cream-200 ${className}`}
      >
        <View className="flex-row items-center justify-center">
          {/* Previous button */}
          <TouchableOpacity
            onPress={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-2.5 rounded-lg flex-row items-center ${
              isFirstPage
                ? "opacity-40 bg-cream-200"
                : "bg-brand-600 active:bg-brand-700"
            }`}
            accessibilityLabel="Previous page"
            accessibilityRole="button"
            accessibilityState={{ disabled: isFirstPage }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isFirstPage ? "#636059" : "#fffefa"}
            />
            <BodyText
              className={`ml-1 font-paragraph-semibold ${
                isFirstPage ? "text-cream-600" : "text-primary-foreground"
              }`}
            >
              Prev
            </BodyText>
          </TouchableOpacity>

          {/* Page numbers */}
          {showPageNumbers && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              className="flex-row mx-3"
            >
              {pageNumbers.map((page, index) => {
                if (page < 0) {
                  // Render ellipsis
                  return (
                    <View key={`ellipsis-${index}`} className="px-3 py-2">
                      <Text className="text-cream-500 font-paragraph">...</Text>
                    </View>
                  );
                }

                const isActive = page === currentPage;

                return (
                  <TouchableOpacity
                    key={`page-${page}`}
                    onPress={() => onPageChange(page)}
                    className={`mx-1 px-4 py-2.5 rounded-lg min-w-[44px] items-center justify-center ${
                      isActive
                        ? "bg-brand-600 border border-brand-600"
                        : "bg-white border border-cream-300 active:bg-cream-100"
                    }`}
                    accessibilityLabel={`Page ${page}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <BodyText
                      className={`font-paragraph-semibold ${
                        isActive ? "text-primary-foreground" : "text-cream-700"
                      }`}
                    >
                      {page}
                    </BodyText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Next button */}
          <TouchableOpacity
            onPress={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-3 py-2.5 rounded-lg flex-row items-center ${
              isLastPage
                ? "opacity-40 bg-cream-200"
                : "bg-brand-600 active:bg-brand-700"
            }`}
            accessibilityLabel="Next page"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLastPage }}
          >
            <BodyText
              className={`mr-1 font-paragraph-semibold ${
                isLastPage ? "text-cream-600" : "text-primary-foreground"
              }`}
            >
              Next
            </BodyText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isLastPage ? "#636059" : "#fffefa"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
