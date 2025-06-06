# Advanced Address Autocomplete Component

A robust, accessible, and feature-rich address autocomplete component built with Google's Place Autocomplete Element API for the OTW website. This component provides real-time address suggestions with comprehensive error handling, accessibility features, and performance optimizations.

## 🚀 Features

### Core Functionality
- **Real-time Suggestions**: Dynamic address suggestions that update as users type
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, and Escape
- **Click Selection**: Mouse/touch support for suggestion selection
- **Debounced API Calls**: Configurable debouncing to prevent excessive API requests
- **Address Validation**: Automatic validation of selected addresses

### Accessibility (WCAG 2.1 AA Compliant)
- **ARIA Support**: Comprehensive ARIA labels, roles, and properties
- **Screen Reader Friendly**: Announcements for selections and status changes
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and visual indicators
- **High Contrast**: Supports high contrast mode

### Performance Optimizations
- **Debounced Requests**: Configurable debounce timing (default 300ms)
- **Efficient Re-renders**: Minimized component re-renders
- **Lazy Loading**: Google Maps API loaded only when needed
- **Memory Management**: Proper cleanup of timeouts and event listeners

### Error Handling
- **API Failure Recovery**: Graceful handling of Google Maps API failures
- **Network Error Handling**: User-friendly error messages for network issues
- **Validation Errors**: Clear feedback for invalid address selections
- **Fallback UI**: Informative error states with recovery options

## 📦 Installation & Setup

### Prerequisites
1. Google Maps API key with Places API enabled
2. React 18+ and Next.js 13+
3. Tailwind CSS for styling

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Dependencies
```bash
npm install @googlemaps/js-api-loader
```

## 🎯 Usage

### Basic Usage
```tsx
import AdvancedAddressAutocomplete, { PlaceDetails } from '@/components/AdvancedAddressAutocomplete';

function MyComponent() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handlePlaceSelect = (place: PlaceDetails) => {
    setSelectedPlace(place);
    console.log('Selected:', place);
  };

  return (
    <AdvancedAddressAutocomplete
      label="Delivery Address"
      onPlaceSelect={handlePlaceSelect}
      placeholder="Enter your address"
      value={inputValue}
      onChange={setInputValue}
      required
    />
  );
}
```

### Advanced Configuration
```tsx
<AdvancedAddressAutocomplete
  label="Pickup Location"
  onPlaceSelect={handlePlaceSelect}
  placeholder="Where should we pick you up?"
  value={inputValue}
  onChange={setInputValue}
  required
  maxSuggestions={5}
  debounceMs={300}
  restrictToCountry={['US', 'CA']}
  types={['address']}
  className="mb-4"
  aria-describedby="pickup-help"
  disabled={isLoading}
/>
```

### Service Integration Examples

#### Ride Booking Service
```tsx
function RideBooking() {
  const [pickup, setPickup] = useState<PlaceDetails | null>(null);
  const [dropoff, setDropoff] = useState<PlaceDetails | null>(null);

  return (
    <div className="space-y-4">
      <AdvancedAddressAutocomplete
        label="Pickup Address"
        onPlaceSelect={setPickup}
        placeholder="Where are you?"
        required
        restrictToCountry={['US']}
      />
      
      <AdvancedAddressAutocomplete
        label="Drop-off Address"
        onPlaceSelect={setDropoff}
        placeholder="Where to?"
        required
        restrictToCountry={['US']}
      />
      
      <button 
        disabled={!pickup || !dropoff}
        onClick={() => bookRide(pickup, dropoff)}
      >
        Book Ride
      </button>
    </div>
  );
}
```

#### Package Delivery Service
```tsx
function PackageDelivery() {
  const [sender, setSender] = useState<PlaceDetails | null>(null);
  const [recipient, setRecipient] = useState<PlaceDetails | null>(null);

  return (
    <div className="space-y-4">
      <AdvancedAddressAutocomplete
        label="Sender Address"
        onPlaceSelect={setSender}
        placeholder="Package pickup location"
        types={['address']}
        required
      />
      
      <AdvancedAddressAutocomplete
        label="Recipient Address"
        onPlaceSelect={setRecipient}
        placeholder="Package delivery location"
        types={['address']}
        required
      />
    </div>
  );
}
```

## 🔧 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | Label text for the input field |
| `onPlaceSelect` | `(place: PlaceDetails) => void` | `undefined` | Callback when a place is selected |
| `placeholder` | `string` | `"Enter {label}"` | Placeholder text for input |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `required` | `boolean` | `false` | Whether the field is required |
| `value` | `string` | `''` | Controlled input value |
| `onChange` | `(value: string) => void` | `undefined` | Input change handler |
| `onFocus` | `() => void` | `undefined` | Focus event handler |
| `onBlur` | `() => void` | `undefined` | Blur event handler |
| `maxSuggestions` | `number` | `5` | Maximum number of suggestions |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `restrictToCountry` | `string[]` | `undefined` | Country codes to restrict results |
| `types` | `string[]` | `['address']` | Place types to search for |
| `aria-label` | `string` | `label` | ARIA label for accessibility |
| `aria-describedby` | `string` | `undefined` | ARIA described-by attribute |
| `id` | `string` | Auto-generated | Input element ID |

### Types

#### PlaceDetails
```tsx
interface PlaceDetails {
  placeId: string;
  address: string;
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
}
```

#### Suggestion
```tsx
interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}
```

## 🎨 Styling

The component uses Tailwind CSS classes and follows the OTW design system:

### Color Scheme
- **Background**: Dark gray (`bg-gray-800`, `bg-gray-900`)
- **Text**: White and gray variants
- **Accent**: Yellow (`yellow-500`) for focus and selection
- **Borders**: Gray variants with yellow focus states

### Responsive Design
- Fully responsive across all screen sizes
- Touch-friendly on mobile devices
- Optimized dropdown positioning

### Customization
```tsx
// Custom styling example
<AdvancedAddressAutocomplete
  className="custom-address-input"
  // ... other props
/>
```

```css
/* Custom CSS */
.custom-address-input input {
  @apply bg-blue-900 border-blue-600;
}

.custom-address-input input:focus {
  @apply ring-blue-500 border-blue-500;
}
```

## ♿ Accessibility Features

### ARIA Implementation
- `role="combobox"` on input element
- `aria-expanded` indicates dropdown state
- `aria-haspopup="listbox"` indicates dropdown type
- `aria-owns` connects input to dropdown
- `aria-activedescendant` indicates selected option
- `aria-autocomplete="list"` indicates autocomplete behavior

### Keyboard Navigation
- **↓ Arrow Down**: Navigate to next suggestion
- **↑ Arrow Up**: Navigate to previous suggestion
- **Enter**: Select highlighted suggestion
- **Escape**: Close dropdown and clear selection
- **Tab**: Close dropdown and move to next element

### Screen Reader Support
- Live announcements for suggestion count
- Selection announcements
- Error state announcements
- Loading state announcements

## 🚀 Performance Considerations

### Optimization Strategies
1. **Debounced API Calls**: Prevents excessive requests during typing
2. **Memoized Callbacks**: Reduces unnecessary re-renders
3. **Efficient State Management**: Minimal state updates
4. **Cleanup on Unmount**: Prevents memory leaks

### Best Practices
```tsx
// Use React.memo for parent components if needed
const MyForm = React.memo(() => {
  return (
    <AdvancedAddressAutocomplete
      // ... props
    />
  );
});

// Memoize expensive callbacks
const handlePlaceSelect = useCallback((place: PlaceDetails) => {
  // Handle selection
}, [/* dependencies */]);
```

## 🛠️ Troubleshooting

### Common Issues

#### API Key Issues
```
Error: Google Maps API key is not configured
```
**Solution**: Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your environment variables.

#### Network Errors
```
Failed to load Google Maps. Please check your internet connection.
```
**Solution**: Check internet connectivity and API key permissions.

#### No Suggestions Appearing
**Possible Causes**:
- Input less than 3 characters
- API quota exceeded
- Invalid country restrictions
- Network connectivity issues

#### Build Errors
```
Cannot use import/export outside a module
```
**Solution**: Ensure the component is used in client-side code with `'use client'` directive.

### Debugging

Enable debug logging:
```tsx
// Add to component for debugging
useEffect(() => {
  console.log('Component state:', {
    isLoading,
    error,
    suggestions: suggestions.length,
    showDropdown
  });
}, [isLoading, error, suggestions, showDropdown]);
```

## 🧪 Testing

### Unit Testing
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedAddressAutocomplete from './AdvancedAddressAutocomplete';

// Mock Google Maps API
jest.mock('@googlemaps/js-api-loader');

test('renders address input', () => {
  render(
    <AdvancedAddressAutocomplete
      label="Test Address"
      onPlaceSelect={jest.fn()}
    />
  );
  
  expect(screen.getByLabelText('Test Address')).toBeInTheDocument();
});

test('shows suggestions on input', async () => {
  const mockOnSelect = jest.fn();
  
  render(
    <AdvancedAddressAutocomplete
      label="Address"
      onPlaceSelect={mockOnSelect}
    />
  );
  
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: '123 Main St' } });
  
  await waitFor(() => {
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
```

### Integration Testing
```tsx
// Test with actual Google Maps API in development
test('integration with Google Maps API', async () => {
  // Requires actual API key and network access
  // Use in development/staging environments
});
```

## 📈 Browser Support

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+
- **Mobile Safari**: 14+
- **Chrome Mobile**: 88+

## 🔄 Migration Guide

### From Basic AddressAutocomplete

```tsx
// Old component
<AddressAutocomplete
  label="Address"
  onPlaceSelect={handleSelect}
  placeholder="Enter address"
/>

// New advanced component
<AdvancedAddressAutocomplete
  label="Address"
  onPlaceSelect={handleSelect}
  placeholder="Enter address"
  // Additional features available:
  maxSuggestions={5}
  debounceMs={300}
  restrictToCountry={['US']}
  required
/>
```

### Breaking Changes
- Enhanced `PlaceDetails` interface with `addressComponents`
- New required props for better accessibility
- Updated styling classes for consistency

## 📝 Changelog

### v2.0.0 (Current)
- ✨ Added real-time suggestions with debouncing
- ♿ Comprehensive accessibility improvements
- 🚀 Performance optimizations
- 🛡️ Enhanced error handling
- 📱 Improved mobile responsiveness
- 🎨 Updated UI/UX design

### v1.0.0 (Legacy)
- Basic address autocomplete functionality
- Simple Google Maps integration
- Basic error handling

## 🤝 Contributing

When contributing to this component:

1. **Accessibility First**: Ensure all changes maintain WCAG 2.1 AA compliance
2. **Performance**: Test with React DevTools Profiler
3. **Browser Testing**: Test across supported browsers
4. **Documentation**: Update this README for any API changes
5. **Testing**: Add appropriate unit and integration tests

## 📄 License

This component is part of the OTW website codebase and follows the project's licensing terms.

---

**Need Help?** Check the [troubleshooting section](#🛠️-troubleshooting) or refer to the [demo page](/advanced-address-demo) for live examples.