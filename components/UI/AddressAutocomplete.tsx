import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { BodyText } from "./Text";
import { CompactSpinner } from "./LoadingSpinner";

interface AddressSuggestion {
  id: string;
  description: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  latitude?: number;
  longitude?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onAddressSelect: (address: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onAddressSelect,
  placeholder = "Enter city, state",
  className = "",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Debounced geocoding function
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address || address.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        // Create suggestions from geocoding results
        const addressSuggestions: AddressSuggestion[] = await Promise.all(
          results.slice(0, 5).map(async (result, index) => {
            try {
              // Reverse geocode to get formatted address
              const [reverseResult] = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
              });

              const formattedAddress = [
                reverseResult.city,
                reverseResult.region,
                reverseResult.country,
              ]
                .filter(Boolean)
                .join(", ");

              return {
                id: `geocode-${index}`,
                description: formattedAddress,
                city: reverseResult.city,
                region: reverseResult.region,
                country: reverseResult.country,
                latitude: result.latitude,
                longitude: result.longitude,
              };
            } catch (error) {
              console.error("Error reverse geocoding:", error);
              return {
                id: `geocode-${index}`,
                description: `${result.latitude.toFixed(
                  4
                )}, ${result.longitude.toFixed(4)}`,
                latitude: result.latitude,
                longitude: result.longitude,
              };
            }
          })
        );

        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce geocoding calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && !isValidated) {
        geocodeAddress(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, geocodeAddress, isValidated]);

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChangeText(suggestion.description);
    onAddressSelect({
      address: suggestion.description,
      latitude: suggestion.latitude || null,
      longitude: suggestion.longitude || null,
    });
    setShowSuggestions(false);
    setIsValidated(true);
    Keyboard.dismiss();
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setIsValidated(false);
    if (text.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <View className="relative">
      <View className="relative">
        <TextInput
          className={`border border-cream-300 rounded-lg p-4 bg-cream-50 pr-12 ${className}`}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor="#9e9a90"
          autoCapitalize="words"
          autoComplete="address-line1"
          textContentType="addressCity"
        />

        {/* Loading indicator or validation checkmark */}
        <View className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <CompactSpinner size={20} />
          ) : isValidated ? (
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          ) : null}
        </View>
      </View>

      {/* Address suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View className="absolute top-full left-0 right-0 z-10 bg-white border border-cream-300 rounded-lg mt-1 max-h-48 shadow-lg">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                className="p-3 border-b border-cream-200 last:border-b-0"
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#5E994B"
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <BodyText className="text-foreground">
                      {suggestion.description}
                    </BodyText>
                    {suggestion.city && suggestion.region && (
                      <BodyText className="text-cream-600 text-sm">
                        {suggestion.city}, {suggestion.region}
                      </BodyText>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Validation message */}
      {isValidated && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <BodyText className="text-green-700 text-sm ml-2">
            Address verified
          </BodyText>
        </View>
      )}
    </View>
  );
}
