'use client';
import { useEffect, useRef, useState } from 'react';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

export type PlaceSuggestion = {
  formatted_address: string;
  place_id: string;
  lat: number;
  lng: number;
};

interface PlaceAutocompleteProps {
  onSelectAddress: (s: PlaceSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // Client-side filtering options (since componentRestrictions is not supported)
  countryFilter?: string | string[];
  typeFilter?: string[];
}

export default function PlaceAutocomplete({
  onSelectAddress,
  placeholder = 'Type an address…',
  className = '',
  disabled = false,
  countryFilter,
  typeFilter,
}: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<any>(null);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);

  // Use the modern Google Maps context
  const { isLoaded, loadError } = useModernGoogleMaps();

  // Initialize PlaceAutocompleteElement when API is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }

    try {
      // Create the new PlaceAutocompleteElement without deprecated properties
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement();

      // Configure the element
      autocompleteElement.placeholder = placeholder;
      autocompleteElement.disabled = disabled;

      // Apply enhanced custom styling for dark theme
      autocompleteElement.style.width = '100%';
      autocompleteElement.style.height = '100%';
      
      // Inject custom CSS into shadow DOM for comprehensive styling with OTW theme
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        /* Hide default input styles and apply OTW dark theme */
        input {
          background: rgba(39, 39, 39, 0.8) !important; /* otw-black-900 with opacity */
          color: white !important;
          font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif !important;
          font-size: 1rem !important;
          border: 1px solid rgba(212, 175, 55, 0.5) !important; /* otw-gold with opacity */
          border-radius: 0.375rem !important;
          outline: none !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        input::placeholder {
          color: rgba(164, 164, 164, 1) !important; /* otw-black-300 */
        }
        
        input:focus {
          border-color: #d4af37 !important; /* otw-gold */
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.5) !important;
        }
        
        input:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        
        /* Style suggestions dropdown with OTW theme */
        .pac-container {
          background-color: rgba(39, 39, 39, 0.95) !important; /* otw-black-900 */
          border: 1px solid rgba(212, 175, 55, 0.4) !important; /* otw-gold */
          border-radius: 0.375rem !important;
          box-shadow: 0 10px 15px -3px rgba(10, 10, 10, 0.6), 0 4px 6px -2px rgba(10, 10, 10, 0.3) !important;
          color: white !important;
          max-height: 15rem !important;
          overflow-y: auto !important;
          z-index: 9999 !important;
          margin-top: 0.25rem !important;
        }
        
        .pac-item {
          padding: 0.5rem 1rem !important;
          cursor: pointer !important;
          color: white !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important; /* otw-gold */
          transition: background-color 0.15s ease !important;
        }
        
        .pac-item:last-child {
          border-bottom: none !important;
        }
        
        .pac-item:hover,
        .pac-item-selected {
          background-color: rgba(212, 175, 55, 0.2) !important; /* otw-gold hover */
        }
        
        .pac-item-query {
          color: #d4af37 !important; /* otw-gold */
          font-weight: 500 !important;
        }
        
        .pac-matched {
          color: #d4af37 !important; /* otw-gold */
          font-weight: 600 !important;
        }
        
        .pac-icon {
          background-image: none !important;
          color: rgba(212, 175, 55, 0.8) !important; /* otw-gold */
        }
      `;
      
      // Wait for shadow root to be available and inject styles
      setTimeout(() => {
        if (autocompleteElement.shadowRoot) {
          autocompleteElement.shadowRoot.appendChild(styleTag);
        } else {
          // Fallback: try to inject into document head for global pac-container styling
          document.head.appendChild(styleTag);
        }
      }, 100);

      // Store reference
      autocompleteElementRef.current = autocompleteElement;

      // Handle place selection with client-side filtering
      const handlePlaceSelect = (event: any) => {
        const place = event.place;
        if (place && place.geometry && place.geometry.location) {
          // Apply client-side country filtering if specified
          if (countryFilter && place.address_components) {
            const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
            const countryComponent = place.address_components.find(
              (component: any) => component.types.includes('country')
            );
            
            if (countryComponent) {
              const countryCode = countryComponent.short_name.toLowerCase();
              const countryName = countryComponent.long_name.toLowerCase();
              const isValidCountry = countries.some(filter => 
                filter.toLowerCase() === countryCode || 
                filter.toLowerCase() === countryName
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
              place.types && place.types.includes(filterType)
            );
            
            if (!hasValidType) {
              console.log('Place filtered out due to type restriction:', place.types);
              return;
            }
          }
          
          const suggestion: PlaceSuggestion = {
            formatted_address: place.formatted_address || '',
            place_id: place.place_id || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          onSelectAddress(suggestion);
          console.log('Selected place:', suggestion);
        }
      };

      // Add event listener
      autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);

      // Append to container
      containerRef.current.appendChild(autocompleteElement);

      // Cleanup function
      return () => {
        if (autocompleteElement) {
          autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
          if (autocompleteElement.parentNode) {
            autocompleteElement.parentNode.removeChild(autocompleteElement);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing PlaceAutocompleteElement:', error);
    }
  }, [isLoaded, placeholder, disabled, onSelectAddress, countryFilter, typeFilter]);

  // Update placeholder when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current) {
      autocompleteElementRef.current.placeholder = placeholder;
    }
  }, [placeholder]);

  // Update disabled state when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current) {
      autocompleteElementRef.current.disabled = disabled;
    }
  }, [disabled]);

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center space-x-2 p-3 border border-otw-gold/50 rounded-md bg-gradient-to-br from-otw-black-900 to-otw-black-800">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-otw-gold"></div>
          <span className="text-otw-black-300">Loading address search...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (apiLoadError || loadError) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-3 border border-otw-red/50 rounded-md bg-gradient-to-br from-otw-black-900 to-otw-black-800">
          <span className="text-otw-red-400">
            Error loading address search: {apiLoadError?.message || loadError}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-otw-black-900 to-otw-black-800 rounded-md p-2 shadow-inner border border-otw-gold/50"
        style={{
          minHeight: '48px',
          maxWidth: '100%',
        }}
      />
    </div>
  );
}