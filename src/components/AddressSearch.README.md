# Address Search Component

A comprehensive React component for Google Maps Places autocomplete functionality with full API key integration, error handling, and customizable styling.

## Features

- 🔍 **Google Places Autocomplete** - Real-time address suggestions
- 🔑 **API Key Integration** - Seamless Google Maps API integration
- 🎨 **Customizable Styling** - Multiple themes and size variants
- ⚡ **Performance Optimized** - Singleton pattern for API loading
- 🛡️ **Error Handling** - Comprehensive error states and messages
- 📱 **Responsive Design** - Works on all device sizes
- ♿ **Accessibility** - ARIA labels and keyboard navigation

## Quick Start

### 1. Setup Google Maps API Key

Run the setup script to configure your API key:

```bash
npm run setup:google-maps
```

Or manually add to your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 2. Wrap Your App with GoogleMapsProvider

```tsx
// app/layout.tsx or _app.tsx
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
```

### 3. Use the AddressSearch Component

```tsx
import AddressSearch, { PlaceDetails } from '@/components/AddressSearch';

function BookingForm() {
  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Selected place:', place);
    // Handle the selected place data
  };

  return (
    <AddressSearch
      placeholder="Enter pickup location"
      onPlaceSelect={handlePlaceSelect}
      theme="default"
      size="md"
    />
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPlaceSelect` | `(place: PlaceDetails) => void` | Required | Callback when a place is selected |
| `placeholder` | `string` | `"Enter address"` | Input placeholder text |
| `className` | `string` | `""` | Additional CSS classes |
| `theme` | `ThemeVariant` | `"default"` | Visual theme variant |
| `size` | `SizeVariant` | `"md"` | Component size |
| `disabled` | `boolean` | `false` | Disable the input |
| `showIcon` | `boolean` | `true` | Show location icon |
| `borderRadius` | `BorderRadius` | `"md"` | Border radius style |
| `focusColor` | `string` | `undefined` | Custom focus color |
| `customStyles` | `StyleConfig` | `{}` | Custom style overrides |
| `errorMessage` | `string` | `undefined` | Custom error message |
| `loadingText` | `string` | `undefined` | Custom loading text |

### Theme Variants

- `default` - Clean, modern design
- `minimal` - Minimal styling
- `outlined` - Outlined border style
- `filled` - Filled background style
- `gradient` - Gradient background
- `glass` - Glassmorphism effect
- `neon` - Neon glow effect
- `retro` - Retro styling
- `corporate` - Professional corporate look
- `playful` - Fun, colorful design

### Size Variants

- `xs` - Extra small (28px height)
- `sm` - Small (32px height)
- `md` - Medium (40px height)
- `lg` - Large (48px height)
- `xl` - Extra large (56px height)

### PlaceDetails Interface

```tsx
interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
}
```

## Advanced Usage

### Custom Styling

```tsx
<AddressSearch
  onPlaceSelect={handlePlaceSelect}
  theme="custom"
  customStyles={{
    container: "bg-blue-50 border-blue-200",
    input: "text-blue-900 placeholder-blue-400",
    icon: "text-blue-500",
    loading: "text-blue-600",
    error: "text-red-600 bg-red-50"
  }}
  focusColor="blue"
  borderRadius="lg"
/>
```

### Error Handling

The component automatically handles various error states:

- Missing API key
- Invalid API key format
- API request denied
- Network errors
- Quota exceeded

```tsx
<AddressSearch
  onPlaceSelect={handlePlaceSelect}
  errorMessage="Custom error message"
  loadingText="Loading maps..."
/>
```

### Integration with Forms

```tsx
import { useState } from 'react';
import AddressSearch, { PlaceDetails } from '@/components/AddressSearch';

function BookingForm() {
  const [pickup, setPickup] = useState<PlaceDetails | null>(null);
  const [destination, setDestination] = useState<PlaceDetails | null>(null);

  return (
    <form>
      <div className="space-y-4">
        <div>
          <label>Pickup Location</label>
          <AddressSearch
            placeholder="Enter pickup location"
            onPlaceSelect={setPickup}
            theme="outlined"
          />
        </div>
        
        <div>
          <label>Destination</label>
          <AddressSearch
            placeholder="Enter destination"
            onPlaceSelect={setDestination}
            theme="outlined"
          />
        </div>
      </div>
    </form>
  );
}
```

## API Key Setup

### Required Google Cloud APIs

1. **Maps JavaScript API** - For map functionality
2. **Places API** - For autocomplete and place details
3. **Geocoding API** - For address conversion (optional)

### API Key Restrictions

For security, restrict your API key:

**HTTP Referrers:**
- `http://localhost:3000/*` (development)
- `https://yourdomain.com/*` (production)

**API Restrictions:**
- Maps JavaScript API
- Places API
- Geocoding API

### Environment Variables

```env
# Required for client-side integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key"

# Optional for server-side operations
GOOGLE_MAPS_SERVER_API_KEY="your-server-api-key"
```

## Troubleshooting

### Common Issues

**"Google Maps API key is not configured"**
- Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Restart your development server

**"REQUEST_DENIED" error**
- Enable required APIs in Google Cloud Console
- Check API key restrictions
- Verify billing is enabled

**Autocomplete not working**
- Verify Places API is enabled
- Check browser console for errors
- Test with a simple address like "New York"

**Performance issues**
- The component uses singleton pattern for optimal performance
- API loading is cached across components
- Consider implementing request debouncing for heavy usage

### Debug Mode

Check browser console for detailed error messages. The GoogleMapsContext provides specific error descriptions for common issues.

## Best Practices

1. **API Key Security**
   - Use environment variables
   - Implement proper restrictions
   - Never commit keys to version control

2. **Performance**
   - Use the singleton GoogleMapsProvider
   - Implement caching for repeated requests
   - Consider request debouncing

3. **User Experience**
   - Provide clear loading states
   - Handle errors gracefully
   - Use appropriate placeholder text

4. **Accessibility**
   - Include proper ARIA labels
   - Ensure keyboard navigation works
   - Provide screen reader support

## Examples

See the following files for complete examples:

- `src/components/AddressSearchExample.tsx` - Basic usage
- `src/components/AddressSearchStylesExample.tsx` - Styling examples
- `src/app/demo/address-search/page.tsx` - Demo page
- `src/app/booking/page.tsx` - Real-world integration

## Support

For issues and questions:

1. Check the browser console for error messages
2. Review the setup documentation
3. Verify Google Cloud Console configuration
4. Test with a fresh API key

For detailed setup instructions, see `docs/GOOGLE_MAPS_API_SETUP.md`.