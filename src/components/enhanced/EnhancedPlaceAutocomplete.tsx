'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
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
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  const dropdownId = `${componentId}-dropdown`;
  const errorId = `${componentId}-error`;
  const labelId = `${componentId}-label`;

  // Initialize Google Maps services
  useEffect(() => {
    if (isLoaded && !autocompleteService && !placesService) {
      try {
        const autoService = new google.maps.places.AutocompleteService();
        const placesServiceDiv = document.createElement('div');
        const placesServiceInstance = new google.maps.places.PlacesService(placesServiceDiv);

        setAutocompleteService(autoService);
        setPlacesService(placesServiceInstance);
      } catch (error) {
        console.error('Failed to initialize Google Maps services:', error);
        setValidation({
          isValid: false,
          message: 'Failed to initialize address search',
          type: 'error',
        });
      }
    }
  }, [isLoaded, autocompleteService, placesService]);

  // Validate address within service area
  const validateServiceArea = useCallback(
    (lat: number, lng: number): boolean => {
      if (!serviceArea) return true;

      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(lat, lng),
        new google.maps.LatLng(serviceArea.center.lat, serviceArea.center.lng),
      );

      return distance <= serviceArea.radius * 1000; // Convert km to meters
    },
    [serviceArea],
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 2 && autocompleteService && isLoaded) {
          setIsLoading(true);

          const request: google.maps.places.AutocompletionRequest = {
            input: query,
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
                }));

              setSuggestions(formattedSuggestions);
              setShowDropdown(true);
              setSelectedIndex(-1);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowDropdown(false);
              if (validateAddress) {
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
                setValidation({
                  isValid: false,
                  message: 'Address search temporarily unavailable. Please try again.',
                  type: 'error',
                });
              }
            }
          });
        } else {
          setSuggestions([]);
          setShowDropdown(false);
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [autocompleteService, isLoaded, maxSuggestions, debounceMs, types, componentRestrictions, bounds, strictBounds, validateAddress],
  );

  // Handle place selection
  const handlePlaceSelect = useCallback(
    (suggestion: Suggestion) => {
      if (!placesService) return;

      setIsLoading(true);

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
              message: 'Address is outside our service area.',
              type: 'error',
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

          setInputValue(place.formatted_address);
          setSuggestions([]);
          setShowDropdown(false);
          setSelectedIndex(-1);

          const validationResult: ValidationResult = {
            isValid: true,
            message: 'Address validated successfully',
            type: 'success',
          };
          setValidation(validationResult);

          if (onChange) {
            onChange(place.formatted_address);
          }

          onPlaceSelect(placeDetails);

          if (onValidationChange) {
            onValidationChange(validationResult);
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
          const errorValidation: ValidationResult = {
            isValid: false,
            message: 'Failed to get address details. Please try again.',
            type: 'error',
          };
          setValidation(errorValidation);
          if (onValidationChange) {
            onValidationChange(errorValidation);
          }
          console.error('Place details error:', status);
        }
      });
    },
    [placesService, onChange, onPlaceSelect, onValidationChange, serviceArea, validateServiceArea],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    // Clear validation when user starts typing
    if (validation && validation.type !== 'success') {
      setValidation(null);
      if (onValidationChange) {
        onValidationChange({ isValid: true, type: 'success' });
      }
    }

    if (newValue.trim().length > 0) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

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

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
    if (inputValue.trim().length > 2 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle blur
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

  // Update input value when prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Memoized validation icon
  const validationIcon = useMemo(() => {
    if (!validation) return null;

    switch (validation.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  }, [validation]);

  if (loadError) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={componentId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={componentId}
            type="text"
            placeholder={`Error: ${loadError}`}
            disabled
            className={cn(
              'flex h-10 w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600',
              showIcon ? 'pl-10' : '',
              inputClassName,
            )}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
          />
          {showIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={componentId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={componentId}
            type="text"
            placeholder="Loading address search..."
            disabled
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600',
              showIcon ? 'pl-10' : '',
              inputClassName,
            )}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
          />
          {showIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={componentId} id={labelId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
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
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            showIcon ? 'pl-10' : '',
            validation?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
            validation?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
            validation?.type === 'warning' ? 'border-yellow-500 focus-visible:ring-yellow-500' : '',
            inputClassName,
          )}
          aria-label={ariaLabel || label}
          aria-describedby={cn(
            ariaDescribedBy,
            validation ? errorId : undefined,
            showDropdown ? dropdownId : undefined,
          )}
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {/* Icon */}
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        )}
        
        {/* Validation icon */}
        {validationIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {validationIcon}
          </div>
        )}
        
        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={dropdownId}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-label="Address suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeId}
                className={cn(
                  'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50',
                  selectedIndex === index ? 'bg-blue-50 border-blue-200' : '',
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={-1}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.mainText}
                    </div>
                    {suggestion.secondaryText && (
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.secondaryText}
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
      {validation && validation.message && (
        <div
          id={errorId}
          className={cn(
            'text-sm',
            validation.type === 'error' ? 'text-red-600' : '',
            validation.type === 'success' ? 'text-green-600' : '',
            validation.type === 'warning' ? 'text-yellow-600' : '',
          )}
          role={validation.type === 'error' ? 'alert' : 'status'}
          aria-live={validation.type === 'error' ? 'assertive' : 'polite'}
        >
          {validation.message}
        </div>
      )}
    </div>
  );
};

export default EnhancedPlaceAutocomplete;
export type { PlaceDetails, ValidationResult, EnhancedPlaceAutocompleteProps };