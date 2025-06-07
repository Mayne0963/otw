'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapPinIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  displayName: string;
  location: {
    lat: number;
    lng: number;
  };
  addressComponents: {
    longName: string;
    shortName: string;
    types: string[];
  }[];
  types: string[];
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
}

export interface ModernPlaceAutocompleteProps {
  value?: string;
  placeholder?: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  onValidationChange?: (validation: ValidationResult) => void;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  // API Configuration
  types?: string[];
  componentRestrictions?: { country?: string | string[] };
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
  strictBounds?: boolean;
  maxSuggestions?: number;
  // Features
  enableAddressValidation?: boolean;
  serviceAreaCenter?: { lat: number; lng: number };
  serviceAreaRadius?: number; // in meters
  debounceMs?: number;
  // Accessibility
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface AutocompleteSuggestion {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  types: string[];
}

const ModernPlaceAutocomplete: React.FC<ModernPlaceAutocompleteProps> = ({
  value = '',
  placeholder = 'Enter an address...',
  onPlaceSelect,
  onValidationChange,
  className = '',
  inputClassName = '',
  dropdownClassName = '',
  disabled = false,
  required = false,
  error,
  types = ['address'],
  componentRestrictions = { country: 'us' },
  bounds,
  strictBounds = false,
  maxSuggestions = 5,
  enableAddressValidation = true,
  serviceAreaCenter,
  serviceAreaRadius = 50000, // 50km default
  debounceMs = 300,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const { isLoaded, loadError, getAutocompleteSuggestions, getPlaceDetails } = useModernGoogleMaps();
  
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    message: '',
    severity: 'success'
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Generate unique IDs for accessibility
  const componentId = useMemo(() => id || `place-autocomplete-${Math.random().toString(36).substr(2, 9)}`, [id]);
  const listboxId = `${componentId}-listbox`;
  const errorId = `${componentId}-error`;
  const descriptionId = `${componentId}-description`;

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      if (!value) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        setValidation({ isValid: false, message: '', severity: 'success' });
      }
    }
  }, [value, inputValue]);

  // Validate service area if configured
  const validateServiceArea = useCallback((location: { lat: number; lng: number }): boolean => {
    if (!serviceAreaCenter || !window.google?.maps?.geometry?.spherical) {
      return true; // No validation if not configured
    }

    const center = new window.google.maps.LatLng(serviceAreaCenter.lat, serviceAreaCenter.lng);
    const placeLocation = new window.google.maps.LatLng(location.lat, location.lng);
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(center, placeLocation);
    
    return distance <= serviceAreaRadius;
  }, [serviceAreaCenter, serviceAreaRadius]);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchInput: string) => {
    if (!isLoaded || !searchInput.trim() || searchInput.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      const suggestions = await getAutocompleteSuggestions(searchInput.trim(), {
        types,
        componentRestrictions,
        bounds,
        strictBounds,
        maxSuggestions
      });

      if (!abortControllerRef.current?.signal.aborted) {
        const formattedSuggestions: AutocompleteSuggestion[] = suggestions.map(suggestion => ({
          placeId: suggestion.placePrediction?.placeId || '',
          displayName: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
          formattedAddress: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
          types: suggestion.placePrediction?.types || []
        })).filter(s => s.placeId);

        setSuggestions(formattedSuggestions);
        setIsDropdownOpen(formattedSuggestions.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Autocomplete search error:', error);
        setSuggestions([]);
        setIsDropdownOpen(false);
        
        // Update validation with error
        setValidation({
          isValid: false,
          message: 'Unable to search addresses. Please try again.',
          severity: 'error'
        });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [isLoaded, getAutocompleteSuggestions, types, componentRestrictions, bounds, strictBounds, maxSuggestions]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Reset validation when typing
    if (validation.isValid) {
      setValidation({ isValid: false, message: '', severity: 'success' });
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(newValue);
    }, debounceMs);
  }, [debouncedSearch, debounceMs, validation.isValid]);

  // Handle place selection
  const handlePlaceSelect = useCallback(async (suggestion: AutocompleteSuggestion) => {
    setInputValue(suggestion.displayName);
    setSuggestions([]);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setIsLoading(true);

    try {
      const place = await getPlaceDetails(suggestion.placeId);
      
      if (place && place.location) {
        const placeDetails: PlaceDetails = {
          placeId: suggestion.placeId,
          formattedAddress: place.formattedAddress || suggestion.formattedAddress,
          displayName: place.displayName?.text || suggestion.displayName,
          location: {
            lat: place.location.lat(),
            lng: place.location.lng()
          },
          addressComponents: place.addressComponents?.map(component => ({
            longName: component.longName,
            shortName: component.shortName,
            types: component.types
          })) || [],
          types: place.types || suggestion.types
        };

        // Validate service area if enabled
        let validationResult: ValidationResult;
        if (enableAddressValidation && serviceAreaCenter) {
          const isInServiceArea = validateServiceArea(placeDetails.location);
          if (isInServiceArea) {
            validationResult = {
              isValid: true,
              message: 'Address verified and within service area',
              severity: 'success'
            };
          } else {
            validationResult = {
              isValid: false,
              message: 'Address is outside our service area',
              severity: 'warning'
            };
          }
        } else {
          validationResult = {
            isValid: true,
            message: 'Address verified',
            severity: 'success'
          };
        }

        setValidation(validationResult);
        onValidationChange?.(validationResult);
        onPlaceSelect?.(placeDetails);
      } else {
        throw new Error('Unable to get place details');
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      const errorValidation: ValidationResult = {
        isValid: false,
        message: 'Unable to verify address. Please try again.',
        severity: 'error'
      };
      setValidation(errorValidation);
      onValidationChange?.(errorValidation);
    } finally {
      setIsLoading(false);
    }
  }, [getPlaceDetails, enableAddressValidation, serviceAreaCenter, validateServiceArea, onPlaceSelect, onValidationChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handlePlaceSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isDropdownOpen, suggestions, selectedIndex, handlePlaceSelect]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [suggestions.length]);

  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setValidation({ isValid: false, message: '', severity: 'success' });
    onValidationChange?.({ isValid: false, message: '', severity: 'success' });
    inputRef.current?.focus();
  }, [onValidationChange]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Determine validation icon and styling
  const getValidationIcon = () => {
    if (isLoading) {
      return (
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
      );
    }
    
    if (validation.message) {
      switch (validation.severity) {
        case 'success':
          return <CheckIcon className="h-4 w-4 text-green-500" />;
        case 'warning':
          return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
        case 'error':
          return <XMarkIcon className="h-4 w-4 text-red-500" />;
      }
    }
    
    return null;
  };

  const getInputBorderClass = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (validation.message) {
      switch (validation.severity) {
        case 'success':
          return 'border-green-500 focus:border-green-500 focus:ring-green-500';
        case 'warning':
          return 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500';
        case 'error':
          return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      }
    }
    return 'border-gray-600 focus:border-blue-500 focus:ring-blue-500';
  };

  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500 rounded-lg">
          <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-400 text-sm">{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          id={componentId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled || !isLoaded}
          required={required}
          className={`
            w-full pl-10 pr-12 py-3 
            bg-gray-800 text-white placeholder-gray-400
            border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getInputBorderClass()}
            ${inputClassName}
          `}
          aria-label={ariaLabel || placeholder}
          aria-describedby={`${ariaDescribedBy || ''} ${validation.message ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `${componentId}-option-${selectedIndex}` : undefined}
          role="combobox"
        />
        
        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          {getValidationIcon()}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Clear input"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-1 
            bg-gray-800 border border-gray-600 rounded-lg shadow-xl
            max-h-60 overflow-auto
            ${dropdownClassName}
          `}
          role="listbox"
          id={listboxId}
          aria-label="Address suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.placeId}
              ref={el => suggestionRefs.current[index] = el}
              id={`${componentId}-option-${index}`}
              className={`
                px-4 py-3 cursor-pointer transition-colors
                border-b border-gray-700 last:border-b-0
                ${index === selectedIndex 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
                }
              `}
              onClick={() => handlePlaceSelect(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {suggestion.displayName}
                  </div>
                  {suggestion.formattedAddress && (
                    <div className="text-sm text-gray-400 truncate">
                      {suggestion.formattedAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Message */}
      {validation.message && (
        <div
          id={descriptionId}
          className={`mt-2 text-sm flex items-center space-x-2 ${
            validation.severity === 'success' ? 'text-green-400' :
            validation.severity === 'warning' ? 'text-yellow-400' :
            'text-red-400'
          }`}
          role="status"
          aria-live="polite"
        >
          {getValidationIcon()}
          <span>{validation.message}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          className="mt-2 text-sm text-red-400 flex items-center space-x-2"
          role="alert"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ModernPlaceAutocomplete;