import { useState, useCallback, useRef, useEffect } from 'react';
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
  validateAddress,
  GeocodingError,
  GeocodingErrorType,
  debounce
} from '../lib/utils/geocoding-utils';
import type {
  GeocodeResult,
  ReverseGeocodeResult,
  AddressValidationResult
} from '../lib/services/geocoding-service';

/**
 * State for geocoding operations
 */
interface GeocodingState {
  loading: boolean;
  error: string | null;
  result: GeocodeResult | ReverseGeocodeResult | AddressValidationResult | null;
}

/**
 * Options for the useGeocoding hook
 */
interface UseGeocodingOptions {
  debounceMs?: number;
  autoValidate?: boolean;
  retries?: number;
  timeout?: number;
}

/**
 * Hook for geocoding operations
 */
export function useGeocoding(options: UseGeocodingOptions = {}) {
  const {
    debounceMs = 300,
    autoValidate = false,
    retries = 3,
    timeout = 10000
  } = options;

  const [state, setState] = useState<GeocodingState>({
    loading: false,
    error: null,
    result: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  /**
   * Set result state
   */
  const setResult = useCallback((result: any) => {
    setState(prev => ({ ...prev, result, error: null, loading: false }));
  }, []);

  /**
   * Clear all state
   */
  const clearState = useCallback(() => {
    setState({ loading: false, error: null, result: null });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Geocode an address
   */
  const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address.trim()) {
      setError('Address is required');
      return null;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    try {
      const result = await geocodeAddress(address, { retries, timeout });
      setResult(result);
      return result;
    } catch (error) {
      if (error instanceof GeocodingError) {
        switch (error.type) {
          case GeocodingErrorType.RATE_LIMIT_ERROR:
            setError(`Rate limit exceeded. Please try again in ${error.retryAfter || 60} seconds.`);
            break;
          case GeocodingErrorType.NETWORK_ERROR:
            setError('Network error. Please check your connection and try again.');
            break;
          case GeocodingErrorType.API_ERROR:
            setError(`API error: ${error.message}`);
            break;
          default:
            setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    }
  }, [retries, timeout, setLoading, setError, setResult]);

  /**
   * Reverse geocode coordinates
   */
  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number
  ): Promise<ReverseGeocodeResult | null> => {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      setError('Valid coordinates are required');
      return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Coordinates are out of valid range');
      return null;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reverseGeocodeCoordinates(lat, lng, { retries, timeout });
      setResult(result);
      return result;
    } catch (error) {
      if (error instanceof GeocodingError) {
        switch (error.type) {
          case GeocodingErrorType.RATE_LIMIT_ERROR:
            setError(`Rate limit exceeded. Please try again in ${error.retryAfter || 60} seconds.`);
            break;
          case GeocodingErrorType.NETWORK_ERROR:
            setError('Network error. Please check your connection and try again.');
            break;
          case GeocodingErrorType.API_ERROR:
            setError(`API error: ${error.message}`);
            break;
          default:
            setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    }
  }, [retries, timeout, setLoading, setError, setResult]);

  /**
   * Validate an address
   */
  const validate = useCallback(async (address: string): Promise<AddressValidationResult | null> => {
    if (!address.trim()) {
      setError('Address is required');
      return null;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateAddress(address, { retries, timeout });
      setResult(result);
      return result;
    } catch (error) {
      if (error instanceof GeocodingError) {
        switch (error.type) {
          case GeocodingErrorType.RATE_LIMIT_ERROR:
            setError(`Rate limit exceeded. Please try again in ${error.retryAfter || 60} seconds.`);
            break;
          case GeocodingErrorType.NETWORK_ERROR:
            setError('Network error. Please check your connection and try again.');
            break;
          case GeocodingErrorType.API_ERROR:
            setError(`API error: ${error.message}`);
            break;
          default:
            setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    }
  }, [retries, timeout, setLoading, setError, setResult]);

  /**
   * Debounced geocode function
   */
  const debouncedGeocode = useCallback(
    debounce((address: string) => {
      if (address.trim()) {
        geocode(address);
      }
    }, debounceMs),
    [geocode, debounceMs]
  );

  /**
   * Debounced validate function
   */
  const debouncedValidate = useCallback(
    debounce((address: string) => {
      if (address.trim()) {
        validate(address);
      }
    }, debounceMs),
    [validate, debounceMs]
  );

  return {
    // State
    loading: state.loading,
    error: state.error,
    result: state.result,
    
    // Actions
    geocode,
    reverseGeocode,
    validate,
    clearState,
    
    // Debounced actions
    debouncedGeocode,
    debouncedValidate,
    
    // Utilities
    isGeocodeResult: (result: any): result is GeocodeResult => {
      return result && 'formatted_address' in result && 'geometry' in result;
    },
    isReverseGeocodeResult: (result: any): result is ReverseGeocodeResult => {
      return result && 'formatted_address' in result && 'geometry' in result;
    },
    isValidationResult: (result: any): result is AddressValidationResult => {
      return result && 'isValid' in result && 'confidence' in result;
    }
  };
}

/**
 * Hook for address input with auto-validation
 */
export function useAddressInput(options: UseGeocodingOptions & {
  onAddressSelect?: (result: GeocodeResult) => void;
  onValidationChange?: (validation: AddressValidationResult) => void;
} = {}) {
  const {
    onAddressSelect,
    onValidationChange,
    autoValidate = true,
    ...geocodingOptions
  } = options;

  const [inputValue, setInputValue] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<GeocodeResult | null>(null);
  const [validation, setValidation] = useState<AddressValidationResult | null>(null);

  const {
    loading,
    error,
    result,
    geocode,
    validate,
    debouncedGeocode,
    debouncedValidate,
    clearState,
    isGeocodeResult,
    isValidationResult
  } = useGeocoding(geocodingOptions);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setSelectedAddress(null);
    setValidation(null);
    
    if (value.trim()) {
      if (autoValidate) {
        debouncedValidate(value);
      } else {
        debouncedGeocode(value);
      }
    } else {
      clearState();
    }
  }, [autoValidate, debouncedValidate, debouncedGeocode, clearState]);

  /**
   * Handle address selection
   */
  const handleAddressSelect = useCallback(async (address: string) => {
    const result = await geocode(address);
    if (result) {
      setSelectedAddress(result);
      setInputValue(result.formatted_address);
      onAddressSelect?.(result);
      
      // Also validate if auto-validation is enabled
      if (autoValidate) {
        const validationResult = await validate(address);
        if (validationResult) {
          setValidation(validationResult);
          onValidationChange?.(validationResult);
        }
      }
    }
  }, [geocode, validate, autoValidate, onAddressSelect, onValidationChange]);

  /**
   * Clear input and state
   */
  const clearInput = useCallback(() => {
    setInputValue('');
    setSelectedAddress(null);
    setValidation(null);
    clearState();
  }, [clearState]);

  // Update validation when result changes
  useEffect(() => {
    if (isValidationResult(result)) {
      setValidation(result);
      onValidationChange?.(result);
    }
  }, [result, isValidationResult, onValidationChange]);

  return {
    // Input state
    inputValue,
    selectedAddress,
    validation,
    
    // Geocoding state
    loading,
    error,
    suggestions: isGeocodeResult(result) ? [result] : [],
    
    // Actions
    handleInputChange,
    handleAddressSelect,
    clearInput,
    
    // Manual actions
    geocode,
    validate,
    
    // Validation helpers
    isValid: validation?.isValid ?? null,
    isDeliverable: validation?.isDeliverable ?? null,
    confidence: validation?.confidence ?? null,
    issues: validation?.issues ?? []
  };
}

/**
 * Hook for current location geocoding
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState<{
    coords: { latitude: number; longitude: number } | null;
    address: ReverseGeocodeResult | null;
    loading: boolean;
    error: string | null;
  }>({
    coords: null,
    address: null,
    loading: false,
    error: null
  });

  const { reverseGeocode } = useGeocoding();

  /**
   * Get current location
   */
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setLocation(prev => ({ ...prev, coords, loading: false }));

      // Reverse geocode the coordinates
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      setLocation(prev => ({ ...prev, address }));

    } catch (error) {
      let errorMessage = 'Failed to get current location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }
      
      setLocation(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [reverseGeocode]);

  /**
   * Clear location data
   */
  const clearLocation = useCallback(() => {
    setLocation({
      coords: null,
      address: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...location,
    getCurrentLocation,
    clearLocation,
    hasLocation: location.coords !== null
  };
}