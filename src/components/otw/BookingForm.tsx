'use client';

import type React from 'react';

import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import EnhancedPlaceAutocomplete, { PlaceDetails, ValidationResult } from '../enhanced/EnhancedPlaceAutocomplete';
import { cn } from '../../lib/utils';
import { MapPin, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';

const services = [
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Food, packages, and more delivered to your door',
  },
  {
    id: 'errands',
    name: 'Errands',
    description: 'Grocery shopping, pharmacy pickup, and other errands',
  },
  {
    id: 'roadside',
    name: 'Roadside Help',
    description: 'Jump starts, tire changes, and fuel delivery',
  },
  {
    id: 'moving',
    name: 'Moving Help',
    description: 'Furniture moving and home relocation assistance',
  },
];

interface FormData {
  selectedService: string;
  pickupLocation: PlaceDetails | null;
  dropoffLocation: PlaceDetails | null;
  scheduledDate: string;
  scheduledTime: string;
  instructions: string;
  isEmergency: boolean;
}

interface FormValidation {
  selectedService: ValidationResult | null;
  pickupLocation: ValidationResult | null;
  dropoffLocation: ValidationResult | null;
  scheduledDate: ValidationResult | null;
  scheduledTime: ValidationResult | null;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    selectedService: '',
    pickupLocation: null,
    dropoffLocation: null,
    scheduledDate: '',
    scheduledTime: '',
    instructions: '',
    isEmergency: false,
  });

  const [validation, setValidation] = useState<FormValidation>({
    selectedService: null,
    pickupLocation: null,
    dropoffLocation: null,
    scheduledDate: null,
    scheduledTime: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get minimum date (today)
  const getMinDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Get minimum time for today
  const getMinTime = useCallback((selectedDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
      return now.toTimeString().slice(0, 5);
    }
    return '00:00';
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newValidation: FormValidation = {
      selectedService: null,
      pickupLocation: null,
      dropoffLocation: null,
      scheduledDate: null,
      scheduledTime: null,
    };

    // Validate service selection
    if (!formData.selectedService) {
      newValidation.selectedService = {
        isValid: false,
        message: 'Please select a service',
        type: 'error',
      };
    } else {
      newValidation.selectedService = {
        isValid: true,
        message: 'Service selected',
        type: 'success',
      };
    }

    // Validate pickup location
    if (!formData.pickupLocation) {
      newValidation.pickupLocation = {
        isValid: false,
        message: 'Please select a pickup location',
        type: 'error',
      };
    } else {
      newValidation.pickupLocation = {
        isValid: true,
        message: 'Pickup location selected',
        type: 'success',
      };
    }

    // Validate dropoff location
    if (!formData.dropoffLocation) {
      newValidation.dropoffLocation = {
        isValid: false,
        message: 'Please select a dropoff location',
        type: 'error',
      };
    } else {
      newValidation.dropoffLocation = {
        isValid: true,
        message: 'Dropoff location selected',
        type: 'success',
      };
    }

    // Validate date and time for non-emergency services
    if (!formData.isEmergency) {
      if (!formData.scheduledDate) {
        newValidation.scheduledDate = {
          isValid: false,
          message: 'Please select a date',
          type: 'error',
        };
      } else {
        newValidation.scheduledDate = {
          isValid: true,
          message: 'Date selected',
          type: 'success',
        };
      }

      if (!formData.scheduledTime) {
        newValidation.scheduledTime = {
          isValid: false,
          message: 'Please select a time',
          type: 'error',
        };
      } else {
        newValidation.scheduledTime = {
          isValid: true,
          message: 'Time selected',
          type: 'success',
        };
      }
    }

    setValidation(newValidation);
    return Object.values(newValidation).every(v => v === null || v.isValid);
  }, [formData]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);
  }, []);

  // Handle place selection
  const handlePlaceSelect = useCallback((field: 'pickupLocation' | 'dropoffLocation') => {
    return (place: PlaceDetails) => {
      updateFormData({ [field]: place });
    };
  }, [updateFormData]);

  // Handle validation change
  const handleValidationChange = useCallback((field: keyof FormValidation) => {
    return (validationResult: ValidationResult) => {
      setValidation(prev => ({
        ...prev,
        [field]: validationResult,
      }));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // TODO: Implement actual form submission
      console.log('Form submitted', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form on success
      setFormData({
        selectedService: '',
        pickupLocation: null,
        dropoffLocation: null,
        scheduledDate: '',
        scheduledTime: '',
        instructions: '',
        isEmergency: false,
      });

      alert('Booking submitted successfully!');
    } catch (error) {
      setSubmitError('Failed to submit booking. Please try again.');
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-otw-gold">
          Select a Service
        </h2>
        <RadioGroup
          value={selectedService}
          onValueChange={setSelectedService}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {services.map((service) => (
            <Card
              key={service.id}
              className="relative p-4 cursor-pointer hover:border-otw-gold transition-colors"
            >
              <RadioGroupItem
                value={service.id}
                id={service.id}
                className="absolute right-4 top-4"
              />
              <Label htmlFor={service.id} className="block cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-400">{service.description}</p>
              </Label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-otw-gold">
          Service Details
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <EnhancedPlaceAutocomplete
              label="Pickup Location"
              placeholder="Enter pickup address..."
              onPlaceSelect={handlePlaceSelect('pickupLocation')}
              onValidationChange={handleValidationChange('pickupLocation')}
              required
              disabled={isSubmitting}
              className="w-full"
              inputClassName="h-12 text-base bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-otw-gold focus-visible:border-otw-gold"
              id="pickup-location"
              aria-describedby="pickup-location-help"
            />
            <p id="pickup-location-help" className="text-xs text-gray-400">
              Where should we pick up from?
            </p>
            {validation.pickupLocation?.message && (
              <p
                className={cn(
                  'text-sm',
                  validation.pickupLocation.type === 'error' ? 'text-red-400' : '',
                  validation.pickupLocation.type === 'success' ? 'text-green-400' : '',
                )}
                role={validation.pickupLocation.type === 'error' ? 'alert' : 'status'}
              >
                {validation.pickupLocation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <EnhancedPlaceAutocomplete
              label="Dropoff Location"
              placeholder="Enter dropoff address..."
              onPlaceSelect={handlePlaceSelect('dropoffLocation')}
              onValidationChange={handleValidationChange('dropoffLocation')}
              required
              disabled={isSubmitting}
              className="w-full"
              inputClassName="h-12 text-base bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-otw-gold focus-visible:border-otw-gold"
              id="dropoff-location"
              aria-describedby="dropoff-location-help"
            />
            <p id="dropoff-location-help" className="text-xs text-gray-400">
              Where should we deliver to?
            </p>
            {validation.dropoffLocation?.message && (
              <p
                className={cn(
                  'text-sm',
                  validation.dropoffLocation.type === 'error' ? 'text-red-400' : '',
                  validation.dropoffLocation.type === 'success' ? 'text-green-400' : '',
                )}
                role={validation.dropoffLocation.type === 'error' ? 'alert' : 'status'}
              >
                {validation.dropoffLocation.message}
              </p>
            )}
          </div>
        </div>

        {/* Scheduling Section - Only show for non-emergency services */}
        {!formData.isEmergency && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-otw-gold">Schedule Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date" className="text-white">
                  Service Date <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <input
                    id="scheduled-date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => updateFormData({ scheduledDate: e.target.value })}
                    min={getMinDate()}
                    required={!formData.isEmergency}
                    disabled={isSubmitting}
                    className={cn(
                      'flex h-12 w-full rounded-md border bg-gray-900 border-gray-700 text-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-otw-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      'pl-10',
                      validation.scheduledDate?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
                      validation.scheduledDate?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
                    )}
                    aria-describedby="scheduled-date-help"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p id="scheduled-date-help" className="text-xs text-gray-400">
                  When do you need this service?
                </p>
                {validation.scheduledDate?.message && (
                  <p
                    className={cn(
                      'text-sm',
                      validation.scheduledDate.type === 'error' ? 'text-red-400' : '',
                      validation.scheduledDate.type === 'success' ? 'text-green-400' : '',
                    )}
                    role={validation.scheduledDate.type === 'error' ? 'alert' : 'status'}
                  >
                    {validation.scheduledDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-time" className="text-white">
                  Service Time <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <input
                    id="scheduled-time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => updateFormData({ scheduledTime: e.target.value })}
                    min={formData.scheduledDate ? getMinTime(formData.scheduledDate) : undefined}
                    required={!formData.isEmergency}
                    disabled={isSubmitting}
                    className={cn(
                      'flex h-12 w-full rounded-md border bg-gray-900 border-gray-700 text-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-otw-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      'pl-10',
                      validation.scheduledTime?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
                      validation.scheduledTime?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
                    )}
                    aria-describedby="scheduled-time-help"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p id="scheduled-time-help" className="text-xs text-gray-400">
                  What time works best for you?
                </p>
                {validation.scheduledTime?.message && (
                  <p
                    className={cn(
                      'text-sm',
                      validation.scheduledTime.type === 'error' ? 'text-red-400' : '',
                      validation.scheduledTime.type === 'success' ? 'text-green-400' : '',
                    )}
                    role={validation.scheduledTime.type === 'error' ? 'alert' : 'status'}
                  >
                    {validation.scheduledTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-white">Special Instructions</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => updateFormData({ instructions: e.target.value })}
            placeholder="Add any special instructions or requirements..."
            disabled={isSubmitting}
            className="min-h-[80px] bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-otw-gold focus-visible:border-otw-gold resize-none"
            aria-describedby="instructions-help"
          />
          <p id="instructions-help" className="text-xs text-gray-400">
            Let us know about any special requirements or details
          </p>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <input
            type="checkbox"
            id="emergency"
            checked={formData.isEmergency}
            onChange={(e) => updateFormData({ isEmergency: e.target.checked })}
            disabled={isSubmitting}
            className="mt-1 rounded border-gray-400 bg-gray-900 text-otw-red focus:ring-otw-red focus:ring-offset-gray-900"
          />
          <div className="flex-1">
            <Label htmlFor="emergency" className="text-red-400 font-medium cursor-pointer">
              This is an emergency (Priority Service)
            </Label>
            <p className="text-xs text-gray-400 mt-1">
              Emergency services are dispatched immediately with priority handling
            </p>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {validation.selectedService?.type === 'error' && (
        <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-md" role="alert">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{validation.selectedService.message}</p>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-md" role="alert">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full h-12 bg-otw-red hover:bg-otw-gold hover:text-black transition-colors font-medium text-base',
          isSubmitting ? 'cursor-wait opacity-75' : '',
        )}
        aria-describedby="submit-help"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Booking...</span>
          </div>
        ) : (
          <span>{formData.isEmergency ? 'Request Emergency Service' : 'Book Now'}</span>
        )}
      </Button>
      <p id="submit-help" className="text-xs text-center text-gray-400">
        By booking, you agree to our terms of service and privacy policy
      </p>
    </form>
  );
}
