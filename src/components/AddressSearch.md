# AddressSearch Component

A reusable React component that provides Google Places Autocomplete functionality for address input.

## Features

- 🔍 Google Places Autocomplete integration
- 📍 Returns detailed place information including coordinates
- 🎨 Customizable styling with Tailwind CSS
- 🔄 Loading and error states
- 📱 Responsive design
- 🛡️ TypeScript support

## Installation

The component uses `@googlemaps/react-wrapper` which should already be installed. If not:

```bash
npm install @googlemaps/react-wrapper
```

## Setup

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Environment Variables

Add your API key to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

```tsx
import AddressSearch, { PlaceDetails } from './components/AddressSearch';

function MyComponent() {
  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Selected place:', place);
    // Handle the selected place data
  };

  return (
    <AddressSearch
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      onPlaceSelect={handlePlaceSelect}
      placeholder="Enter your address..."
    />
  );
}
```

### Advanced Usage with Custom Styling

```tsx
import AddressSearch, { PlaceDetails } from './components/AddressSearch';

function MyComponent() {
  const [address, setAddress] = useState<PlaceDetails | null>(null);

  const handlePlaceSelect = (place: PlaceDetails) => {
    setAddress(place);
    // Extract specific data
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const formattedAddress = place.formatted_address;
    
    // Do something with the data
  };

  return (
    <div>
      <AddressSearch
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        onPlaceSelect={handlePlaceSelect}
        placeholder="Where should we deliver?"
        className="border-2 border-blue-500 rounded-xl"
      />
      
      {address && (
        <div>
          <p>Selected: {address.formatted_address}</p>
          <p>Coordinates: {address.geometry.location.lat()}, {address.geometry.location.lng()}</p>
        </div>
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiKey` | `string` | ✅ | - | Your Google Maps API key |
| `onPlaceSelect` | `(place: PlaceDetails) => void` | ✅ | - | Callback when a place is selected |
| `placeholder` | `string` | ❌ | "Enter an address..." | Input placeholder text |
| `className` | `string` | ❌ | "" | Additional CSS classes for styling |

## PlaceDetails Interface

```tsx
interface PlaceDetails {
  formatted_address: string;           // Full formatted address
  place_id: string;                   // Unique Google place identifier
  geometry: {
    location: {
      lat: () => number;              // Latitude function
      lng: () => number;              // Longitude function
    };
  };
  address_components: google.maps.GeocoderAddressComponent[]; // Detailed address parts
  name?: string;                      // Place name (if available)
}
```

## Address Components

The `address_components` array contains detailed information about the address:

```tsx
// Example: Extract specific address parts
const getAddressComponent = (place: PlaceDetails, type: string) => {
  const component = place.address_components.find(comp => 
    comp.types.includes(type)
  );
  return component?.long_name || '';
};

// Usage
const streetNumber = getAddressComponent(place, 'street_number');
const route = getAddressComponent(place, 'route');
const city = getAddressComponent(place, 'locality');
const state = getAddressComponent(place, 'administrative_area_level_1');
const zipCode = getAddressComponent(place, 'postal_code');
const country = getAddressComponent(place, 'country');
```

## Error Handling

The component includes built-in error handling for:
- Failed API key loading
- Network issues
- Invalid API responses

## Styling

The component uses Tailwind CSS classes by default but can be customized:

```tsx
<AddressSearch
  className="your-custom-classes"
  // ... other props
/>
```

## Security Notes

1. **API Key Restrictions**: Always restrict your API key to specific domains in production
2. **Environment Variables**: Use `NEXT_PUBLIC_` prefix for client-side environment variables
3. **Rate Limiting**: Be aware of Google's API usage limits and billing

## Troubleshooting

### Common Issues

1. **"Google is not defined" error**
   - Ensure the API key is valid
   - Check that Places API is enabled
   - Verify network connectivity

2. **No autocomplete suggestions**
   - Check API key permissions
   - Ensure Places API is enabled
   - Verify the API key is not restricted to wrong domains

3. **Component not loading**
   - Check browser console for errors
   - Verify the API key environment variable is set
   - Ensure `@googlemaps/react-wrapper` is installed

### Debug Mode

Add console logging to debug:

```tsx
const handlePlaceSelect = (place: PlaceDetails) => {
  console.log('Full place object:', place);
  console.log('Formatted address:', place.formatted_address);
  console.log('Coordinates:', place.geometry.location.lat(), place.geometry.location.lng());
};
```

## Example Integration

See `AddressSearchExample.tsx` for a complete working example with state management and result display.