'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { MapPin, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import PlaceAutocompleteElement, { PlaceDetails as ModernPlaceDetails } from '../modern/PlaceAutocompleteElement';

// Legacy interface for backward compatibility
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

// Convert modern place details to legacy format
const convertToLegacyFormat = (modernPlace: ModernPlaceDetails): PlaceDetails => {
  return {
    placeId: modernPlace.placeId,
    formattedAddress: modernPlace.formattedAddress,
    lat: modernPlace.lat,
    lng: modernPlace.lng,
    addressComponents: modernPlace.addressComponents,
    name: modernPlace.name,
    types: modernPlace.types,
  };
};

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
  const componentId = id || `enhanced-place-autocomplete-${Math.random().toString(36).substr(2, 9)}`;

  const [inputValue, setInputValue] = useState(value);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const errorId = `${componentId}-error`;
  const labelId = `${componentId}-label`;

  // Handle place selection from the modern component
  const handlePlaceSelect = useCallback(
    (modernPlace: ModernPlaceDetails) => {
      const legacyPlace = convertToLegacyFormat(modernPlace);
      setInputValue(legacyPlace.formattedAddress);
      setHasUserInteracted(true);

      // Validate service area if configured
      if (serviceArea && !validateServiceArea(legacyPlace.lat, legacyPlace.lng)) {
        const validationResult: ValidationResult = {
          isValid: false,
          message: 'Address is outside the service area',
          type: 'error',
        };
        setValidation(validationResult);
        onValidationChange?.(validationResult);
        return;
      }

      // Set success validation
      const validationResult: ValidationResult = {
        isValid: true,
        message: 'Valid address selected',
        type: 'success',
      };
      setValidation(validationResult);
      onValidationChange?.(validationResult);

      onPlaceSelect(legacyPlace);
    },
    [onPlaceSelect, onValidationChange, serviceArea, validateServiceArea],
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      setHasUserInteracted(true);
      onChange?.(newValue);

      // Clear validation when user starts typing
      if (validation) {
        setValidation(null);
        onValidationChange?.({
          isValid: true,
          type: 'success',
        });
      }
    },
    [onChange, onValidationChange, validation],
  );

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

  // Handle clear button
  const handleClear = useCallback(() => {
    setInputValue('');
    setHasUserInteracted(true);
    onChange?.('');
    setValidation(null);
    onValidationChange?.({
      isValid: true,
      type: 'success',
    });
  }, [onChange, onValidationChange]);







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
          validation?.type === 'error' ? 'border-red-500' : '',
          validation?.type === 'success' ? 'border-green-500' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        )}>
          {showIcon && (
            <div className="flex items-center justify-center w-12 h-12">
              <MapPin className={cn('w-5 h-5', themeStyles.icon)} />
            </div>
          )}

          <PlaceAutocompleteElement
            id={componentId}
            placeholder={placeholder}
            value={inputValue}
            onPlaceSelect={handlePlaceSelect}
            onInputChange={handleInputChange}
            disabled={disabled}
            required={required}
            className={cn(
              'flex-1 px-4 py-3 text-base bg-transparent border-0 outline-none',
              'placeholder:text-center focus:placeholder:text-left transition-all duration-200',
              themeStyles.input,
              showIcon ? 'pl-0' : 'px-4',
              showClearButton && inputValue ? 'pr-12' : 'pr-4',
              inputClassName,
            )}
            componentRestrictions={componentRestrictions}
            fields={fields}
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