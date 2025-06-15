'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPinIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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

type ThemeVariant = 'default' | 'modern' | 'minimal' | 'glassmorphism' | 'dark' | 'otw';
type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

export interface PlaceAutocompleteElementProps {
  value?: string;
  placeholder?: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  // Styling
  theme?: ThemeVariant;
  size?: SizeVariant;
  showIcon?: boolean;
  label?: string;
  // API Configuration
  countryFilter?: string | string[];
  typeFilter?: string[];
  fields?: string[];
  // Accessibility
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Styling helper functions
const getThemeStyles = (theme: ThemeVariant): string => {
  const themes = {
    default: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
    modern: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm',
    minimal: 'bg-transparent border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-0',
    glassmorphism: 'bg-white/10 backdrop-blur-md border-white/20 text-gray-900 placeholder-gray-600 focus:border-white/40 focus:ring-white/20',
    dark: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400',
    otw: 'bg-[--color-input-bg] backdrop-blur-lg border-[--color-border] text-white/95 placeholder:[--color-muted] focus:border-[--color-harvest-gold] focus:ring-[--color-harvest-gold]/25 hover:border-[--color-harvest-gold]/50 hover:bg-[--color-input-bg] focus:bg-[--color-input-bg] transition-all duration-500 ease-out shadow-lg shadow-black/20'
  };
  return themes[theme] || themes.otw;
};

const getSizeStyles = (size: SizeVariant): string => {
  const sizes = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-3 text-base h-11',
    lg: 'px-5 py-3.5 text-lg h-12',
    xl: 'px-6 py-4 text-xl h-14'
  };
  return sizes[size] || sizes.md;
};

const getIconSizeStyles = (size: SizeVariant): string => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };
  return iconSizes[size] || iconSizes.md;
};

const PlaceAutocompleteElement: React.FC<PlaceAutocompleteElementProps> = ({
  value = '',
  placeholder = 'Enter an address...',
  onPlaceSelect,
  onInputChange,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  error,
  theme = 'otw',
  size = 'md',
  showIcon = true,
  label,
  countryFilter,
  typeFilter,
  fields = ['place_id', 'formatted_address', 'name', 'geometry', 'address_components', 'types'],
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const autocompleteRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // Check if Google Maps API is loaded
  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    const checkApiLoaded = () => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsApiLoaded(true);
        setLoadError(null);
      } else {
        // Try to load the API if not already loaded
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setLoadError('Google Maps API key is not configured');
          return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Script is loading, wait for it
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places?.PlaceAutocompleteElement) {
              setIsApiLoaded(true);
              setLoadError(null);
              clearInterval(checkInterval);
            }
          }, 100);

          // Clear interval after 10 seconds
          setTimeout(() => clearInterval(checkInterval), 10000);
          return;
        }

        // Load the API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.onload = () => {
          // Wait for the API to be fully initialized
          const checkReady = setInterval(() => {
            if (window.google?.maps?.places?.PlaceAutocompleteElement) {
              setIsApiLoaded(true);
              setLoadError(null);
              clearInterval(checkReady);
            }
          }, 100);

          // Clear interval after 5 seconds
          setTimeout(() => {
            clearInterval(checkReady);
            if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
              setLoadError('Failed to initialize Google Maps Places API');
            }
          }, 5000);
        };
        script.onerror = () => {
          setLoadError('Failed to load Google Maps API');
        };
        document.head.appendChild(script);
      }
    };

    checkApiLoaded();
  }, []);

  // Handle place selection
  const handlePlaceChange = useCallback(() => {
    if (!autocompleteRef.current) {return;}

    try {
      const place = autocompleteRef.current.getPlace();

      if (!place || !place.place_id) {
        console.warn('No valid place selected');
        return;
      }

      // Apply client-side country filtering if specified
      if (countryFilter && place.address_components) {
        const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
        const countryComponent = place.address_components.find(
          (component: any) => component.types.includes('country'),
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

      // Apply client-side type filtering if specified
      if (typeFilter && typeFilter.length > 0) {
        const hasValidType = typeFilter.some(filterType =>
          place.types && place.types.includes(filterType),
        );

        if (!hasValidType) {
          console.log('Place filtered out due to type restriction:', place.types);
          return;
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
        addressComponents: (place.address_components || []).map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
        types: place.types || [],
      };

      setInputValue(placeDetails.formattedAddress);
      onPlaceSelect?.(placeDetails);
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  }, [onPlaceSelect, countryFilter, typeFilter]);

  // Handle input changes
  const handleInputChange = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  }, [onInputChange]);

  // Set up event listeners when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !autocompleteRef.current) {return;}

    const element = autocompleteRef.current;

    // Add event listeners
    element.addEventListener('gmp-placeselect', handlePlaceChange);
    element.addEventListener('input', handleInputChange);

    return () => {
      // Clean up event listeners
      element.removeEventListener('gmp-placeselect', handlePlaceChange);
      element.removeEventListener('input', handleInputChange);
    };
  }, [isApiLoaded, handlePlaceChange, handleInputChange]);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && value !== undefined) {
      setInputValue(value);
      if (autocompleteRef.current) {
        autocompleteRef.current.value = value;
      }
    }
  }, [value, inputValue]);

  // Configure the autocomplete element
  useEffect(() => {
    if (!isApiLoaded || !autocompleteRef.current) {return;}

    const element = autocompleteRef.current;

    // Note: componentRestrictions is not supported in PlaceAutocompleteElement
    // Client-side filtering will be applied in the place selection handler

    // Set fields
    if (fields.length > 0) {
      element.fields = fields;
    }

    // Set other properties
    element.placeholder = placeholder;
    element.disabled = disabled;
    element.value = inputValue;
  }, [isApiLoaded, fields, placeholder, disabled, inputValue]);

  // Generate unique IDs for accessibility
  const inputId = id || `place-autocomplete-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const labelId = `${inputId}-label`;

  // Combine styling classes
  const themeClasses = getThemeStyles(theme);
  const sizeClasses = getSizeStyles(size);
  const iconSizeClasses = getIconSizeStyles(size);

  // Enhanced CSS injection for autocomplete dropdown styling with improved z-index and responsiveness
  useEffect(() => {
    if (!isApiLoaded) return;

    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced OTW Google Maps Autocomplete Dropdown Styling */
      .pac-container {
        background-color: var(--color-surface) !important;
        border: 2px solid var(--color-border) !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
        margin-top: 0.5rem !important;
        overflow: hidden !important;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        position: absolute !important;
        z-index: 999999 !important;
        min-width: 100% !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      
      .pac-item {
        background-color: transparent !important;
        color: var(--color-onyx) !important;
        border-bottom: 1px solid var(--color-border) !important;
        padding: 14px 18px !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        cursor: pointer !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative !important;
      }
      
      .pac-item:hover {
        background-color: var(--color-surface-strong) !important;
        color: var(--color-onyx) !important;
        transform: translateX(2px) !important;
      }
      
      .pac-item-selected,
      .pac-item:focus {
        background-color: var(--color-harvest-gold) !important;
        background: linear-gradient(135deg, rgba(var(--color-harvest-gold-rgb), 0.15) 0%, rgba(var(--color-harvest-gold-rgb), 0.05) 100%) !important;
        color: var(--color-onyx) !important;
        font-weight: 600 !important;
        border-left: 3px solid var(--color-harvest-gold) !important;
        padding-left: 15px !important;
      }
      
      .pac-item:last-child {
        border-bottom: none !important;
        border-radius: 0 0 0.75rem 0.75rem !important;
      }
      
      .pac-item:first-child {
        border-radius: 0.75rem 0.75rem 0 0 !important;
      }
      
      .pac-item-query {
        color: var(--color-onyx) !important;
        font-weight: 600 !important;
      }
      
      .pac-matched {
        color: var(--color-harvest-gold) !important;
        font-weight: 700 !important;
        text-shadow: 0 0 8px rgba(var(--color-harvest-gold-rgb), 0.3) !important;
      }
      
      .pac-icon {
        background-image: none !important;
        width: 22px !important;
        height: 22px !important;
        margin-right: 14px !important;
        background: linear-gradient(135deg, var(--color-harvest-gold) 0%, rgba(var(--color-harvest-gold-rgb), 0.8) 100%) !important;
        border-radius: 50% !important;
        position: relative !important;
        box-shadow: 0 2px 8px rgba(var(--color-harvest-gold-rgb), 0.3) !important;
      }
      
      .pac-icon::before {
        content: "📍" !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        font-size: 12px !important;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)) !important;
      }
      
      /* Enhanced mobile responsiveness */
      @media (max-width: 640px) {
        .pac-container {
          min-width: 300px !important;
          max-width: calc(100vw - 32px) !important;
          left: 16px !important;
          right: 16px !important;
          margin-top: 8px !important;
        }
        
        .pac-item {
          padding: 12px 16px !important;
          font-size: 13px !important;
        }
        
        .pac-icon {
          width: 20px !important;
          height: 20px !important;
          margin-right: 12px !important;
        }
      }
      
      /* Critical z-index and positioning fixes */
      .pac-container {
        z-index: 999999 !important;
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        right: 0 !important;
      }
      
      /* Remove Google branding */
      .pac-container.pac-logo:after {
        display: none !important;
      }
      
      /* Scrollbar styling for dropdown */
      .pac-container::-webkit-scrollbar {
        width: 6px !important;
      }
      
      .pac-container::-webkit-scrollbar-track {
        background: var(--color-surface-strong) !important;
        border-radius: 3px !important;
      }
      
      .pac-container::-webkit-scrollbar-thumb {
        background: var(--color-harvest-gold) !important;
        border-radius: 3px !important;
      }
      
      .pac-container::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--color-harvest-gold-rgb), 0.8) !important;
      }
    `;
    
    if (!document.head.querySelector('[data-pac-styles]')) {
      style.setAttribute('data-pac-styles', 'true');
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.head.querySelector('[data-pac-styles]');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [isApiLoaded]);

  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-otw-black-700 mb-2">
            {label}
            {required && <span className="text-otw-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center space-x-3 p-4 bg-otw-red-50 border border-otw-red-200 rounded-xl shadow-sm">
          <ExclamationTriangleIcon className="h-5 w-5 text-otw-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-otw-red-800">Address Search Unavailable</p>
            <p className="text-xs text-otw-red-600 mt-1">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isApiLoaded) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-otw-black-700 mb-2">
            {label}
            {required && <span className="text-otw-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-otw-gold-50 to-otw-gold-100 border border-otw-gold-200 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-otw-gold-300 border-t-otw-gold-600"></div>
          <div>
            <p className="text-sm font-medium text-otw-black-700">Loading Address Search...</p>
            <p className="text-xs text-otw-black-500 mt-1">Connecting to Google Places</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          id={labelId}
          className="block text-sm font-semibold text-white/95 mb-3 tracking-wide drop-shadow-sm"
        >
          {label}
          {required && <span className="text-otw-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {showIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <MapPinIcon className={`${iconSizeClasses} text-otw-gold-400/80 drop-shadow-lg transition-all duration-300 group-hover:text-otw-gold-300 group-focus-within:text-otw-gold-300 group-focus-within:scale-110`} />
          </div>
        )}
        
        <gmp-place-autocomplete
          ref={autocompleteRef}
          id={inputId}
          className={`
            w-full rounded-xl border-2 transition-all duration-500 ease-out
            focus:outline-none focus:ring-4 focus:ring-offset-0
            font-medium text-base backdrop-blur-lg
            ${showIcon ? 'pl-12' : ''}
            ${themeClasses}
            ${sizeClasses}
            ${inputClassName}
            ${
              error 
                ? 'border-otw-red-400/70 focus:border-otw-red-400 focus:ring-otw-red-400/25 bg-red-900/20' 
                : ''
            }
            ${
              disabled 
                ? 'bg-black/25 cursor-not-allowed opacity-40 border-white/8' 
                : 'hover:shadow-2xl hover:shadow-otw-gold-400/15 focus:shadow-3xl focus:shadow-otw-gold-400/25 hover:scale-[1.01] focus:scale-[1.02]'
            }
          `}
          aria-label={ariaLabel || (label ? `${label} address input` : 'Address search input')}
          aria-describedby={error ? errorId : ariaDescribedBy}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
        />
      </div>

      {error && (
        <div id={errorId} className="mt-4 flex items-start space-x-3 p-4 bg-red-900/20 border border-otw-red-400/30 rounded-xl backdrop-blur-lg shadow-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-otw-red-300 flex-shrink-0 mt-0.5 drop-shadow-sm" />
          <span className="text-sm text-otw-red-200 font-medium leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  );
};

// OTW-specific wrapper component with default styling
export const OTWPlaceAutocompleteElement: React.FC<Omit<PlaceAutocompleteElementProps, 'theme' | 'size' | 'showIcon'> & {
  theme?: ThemeVariant;
  size?: SizeVariant;
  showIcon?: boolean;
}> = (props) => {
  return (
    <PlaceAutocompleteElement
      theme="otw"
      size="md"
      showIcon={true}
      {...props}
    />
  );
};

export default PlaceAutocompleteElement;

// Export types for external use
export type { PlaceDetails, PlaceAutocompleteElementProps, ThemeVariant, SizeVariant };