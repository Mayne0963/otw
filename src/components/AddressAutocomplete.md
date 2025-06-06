# AddressAutocomplete Component

A reusable, interactive address input component for the OTW (On The Way) delivery service platform. This component integrates Google's PlaceAutocompleteElement API with Next.js 14, TypeScript, and Tailwind CSS styling.

## Features

- 🎯 **Google Places Integration**: Uses the latest `@googlemaps/js-api-loader` for optimal performance
- 🎨 **OTW Brand Styling**: Dark theme with yellow accents matching the OTW aesthetic
- 📱 **Responsive Design**: Works seamlessly across all device sizes
- ⚡ **TypeScript Support**: Full type safety with comprehensive interfaces
- 🔄 **Real-time Autocomplete**: Dynamic address suggestions as users type
- 🛡️ **Error Handling**: Graceful handling of API failures and invalid selections
- ♿ **Accessibility**: Proper labeling and keyboard navigation support

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @googlemaps/js-api-loader
```

### 2. Environment Configuration

Add your Google Maps API key to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Enable Required APIs

Ensure the following APIs are enabled in your Google Cloud Console:
- Places API
- Maps JavaScript API
- Geocoding API

## Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | ✅ | - | Display label for the input field |
| `onPlaceSelect` | `(place: PlaceDetails) => void` | ❌ | - | Callback fired when a place is selected |
| `placeholder` | `string` | ❌ | `"Enter {label}"` | Input placeholder text |
| `className` | `string` | ❌ | `""` | Additional CSS classes |
| `disabled` | `boolean` | ❌ | `false` | Disable the input field |

### PlaceDetails Interface

```typescript
interface PlaceDetails {
  placeId: string;    // Unique Google Place ID
  address: string;    // Formatted address string
  lat: number;        // Latitude coordinate
  lng: number;        // Longitude coordinate
}
```

## Usage Examples

### Basic Usage

```tsx
import AddressAutocomplete from '@/components/AddressAutocomplete';

function MyComponent() {
  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Selected place:', place);
  };

  return (
    <AddressAutocomplete 
      label="Delivery Address"
      onPlaceSelect={handlePlaceSelect}
      placeholder="Where should we deliver?"
    />
  );
}
```

### OTW Service Integrations

#### 1. Ride Booking Service

```tsx
import React, { useState } from 'react';
import AddressAutocomplete, { PlaceDetails } from '@/components/AddressAutocomplete';

function RideBooking() {
  const [pickup, setPickup] = useState<PlaceDetails | null>(null);
  const [dropoff, setDropoff] = useState<PlaceDetails | null>(null);

  return (
    <div className="space-y-4">
      <AddressAutocomplete 
        label="Pickup Address" 
        onPlaceSelect={setPickup}
        placeholder="Where are you?"
      />
      
      <AddressAutocomplete 
        label="Drop-off Address" 
        onPlaceSelect={setDropoff}
        placeholder="Where to?"
      />
      
      <button 
        disabled={!pickup || !dropoff}
        className="w-full bg-yellow-500 text-black py-3 rounded-lg"
      >
        Book Ride
      </button>
    </div>
  );
}
```

#### 2. Grocery Delivery Service

```tsx
function GroceryDelivery() {
  const [deliveryAddress, setDeliveryAddress] = useState<PlaceDetails | null>(null);

  return (
    <AddressAutocomplete 
      label="Delivery Address" 
      onPlaceSelect={setDeliveryAddress}
      placeholder="Where should we deliver your groceries?"
    />
  );
}
```

#### 3. Package Delivery Service

```tsx
function PackageDelivery() {
  const [sender, setSender] = useState<PlaceDetails | null>(null);
  const [recipient, setRecipient] = useState<PlaceDetails | null>(null);

  return (
    <div className="space-y-4">
      <AddressAutocomplete 
        label="Pickup Address" 
        onPlaceSelect={setSender}
        placeholder="Where should we pick up?"
      />
      
      <AddressAutocomplete 
        label="Delivery Address" 
        onPlaceSelect={setRecipient}
        placeholder="Where should we deliver?"
      />
    </div>
  );
}
```

## Styling & Theming

### Default OTW Theme

The component comes with built-in OTW styling:
- **Background**: Dark gray (`bg-gray-800`)
- **Text**: White text with gray labels
- **Focus State**: Yellow ring (`focus:ring-yellow-500`)
- **Border**: Gray border with yellow focus
- **Shadow**: Subtle shadow for depth

### Custom Styling

You can extend the styling using the `className` prop:

```tsx
<AddressAutocomplete 
  label="Custom Styled Address"
  className="my-custom-class"
  onPlaceSelect={handleSelect}
/>
```

### CSS Classes Applied

```css
/* Container */
.relative.rounded-xl.shadow-lg.overflow-hidden

/* Label */
.text-sm.font-semibold.text-gray-300.mb-1.block

/* Input */
.w-full.bg-gray-800.text-white.rounded-lg.px-4.py-3.pl-10
.focus:outline-none.focus:ring-2.focus:ring-yellow-500
.focus:border-yellow-500.border.border-gray-600
.transition-all.duration-200

/* Icon */
.absolute.left-3.top-1/2.transform.-translate-y-1/2.text-gray-400
```

## Component States

### Loading State
- Shows animated spinner
- Displays "Loading..." text
- Maintains component structure

### Error State
- Red background (`bg-red-900`)
- Error message display
- Graceful fallback

### Success State
- Shows selected address below input
- Maintains place details in state
- Triggers `onPlaceSelect` callback

## Technical Implementation

### Google Maps API Loading

```typescript
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

await loader.load();
```

### Autocomplete Configuration

```typescript
const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
  types: ['address'],
  fields: ['place_id', 'formatted_address', 'geometry']
});
```

### Event Handling

```typescript
autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  // Process and validate place data
  // Update component state
  // Trigger callback
});
```

## Error Handling

### Common Issues & Solutions

1. **API Key Missing**
   - Error: "Google Maps API key is not configured"
   - Solution: Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`

2. **Invalid Place Selection**
   - Error: "Please select a valid address from the suggestions"
   - Solution: Ensure users select from autocomplete dropdown

3. **API Loading Failure**
   - Error: "Failed to load Google Maps"
   - Solution: Check API key validity and enabled services

## Performance Considerations

- **Lazy Loading**: Google Maps API loads only when component mounts
- **Debounced Requests**: Built-in autocomplete debouncing
- **Minimal Fields**: Only requests necessary place data
- **Error Boundaries**: Graceful failure handling

## Accessibility Features

- **Semantic Labels**: Proper label association
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA attributes
- **Focus Management**: Clear focus indicators

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Demo

View the interactive demo at `/address-autocomplete-demo` to see all three OTW service integrations in action.

## Contributing

When contributing to this component:

1. Maintain TypeScript strict mode compliance
2. Follow the existing Tailwind CSS patterns
3. Ensure accessibility standards are met
4. Add appropriate error handling
5. Update documentation for new features

## License

This component is part of the OTW platform and follows the project's licensing terms.