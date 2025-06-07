'use client';
import React, { useRef, useEffect } from 'react';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

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

type ThemeVariant = 'default' | 'modern' | 'minimal' | 'glassmorphism' | 'dark';
type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

interface StyleConfig {
  container?: string;
  input?: string;
  loading?: string;
  error?: string;
  icon?: string;
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
}

// Theme configurations
const getThemeStyles = (theme: ThemeVariant = 'default', focusColor?: string): string => {
  const themes = {
    default: 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500',
    modern: 'border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm',
    minimal: 'border-gray-200 bg-transparent text-gray-900 focus:ring-gray-400 focus:border-gray-400 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none',
    glassmorphism: 'border-white/20 bg-white/10 backdrop-blur-md text-gray-900 focus:ring-white/30 focus:border-white/30 shadow-lg',
    dark: 'border-gray-600 bg-gray-800 text-white focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400',
  };

  let baseStyle = themes[theme];

  if (focusColor) {
    baseStyle = baseStyle.replace(/focus:ring-\w+-\d+/, `focus:ring-[${focusColor}]`);
    baseStyle = baseStyle.replace(/focus:border-\w+-\d+/, `focus:border-[${focusColor}]`);
  }

  return baseStyle;
};

const getSizeStyles = (size: SizeVariant = 'md'): string => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
  };
  return sizes[size];
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

const AutocompleteInput: React.FC<Omit<AddressSearchProps, never>> = ({
  onPlaceSelect,
  placeholder = 'Enter an address...',
  className = '',
  theme = 'default',
  size = 'md',
  disabled = false,
  showIcon = true,
  customStyles,
  borderRadius = 'md',
  focusColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);

  const { isLoaded } = useModernGoogleMaps();

  useEffect(() => {
    if (!containerRef.current || !isLoaded || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(','),
    );

    // Configure placeholder + disabled state
    autocompleteElement.placeholder = placeholder;
    if (disabled) {
      autocompleteElement.setAttribute('disabled', 'true');
    }

    // Apply Tailwind/custom styles
    const inputStyles = [
      'w-full',
      'outline-none',
      'transition-all duration-200',
      'focus:ring-2',
      getSizeStyles(size),
      getThemeStyles(theme, focusColor),
      getBorderRadiusStyles(borderRadius),
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
      customStyles?.input || '',
      className,
      showIcon ? 'pl-10' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Apply the styles to the autocomplete element
    autocompleteElement.className = inputStyles;

    // Add event listener for place selection
    autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
      const place = event.place;
      if (place && onPlaceSelect) {
        onPlaceSelect(place);
      }
    });

    // Append to container
    containerRef.current.appendChild(autocompleteElement);
    autocompleteRef.current = autocompleteElement;

    // Cleanup function
    return () => {
      if (autocompleteRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(autocompleteRef.current);
        } catch (e) {
          // Element might already be removed
        }
      }
    };
  }, [onPlaceSelect, placeholder, theme, size, disabled, showIcon, customStyles, borderRadius, focusColor, className]);

  const containerStyles = [
    'relative',
    customStyles?.container || '',
  ].filter(Boolean).join(' ');

  const iconStyles = [
    'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
    customStyles?.icon || '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerStyles}>
      {showIcon && (
        <svg className={iconStyles} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )}
      <div ref={containerRef} />
    </div>
  );
};

const AddressSearch: React.FC<AddressSearchProps> = ({
  onPlaceSelect,
  placeholder,
  className,
  theme,
  size,
  disabled,
  showIcon,
  customStyles,
  borderRadius,
  focusColor,
  errorMessage,
  loadingText,
}) => {
  const { isLoaded, loadError } = useModernGoogleMaps();

  if (!isLoaded) {
    const loadingStyles = [
      'flex items-center justify-center p-4',
      customStyles?.loading || '',
    ].filter(Boolean).join(' ');

    return (
      <div className={loadingStyles}>
        <p>{loadingText || 'Loading Google Maps...'}</p>
      </div>
    );
  }

  if (loadError) {
    const errorStyles = [
      'flex items-center justify-center p-4 text-red-600',
      customStyles?.error || '',
    ].filter(Boolean).join(' ');

    return (
      <div className={errorStyles}>
        <p>{errorMessage || 'Failed to load Google Maps. Please check your API key.'}</p>
      </div>
    );
  }

  return (
    <AutocompleteInput
      onPlaceSelect={onPlaceSelect}
      placeholder={placeholder}
      className={className}
      theme={theme}
      size={size}
      disabled={disabled}
      showIcon={showIcon}
      customStyles={customStyles}
      borderRadius={borderRadius}
      focusColor={focusColor}
    />
  );
};

export default AddressSearch;
export type { PlaceDetails, AddressSearchProps };