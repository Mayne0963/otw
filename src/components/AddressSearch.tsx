'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';
import { MapPinIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PlaceDetails {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components: google.maps.GeocoderAddressComponent[];
  name?: string;
}

type ThemeVariant = 'default' | 'modern' | 'minimal' | 'glassmorphism' | 'dark' | 'otw';
type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

interface StyleConfig {
  container?: string;
  input?: string;
  loading?: string;
  error?: string;
  icon?: string;
  dropdown?: string;
  suggestion?: string;
}

interface AddressSearchProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  theme?: ThemeVariant;
  size?: SizeVariant;
  disabled?: boolean;
  showIcon?: boolean;
  customStyles?: StyleConfig;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  focusColor?: string;
  errorMessage?: string;
  loadingText?: string;
  label?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Theme configurations
const getThemeStyles = (theme: ThemeVariant = 'default', focusColor?: string): string => {
  const themes = {
    default: 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500',
    modern: 'border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm',
    minimal: 'border-gray-200 bg-transparent text-gray-900 focus:ring-gray-400 focus:border-gray-400 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none',
    glassmorphism: 'border-white/20 bg-white/10 backdrop-blur-md text-gray-900 focus:ring-white/30 focus:border-white/30 shadow-lg',
    dark: 'border-gray-600 bg-gray-800 text-white focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400',
    otw: 'bg-black/40 backdrop-blur-xl border-white/12 text-white/95 placeholder-white/50 focus:border-otw-gold-400/80 focus:ring-otw-gold-400/30 hover:border-white/20 hover:bg-black/50 focus:bg-black/55 transition-all duration-300 ease-out shadow-xl shadow-black/25 hover:shadow-2xl hover:shadow-otw-gold-400/10 focus:shadow-2xl focus:shadow-otw-gold-400/20',
  };

  let baseStyle = themes[theme] || themes.otw;

  if (focusColor) {
    baseStyle = baseStyle.replace(/focus:ring-\w+-\d+/, `focus:ring-[${focusColor}]`);
    baseStyle = baseStyle.replace(/focus:border-\w+-\d+/, `focus:border-[${focusColor}]`);
  }

  return baseStyle;
};

const getSizeStyles = (size: SizeVariant = 'md'): string => {
  const sizes = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-3 text-base h-11',
    lg: 'px-5 py-3.5 text-lg h-12',
    xl: 'px-6 py-4 text-xl h-14'
  };
  return sizes[size];
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

const getBorderRadiusStyles = (borderRadius: AddressSearchProps['borderRadius'] = 'md'): string => {
  const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  return radiusMap[borderRadius];
};

const AutocompleteInput: React.FC<AddressSearchProps> = ({
  onPlaceSelect,
  placeholder = "Enter an address",
  className = "",
  theme = 'otw',
  size = 'md',
  disabled = false,
  showIcon = true,
  customStyles = {},
  borderRadius = 'md',
  focusColor,
  errorMessage,
  loadingText = "Loading...",
  label,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const { isLoaded, loadError } = useModernGoogleMaps();
  const inputId = `address-search-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'place_id', 'geometry', 'address_components', 'name']
    });

    // Apply enhanced styling with OTW branding
    const themeStyles = getThemeStyles(theme);
    const sizeStyles = getSizeStyles(size);
    const radiusStyles = getBorderRadiusStyles(borderRadius);
    
    if (inputRef.current) {
      inputRef.current.className = `
        w-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-0
        ${themeStyles}
        ${sizeStyles}
        ${radiusStyles}
        ${disabled ? 'opacity-40 cursor-not-allowed bg-black/25 border-white/8' : 'hover:shadow-2xl hover:shadow-otw-gold-400/15 focus:shadow-3xl focus:shadow-otw-gold-400/25 hover:scale-[1.01] focus:scale-[1.02]'}
        ${showIcon ? 'pl-12' : ''}
        ${customStyles.input || ''}
        ${className}
        font-medium text-base
      `.trim().replace(/\s+/g, ' ');
    }

    // Enhanced autocomplete styling with seamless background blending
    const style = document.createElement('style');
    style.textContent = `
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
      .pac-item-selected {
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
      .pac-item-selected .pac-icon {
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
      .pac-item-selected .pac-icon::after {
        filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.9)) !important;
      }
      .pac-item-query {
        color: rgba(244, 228, 166, 0.95) !important;
        font-weight: 600 !important;
        letter-spacing: 0.025em !important;
        flex: 1;
      }
      .pac-matched {
        color: rgba(244, 228, 166, 1) !important;
        font-weight: 700 !important;
        text-shadow: 0 0 12px rgba(244, 228, 166, 0.4) !important;
        background: linear-gradient(135deg, rgba(244, 228, 166, 0.2), transparent) !important;
        padding: 1px 3px !important;
        border-radius: 3px !important;
      }
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
      ${customStyles.dropdown || ''}
    `;
    document.head.appendChild(style);

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        onPlaceSelect(place as PlaceDetails);
        setHasValue(true);
      }
    });

    return () => {
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(listener);
      }
      document.head.removeChild(style);
    };
  }, [isLoaded, onPlaceSelect, theme, size, borderRadius, disabled, customStyles, className, focusColor, showIcon]);

  if (loadError) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-otw-black-700">
            {label}
            {required && <span className="text-otw-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${customStyles.error || ''}`}>
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm font-medium">
            {errorMessage || 'Error loading Google Maps. Please refresh the page.'}
          </span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-otw-black-700">
            {label}
            {required && <span className="text-otw-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`flex items-center gap-3 p-3 bg-otw-gold-50 border border-otw-gold-200 rounded-lg ${customStyles.loading || ''}`}>
          <div className="w-5 h-5 border-2 border-otw-gold-300 border-t-otw-gold-600 rounded-full animate-spin flex-shrink-0"></div>
          <span className="text-otw-black-600 text-sm font-medium">
            {loadingText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${customStyles.container || ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-semibold text-white/95 mb-1 tracking-wide drop-shadow-sm"
        >
          {label}
          {required && <span className="text-otw-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative group">
        {showIcon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
            isFocused || hasValue ? 'text-otw-gold-400 scale-110' : 'text-otw-gold-500/70'
          } drop-shadow-lg group-hover:text-otw-gold-300 group-focus-within:text-otw-gold-300`}>
            <MapPinIcon className={getIconSizeStyles(size)} />
          </div>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || label || placeholder}
          aria-describedby={ariaDescribedBy || (errorMessage ? errorId : descriptionId)}
          aria-invalid={!!errorMessage}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
          className="peer"
        />
        {/* Focus ring enhancement */}
        <div className={`absolute inset-0 ${getBorderRadiusStyles(borderRadius)} pointer-events-none transition-all duration-300 ${
          isFocused ? 'ring-4 ring-otw-gold-500/20 ring-offset-0' : ''
        }`} />
      </div>
      {errorMessage && (
        <div id={errorId} className="mt-2 flex items-start space-x-2 p-3 bg-otw-red-500/10 border border-otw-red-500/20 rounded-lg backdrop-blur-sm">
          <ExclamationTriangleIcon className="w-4 h-4 text-otw-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-otw-red-300 font-medium">{errorMessage}</span>
        </div>
      )}
      <div id={descriptionId} className="sr-only">
        Start typing an address to see suggestions. Use arrow keys to navigate and Enter to select.
      </div>
    </div>
  );
};

const AddressSearch: React.FC<AddressSearchProps> = (props) => {
  return <AutocompleteInput {...props} />;
};

// Enhanced component with OTW branding as default export
const OTWAddressSearch: React.FC<AddressSearchProps> = (props) => {
  const enhancedProps = {
    theme: 'otw' as const,
    size: 'md' as const,
    borderRadius: 'md' as const,
    showIcon: true,
    ...props
  };
  
  return <AddressSearch {...enhancedProps} />;
};

export default AddressSearch;
export { OTWAddressSearch };
export type { AddressSearchProps, PlaceDetails, ThemeVariant, SizeVariant, StyleConfig };