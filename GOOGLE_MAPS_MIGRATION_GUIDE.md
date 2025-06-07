# Google Maps Places API Migration Guide

This guide provides a comprehensive solution for fixing Google Maps Places Autocomplete issues and migrating from deprecated APIs to the new PlaceAutocompleteElement web component.

## 🚨 Current Issues

1. **API Key Errors**: `REQUEST_DENIED` and `ApiTargetBlockedMapError`
2. **Deprecated APIs**: Using `AutocompleteService`, `bounds`, `types` properties
3. **Migration Required**: Must use new `PlaceAutocompleteElement` web component

## 🔧 Step 1: Fix Google API Key Issues

### 1.1 Verify API Key Configuration

1. **Google Cloud Console Setup**:
   ```bash
   # Navigate to Google Cloud Console
   https://console.cloud.google.com/
   ```

2. **Enable Required APIs**:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
   - Places API (Legacy) - for backward compatibility

3. **Check Billing**:
   - Ensure billing is enabled on your Google Cloud project
   - Verify you have sufficient quota

4. **API Key Restrictions**:
   ```javascript
   // For development - use unrestricted key temporarily
   // For production - add these domains:
   const allowedDomains = [
     'localhost:3000',
     'otw-chi.vercel.app',
     '*.vercel.app',
     'your-domain.com'
   ];
   ```

### 1.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...
```

### 1.3 Test API Key

```javascript
// Test script to verify API key
const testApiKey = async () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  
  try {
    const response = await fetch(testUrl);
    if (response.ok) {
      console.log('✅ API Key is valid');
    } else {
      console.error('❌ API Key error:', response.status);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};
```

## 🔄 Step 2: Migration to New PlaceAutocompleteElement

### 2.1 Updated Modern Context Provider

```typescript
// src/contexts/ModernGoogleMapsContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  apiKey: string;
}

const ModernGoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export function ModernGoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Validate API key
    if (!apiKey) {
      setLoadError('Google Maps API key is not configured');
      return;
    }

    if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
      setLoadError('Invalid Google Maps API key format');
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      setIsLoaded(true);
      return;
    }

    // Load the API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    
    script.onload = () => {
      // Wait for PlaceAutocompleteElement to be available
      const checkReady = setInterval(() => {
        if (window.google?.maps?.places?.PlaceAutocompleteElement) {
          setIsLoaded(true);
          setLoadError(null);
          clearInterval(checkReady);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
          setLoadError('PlaceAutocompleteElement not available');
        }
      }, 10000);
    };

    script.onerror = (error) => {
      console.error('Google Maps API loading error:', error);
      setLoadError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [apiKey]);

  return (
    <ModernGoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      {children}
    </ModernGoogleMapsContext.Provider>
  );
}

export function useModernGoogleMaps() {
  const context = useContext(ModernGoogleMapsContext);
  if (!context) {
    throw new Error('useModernGoogleMaps must be used within ModernGoogleMapsProvider');
  }
  return context;
}
```

### 2.2 Enhanced PlaceAutocomplete Component

```typescript
// src/components/modern/EnhancedPlaceAutocomplete.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

// Extend JSX for the web component
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
  value?: string;
  onChange?: (value: string) => void;
  componentRestrictions?: { country?: string | string[] };
  serviceArea?: {
    center: { lat: number; lng: number };
    radius: number; // in kilometers
  };
  label?: string;
  id?: string;
  showClearButton?: boolean;
  theme?: 'light' | 'dark';
}

const EnhancedPlaceAutocomplete: React.FC<EnhancedPlaceAutocompleteProps> = ({
  onPlaceSelect,
  onValidationChange,
  placeholder = 'Enter an address...',
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  value = '',
  onChange,
  componentRestrictions = { country: 'us' },
  serviceArea,
  label,
  id,
  showClearButton = true,
  theme = 'dark',
}) => {
  const { isLoaded, loadError } = useModernGoogleMaps();
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const componentId = id || `enhanced-place-autocomplete-${Math.random().toString(36).substr(2, 9)}`;

  // Validate service area
  const validateServiceArea = useCallback(
    (lat: number, lng: number): boolean => {
      if (!serviceArea || !window.google?.maps?.geometry) return true;

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(lat, lng),
        new window.google.maps.LatLng(serviceArea.center.lat, serviceArea.center.lng)
      );

      return distance <= serviceArea.radius * 1000; // Convert km to meters
    },
    [serviceArea]
  );

  // Handle place selection
  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;

    try {
      const place = autocompleteRef.current.getPlace();
      
      if (!place || !place.place_id) {
        console.warn('No valid place selected');
        return;
      }

      const placeDetails: PlaceDetails = {
        placeId: place.place_id,
        formattedAddress: place.formatted_address || '',
        displayName: place.name || place.formatted_address || '',
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
        addressComponents: parseAddressComponents(place.address_components || []),
        types: place.types || [],
      };

      setInputValue(placeDetails.formattedAddress);
      setHasUserInteracted(true);
      onChange?.(placeDetails.formattedAddress);

      // Validate service area
      if (serviceArea && !validateServiceArea(placeDetails.lat, placeDetails.lng)) {
        const validationResult: ValidationResult = {
          isValid: false,
          message: 'Address is outside the service area',
          type: 'error',
        };
        setValidation(validationResult);
        onValidationChange?.(validationResult);
        return;
      }

      // Success validation
      const validationResult: ValidationResult = {
        isValid: true,
        message: 'Valid address selected',
        type: 'success',
      };
      setValidation(validationResult);
      onValidationChange?.(validationResult);
      onPlaceSelect(placeDetails);
    } catch (error) {
      console.error('Error handling place selection:', error);
      const validationResult: ValidationResult = {
        isValid: false,
        message: 'Error selecting place',
        type: 'error',
      };
      setValidation(validationResult);
      onValidationChange?.(validationResult);
    }
  }, [onPlaceSelect, onValidationChange, onChange, serviceArea, validateServiceArea]);

  // Handle input changes
  const handleInputChange = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
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
  }, [onChange, onValidationChange, validation]);

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
    if (autocompleteRef.current) {
      autocompleteRef.current.value = '';
    }
  }, [onChange, onValidationChange]);

  // Set up event listeners
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;

    const element = autocompleteRef.current;
    element.addEventListener('gmp-placeselect', handlePlaceSelect);
    element.addEventListener('input', handleInputChange);

    return () => {
      element.removeEventListener('gmp-placeselect', handlePlaceSelect);
      element.removeEventListener('input', handleInputChange);
    };
  }, [isLoaded, handlePlaceSelect, handleInputChange]);

  // Configure the autocomplete element
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;

    const element = autocompleteRef.current;
    
    // Set component restrictions
    if (componentRestrictions?.country) {
      const countries = Array.isArray(componentRestrictions.country)
        ? componentRestrictions.country
        : [componentRestrictions.country];
      element.componentRestrictions = { country: countries };
    }

    // Set fields
    element.fields = [
      'place_id',
      'formatted_address',
      'name',
      'geometry',
      'address_components',
      'types'
    ];

    element.placeholder = placeholder;
    element.disabled = disabled;
    element.value = inputValue;
  }, [isLoaded, componentRestrictions, placeholder, disabled, inputValue]);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && value !== undefined) {
      setInputValue(value);
      if (autocompleteRef.current) {
        autocompleteRef.current.value = value;
      }
    }
  }, [value, inputValue]);

  // Theme styles
  const themeStyles = {
    container: theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700',
    input: theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white',
    icon: theme === 'light' ? 'text-gray-400' : 'text-gray-400',
    error: theme === 'light' ? 'text-red-600' : 'text-red-400',
    success: theme === 'light' ? 'text-green-600' : 'text-green-400',
  };

  // Loading state
  if (!isLoaded && !loadError) {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className={cn('block text-sm font-medium mb-2', themeStyles.icon)}>
            {label}
            {required && <span className={themeStyles.error}> *</span>}
          </label>
        )}
        <div className={cn(
          'flex items-center rounded-lg border p-3',
          themeStyles.container
        )}>
          <Loader2 className="w-5 h-5 animate-spin mr-3" />
          <span className={themeStyles.icon}>Loading autocomplete...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className={cn('block text-sm font-medium mb-2', themeStyles.icon)}>
            {label}
            {required && <span className={themeStyles.error}> *</span>}
          </label>
        )}
        <div className={cn(
          'flex items-center rounded-lg border p-3',
          'border-red-500 bg-red-50 dark:bg-red-900/20'
        )}>
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className={themeStyles.error}>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={componentId}
          className={cn('block text-sm font-medium mb-2', themeStyles.icon)}
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
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        )}>
          <div className="flex items-center justify-center w-12 h-12">
            <MapPin className={cn('w-5 h-5', themeStyles.icon)} />
          </div>

          <gmp-place-autocomplete
            ref={autocompleteRef}
            id={componentId}
            className={cn(
              'flex-1 px-4 py-3 text-base bg-transparent border-0 outline-none',
              'placeholder:text-center focus:placeholder:text-left transition-all duration-200',
              themeStyles.input,
              showClearButton && inputValue ? 'pr-12' : 'pr-4',
              inputClassName
            )}
            required={required}
          />

          {showClearButton && inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'flex items-center justify-center w-8 h-8 mr-2 rounded-full',
                'hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                themeStyles.icon
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

      {validation && (
        <p className={cn(
          'text-xs mt-1 flex items-center space-x-1',
          validation.type === 'success' ? themeStyles.success : themeStyles.error
        )}>
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

// Helper function to parse address components
function parseAddressComponents(components: any[]) {
  const result: any = {};
  
  components.forEach((component) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      result.route = component.long_name;
    }
    if (types.includes('locality')) {
      result.locality = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      result.administrativeAreaLevel1 = component.short_name;
    }
    if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      result.country = component.short_name;
    }
  });
  
  return result;
}

export default EnhancedPlaceAutocomplete;
export type { PlaceDetails, ValidationResult, EnhancedPlaceAutocompleteProps };
```

### 2.3 Usage Example

```typescript
// Example usage in a form component
import React, { useState } from 'react';
import EnhancedPlaceAutocomplete, { PlaceDetails, ValidationResult } from '@/components/modern/EnhancedPlaceAutocomplete';
import { ModernGoogleMapsProvider } from '@/contexts/ModernGoogleMapsContext';

function AddressForm() {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupPlace, setPickupPlace] = useState<PlaceDetails | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<PlaceDetails | null>(null);

  const handlePickupSelect = (place: PlaceDetails) => {
    setPickupPlace(place);
    console.log('Pickup place selected:', place);
  };

  const handleDropoffSelect = (place: PlaceDetails) => {
    setDropoffPlace(place);
    console.log('Dropoff place selected:', place);
  };

  const handleValidationChange = (validation: ValidationResult) => {
    console.log('Validation changed:', validation);
  };

  return (
    <ModernGoogleMapsProvider>
      <form className="space-y-6">
        <EnhancedPlaceAutocomplete
          label="Pickup Address"
          placeholder="Enter pickup location..."
          value={pickupAddress}
          onChange={setPickupAddress}
          onPlaceSelect={handlePickupSelect}
          onValidationChange={handleValidationChange}
          required
          componentRestrictions={{ country: 'us' }}
          serviceArea={{
            center: { lat: 40.7128, lng: -74.0060 }, // NYC
            radius: 50 // 50km radius
          }}
        />

        <EnhancedPlaceAutocomplete
          label="Dropoff Address"
          placeholder="Enter dropoff location..."
          value={dropoffAddress}
          onChange={setDropoffAddress}
          onPlaceSelect={handleDropoffSelect}
          onValidationChange={handleValidationChange}
          required
          componentRestrictions={{ country: 'us' }}
        />

        <button
          type="submit"
          disabled={!pickupPlace || !dropoffPlace}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Submit Order
        </button>
      </form>
    </ModernGoogleMapsProvider>
  );
}

export default AddressForm;
```

## 🧪 Step 3: Testing and Validation

### 3.1 API Key Test Component

```typescript
// src/components/debug/ApiKeyTest.tsx
import React, { useEffect, useState } from 'react';

function ApiKeyTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testApiKey = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setStatus('error');
        setMessage('API key not found in environment variables');
        return;
      }

      try {
        // Test by loading the API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        
        script.onload = () => {
          setStatus('success');
          setMessage('API key is valid and Places API is accessible');
        };
        
        script.onerror = () => {
          setStatus('error');
          setMessage('Failed to load Google Maps API - check key restrictions');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        setStatus('error');
        setMessage(`Error: ${error}`);
      }
    };

    testApiKey();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Google Maps API Key Test</h3>
      <div className={`flex items-center space-x-2 ${
        status === 'success' ? 'text-green-600' :
        status === 'error' ? 'text-red-600' : 'text-yellow-600'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          status === 'success' ? 'bg-green-500' :
          status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
        }`} />
        <span>{message || 'Testing API key...'}</span>
      </div>
    </div>
  );
}

export default ApiKeyTest;
```

### 3.2 Integration Test

```typescript
// src/app/test-autocomplete/page.tsx
import React from 'react';
import { ModernGoogleMapsProvider } from '@/contexts/ModernGoogleMapsContext';
import EnhancedPlaceAutocomplete from '@/components/modern/EnhancedPlaceAutocomplete';
import ApiKeyTest from '@/components/debug/ApiKeyTest';

function TestAutocompletePage() {
  return (
    <ModernGoogleMapsProvider>
      <div className="container mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">Google Maps Autocomplete Test</h1>
        
        <ApiKeyTest />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedPlaceAutocomplete
            label="Test Address Input"
            placeholder="Enter any address..."
            onPlaceSelect={(place) => console.log('Selected:', place)}
            onValidationChange={(validation) => console.log('Validation:', validation)}
            theme="light"
          />
          
          <EnhancedPlaceAutocomplete
            label="Restricted to US"
            placeholder="US addresses only..."
            onPlaceSelect={(place) => console.log('US Selected:', place)}
            componentRestrictions={{ country: 'us' }}
            theme="dark"
          />
        </div>
      </div>
    </ModernGoogleMapsProvider>
  );
}

export default TestAutocompletePage;
```

## 🔍 Step 4: Troubleshooting Common Issues

### 4.1 API Key Issues

```javascript
// Common error messages and solutions
const errorSolutions = {
  'REQUEST_DENIED': {
    cause: 'API key restrictions or missing permissions',
    solutions: [
      'Check if Places API is enabled in Google Cloud Console',
      'Verify API key restrictions allow your domain',
      'Ensure billing is enabled on the project',
      'Try with an unrestricted API key temporarily'
    ]
  },
  'ApiTargetBlockedMapError': {
    cause: 'Domain not authorized for this API key',
    solutions: [
      'Add your domain to API key restrictions',
      'Use localhost:3000 for development',
      'Check for typos in domain restrictions'
    ]
  },
  'OVER_QUERY_LIMIT': {
    cause: 'Exceeded API quota',
    solutions: [
      'Check usage in Google Cloud Console',
      'Increase quota limits',
      'Implement request caching'
    ]
  }
};
```

### 4.2 Component Not Loading

```typescript
// Debug component loading issues
const debugPlaceAutocomplete = () => {
  console.log('Google Maps loaded:', !!window.google?.maps);
  console.log('Places API loaded:', !!window.google?.maps?.places);
  console.log('PlaceAutocompleteElement available:', !!window.google?.maps?.places?.PlaceAutocompleteElement);
  
  if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
    console.error('PlaceAutocompleteElement not available. Check API loading.');
  }
};
```

## 📋 Step 5: Migration Checklist

- [ ] ✅ API key configured with correct permissions
- [ ] ✅ Places API enabled in Google Cloud Console
- [ ] ✅ Billing enabled on Google Cloud project
- [ ] ✅ Domain restrictions configured (or temporarily removed)
- [ ] ✅ Replaced deprecated `AutocompleteService` with `PlaceAutocompleteElement`
- [ ] ✅ Updated context providers to use modern API
- [ ] ✅ Migrated all autocomplete components
- [ ] ✅ Added proper error handling for API failures
- [ ] ✅ Implemented loading states
- [ ] ✅ Added validation and service area restrictions
- [ ] ✅ Tested with multiple address inputs
- [ ] ✅ Verified no console errors or warnings
- [ ] ✅ Confirmed autocomplete suggestions appear
- [ ] ✅ Tested place selection functionality

## 🚀 Next Steps

1. **Update App Layout**: Wrap your app with `ModernGoogleMapsProvider`
2. **Replace Components**: Update all components using the old `useGoogleMaps` hook
3. **Test Thoroughly**: Use the test page to verify functionality
4. **Monitor Usage**: Check Google Cloud Console for API usage
5. **Optimize**: Implement caching and request optimization

## 📞 Support

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify API key permissions in Google Cloud Console
3. Test with an unrestricted API key first
4. Use the debug components provided in this guide

This migration ensures your Google Maps autocomplete functionality is future-proof and follows Google's latest best practices.