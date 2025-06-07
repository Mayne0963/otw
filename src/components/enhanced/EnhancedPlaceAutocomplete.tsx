'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';

interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
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
  name?: string;
  types?: string[];
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  type: 'success' | 'error' | 'warning';
}

interface EnhancedPlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  onValidationChange?: (validation: ValidationResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  showIcon?: boolean;
  types?: string[];
  componentRestrictions?: { country?: string | string[] };
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
  strictBounds?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number;
  maxSuggestions?: number;
  validateAddress?: boolean;
  serviceArea?: {
    center: { lat: number; lng: number };
    radius: number; // in kilometers
  };
  label?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  autoComplete?: string;
  showClearButton?: boolean;
  theme?: 'light' | 'dark';
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
  structuredFormatting: {
    mainText: string;
    secondaryText?: string;
  };
}

const EnhancedPlaceAutocomplete: React.FC<EnhancedPlaceAutocompleteProps> = ({
  onPlaceSelect,
  onValidationChange,
  placeholder = 'Enter an address...',
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  showIcon = true,
  types = ['address'],
  componentRestrictions,
  bounds,
  strictBounds = false,
  value = '',
  onChange,
  onFocus,
  onBlur,
  debounceMs = 300,
  maxSuggestions = 5,
  validateAddress = true,
  serviceArea,
  label,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  autoComplete = 'off',
  showClearButton = true,
  theme = 'dark',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentId = id || `enhanced-place-autocomplete-${Math.random().toString(36).substr(2, 9)}`;

  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { isLoaded, loadError, autocompleteService, placesService } = useGoogleMaps();

  const dropdownId = `${componentId}-dropdown`;
  const errorId = `${componentId}-error`;
  const labelId = `${componentId}-label`;

  // Theme-based styles
  const themeStyles = useMemo(() => {
    if (theme === 'light') {
      return {
        container: 'bg-white border-gray-300',
        input: 'bg-white text-gray-900 placeholder-gray-500',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        suggestion: 'hover:bg-gray-50 text-gray-900',
        suggestionActive: 'bg-blue-50 text-blue-900',
        icon: 'text-gray-400',
        error: 'text-red-600',
        success: 'text-green-600',
      };
    }
    return {
      container: 'bg-gray-800 border-gray-700',
      input: 'bg-gray-800 text-white placeholder-gray-400',
      dropdown: 'bg-gray-800 border-gray-700 shadow-2xl',
      suggestion: 'hover:bg-gray-700 text-white',
      suggestionActive: 'bg-yellow-400/20 text-yellow-400',
      icon: 'text-gray-400',
      error: 'text-red-400',
      success: 'text-green-400',
    };
  }, [theme]);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && !hasUserInteracted) {
      setInputValue(value);
    }
  }, [value, inputValue, hasUserInteracted]);

  // Validate address within service area
  const validateServiceArea = useCallback(
    (lat: number, lng: number): boolean => {
      if (!serviceArea || !window.google?.maps?.geometry) {return true;}

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(lat, lng),
        new window.google.maps.LatLng(serviceArea.center.lat, serviceArea.center.lng),
      );

      return distance <= serviceArea.radius * 1000; // Convert km to meters
    },
    [serviceArea],
  );

  // Debounced search function with improved error handling
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 2 && autocompleteService && isLoaded) {
          setIsLoading(true);

          const request: google.maps.places.AutocompletionRequest = {
            input: query.trim(),
            types,
            componentRestrictions,
            bounds,
            strictBounds,
          };

          autocompleteService.getPlacePredictions(request, (predictions, status) => {
            setIsLoading(false);

            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const formattedSuggestions: Suggestion[] = predictions
                .slice(0, maxSuggestions)
                .map((prediction) => ({
                  placeId: prediction.place_id,
                  description: prediction.description,
                  mainText: prediction.structured_formatting.main_text,
                  secondaryText: prediction.structured_formatting.secondary_text || '',
                  types: prediction.types,
                  structuredFormatting: {
                    mainText: prediction.structured_formatting.main_text,
                    secondaryText: prediction.structured_formatting.secondary_text,
                  },
                }));

              setSuggestions(formattedSuggestions);
              setShowDropdown(true);
              setSelectedIndex(-1);

              if (validateAddress) {
                setValidation(null); // Clear previous validation errors
              }
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowDropdown(false);
              if (validateAddress && query.trim().length > 0) {
                setValidation({
                  isValid: false,
                  message: 'No addresses found. Please try a different search.',
                  type: 'warning',
                });
              }
            } else {
              console.warn('Autocomplete service error:', status);
              setSuggestions([]);
              setShowDropdown(false);

              if (validateAddress) {
                let errorMessage = 'Address search temporarily unavailable.';

                if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                  errorMessage = 'Address search access denied. Please check API configuration.';
                } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                  errorMessage = 'Search limit exceeded. Please try again later.';
                }

                setValidation({
                  isValid: false,
                  message: errorMessage,
                  type: 'error',
                });
              }
            }
          });
        } else {
          setSuggestions([]);
          setShowDropdown(false);
          setIsLoading(false);

          if (validateAddress && query.trim().length === 0) {
            setValidation(null);
          }
        }
      }, debounceMs);
    },
    [autocompleteService, isLoaded, maxSuggestions, debounceMs, types, componentRestrictions, bounds, strictBounds, validateAddress],
  );

  // Handle place selection with improved validation
  const handlePlaceSelect = useCallback(
    (suggestion: Suggestion) => {
      if (!placesService) {
        setValidation({
          isValid: false,
          message: 'Places service not available. Please try again.',
          type: 'error',
        });
        return;
      }

      setIsLoading(true);
      setShowDropdown(false);
      setInputValue(suggestion.description);

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: suggestion.placeId,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name', 'types'],
      };

      placesService.getDetails(request, (place, status) => {
        setIsLoading(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.geometry || !place.formatted_address || !place.place_id) {
            setValidation({
              isValid: false,
              message: 'Invalid address selected. Please try another address.',
              type: 'error',
            });
            return;
          }

          const lat = place.geometry.location!.lat();
          const lng = place.geometry.location!.lng();

          // Validate service area if specified
          if (serviceArea && !validateServiceArea(lat, lng)) {
            setValidation({
              isValid: false,
              message: `Address is outside service area (${serviceArea.radius}km radius).`,
              type: 'warning',
            });
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

          const placeDetails: PlaceDetails = {
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
            lat,
            lng,
            addressComponents,
            name: place.name,
            types: place.types,
          };

          // Set success validation
          if (validateAddress) {
            setValidation({
              isValid: true,
              message: 'Address validated successfully',
              type: 'success',
            });
          }

          // Call callbacks
          onPlaceSelect(placeDetails);
          if (onChange) {
            onChange(place.formatted_address);
          }
        } else {
          let errorMessage = 'Failed to get address details.';

          if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
            errorMessage = 'Address not found. Please try a different address.';
          } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            errorMessage = 'Access denied. Please check API configuration.';
          }

          setValidation({
            isValid: false,
            message: errorMessage,
            type: 'error',
          });
        }
      });
    },
    [placesService, serviceArea, validateServiceArea, validateAddress, onPlaceSelect, onChange],
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setHasUserInteracted(true);

      if (onChange) {
        onChange(newValue);
      }

      // Clear validation when user starts typing
      if (validation && newValue !== value) {
        setValidation(null);
      }

      // Trigger search
      debouncedSearch(newValue);
    },
    [onChange, validation, value, debouncedSearch],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          e.preventDefault();
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
        case 'Tab':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showDropdown, suggestions, selectedIndex, handlePlaceSelect],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setHasUserInteracted(true);
    if (onFocus) {onFocus();}

    // Show dropdown if there are suggestions
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [onFocus, suggestions.length]);

  // Handle blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Delay hiding dropdown to allow for suggestion clicks
      setTimeout(() => {
        setIsFocused(false);
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onBlur) {onBlur();}
      }, 150);
    },
    [onBlur],
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setValidation(null);
    setHasUserInteracted(true);

    if (onChange) {
      onChange('');
    }

    inputRef.current?.focus();
  }, [onChange]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      handlePlaceSelect(suggestion);
    },
    [handlePlaceSelect],
  );

  // Update validation callback
  useEffect(() => {
    if (onValidationChange && validation) {
      onValidationChange(validation);
    }
  }, [validation, onValidationChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Show loading error if Google Maps failed to load
  if (loadError) {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label htmlFor={componentId} className={cn('block text-sm font-medium mb-2', themeStyles.error)}>
            {label}
          </label>
        )}
        <div className={cn(
          'flex items-center px-4 py-3 rounded-lg border',
          themeStyles.container,
          'border-red-500',
        )}>
          <AlertCircle className={cn('w-5 h-5 mr-3', themeStyles.error)} />
          <span className={cn('text-sm', themeStyles.error)}>Address search unavailable</span>
        </div>
        <p className={cn('text-xs mt-1', themeStyles.error)}>{loadError}</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={componentId}
          id={labelId}
          className={cn('block text-sm font-medium mb-2', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}
        >
          {label}
          {required && <span className={themeStyles.error}> *</span>}
        </label>
      )}

      <div className="relative">
        <div className={cn(
          'flex items-center rounded-lg border transition-all duration-200',
          themeStyles.container,
          isFocused ? 'ring-2 ring-yellow-400 border-yellow-400' : '',
          validation?.type === 'error' ? 'border-red-500' : '',
          validation?.type === 'success' ? 'border-green-500' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        )}>
          {showIcon && (
            <div className="flex items-center justify-center w-12 h-12">
              {isLoading ? (
                <Loader2 className={cn('w-5 h-5 animate-spin', themeStyles.icon)} />
              ) : (
                <MapPin className={cn('w-5 h-5', themeStyles.icon)} />
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            id={componentId}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled || !isLoaded}
            required={required}
            autoComplete={autoComplete}
            aria-label={ariaLabel || label}
            aria-describedby={cn(
              ariaDescribedBy,
              validation ? errorId : undefined,
              showDropdown ? dropdownId : undefined,
            ).trim() || undefined}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-activedescendant={selectedIndex >= 0 ? `${componentId}-option-${selectedIndex}` : undefined}
            role="combobox"
            className={cn(
              'flex-1 px-4 py-3 text-base bg-transparent border-0 outline-none',
              'placeholder:text-center focus:placeholder:text-left transition-all duration-200',
              themeStyles.input,
              showIcon ? 'pl-0' : 'px-4',
              showClearButton && inputValue ? 'pr-12' : 'pr-4',
              inputClassName,
            )}
          />

          {showClearButton && inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'flex items-center justify-center w-8 h-8 mr-2 rounded-full',
                'hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                themeStyles.icon,
              )}
              aria-label="Clear address"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {validation && (
            <div className="flex items-center justify-center w-8 h-8 mr-2">
              {validation.type === 'success' ? (
                <CheckCircle2 className={cn('w-5 h-5', themeStyles.success)} />
              ) : (
                <AlertCircle className={cn('w-5 h-5', themeStyles.error)} />
              )}
            </div>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={dropdownId}
            role="listbox"
            aria-label="Address suggestions"
            className={cn(
              'absolute z-50 w-full mt-1 rounded-lg border overflow-hidden',
              themeStyles.dropdown,
            )}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeId}
                id={`${componentId}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0',
                  index === selectedIndex ? themeStyles.suggestionActive : themeStyles.suggestion,
                )}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className={cn('w-4 h-4 mt-0.5 flex-shrink-0', themeStyles.icon)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {suggestion.structuredFormatting.mainText}
                    </div>
                    {suggestion.structuredFormatting.secondaryText && (
                      <div className={cn('text-sm opacity-75 truncate')}>
                        {suggestion.structuredFormatting.secondaryText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation message */}
      {validation && (
        <p
          id={errorId}
          className={cn(
            'text-xs mt-1 flex items-center space-x-1',
            validation.type === 'success' ? themeStyles.success : themeStyles.error,
          )}
        >
          {validation.type === 'success' ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          <span>{validation.message}</span>
        </p>
      )}
    </div>
  );
};

export default EnhancedPlaceAutocomplete;
export type { PlaceDetails, ValidationResult, EnhancedPlaceAutocompleteProps };