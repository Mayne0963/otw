'use client';

import type React from 'react';

import { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaComment,
  FaCheck,
} from 'react-icons/fa';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true,
    });

    // Real-time validation for touched fields
    if (touched[name] || value.length > 0) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'subject':
        if (!value.trim()) {
          newErrors.subject = 'Subject is required';
        } else if (value.trim().length < 5) {
          newErrors.subject = 'Subject must be at least 5 characters';
        } else {
          delete newErrors.subject;
        }
        break;
      case 'message':
        if (!value.trim()) {
          newErrors.message = 'Message is required';
        } else if (value.trim().length < 10) {
          newErrors.message = 'Message must be at least 10 characters';
        } else {
          delete newErrors.message;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    };
    setTouched(allTouched);

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Check if form is valid
    return isFormValid();
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field as keyof typeof formData].trim().length > 0
    );
    const hasNoErrors = Object.keys(errors).length === 0;
    return hasRequiredFields && hasNoErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      // Show success message
      setIsSubmitted(true);
      setSubmitStatus('success');

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setTouched({});
        setErrors({});
        setIsSubmitted(false);
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      
      if (error.name === 'AbortError') {
        setErrors({
          ...errors,
          form: 'Request timeout. Please try again.',
        });
      } else {
        setErrors({
          ...errors,
          form: error instanceof Error ? error.message : 'An error occurred. Please try again later.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    'General Inquiry',
    'Catering',
    'Events',
    'Delivery',
    'Feedback',
    'Career',
    'Other',
  ];

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#333333]">
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-emerald-green text-2xl" />
          </div>
          <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
          <p className="text-gray-300 mb-6">
            Thank you for reaching out. We&apos;ll get back to you as soon as
            possible.
          </p>
          <button className="btn-primary" onClick={() => setIsSubmitted(false)}>
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="bg-blood-red bg-opacity-20 text-blood-red p-4 rounded-md">
              {errors.form}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-500" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input pl-10 w-full ${
                  errors.name && touched.name
                    ? 'border-blood-red bg-red-50'
                    : 'hover:border-gray-400'
                }`}
                placeholder="Your name"
                aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
              />
            </div>
            {errors.name && touched.name && (
              <p id="name-error" className="mt-1 text-sm text-blood-red flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input pl-10 w-full ${
                  errors.email && touched.email
                    ? 'border-blood-red bg-red-50'
                    : 'hover:border-gray-400'
                }`}
                placeholder="your@email.com"
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && touched.email && (
              <p id="email-error" className="mt-1 text-sm text-blood-red flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-500" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input pl-10 w-full ${
                  errors.phone && touched.phone
                    ? 'border-blood-red bg-red-50'
                    : 'hover:border-gray-400'
                }`}
                placeholder="(123) 456-7890"
                aria-invalid={errors.phone && touched.phone ? 'true' : 'false'}
                aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
              />
            </div>
            {errors.phone && touched.phone && (
              <p id="phone-error" className="mt-1 text-sm text-blood-red flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input w-full ${
                errors.subject && touched.subject
                  ? 'border-blood-red bg-red-50'
                  : 'hover:border-gray-400'
              }`}
              aria-invalid={errors.subject && touched.subject ? 'true' : 'false'}
              aria-describedby={errors.subject && touched.subject ? 'subject-error' : undefined}
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.subject && touched.subject && (
              <p id="subject-error" className="mt-1 text-sm text-blood-red flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message *
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FaComment className="text-gray-500" />
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={5}
                className={`input pl-10 w-full ${
                  errors.message && touched.message
                    ? 'border-blood-red bg-red-50'
                    : 'hover:border-gray-400'
                }`}
                placeholder="How can we help you?"
                aria-invalid={errors.message && touched.message ? 'true' : 'false'}
                aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
              ></textarea>
            </div>
            {errors.message && touched.message && (
              <p id="message-error" className="mt-1 text-sm text-blood-red flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className={`btn-primary w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting || !isFormValid()
                ? 'opacity-50 cursor-not-allowed'
                : submitStatus === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : submitStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
            aria-label={isSubmitting ? 'Sending message' : 'Send message'}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : submitStatus === 'success' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Message Sent!
              </span>
            ) : submitStatus === 'error' ? (
              'Try Again'
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
