'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ModernPlaceAutocomplete, { PlaceDetails, ValidationResult } from './ModernPlaceAutocomplete';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

export interface BookingFormData {
  // Location fields
  pickup: PlaceDetails | null;
  delivery?: PlaceDetails | null;
  destination?: PlaceDetails | null;
  
  // Date and time
  date: string;
  time: string;
  
  // Passenger information
  passengers: number;
  
  // Contact information
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Additional options
  notes?: string;
  isRoundTrip?: boolean;
  vehicleType?: 'sedan' | 'suv' | 'van' | 'luxury';
}

export interface FormValidation {
  pickup: ValidationResult;
  delivery?: ValidationResult;
  destination?: ValidationResult;
  date: ValidationResult;
  time: ValidationResult;
  passengers: ValidationResult;
  customerName: ValidationResult;
  customerPhone: ValidationResult;
  customerEmail: ValidationResult;
}

export interface ModernBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  initialData?: Partial<BookingFormData>;
  serviceArea?: {
    center: { lat: number; lng: number };
    radius: number;
  };
  maxPassengers?: number;
  minAdvanceBookingHours?: number;
  enableDeliveryField?: boolean;
  enableDestinationField?: boolean;
  className?: string;
}

const ModernBookingForm: React.FC<ModernBookingFormProps> = ({
  onSubmit,
  initialData = {},
  serviceArea,
  maxPassengers = 8,
  minAdvanceBookingHours = 2,
  enableDeliveryField = false,
  enableDestinationField = true,
  className = ''
}) => {
  const { isLoaded, loadError } = useModernGoogleMaps();
  
  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: null,
    delivery: enableDeliveryField ? null : undefined,
    destination: enableDestinationField ? null : undefined,
    date: '',
    time: '',
    passengers: 1,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    isRoundTrip: false,
    vehicleType: 'sedan',
    ...initialData
  });
  
  // Validation state
  const [validation, setValidation] = useState<FormValidation>({
    pickup: { isValid: false, message: '', severity: 'success' },
    delivery: enableDeliveryField ? { isValid: false, message: '', severity: 'success' } : undefined,
    destination: enableDestinationField ? { isValid: false, message: '', severity: 'success' } : undefined,
    date: { isValid: false, message: '', severity: 'success' },
    time: { isValid: false, message: '', severity: 'success' },
    passengers: { isValid: true, message: '', severity: 'success' },
    customerName: { isValid: false, message: '', severity: 'success' },
    customerPhone: { isValid: false, message: '', severity: 'success' },
    customerEmail: { isValid: false, message: '', severity: 'success' }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Validation functions
  const validateEmail = useCallback((email: string): ValidationResult => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email is required', severity: 'error' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address', severity: 'error' };
    }
    return { isValid: true, message: 'Valid email address', severity: 'success' };
  }, []);
  
  const validatePhone = useCallback((phone: string): ValidationResult => {
    if (!phone.trim()) {
      return { isValid: false, message: 'Phone number is required', severity: 'error' };
    }
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, message: 'Please enter a valid phone number', severity: 'error' };
    }
    return { isValid: true, message: 'Valid phone number', severity: 'success' };
  }, []);
  
  const validateName = useCallback((name: string): ValidationResult => {
    if (!name.trim()) {
      return { isValid: false, message: 'Name is required', severity: 'error' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters', severity: 'error' };
    }
    return { isValid: true, message: 'Valid name', severity: 'success' };
  }, []);
  
  const validateDate = useCallback((date: string): ValidationResult => {
    if (!date) {
      return { isValid: false, message: 'Date is required', severity: 'error' };
    }
    
    const selectedDate = new Date(date);
    const now = new Date();
    const minDate = new Date(now.getTime() + minAdvanceBookingHours * 60 * 60 * 1000);
    
    if (selectedDate < minDate) {
      return {
        isValid: false,
        message: `Booking must be at least ${minAdvanceBookingHours} hours in advance`,
        severity: 'error'
      };
    }
    
    return { isValid: true, message: 'Valid date', severity: 'success' };
  }, [minAdvanceBookingHours]);
  
  const validateTime = useCallback((time: string, date: string): ValidationResult => {
    if (!time) {
      return { isValid: false, message: 'Time is required', severity: 'error' };
    }
    
    if (date) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      const minDateTime = new Date(now.getTime() + minAdvanceBookingHours * 60 * 60 * 1000);
      
      if (selectedDateTime < minDateTime) {
        return {
          isValid: false,
          message: `Booking must be at least ${minAdvanceBookingHours} hours in advance`,
          severity: 'error'
        };
      }
    }
    
    return { isValid: true, message: 'Valid time', severity: 'success' };
  }, [minAdvanceBookingHours]);
  
  const validatePassengers = useCallback((passengers: number): ValidationResult => {
    if (passengers < 1) {
      return { isValid: false, message: 'At least 1 passenger is required', severity: 'error' };
    }
    if (passengers > maxPassengers) {
      return { isValid: false, message: `Maximum ${maxPassengers} passengers allowed`, severity: 'error' };
    }
    return { isValid: true, message: 'Valid passenger count', severity: 'success' };
  }, [maxPassengers]);
  
  // Check if form is valid
  const isFormValid = useMemo(() => {
    const requiredFields = ['pickup', 'date', 'time', 'customerName', 'customerPhone', 'customerEmail'];
    
    // Check required place fields
    if (!formData.pickup) return false;
    if (enableDeliveryField && !formData.delivery) return false;
    if (enableDestinationField && !formData.destination) return false;
    
    // Check validation results
    for (const field of requiredFields) {
      const fieldValidation = validation[field as keyof FormValidation];
      if (!fieldValidation?.isValid) return false;
    }
    
    return validation.passengers.isValid;
  }, [formData, validation, enableDeliveryField, enableDestinationField]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      setSubmitError('Google Maps is still loading. Please wait.');
      return;
    }
    
    if (loadError) {
      setSubmitError('Google Maps failed to load. Please refresh the page.');
      return;
    }
    
    if (!isFormValid) {
      setSubmitError('Please fill in all required fields correctly.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, loadError, isFormValid, formData, onSubmit]);
  
  // Handle field changes with validation
  const handleFieldChange = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field
    let fieldValidation: ValidationResult;
    switch (field) {
      case 'customerName':
        fieldValidation = validateName(value);
        break;
      case 'customerEmail':
        fieldValidation = validateEmail(value);
        break;
      case 'customerPhone':
        fieldValidation = validatePhone(value);
        break;
      case 'date':
        fieldValidation = validateDate(value);
        // Re-validate time when date changes
        if (formData.time) {
          const timeValidation = validateTime(formData.time, value);
          setValidation(prev => ({ ...prev, time: timeValidation }));
        }
        break;
      case 'time':
        fieldValidation = validateTime(value, formData.date);
        break;
      case 'passengers':
        fieldValidation = validatePassengers(value);
        break;
      default:
        return;
    }
    
    setValidation(prev => ({ ...prev, [field]: fieldValidation }));
  }, [formData.time, formData.date, validateName, validateEmail, validatePhone, validateDate, validateTime, validatePassengers]);
  
  // Handle place selection
  const handlePlaceSelect = useCallback((field: 'pickup' | 'delivery' | 'destination', place: PlaceDetails) => {
    setFormData(prev => ({ ...prev, [field]: place }));
  }, []);
  
  // Handle place validation
  const handlePlaceValidation = useCallback((field: 'pickup' | 'delivery' | 'destination', validationResult: ValidationResult) => {
    setValidation(prev => ({ ...prev, [field]: validationResult }));
  }, []);
  
  // Initialize validation on mount
  useEffect(() => {
    // Validate initial data
    if (initialData.customerName) {
      setValidation(prev => ({ ...prev, customerName: validateName(initialData.customerName!) }));
    }
    if (initialData.customerEmail) {
      setValidation(prev => ({ ...prev, customerEmail: validateEmail(initialData.customerEmail!) }));
    }
    if (initialData.customerPhone) {
      setValidation(prev => ({ ...prev, customerPhone: validatePhone(initialData.customerPhone!) }));
    }
    if (initialData.date) {
      setValidation(prev => ({ ...prev, date: validateDate(initialData.date!) }));
    }
    if (initialData.time && initialData.date) {
      setValidation(prev => ({ ...prev, time: validateTime(initialData.time!, initialData.date!) }));
    }
    if (initialData.passengers) {
      setValidation(prev => ({ ...prev, passengers: validatePassengers(initialData.passengers!) }));
    }
  }, [initialData, validateName, validateEmail, validatePhone, validateDate, validateTime, validatePassengers]);
  
  // Get minimum date (today + advance booking hours)
  const minDate = useMemo(() => {
    const now = new Date();
    const minDateTime = new Date(now.getTime() + minAdvanceBookingHours * 60 * 60 * 1000);
    return minDateTime.toISOString().split('T')[0];
  }, [minAdvanceBookingHours]);
  
  // Get minimum time for today
  const minTime = useMemo(() => {
    if (formData.date === minDate) {
      const now = new Date();
      const minDateTime = new Date(now.getTime() + minAdvanceBookingHours * 60 * 60 * 1000);
      return minDateTime.toTimeString().slice(0, 5);
    }
    return '00:00';
  }, [formData.date, minDate, minAdvanceBookingHours]);
  
  if (loadError) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <XMarkIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">Google Maps Error</h3>
              <p className="text-red-300 mt-1">{loadError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
            <span className="text-gray-300">Loading Google Maps...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Book Your Ride</h2>
          <p className="text-gray-400">Fill in the details below to schedule your transportation</p>
        </div>
        
        {/* Location Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5" />
            <span>Locations</span>
          </h3>
          
          {/* Pickup Location */}
          <div>
            <label htmlFor="pickup" className="block text-sm font-medium text-gray-300 mb-2">
              Pickup Location *
            </label>
            <ModernPlaceAutocomplete
              id="pickup"
              value={formData.pickup?.displayName || ''}
              placeholder="Enter pickup address..."
              onPlaceSelect={(place) => handlePlaceSelect('pickup', place)}
              onValidationChange={(validation) => handlePlaceValidation('pickup', validation)}
              serviceAreaCenter={serviceArea?.center}
              serviceAreaRadius={serviceArea?.radius}
              enableAddressValidation={!!serviceArea}
              required
              aria-label="Pickup location"
            />
          </div>
          
          {/* Delivery Location (Optional) */}
          {enableDeliveryField && (
            <div>
              <label htmlFor="delivery" className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Location
              </label>
              <ModernPlaceAutocomplete
                id="delivery"
                value={formData.delivery?.displayName || ''}
                placeholder="Enter delivery address..."
                onPlaceSelect={(place) => handlePlaceSelect('delivery', place)}
                onValidationChange={(validation) => handlePlaceValidation('delivery', validation)}
                serviceAreaCenter={serviceArea?.center}
                serviceAreaRadius={serviceArea?.radius}
                enableAddressValidation={!!serviceArea}
                aria-label="Delivery location"
              />
            </div>
          )}
          
          {/* Destination Location */}
          {enableDestinationField && (
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-300 mb-2">
                Destination {!enableDeliveryField ? '*' : ''}
              </label>
              <ModernPlaceAutocomplete
                id="destination"
                value={formData.destination?.displayName || ''}
                placeholder="Enter destination address..."
                onPlaceSelect={(place) => handlePlaceSelect('destination', place)}
                onValidationChange={(validation) => handlePlaceValidation('destination', validation)}
                serviceAreaCenter={serviceArea?.center}
                serviceAreaRadius={serviceArea?.radius}
                enableAddressValidation={!!serviceArea}
                required={!enableDeliveryField}
                aria-label="Destination location"
              />
            </div>
          )}
        </div>
        
        {/* Date and Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  min={minDate}
                  required
                  className={`
                    w-full pl-10 pr-4 py-3
                    bg-gray-800 text-white
                    border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${
                      validation.date.severity === 'error'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : validation.date.severity === 'success'
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              </div>
              {validation.date.message && (
                <p className={`mt-1 text-sm ${
                  validation.date.severity === 'error' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {validation.date.message}
                </p>
              )}
            </div>
            
            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Time *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleFieldChange('time', e.target.value)}
                  min={minTime}
                  required
                  className={`
                    w-full pl-10 pr-4 py-3
                    bg-gray-800 text-white
                    border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${
                      validation.time.severity === 'error'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : validation.time.severity === 'success'
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              </div>
              {validation.time.message && (
                <p className={`mt-1 text-sm ${
                  validation.time.severity === 'error' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {validation.time.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Passenger Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Passenger Details</span>
          </h3>
          
          {/* Number of Passengers */}
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-300 mb-2">
              Number of Passengers *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="passengers"
                value={formData.passengers}
                onChange={(e) => handleFieldChange('passengers', parseInt(e.target.value))}
                required
                className={`
                  w-full pl-10 pr-4 py-3
                  bg-gray-800 text-white
                  border rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-opacity-50
                  ${
                    validation.passengers.severity === 'error'
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  }
                `}
              >
                {Array.from({ length: maxPassengers }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
            {validation.passengers.message && (
              <p className="mt-1 text-sm text-red-400">
                {validation.passengers.message}
              </p>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <EnvelopeIcon className="h-5 w-5" />
            <span>Contact Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="md:col-span-2">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className={`
                    w-full pl-10 pr-4 py-3
                    bg-gray-800 text-white placeholder-gray-400
                    border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${
                      validation.customerName.severity === 'error'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : validation.customerName.severity === 'success'
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              </div>
              {validation.customerName.message && (
                <p className={`mt-1 text-sm ${
                  validation.customerName.severity === 'error' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {validation.customerName.message}
                </p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  className={`
                    w-full pl-10 pr-4 py-3
                    bg-gray-800 text-white placeholder-gray-400
                    border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${
                      validation.customerPhone.severity === 'error'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : validation.customerPhone.severity === 'success'
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              </div>
              {validation.customerPhone.message && (
                <p className={`mt-1 text-sm ${
                  validation.customerPhone.severity === 'error' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {validation.customerPhone.message}
                </p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`
                    w-full pl-10 pr-4 py-3
                    bg-gray-800 text-white placeholder-gray-400
                    border rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${
                      validation.customerEmail.severity === 'error'
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : validation.customerEmail.severity === 'success'
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              </div>
              {validation.customerEmail.message && (
                <p className={`mt-1 text-sm ${
                  validation.customerEmail.severity === 'error' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {validation.customerEmail.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300 mb-2">
            Vehicle Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TruckIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value as any }))}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="sedan">Sedan (1-4 passengers)</option>
              <option value="suv">SUV (1-6 passengers)</option>
              <option value="van">Van (1-8 passengers)</option>
              <option value="luxury">Luxury Vehicle</option>
            </select>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any special requests or additional information..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
          />
        </div>
        
        {/* Round Trip Option */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isRoundTrip"
            checked={formData.isRoundTrip}
            onChange={(e) => setFormData(prev => ({ ...prev, isRoundTrip: e.target.checked }))}
            className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="isRoundTrip" className="text-sm text-gray-300">
            This is a round trip
          </label>
        </div>
        
        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-400">{submitError}</span>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-white
            transition-all duration-200 flex items-center justify-center space-x-2
            ${
              isFormValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
                : 'bg-gray-600 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span>Book Ride</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ModernBookingForm;