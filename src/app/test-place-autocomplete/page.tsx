import PlaceAutocompleteExample from '@/components/maps/PlaceAutocompleteExample';

export default function TestPlaceAutocompletePage() {
  return (
    <div className="min-h-screen bg-background">
      <PlaceAutocompleteExample />
    </div>
  );
}

export const metadata = {
  title: 'PlaceAutocomplete Component Test',
  description: 'Testing the new PlaceAutocomplete component with PlaceAutocompleteElement',
};