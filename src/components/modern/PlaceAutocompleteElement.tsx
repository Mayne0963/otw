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
    otw: 'bg-black/50 backdrop-blur-lg border-white/15 text-white/95 placeholder-white/40 focus:border-otw-gold-400/70 focus:ring-otw-gold-400/25 hover:border-otw-gold-300/50 hover:bg-black/60 focus:bg-black/65 transition-all duration-500 ease-out shadow-lg shadow-black/20'
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

  // Enhanced CSS injection for autocomplete dropdown styling with dark theme
  useEffect(() => {
    if (!isApiLoaded) return;

    const style = document.createElement('style');
    style.textContent = `
      /* Custom styling for Google Places Autocomplete dropdown with enhanced background blending */
      .pac-container {
        background: rgba(10, 10, 10, 0.75) !important;
        backdrop-filter: blur(32px) saturate(200%) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 20px !important;
        box-shadow: 
          0 32px 64px rgba(0, 0, 0, 0.6),
          0 16px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 0 1px rgba(244, 228, 166, 0.05) !important;
        margin-top: 8px !important;
        overflow: hidden !important;
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: 9999 !important;
        max-height: 360px !important;
        overflow-y: auto !important;
        transform: translateZ(0) !important;
        animation: dropdownFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }
      
      .pac-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          rgba(244, 228, 166, 0.02) 0%,
          rgba(10, 10, 10, 0.1) 50%,
          rgba(244, 228, 166, 0.01) 100%
        );
        pointer-events: none;
        z-index: -1;
      }
      
      .pac-item {
        background: transparent !important;
        border: none !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        color: rgba(255, 255, 255, 0.88) !important;
        padding: 16px 20px !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        cursor: pointer !important;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        position: relative !important;
        backdrop-filter: blur(12px) !important;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .pac-item:last-child {
        border-bottom: none !important;
      }
      
      .pac-item:hover,
      .pac-item.pac-item-selected {
        background: linear-gradient(135deg, 
          rgba(244, 228, 166, 0.08), 
          rgba(212, 175, 55, 0.05),
          rgba(255, 215, 0, 0.03)
        ) !important;
        color: rgba(255, 255, 255, 0.98) !important;
        transform: translateX(8px) scale(1.005) !important;
        border-left: 3px solid rgba(244, 228, 166, 0.6) !important;
        padding-left: 17px !important;
        box-shadow: 
          0 12px 24px rgba(244, 228, 166, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(16px) !important;
      }
      
      .pac-item-query {
        color: rgba(244, 228, 166, 0.95) !important;
        font-weight: 600 !important;
        letter-spacing: 0.02em !important;
        flex: 1;
      }
      
      .pac-matched {
        color: rgba(244, 228, 166, 1) !important;
        font-weight: 700 !important;
        text-shadow: 0 0 8px rgba(244, 228, 166, 0.3) !important;
        background: linear-gradient(135deg, rgba(244, 228, 166, 0.15), transparent) !important;
        padding: 2px 4px !important;
        border-radius: 4px !important;
      }
      
      .pac-icon {
        background-image: none !important;
        width: 24px !important;
        height: 24px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.06), 
          rgba(244, 228, 166, 0.04)
        ) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        position: relative !important;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
        backdrop-filter: blur(8px) !important;
        flex-shrink: 0;
      }
      
      .pac-icon::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpIi8+Cjwvc3ZnPgo=') center/contain no-repeat;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.25));
      }
      
      .pac-item:hover .pac-icon,
      .pac-item.pac-item-selected .pac-icon {
        background: linear-gradient(135deg, 
          rgba(244, 228, 166, 0.85), 
          rgba(212, 175, 55, 0.75),
          rgba(255, 215, 0, 0.65)
        ) !important;
        box-shadow: 
          0 8px 24px rgba(244, 228, 166, 0.4),
          0 0 0 2px rgba(244, 228, 166, 0.25) !important;
        transform: scale(1.15) rotate(3deg) !important;
        border-color: rgba(244, 228, 166, 0.7) !important;
      }
      
      .pac-item:hover .pac-icon::after,
      .pac-item.pac-item-selected .pac-icon::after {
        filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.9)) !important;
      }
      
      /* Enhanced scrollbar styling */
      .pac-container::-webkit-scrollbar {
        width: 6px;
      }
      
      .pac-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
      }
      
      .pac-container::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, 
          rgba(244, 228, 166, 0.5), 
          rgba(212, 175, 55, 0.3)
        );
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      
      .pac-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, 
          rgba(244, 228, 166, 0.7), 
          rgba(212, 175, 55, 0.5)
        );
      }
      
      /* Loading state for autocomplete */
      .pac-container.pac-logo::after {
        display: none;
      }
      
      /* Enhanced animation for dropdown appearance */
      .pac-container {
        animation: dropdownFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      @keyframes dropdownFadeIn {
        from {
          opacity: 0;
          transform: translateY(-16px) scale(0.9);
          filter: blur(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .pac-container {
          border-radius: 16px !important;
          margin-top: 6px !important;
          backdrop-filter: blur(24px) !important;
        }
        
        .pac-item {
          padding: 14px 18px !important;
          font-size: 13px !important;
        }
        
        .pac-icon {
          width: 20px !important;
          height: 20px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
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