'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapPinIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

// Extend JSX to include the Google Maps web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': any;
    }
  }
}

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
  countryFilter?: string | string[];
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

// AutocompleteSuggestion interface removed - using PlaceAutocompleteElement directly

// Add interface for Google Maps Place object
interface GoogleMapsPlace {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
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
  countryFilter = 'us',
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
  const { isLoaded, loadError, getPlaceDetails } = useModernGoogleMaps();

  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    message: '',
    severity: 'success',
  });
  const [isApiReady, setIsApiReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const placeAutocompleteRef = useRef<any>(null);

  // Generate unique IDs for accessibility
  const componentId = useMemo(() => id || `place-autocomplete-${Math.random().toString(36).substr(2, 9)}`, [id]);
  const errorId = `${componentId}-error`;
  const descriptionId = `${componentId}-description`;

  // Sync external value changes
  useEffect(() => {
    // Only update if the external value is different and not empty
    // This prevents clearing the input during typing
    if (value !== inputValue && value !== undefined) {
      setInputValue(value);
      if (!value) {
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

  // Use PlaceAutocompleteElement instead of deprecated getAutocompleteSuggestions

  // Check if PlaceAutocompleteElement is available
  useEffect(() => {
    const checkApiReady = () => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsApiReady(true);
      } else {
        // Wait for API to load
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places?.PlaceAutocompleteElement) {
            setIsApiReady(true);
            clearInterval(checkInterval);
          }
        }, 100);

        // Clear interval after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
      }
    };

    if (isLoaded) {
      checkApiReady();
    }
  }, [isLoaded]);

  // Initialize PlaceAutocompleteElement
  useEffect(() => {
    if (!isApiReady || !placeAutocompleteRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }

    try {
      // Create the autocomplete element
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components', 'types'],
      });

      // Apply country filter if specified
      if (countryFilter) {
        const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
        autocompleteElement.componentRestrictions = { country: countries };
      }

      // Apply type filter if specified
      if (types && types.length > 0) {
        autocompleteElement.types = types;
      }

      // Handle place selection
      autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
        const place = event.place as GoogleMapsPlace;
        handlePlaceSelectFromElement(place);
      });

      // Replace the input with the autocomplete element
      placeAutocompleteRef.current.appendChild(autocompleteElement);

      return () => {
        if (placeAutocompleteRef.current && autocompleteElement) {
          placeAutocompleteRef.current.removeChild(autocompleteElement);
        }
      };
    } catch (error) {
      console.error('Error initializing PlaceAutocompleteElement:', error);
    }
  }, [isApiReady, countryFilter, types]);

  // Handle place selection from PlaceAutocompleteElement
  const handlePlaceSelectFromElement = useCallback(async (place: GoogleMapsPlace) => {
    if (!place || !place.place_id) {
      console.warn('No valid place selected');
      return;
    }

    // Apply client-side filtering
    if (countryFilter && place.address_components) {
      const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
      const countryComponent = place.address_components.find(
        (component) => component.types.includes('country'),
      );

      if (countryComponent) {
        const countryCode = countryComponent.short_name.toLowerCase();
        const countryName = countryComponent.long_name.toLowerCase();
        const isValidCountry = countries.some(filter =>
          filter.toLowerCase() === countryCode ||
          filter.toLowerCase() === countryName,
        );

        if (!isValidCountry) {
          console.log('Place filtered out due to country restriction:', countryComponent);
          return;
        }
      }
    }

    // Convert to our PlaceDetails interface
    const placeDetails: PlaceDetails = {
      placeId: place.place_id,
      formattedAddress: place.formatted_address || '',
      displayName: place.name || place.formatted_address || '',
      location: {
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
      },
      addressComponents: (place.address_components || []).map((component) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types,
      })),
      types: place.types || [],
    };

    // Validate service area if configured
    if (serviceAreaCenter) {
      const isInServiceArea = validateServiceArea(placeDetails.location);
      if (!isInServiceArea) {
        setValidation({
          isValid: false,
          message: `Address is outside our service area (${Math.round(serviceAreaRadius / 1000)}km radius)`,
          severity: 'warning',
        });
        onValidationChange?.({
          isValid: false,
          message: `Address is outside our service area (${Math.round(serviceAreaRadius / 1000)}km radius)`,
          severity: 'warning',
        });
        return;
      }
    }

    // Update input value
    setInputValue(placeDetails.displayName);

    // Set validation
    const validationResult: ValidationResult = {
      isValid: true,
      message: enableAddressValidation ? 'Address validated successfully' : '',
      severity: 'success',
    };
    setValidation(validationResult);
    onValidationChange?.(validationResult);

    // Call the callback
    onPlaceSelect?.(placeDetails);
  }, [countryFilter, serviceAreaCenter, validateServiceArea, serviceAreaRadius, enableAddressValidation, onPlaceSelect, onValidationChange]);

  // Handle input change (simplified since PlaceAutocompleteElement handles suggestions)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Reset validation when typing
    if (validation.isValid) {
      setValidation({ isValid: false, message: '', severity: 'success' });
    }

    // Call onInputChange if provided
    // Note: PlaceAutocompleteElement handles autocomplete suggestions internally
  }, [validation.isValid]);

  // Legacy handlePlaceSelect removed - now handled by handlePlaceSelectFromElement
  // This function is no longer needed since PlaceAutocompleteElement handles place selection directly

  // Simplified keyboard navigation (PlaceAutocompleteElement handles most navigation)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Basic escape handling for consistency
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
    // PlaceAutocompleteElement handles other keyboard navigation internally
  }, []);

  // Handle input focus (simplified since PlaceAutocompleteElement handles suggestions)
  const handleInputFocus = useCallback(() => {
    // PlaceAutocompleteElement handles focus behavior internally
  }, []);

  // Handle input blur (simplified since PlaceAutocompleteElement handles suggestions)
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // PlaceAutocompleteElement handles blur behavior internally
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    setValidation({ isValid: false, message: '', severity: 'success' });
    onValidationChange?.({ isValid: false, message: '', severity: 'success' });

    // Clear the PlaceAutocompleteElement if available
    if (placeAutocompleteRef.current) {
      const input = placeAutocompleteRef.current.querySelector('input');
      if (input) {
        input.value = '';
      }
    }

    // Notify parent component of the clear action
    onPlaceSelect?.({
      placeId: '',
      formattedAddress: '',
      displayName: '',
      location: { lat: 0, lng: 0 },
      addressComponents: [],
      types: [],
    });

    inputRef.current?.focus();
  }, [onValidationChange, onPlaceSelect]);

  // No cleanup needed since we're using PlaceAutocompleteElement

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
    if (error) {return 'border-red-500 focus:border-red-500 focus:ring-red-500';}
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
      {/* PlaceAutocompleteElement Web Component */}
      {isApiReady && (
        <gmp-place-autocomplete
          ref={placeAutocompleteRef}
          className={`
            w-full
            [&>input]:w-full [&>input]:pl-10 [&>input]:pr-12 [&>input]:py-3
            [&>input]:bg-gray-800 [&>input]:text-white [&>input]:placeholder-gray-400
            [&>input]:border [&>input]:rounded-lg [&>input]:transition-all [&>input]:duration-200
            [&>input]:focus:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-opacity-50
            [&>input]:disabled:opacity-50 [&>input]:disabled:cursor-not-allowed
            [&>input]:${getInputBorderClass()}
            ${inputClassName}
          `}
        >
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
            aria-label={ariaLabel || placeholder}
            aria-describedby={`${ariaDescribedBy || ''} ${validation.message ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
          />
        </gmp-place-autocomplete>
      )}

      {/* Fallback input when API is not ready */}
      {!isApiReady && (
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
          />
        </div>
      )}

      {/* Icon overlay for both cases */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPinIcon className="h-5 w-5 text-gray-400" />
      </div>

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