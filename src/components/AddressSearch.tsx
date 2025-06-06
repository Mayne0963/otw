import React, { useRef, useEffect } from 'react';
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

const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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
const AutocompleteInput: React.FC<Omit<AddressSearchProps, 'apiKey'>> = ({
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

  useEffect(() => {
    if (!containerRef.current || !window.google) {
      return;
    }

    // Initialize the new PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['address'],
    });

    // ─── FIX: Set the "fields" via an attribute instead of calling a nonexistent method ───
    autocompleteElement.setAttribute(
      'fields',
      ['place_id', 'geometry', 'name'].join(',')
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

    autocompleteElement.className = inputStyles;

    // Add the element to the container
    containerRef.current.appendChild(autocompleteElement);

    // Add place changed listener
    const handlePlaceSelect = (event: any) => {
      const place = event.place;

      if (place && place.location) {
        const placeDetails: PlaceDetails = {
          formatted_address: place.formattedAddress || '',
          place_id: place.id || '',
          geometry: {
            location: {
              lat: () => place.location.lat(),
              lng: () => place.location.lng(),
            },
          },
          address_components: place.addressComponents || [],
          name: place.displayName,
        };

        onPlaceSelect(placeDetails);
      }
    };

    autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);

    // Store reference for cleanup
    autocompleteRef.current = autocompleteElement;

    // Cleanup
    return () => {
      if (autocompleteElement) {
        autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
        if (autocompleteElement.parentNode) {
          autocompleteElement.parentNode.removeChild(autocompleteElement);
        }
      }
    };
  }, [onPlaceSelect, placeholder, disabled, theme, size, borderRadius, focusColor, className, customStyles, showIcon]);

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
        <div className={'absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10'}>
          <LocationIcon />
        </div>
      )}
      <div ref={containerRef} className="w-full" />
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
  loadingText = 'Loading Google Maps...',
}) => {
  const render = (status: string) => {
    if (status === 'LOADING') {
      const loadingStyles = [
        'flex items-center justify-center',
        getSizeStyles(size),
        getThemeStyles(theme),
        getBorderRadiusStyles(borderRadius),
        'border',
        customStyles?.loading || '',
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