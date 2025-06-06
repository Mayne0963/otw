import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Upload, Clock } from 'lucide-react';

interface FormData {
  serviceType: string;
  urgency: number;
  repPreference?: string;
  details: string;
  media?: File | null;
  pickup?: string;
  dropoff?: string;
}

const SERVICE_TYPES = {
  food: {
    label: 'Food Delivery',
    suggestion:
      'Order from local restaurants with our trusted delivery network',
    fields: ['pickup', 'dropoff'],
  },
  grocery: {
    label: 'Grocery Shop & Drop',
    suggestion: 'We&apos;ll shop your list and deliver to your door',
    fields: ['details'],
  },
  ride: {
    label: 'Local Ride Request',
    suggestion: 'Safe and reliable rides within your community',
    fields: ['pickup', 'dropoff'],
  },
  moving: {
    label: 'Furniture/Appliance Moving',
    suggestion: 'Need a fridge moved? We&apos;ll match you with Malik + truck',
    fields: ['pickup', 'dropoff', 'media'],
  },
};

const REP_PREFERENCES = [
  { id: 'any', name: 'Any Available Rep' },
  { id: 'preferred', name: 'My Preferred Reps' },
  { id: 'new', name: 'Try New Reps' },
];

export default function ServiceBookingForm() {
  const [formData, setFormData] = useState<FormData>({
    serviceType: 'food',
    urgency: 3,
    details: '',
    media: null,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    const serviceInfo =
      SERVICE_TYPES[formData.serviceType as keyof typeof SERVICE_TYPES];
    setSuggestion(serviceInfo?.suggestion || '');
  }, [formData.serviceType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<FormData> = {};

    if (!formData.details && formData.serviceType === 'grocery') {
      newErrors.details = 'Please provide your grocery list';
    }
    if (
      !formData.pickup &&
      SERVICE_TYPES[
        formData.serviceType as keyof typeof SERVICE_TYPES
      ].fields.includes('pickup')
    ) {
      newErrors.pickup = 'Pickup location is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit form logic here
      console.log('Form submitted:', formData);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Book a Service</h2>
        {suggestion && <p className="text-sm text-gray-500">{suggestion}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Service Type</Label>
          <select
            className="w-full p-2 border rounded"
            value={formData.serviceType}
            onChange={(e) =>
              setFormData({ ...formData, serviceType: e.target.value })
            }
          >
            {Object.entries(SERVICE_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Urgency Level</Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={5}
              value={formData.urgency}
              onChange={(e) =>
                setFormData({ ...formData, urgency: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formData.urgency}</span>
          </div>
        </div>

        {SERVICE_TYPES[
          formData.serviceType as keyof typeof SERVICE_TYPES
        ].fields.includes('pickup') && (
          <div className="space-y-2">
            <Label>Pickup Location</Label>
            <Input
              placeholder="Enter pickup address"
              value={formData.pickup || ''}
              onChange={(e) =>
                setFormData({ ...formData, pickup: e.target.value })
              }
              className={errors.pickup ? 'border-red-500' : ''}
            />
            {errors.pickup && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.pickup}
              </p>
            )}
          </div>
        )}

        {SERVICE_TYPES[
          formData.serviceType as keyof typeof SERVICE_TYPES
        ].fields.includes('dropoff') && (
          <div className="space-y-2">
            <Label>Dropoff Location</Label>
            <Input
              placeholder="Enter delivery address"
              value={formData.dropoff || ''}
              onChange={(e) =>
                setFormData({ ...formData, dropoff: e.target.value })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Rep Preference</Label>
          <select
            className="w-full p-2 border rounded"
            value={formData.repPreference}
            onChange={(e) =>
              setFormData({ ...formData, repPreference: e.target.value })
            }
          >
            {REP_PREFERENCES.map((pref) => (
              <option key={pref.id} value={pref.id}>
                {pref.name}
              </option>
            ))}
          </select>
        </div>

        {SERVICE_TYPES[
          formData.serviceType as keyof typeof SERVICE_TYPES
        ].fields.includes('media') && (
          <div className="space-y-2">
            <Label>Upload Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    media: e.target.files?.[0] || null,
                  })
                }
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {formData.media
                    ? formData.media.name
                    : 'Click to upload photo'}
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Additional Details</Label>
          <textarea
            className={`w-full p-2 border rounded ${errors.details ? 'border-red-500' : ''}`}
            rows={4}
            placeholder="Enter any special instructions or details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
          />
          {errors.details && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.details}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-otw-red hover:bg-otw-gold text-white font-bold py-2 px-4 rounded"
        >
          Book Service
        </Button>
      </form>
    </Card>
  );
}
