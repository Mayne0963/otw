import React, { useRef, useEffect, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

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
  apiKey: string;
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
    default: `border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500`,
    modern: `border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm`,
    minimal: `border-gray-200 bg-transparent text-gray-900 focus:ring-gray-400 focus:border-gray-400 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none`,
    glassmorphism: `border-white/20 bg-white/10 backdrop-blur-md text-gray-900 focus:ring-white/30 focus:border-white/30 shadow-lg`,
    dark: `border-gray-600 bg-gray-800 text-white focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400`
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
    xl: 'px-6 py-4 text-xl'
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
    full: 'rounded-full'
  };
  return radiusMap[borderRadius];
};

const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
  onPlaceSelect,
  placeholder = "Enter an address...",
  className = "",
  theme = 'default',
  size = 'md',
  disabled = false,
  showIcon = true,
  customStyles,
  borderRadius = 'md',
  focusColor
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Initialize the autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        fields: [
          'formatted_address',
          'place_id',
          'geometry',
          'address_components',
          'name'
        ]
      }
    );

    // Add place changed listener
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const placeDetails: PlaceDetails = {
          formatted_address: place.formatted_address || '',
          place_id: place.place_id || '',
          geometry: {
            location: {
              lat: () => place.geometry!.location!.lat(),
              lng: () => place.geometry!.location!.lng()
            }
          },
          address_components: place.address_components || [],
          name: place.name
        };
        
        onPlaceSelect(placeDetails);
        setInputValue(place.formatted_address || '');
      }
    });

    // Cleanup
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Build the complete input styles
  const inputStyles = [
    'w-full',
    'outline-none',
    'transition-all duration-200',
    'focus:ring-2',
    getSizeStyles(size),
    getThemeStyles(theme, focusColor),
    getBorderRadiusStyles(borderRadius),
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
    isFocused ? 'ring-2' : '',
    customStyles?.input || '',
    className
  ].filter(Boolean).join(' ');

  // Location icon SVG
  const LocationIcon = () => (
    <svg 
      className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${customStyles?.icon || ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );

  return (
    <div className={`relative ${customStyles?.container || ''}`}>
      {showIcon && (
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10`}>
          <LocationIcon />
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputStyles} ${showIcon ? 'pl-10' : ''}`}
      />
    </div>
  );
};

const AddressSearch: React.FC<AddressSearchProps> = ({
  onPlaceSelect,
  placeholder,
  className,
  apiKey,
  theme = 'default',
  size = 'md',
  disabled = false,
  showIcon = true,
  customStyles,
  borderRadius = 'md',
  focusColor,
  errorMessage,
  loadingText = 'Loading Google Maps...'
}) => {
  const render = (status: string) => {
    if (status === 'LOADING') {
      const loadingStyles = [
        'flex items-center justify-center',
        getSizeStyles(size),
        getThemeStyles(theme),
        getBorderRadiusStyles(borderRadius),
        'border',
        customStyles?.loading || ''
      ].filter(Boolean).join(' ');

      return (
        <div className={loadingStyles}>
          <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
            theme === 'dark' ? 'border-white' : 'border-blue-500'
          }`}></div>
          <span className={`ml-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{loadingText}</span>
        </div>
      );
    }

    if (status === 'FAILURE') {
      const errorStyles = [
        getSizeStyles(size),
        getBorderRadiusStyles(borderRadius),
        theme === 'dark' 
          ? 'bg-red-900/20 border-red-500/30 text-red-300'
          : 'bg-red-50 border-red-200 text-red-600',
        'border',
        customStyles?.error || ''
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

  return (
    <Wrapper
      apiKey={apiKey}
      libraries={['places']}
      render={render}
    />
  );
};

export default AddressSearch;
export type { PlaceDetails, AddressSearchProps };