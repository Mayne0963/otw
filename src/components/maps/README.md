# PlaceAutocomplete Component

A modern React component that uses Google Maps' new `PlaceAutocompleteElement` API to provide address and place autocomplete functionality. This component replaces the deprecated `google.maps.places.Autocomplete` class with a future-proof implementation.

## Features

- ✅ **Modern API**: Uses the new `PlaceAutocompleteElement` instead of deprecated `Autocomplete`
- ✅ **TypeScript Support**: Full type safety with comprehensive interfaces
- ✅ **Customizable**: Configurable place types, restrictions, and styling
- ✅ **Controlled/Uncontrolled**: Supports both controlled and uncontrolled input patterns
- ✅ **Error Handling**: Graceful loading states and error fallbacks
- ✅ **Accessibility**: Built-in accessibility features from Google's new element
- ✅ **Tailwind CSS**: Styled with Tailwind CSS and shadcn/ui components

## Installation

Ensure you have the required dependencies:

```bash
npm install lucide-react
# or
yarn add lucide-react
```

Make sure your Google Maps API key is configured in your environment:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Basic Usage

```tsx
import PlaceAutocomplete, { PlaceDetails } from '@/components/maps/PlaceAutocomplete';

function MyComponent() {
  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Selected place:', place);
    console.log('Address:', place.formatted_address);
    console.log('Coordinates:', {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });
  };

  return (
    <PlaceAutocomplete
      onPlaceSelect={handlePlaceSelect}
      placeholder="Enter an address..."
    />
  );
}
```

## Advanced Usage

### Route Planning

```tsx
function RoutePlanner() {
  const [origin, setOrigin] = useState<PlaceDetails | null>(null);
  const [destination, setDestination] = useState<PlaceDetails | null>(null);

  return (
    <div className="space-y-4">
      <PlaceAutocomplete
        onPlaceSelect={setOrigin}
        placeholder="Starting location..."
        types={['address', 'establishment']}
      />
      <PlaceAutocomplete
        onPlaceSelect={setDestination}
        placeholder="Destination..."
        types={['address', 'establishment']}
      />
    </div>
  );
}
```

### Business Search

```tsx
function BusinessSearch() {
  const handleBusinessSelect = (place: PlaceDetails) => {
    console.log('Business:', place.name);
    console.log('Address:', place.formatted_address);
  };

  return (
    <PlaceAutocomplete
      onPlaceSelect={handleBusinessSelect}
      placeholder="Search for restaurants, shops, etc..."
      types={['establishment']}
      fields={[
        'formattedAddress',
        'id',
        'location',
        'displayName',
        'businessStatus',
        'rating'
      ]}
    />
  );
}
```

### Controlled Input

```tsx
function ControlledExample() {
  const [value, setValue] = useState('');

  return (
    <PlaceAutocomplete
      onPlaceSelect={(place) => setValue(place.formatted_address)}
      placeholder="Type to search..."
      value={value}
      onChange={setValue}
      componentRestrictions={{ country: 'us' }}
    />
  );
}
```

## Props API

### PlaceAutocompleteProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPlaceSelect` | `(place: PlaceDetails) => void` | **Required** | Callback when a place is selected |
| `placeholder` | `string` | `"Enter an address..."` | Input placeholder text |
| `className` | `string` | `""` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `showIcon` | `boolean` | `true` | Show the map pin icon |
| `types` | `string[]` | `['address']` | Place types to search for |
| `componentRestrictions` | `{ country?: string \| string[] }` | `undefined` | Country restrictions |
| `bounds` | `google.maps.LatLngBounds \| google.maps.LatLngBoundsLiteral` | `undefined` | Bias results to bounds |
| `strictBounds` | `boolean` | `false` | Restrict results to bounds |
| `fields` | `string[]` | See below | Place data fields to return |
| `value` | `string` | `undefined` | Controlled input value |
| `onChange` | `(value: string) => void` | `undefined` | Controlled input change handler |

### Default Fields

```typescript
fields: [
  'formattedAddress',
  'id',
  'location',
  'addressComponents',
  'displayName'
]
```

### PlaceDetails Interface

```typescript
interface PlaceDetails {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: google.maps.GeocoderAddressComponent[];
  name?: string;
}
```

## Place Types

Common place types you can use:

- `'address'` - Street addresses
- `'establishment'` - Businesses and points of interest
- `'geocode'` - All geocoding results
- `'(cities)'` - Cities only
- `'(regions)'` - Administrative regions

For a complete list, see [Google's Place Types documentation](https://developers.google.com/maps/documentation/places/web-service/supported_types).

## Migration Guide

### From Legacy @react-google-maps/api Autocomplete

This project has been fully migrated from the legacy `@react-google-maps/api` Autocomplete to the new Google Places API (New) using `PlaceAutocompleteElement`.

#### Current Implementation

```tsx
// Current implementation using PlaceAutocomplete
<PlaceAutocomplete
  onPlaceSelect={onPlaceSelect}
  types={['address']}
  componentRestrictions={{ country: 'us' }}
  placeholder="Enter address..."
/>
```

#### Benefits of New Implementation

- **Better Performance**: Uses the latest Google Places API
- **Improved UX**: Better autocomplete suggestions and faster responses
- **Modern Architecture**: Element-based approach with better error handling
- **No Legacy Dependencies**: Removed dependency on `@react-google-maps/api` Autocomplete

### Key Changes

1. **Element-based**: Uses HTML custom element instead of class instantiation
2. **Event names**: `'place_changed'` → `'gmp-placeselect'`
3. **Field names**: Some field names have changed (e.g., `'place_id'` → `'id'`)
4. **Automatic styling**: The element handles its own styling and behavior
5. **Better accessibility**: Built-in ARIA support and keyboard navigation

## Styling

The component uses Tailwind CSS classes and can be customized:

```tsx
<PlaceAutocomplete
  onPlaceSelect={handleSelect}
  className="border-red-500 focus:ring-red-500"
  showIcon={false}
/>
```

## Error Handling

The component handles various error states:

- **API Loading**: Shows loading state while Google Maps API loads
- **API Errors**: Displays error message if API fails to load
- **Missing API Key**: Shows error if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set
- **Initialization Errors**: Logs errors to console if element creation fails

## Performance

- **Lazy Loading**: Google Maps API is loaded only when needed
- **Efficient Updates**: Uses refs to avoid unnecessary re-renders
- **Memory Management**: Proper cleanup of event listeners and DOM elements

## Browser Support

The `PlaceAutocompleteElement` is supported in:

- Chrome 91+
- Firefox 90+
- Safari 15+
- Edge 91+

For older browsers, the component will gracefully degrade to a regular input field.

## Examples

See `PlaceAutocompleteExample.tsx` for comprehensive usage examples including:

- Basic address search
- Route planning with origin/destination
- Business and establishment search
- Controlled input patterns
- Custom styling and configuration

## Troubleshooting

### Common Issues

1. **"Google Maps API key not found"**
   - Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your environment
   - Restart your development server after adding the key

2. **"Failed to load Google Maps API"**
   - Check your API key permissions
   - Ensure Places API is enabled in Google Cloud Console
   - Check for network connectivity issues

3. **Places not appearing**
   - Verify your API key has Places API enabled
   - Check the `types` and `componentRestrictions` props
   - Ensure you're not hitting API quotas

4. **Styling issues**
   - The component uses Tailwind CSS classes
   - Ensure your project has Tailwind CSS configured
   - Check for CSS conflicts with the `gmp-place-autocomplete` element

### Debug Mode

Enable debug logging:

```tsx
<PlaceAutocomplete
  onPlaceSelect={(place) => {
    console.log('Debug - Selected place:', place);
    // Your handler
  }}
  // ... other props
/>
```

## License

This component is part of your project and follows your project's license terms.