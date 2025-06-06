'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  addressComponents?: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    administrativeAreaLevel1?: string;
    postalCode?: string;
    country?: string;
  };
}

interface AdvancedAddressAutocompleteProps {
  label: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxSuggestions?: number;
  debounceMs?: number;
  restrictToCountry?: string[];
  types?: string[];
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const AdvancedAddressAutocomplete: React.FC<AdvancedAddressAutocompleteProps> = ({
  label,
  onPlaceSelect,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  value = '',
  onChange,
  onFocus,
  onBlur,
  maxSuggestions = 5,
  debounceMs = 300,
  restrictToCountry,
  types = ['address'],
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentId = id || `address-autocomplete-${Math.random().toString(36).substr(2, 9)}`;

  // Use centralized Google Maps context
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsError } = useGoogleMaps();
  const dropdownId = `${componentId}-dropdown`;
  const errorId = `${componentId}-error`;

  // Initialize Google Maps services when API is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && !autocompleteService && !placesService) {
      try {
        // Initialize services
        const autoService = new google.maps.places.AutocompleteService();
        const placesServiceDiv = document.createElement('div');
        const placesServiceInstance = new google.maps.places.PlacesService(placesServiceDiv);

        setAutocompleteService(autoService);
        setPlacesService(placesServiceInstance);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google Maps services.';
        setError(errorMessage);
        console.error('Google Maps services initialization error:', err);
      }
    }

    // Handle Google Maps loading errors
    if (googleMapsError) {
      setError(googleMapsError);
    }
  }, [isGoogleMapsLoaded, googleMapsError, autocompleteService, placesService]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 2 && autocompleteService && isGoogleMapsLoaded) {
          const request: google.maps.places.AutocompletionRequest = {
            input: query,
            types: types,
            componentRestrictions: restrictToCountry ? { country: restrictToCountry } : undefined,
          };

          autocompleteService.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const formattedSuggestions: Suggestion[] = predictions
                .slice(0, maxSuggestions)
                .map((prediction) => ({
                  placeId: prediction.place_id,
                  description: prediction.description,
                  mainText: prediction.structured_formatting.main_text,
                  secondaryText: prediction.structured_formatting.secondary_text || '',
                }));

              setSuggestions(formattedSuggestions);
              setShowDropdown(true);
              setSelectedIndex(-1);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowDropdown(false);
            } else {
              console.warn('Autocomplete service error:', status);
              setSuggestions([]);
              setShowDropdown(false);
            }
          });
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }, debounceMs);
    },
    [autocompleteService, isGoogleMapsLoaded, maxSuggestions, debounceMs, types, restrictToCountry],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    if (newValue.trim().length > 0) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle place selection
  const handlePlaceSelect = useCallback(
    (suggestion: Suggestion) => {
      if (!placesService) {return;}

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: suggestion.placeId,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components'],
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.geometry || !place.formatted_address || !place.place_id) {
            setError('Invalid address selected. Please try another address.');
            return;
          }

          // Parse address components
          const addressComponents: PlaceDetails['addressComponents'] = {};
          if (place.address_components) {
            place.address_components.forEach((component) => {
              const types = component.types;
              if (types.includes('street_number')) {
                addressComponents.streetNumber = component.long_name;
              } else if (types.includes('route')) {
                addressComponents.route = component.long_name;
              } else if (types.includes('locality')) {
                addressComponents.locality = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                addressComponents.administrativeAreaLevel1 = component.short_name;
              } else if (types.includes('postal_code')) {
                addressComponents.postalCode = component.long_name;
              } else if (types.includes('country')) {
                addressComponents.country = component.long_name;
              }
            });
          }

          const placeData: PlaceDetails = {
            placeId: place.place_id,
            address: place.formatted_address,
            lat: place.geometry.location!.lat(),
            lng: place.geometry.location!.lng(),
            addressComponents,
          };

          setInputValue(place.formatted_address);
          setSuggestions([]);
          setShowDropdown(false);
          setSelectedIndex(-1);
          setError(null);

          if (onChange) {
            onChange(place.formatted_address);
          }

          if (onPlaceSelect) {
            onPlaceSelect(placeData);
          }

          // Announce selection to screen readers
          const announcement = `Address selected: ${place.formatted_address}`;
          const ariaLiveRegion = document.createElement('div');
          ariaLiveRegion.setAttribute('aria-live', 'polite');
          ariaLiveRegion.setAttribute('aria-atomic', 'true');
          ariaLiveRegion.style.position = 'absolute';
          ariaLiveRegion.style.left = '-10000px';
          ariaLiveRegion.textContent = announcement;
          document.body.appendChild(ariaLiveRegion);
          setTimeout(() => document.body.removeChild(ariaLiveRegion), 1000);
        } else {
          setError('Failed to get address details. Please try again.');
          console.error('Place details error:', status);
        }
      });
    },
    [placesService, onChange, onPlaceSelect],
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {return;}

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handlePlaceSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
    if (inputValue.trim().length > 2 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onBlur) {
          onBlur();
        }
      }
    }, 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    handlePlaceSelect(suggestion);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (!isGoogleMapsLoaded && !googleMapsError) {
    return (
      <div className={`relative ${className}`}>
        <label htmlFor={componentId} className="text-sm font-semibold text-gray-300 mb-1 block">
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
        <div className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 flex items-center border border-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2" aria-hidden="true"></div>
          <span className="text-gray-400">Loading address suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <label htmlFor={componentId} className="text-sm font-semibold text-gray-300 mb-1 block">
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
        <div className="w-full bg-red-900 text-red-200 rounded-lg px-4 py-3 border border-red-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 underline focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
        >
          Reload page to try again
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={componentId} className="text-sm font-semibold text-gray-300 mb-1 block">
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={componentId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isFocused ? 'border-yellow-500 ring-2 ring-yellow-500' : 'border-gray-600'
          } ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={`${ariaDescribedBy ? ariaDescribedBy + ' ' : ''}${error ? errorId : ''}`}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-owns={showDropdown ? dropdownId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `${dropdownId}-option-${selectedIndex}` : undefined}
          autoComplete="off"
          role="combobox"
        />

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={dropdownId}
            className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
            role="listbox"
            aria-label={`Address suggestions for ${label}`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeId}
                id={`${dropdownId}-option-${index}`}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-700 last:border-b-0 ${
                  index === selectedIndex
                    ? 'bg-yellow-500 text-black'
                    : 'text-white hover:bg-gray-700'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{suggestion.mainText}</span>
                  {suggestion.secondaryText && (
                    <span className={`text-xs ${
                      index === selectedIndex ? 'text-black opacity-70' : 'text-gray-400'
                    }`}>
                      {suggestion.secondaryText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {showDropdown && suggestions.length > 0 && (
          `${suggestions.length} address suggestions available. Use arrow keys to navigate and Enter to select.`
        )}
      </div>
    </div>
  );
};

export default AdvancedAddressAutocomplete;
export type { PlaceDetails, AdvancedAddressAutocompleteProps, Suggestion };