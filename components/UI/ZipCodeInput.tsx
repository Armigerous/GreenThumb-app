import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { BodyText } from "./Text";
import { CompactSpinner } from "./LoadingSpinner";

/**
 * ZipCodeInput Component
 *
 * A specialized input component for North Carolina ZIP code validation and geocoding.
 * Validates ZIP code format (27xxx or 28xxx), geocodes the location to get coordinates,
 * and provides real-time feedback with visual indicators.
 *
 * Features:
 * - Real-time NC ZIP code format validation
 * - Automatic geocoding with coordinates and location details
 * - Loading states during validation
 * - Success/error feedback with appropriate messaging
 * - Numeric-only input with 5-digit limit
 * - Debounced validation to prevent excessive API calls
 * - Prevents re-validation of already validated ZIP codes
 */

interface ZipCodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onLocationSelect: (locationData: {
    zipCode: string;
    latitude: number;
    longitude: number;
    city?: string;
    county?: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function ZipCodeInput({
  value,
  onChangeText,
  onLocationSelect,
  placeholder = "Enter NC ZIP code",
  className = "",
}: ZipCodeInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the last validated ZIP code to prevent redundant validation
  const lastValidatedZipRef = useRef<string>("");
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate NC ZIP code format (27xxx or 28xxx)
  const isValidNCZip = (zip: string): boolean => {
    const zipRegex = /^(27|28)\d{3}$/;
    return zipRegex.test(zip);
  };

  // Geocode ZIP code to get coordinates
  const geocodeZipCode = useCallback(
    async (zipCode: string) => {
      // Don't validate if we've already validated this ZIP code
      if (lastValidatedZipRef.current === zipCode && isValid) {
        return;
      }

      if (!isValidNCZip(zipCode)) {
        setError("Please enter a valid NC ZIP code (27xxx or 28xxx)");
        setIsValid(false);
        lastValidatedZipRef.current = "";
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        // Geocode the ZIP code
        const results = await Location.geocodeAsync(
          `${zipCode}, North Carolina, USA`
        );

        if (results.length > 0) {
          const { latitude, longitude } = results[0];

          // Try reverse geocoding but don't fail if it doesn't work
          let city: string | undefined;
          let county: string | undefined;

          try {
            const [reverseResult] = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            city = reverseResult.city || undefined;
            county = reverseResult.subregion || undefined;
          } catch (reverseError) {
            console.warn(
              "Reverse geocoding failed, continuing without city/county:",
              reverseError
            );
            // Continue without city/county data
          }

          setIsValid(true);
          lastValidatedZipRef.current = zipCode;
          onLocationSelect({
            zipCode,
            latitude,
            longitude,
            city,
            county,
          });
        } else {
          setError("Could not find location for this ZIP code");
          setIsValid(false);
          lastValidatedZipRef.current = "";
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setError("Could not validate ZIP code. Please try again.");
        setIsValid(false);
        lastValidatedZipRef.current = "";
      } finally {
        setIsValidating(false);
      }
    },
    [onLocationSelect, isValid]
  );

  // Handle text changes and reset validation state when ZIP changes
  const handleTextChange = (text: string) => {
    // Only allow numbers and limit to 5 digits
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 5);
    onChangeText(numericText);

    // Reset validation state only if the ZIP actually changed
    if (numericText !== value) {
      setIsValid(false);
      setError(null);
      lastValidatedZipRef.current = "";
    }
  };

  // Debounced validation - only validate when ZIP code changes
  useEffect(() => {
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Only validate if we have a 5-digit ZIP and it's different from last validated
    if (value.length === 5 && value !== lastValidatedZipRef.current) {
      validationTimeoutRef.current = setTimeout(() => {
        geocodeZipCode(value);
      }, 500);
    } else if (value.length < 5) {
      // Reset state for incomplete ZIP codes
      setIsValid(false);
      setError(null);
      lastValidatedZipRef.current = "";
    }

    // Cleanup timeout
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [value, geocodeZipCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const getInputBorderColor = () => {
    if (error) return "border-destructive";
    if (isValid) return "border-brand-300";
    return "border-cream-300";
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <CompactSpinner size={20} />;
    }
    if (isValid) {
      return <Ionicons name="checkmark-circle" size={20} color="#5E994B" />;
    }
    if (error) {
      return <Ionicons name="close-circle" size={20} color="#E50000" />;
    }
    return null;
  };

  return (
    <View>
      <View className="relative">
        <TextInput
          className={`border ${getInputBorderColor()} rounded-lg p-4 bg-cream-50 pr-12 ${className}`}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9e9a90"
          keyboardType="numeric"
          maxLength={5}
          autoComplete="postal-code"
          textContentType="postalCode"
        />

        {/* Status indicator */}
        <View className="absolute right-3 top-4 h-6 w-6 justify-center items-center">
          {getStatusIcon()}
        </View>
      </View>

      {/* Error message */}
      {error && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="alert-circle" size={16} color="#E50000" />
          <BodyText className="text-destructive text-sm ml-2">{error}</BodyText>
        </View>
      )}
    </View>
  );
}
