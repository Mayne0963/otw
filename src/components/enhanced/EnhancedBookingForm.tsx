'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedPlaceAutocomplete, { PlaceDetails, ValidationResult } from './EnhancedPlaceAutocomplete';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface BookingFormData {
  pickupLocation: PlaceDetails | null;
  deliveryLocation: PlaceDetails | null;
  destinationLocation: PlaceDetails | null;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  specialRequests: string;
}

interface FormValidation {
  pickupLocation: ValidationResult | null;
  deliveryLocation: ValidationResult | null;
  destinationLocation: ValidationResult | null;
  pickupDate: ValidationResult | null;
  pickupTime: ValidationResult | null;
  passengers: ValidationResult | null;
}

interface EnhancedBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  onDataChange?: (data: Partial<BookingFormData>) => void;
  className?: string;
  serviceArea?: {
    center: { lat: number; lng: number };
    radius: number;
  };
  maxPassengers?: number;
  minAdvanceBooking?: number; // hours
  showDeliveryOption?: boolean;
  showDestinationOption?: boolean;
  disabled?: boolean;
  initialData?: Partial<BookingFormData>;
}

const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  onSubmit,
  onDataChange,
  className = '',
  serviceArea,
  maxPassengers = 8,
  minAdvanceBooking = 2,
  showDeliveryOption = true,
  showDestinationOption = true,
  disabled = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    pickupLocation: null,
    deliveryLocation: null,
    destinationLocation: null,
    pickupDate: '',
    pickupTime: '',
    passengers: 1,
    specialRequests: '',
    ...initialData,
  });

  const [validation, setValidation] = useState<FormValidation>({
    pickupLocation: null,
    deliveryLocation: null,
    destinationLocation: null,
    pickupDate: null,
    pickupTime: null,
    passengers: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();

  // Get minimum date (today + minimum advance booking)
  const getMinDate = useCallback(() => {
    const now = new Date();
    now.setHours(now.getHours() + minAdvanceBooking);
    return now.toISOString().split('T')[0];
  }, [minAdvanceBooking]);

  // Get minimum time for selected date
  const getMinTime = useCallback((selectedDate: string) => {
    const now = new Date();
    const selected = new Date(selectedDate);
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate === today) {
      now.setHours(now.getHours() + minAdvanceBooking);
      return now.toTimeString().slice(0, 5);
    }
    return '00:00';
  }, [minAdvanceBooking]);

  // Validate date and time
  const validateDateTime = useCallback((date: string, time: string) => {
    if (!date || !time) {
      return {
        isValid: false,
        message: 'Please select both date and time',
        type: 'error' as const,
      };
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const minDateTime = new Date();
    minDateTime.setHours(minDateTime.getHours() + minAdvanceBooking);

    if (selectedDateTime < minDateTime) {
      return {
        isValid: false,
        message: `Booking must be at least ${minAdvanceBooking} hours in advance`,
        type: 'error' as const,
      };
    }

    return {
      isValid: true,
      message: 'Date and time are valid',
      type: 'success' as const,
    };
  }, [minAdvanceBooking]);

  // Validate passengers
  const validatePassengers = useCallback((count: number) => {
    if (count < 1) {
      return {
        isValid: false,
        message: 'At least 1 passenger is required',
        type: 'error' as const,
      };
    }

    if (count > maxPassengers) {
      return {
        isValid: false,
        message: `Maximum ${maxPassengers} passengers allowed`,
        type: 'error' as const,
      };
    }

    return {
      isValid: true,
      message: 'Passenger count is valid',
      type: 'success' as const,
    };
  }, [maxPassengers]);

  // Update form data and trigger validation
  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);

    if (onDataChange) {
      onDataChange(updates);
    }

    // Validate date/time if either changed
    if ('pickupDate' in updates || 'pickupTime' in updates) {
      const dateValidation = validateDateTime(newData.pickupDate, newData.pickupTime);
      setValidation(prev => ({
        ...prev,
        pickupDate: dateValidation,
        pickupTime: dateValidation,
      }));
    }

    // Validate passengers if changed
    if ('passengers' in updates) {
      const passengersValidation = validatePassengers(newData.passengers);
      setValidation(prev => ({
        ...prev,
        passengers: passengersValidation,
      }));
    }
  }, [formData, onDataChange, validateDateTime, validatePassengers]);

  // Handle place selection
  const handlePlaceSelect = useCallback((field: keyof Pick<BookingFormData, 'pickupLocation' | 'deliveryLocation' | 'destinationLocation'>) => {
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

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const requiredFields = ['pickupLocation', 'pickupDate', 'pickupTime', 'passengers'] as const;

    // Check required fields
    for (const field of requiredFields) {
      if (field === 'pickupLocation') {
        if (!formData.pickupLocation) {return false;}
      } else if (field === 'pickupDate' || field === 'pickupTime') {
        if (!formData[field]) {return false;}
      } else if (field === 'passengers') {
        if (formData.passengers < 1) {return false;}
      }
    }

    // Check validation results
    const validationFields = Object.values(validation);
    for (const validationResult of validationFields) {
      if (validationResult && !validationResult.isValid) {
        return false;
      }
    }

    return true;
  }, [formData, validation]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      setSubmitError('Google Maps is still loading. Please wait a moment.');
      return;
    }
    
    if (loadError) {
      setSubmitError('Google Maps failed to load. Please refresh the page and try again.');
      return;
    }

    if (!isFormValid()) {
      setSubmitError('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize validation on mount
  useEffect(() => {
    if (formData.pickupDate && formData.pickupTime) {
      const dateValidation = validateDateTime(formData.pickupDate, formData.pickupTime);
      setValidation(prev => ({
        ...prev,
        pickupDate: dateValidation,
        pickupTime: dateValidation,
      }));
    }

    if (formData.passengers) {
      const passengersValidation = validatePassengers(formData.passengers);
      setValidation(prev => ({
        ...prev,
        passengers: passengersValidation,
      }));
    }
  }, []);

  // Show loading state while Google Maps is loading
  if (!isLoaded && !loadError) {
    return (
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <div className="flex items-center justify-center space-x-2 py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  // Show error state if Google Maps failed to load
  if (loadError) {
    return (
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Google Maps Error</h3>
            <p className="text-sm text-red-700 mt-1">{loadError}</p>
            <p className="text-xs text-red-600 mt-2">Please refresh the page to try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Ride</h2>
          <p className="text-gray-600">Fill in the details below to schedule your transportation</p>
        </div>

        {/* Location Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Pickup Location */}
            <div className="space-y-2">
              <EnhancedPlaceAutocomplete
                label="Pickup Location"
                placeholder="Enter pickup address..."
                onPlaceSelect={handlePlaceSelect('pickupLocation')}
                onValidationChange={handleValidationChange('pickupLocation')}
                serviceArea={serviceArea}
                required
                disabled={disabled}
                className="w-full"
                inputClassName="h-12 text-base"
                id="pickup-location"
                aria-describedby="pickup-location-help"
              />
              <p id="pickup-location-help" className="text-xs text-gray-500">
                Enter the address where you'd like to be picked up
              </p>
            </div>

            {/* Delivery Location (Optional) */}
            {showDeliveryOption && (
              <div className="space-y-2">
                <EnhancedPlaceAutocomplete
                  label="Delivery Location (Optional)"
                  placeholder="Enter delivery address..."
                  onPlaceSelect={handlePlaceSelect('deliveryLocation')}
                  onValidationChange={handleValidationChange('deliveryLocation')}
                  serviceArea={serviceArea}
                  disabled={disabled}
                  className="w-full"
                  inputClassName="h-12 text-base"
                  id="delivery-location"
                  aria-describedby="delivery-location-help"
                />
                <p id="delivery-location-help" className="text-xs text-gray-500">
                  Optional stop for package delivery or pickup
                </p>
              </div>
            )}

            {/* Destination Location (Optional) */}
            {showDestinationOption && (
              <div className="space-y-2">
                <EnhancedPlaceAutocomplete
                  label="Destination Location (Optional)"
                  placeholder="Enter destination address..."
                  onPlaceSelect={handlePlaceSelect('destinationLocation')}
                  onValidationChange={handleValidationChange('destinationLocation')}
                  serviceArea={serviceArea}
                  disabled={disabled}
                  className="w-full"
                  inputClassName="h-12 text-base"
                  id="destination-location"
                  aria-describedby="destination-location-help"
                />
                <p id="destination-location-help" className="text-xs text-gray-500">
                  Final destination address
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="pickup-date" className="text-sm font-medium text-gray-700">
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pickup-date"
                type="date"
                value={formData.pickupDate}
                onChange={(e) => updateFormData({ pickupDate: e.target.value })}
                min={getMinDate()}
                required
                disabled={disabled}
                className={cn(
                  'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  'pl-10',
                  validation.pickupDate?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
                  validation.pickupDate?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
                )}
                aria-describedby="pickup-date-help pickup-date-error"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <p id="pickup-date-help" className="text-xs text-gray-500">
              Select your preferred pickup date
            </p>
            {validation.pickupDate?.message && (
              <p
                id="pickup-date-error"
                className={cn(
                  'text-sm',
                  validation.pickupDate.type === 'error' ? 'text-red-600' : '',
                  validation.pickupDate.type === 'success' ? 'text-green-600' : '',
                )}
                role={validation.pickupDate.type === 'error' ? 'alert' : 'status'}
              >
                {validation.pickupDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="pickup-time" className="text-sm font-medium text-gray-700">
              Pickup Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pickup-time"
                type="time"
                value={formData.pickupTime}
                onChange={(e) => updateFormData({ pickupTime: e.target.value })}
                min={formData.pickupDate ? getMinTime(formData.pickupDate) : undefined}
                required
                disabled={disabled}
                className={cn(
                  'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  'pl-10',
                  validation.pickupTime?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
                  validation.pickupTime?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
                )}
                aria-describedby="pickup-time-help pickup-time-error"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <p id="pickup-time-help" className="text-xs text-gray-500">
              Select your preferred pickup time
            </p>
            {validation.pickupTime?.message && validation.pickupTime.message !== validation.pickupDate?.message && (
              <p
                id="pickup-time-error"
                className={cn(
                  'text-sm',
                  validation.pickupTime.type === 'error' ? 'text-red-600' : '',
                  validation.pickupTime.type === 'success' ? 'text-green-600' : '',
                )}
                role={validation.pickupTime.type === 'error' ? 'alert' : 'status'}
              >
                {validation.pickupTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Passengers */}
        <div className="space-y-2">
          <label htmlFor="passengers" className="text-sm font-medium text-gray-700">
            Number of Passengers <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="passengers"
              type="number"
              value={formData.passengers}
              onChange={(e) => updateFormData({ passengers: parseInt(e.target.value) || 1 })}
              min={1}
              max={maxPassengers}
              required
              disabled={disabled}
              className={cn(
                'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                'pl-10',
                validation.passengers?.type === 'error' ? 'border-red-500 focus-visible:ring-red-500' : '',
                validation.passengers?.type === 'success' ? 'border-green-500 focus-visible:ring-green-500' : '',
              )}
              aria-describedby="passengers-help passengers-error"
            />
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <p id="passengers-help" className="text-xs text-gray-500">
            How many people will be traveling? (Max: {maxPassengers})
          </p>
          {validation.passengers?.message && (
            <p
              id="passengers-error"
              className={cn(
                'text-sm',
                validation.passengers.type === 'error' ? 'text-red-600' : '',
                validation.passengers.type === 'success' ? 'text-green-600' : '',
              )}
              role={validation.passengers.type === 'error' ? 'alert' : 'status'}
            >
              {validation.passengers.message}
            </p>
          )}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <label htmlFor="special-requests" className="text-sm font-medium text-gray-700">
            Special Requests (Optional)
          </label>
          <textarea
            id="special-requests"
            value={formData.specialRequests}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            placeholder="Any special requirements or notes..."
            rows={3}
            disabled={disabled}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            aria-describedby="special-requests-help"
          />
          <p id="special-requests-help" className="text-xs text-gray-500">
            Let us know about any special requirements (wheelchair accessibility, child seats, etc.)
          </p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || isSubmitting || !isFormValid() || !isLoaded}
          className={cn(
            'w-full flex items-center justify-center space-x-2 h-12 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            isSubmitting ? 'cursor-wait' : '',
          )}
          aria-describedby="submit-help"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Booking...</span>
            </>
          ) : (
            <>
              <span>Book Ride</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p id="submit-help" className="text-xs text-center text-gray-500">
          By booking, you agree to our terms of service and privacy policy
        </p>
      </form>
    </div>
  );
};

export default EnhancedBookingForm;
export type { BookingFormData, FormValidation, EnhancedBookingFormProps };