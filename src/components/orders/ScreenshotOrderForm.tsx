"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaUpload,
  FaCheck,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface ScreenshotOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  restaurantName: string;
  pickupLocation: string;
  estimatedTotal: string;
  specialInstructions: string;
  screenshot: File | null;
  screenshotPreview: string | null;
}

export default function ScreenshotOrderForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ScreenshotOrderData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    restaurantName: "",
    pickupLocation: "",
    estimatedTotal: "",
    specialInstructions: "",
    screenshot: null,
    screenshotPreview: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image file must be less than 10MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          screenshot: file,
          screenshotPreview: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeScreenshot = () => {
    setFormData(prev => ({
      ...prev,
      screenshot: null,
      screenshotPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    } else if (!/^[\d\s\-\(\)\+]{10,}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "Please enter a valid phone number";
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = "Restaurant name is required";
    }

    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    }

    if (!formData.estimatedTotal.trim()) {
      newErrors.estimatedTotal = "Estimated total is required";
    } else if (!/^\$?\d+(\.\d{2})?$/.test(formData.estimatedTotal)) {
      newErrors.estimatedTotal = "Please enter a valid amount (e.g., $25.99)";
    }

    if (!formData.screenshot) {
      newErrors.screenshot = "Screenshot is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please correct the errors in the form");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("customerName", formData.customerName);
      submitData.append("customerPhone", formData.customerPhone);
      submitData.append("customerEmail", formData.customerEmail);
      submitData.append("restaurantName", formData.restaurantName);
      submitData.append("pickupLocation", formData.pickupLocation);
      submitData.append("estimatedTotal", formData.estimatedTotal);
      submitData.append("specialInstructions", formData.specialInstructions);
      if (formData.screenshot) {
        submitData.append("screenshot", formData.screenshot);
      }

      // Submit to API
      const response = await fetch("/api/orders/screenshot", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      setOrderId(result.orderId);
      setOrderComplete(true);
    } catch (err) {
      console.error("Order submission error:", err);
      setError("There was an error submitting your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-[#1A1A1A] border-[#333333]">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-emerald-green text-3xl" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Order Submitted!</h1>
              <p className="text-gray-300 mb-6">
                Thank you! Your screenshot order has been received. Our team will review your order and contact you shortly to confirm details and arrange pickup.
              </p>
              
              <div className="bg-[#111111] p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Order #{orderId}</h2>
                  <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 px-3 py-1 rounded-full text-sm">
                    Under Review
                  </span>
                </div>
                <div className="text-left space-y-2">
                  <p><strong>Restaurant:</strong> {formData.restaurantName}</p>
                  <p><strong>Pickup Location:</strong> {formData.pickupLocation}</p>
                  <p><strong>Estimated Total:</strong> {formData.estimatedTotal}</p>
                  <p><strong>Contact:</strong> {formData.customerPhone}</p>
                </div>
              </div>

              <Alert className="mb-6 bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-blue-300">
                  <strong>Next Steps:</strong> Our team will call you within 15-30 minutes to confirm your order details, verify the total amount, and provide pickup instructions.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/orders")}
                  className="btn-primary"
                >
                  View My Orders
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-[#333333] text-white hover:bg-[#333333]"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-white hover:bg-[#333333] mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Screenshot Order Service</h1>
            <p className="text-xl text-gray-300 mb-6">
              Simply upload a screenshot of your order, and we'll handle everything else!
            </p>
            
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1">Upload Screenshot</h3>
                <p className="text-xs text-gray-400">Share your order image</p>
              </div>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1">We Review</h3>
                <p className="text-xs text-gray-400">Confirm details with you</p>
              </div>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1">We Order</h3>
                <p className="text-xs text-gray-400">Place & pick up for you</p>
              </div>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-1">Fast Delivery</h3>
                <p className="text-xs text-gray-400">Right to your door</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <FaExclamationTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-2xl">Order Information</CardTitle>
                <p className="text-gray-400">Fill out the details below - we'll handle the rest!</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Customer Information */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="text-xl font-semibold mb-2">Step 1: Your Information</h3>
                      <p className="text-gray-400 text-sm">We need this to contact you about your order</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="customerName" className="text-base font-medium mb-2 block">
                          Full Name *
                        </Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          type="text"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.customerName ? 'border-red-500' : ''}`}
                          placeholder="John Doe"
                        />
                        {errors.customerName && (
                          <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerPhone" className="text-base font-medium mb-2 block">
                          Phone Number *
                        </Label>
                        <Input
                          id="customerPhone"
                          name="customerPhone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.customerPhone ? 'border-red-500' : ''}`}
                          placeholder="(555) 123-4567"
                        />
                        {errors.customerPhone && (
                          <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerEmail" className="text-base font-medium mb-2 block">
                        Email Address *
                      </Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.customerEmail ? 'border-red-500' : ''}`}
                        placeholder="john@example.com"
                      />
                      {errors.customerEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Restaurant Information */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="text-xl font-semibold mb-2">Step 2: Restaurant Details</h3>
                      <p className="text-gray-400 text-sm">Tell us where to pick up your order</p>
                    </div>

                    <div>
                      <Label htmlFor="restaurantName" className="text-base font-medium mb-2 block">
                        Restaurant Name *
                      </Label>
                      <Input
                        id="restaurantName"
                        name="restaurantName"
                        type="text"
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.restaurantName ? 'border-red-500' : ''}`}
                        placeholder="McDonald's, Chipotle, etc."
                      />
                      {errors.restaurantName && (
                        <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="pickupLocation" className="text-base font-medium mb-2 block">
                        Pickup Location *
                      </Label>
                      <Input
                        id="pickupLocation"
                        name="pickupLocation"
                        type="text"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.pickupLocation ? 'border-red-500' : ''}`}
                        placeholder="123 Main St, Fort Wayne, IN"
                      />
                      {errors.pickupLocation && (
                        <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="estimatedTotal" className="text-base font-medium mb-2 block">
                        Estimated Total *
                      </Label>
                      <Input
                        id="estimatedTotal"
                        name="estimatedTotal"
                        type="text"
                        value={formData.estimatedTotal}
                        onChange={handleInputChange}
                        className={`bg-[#111111] border-[#333333] h-12 text-base ${errors.estimatedTotal ? 'border-red-500' : ''}`}
                        placeholder="$25.99"
                      />
                      <p className="text-xs text-gray-500 mt-1">Total amount from your order (including tax & tip)</p>
                      {errors.estimatedTotal && (
                        <p className="text-red-500 text-sm mt-1">{errors.estimatedTotal}</p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Screenshot Upload */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="text-xl font-semibold mb-2">Step 3: Upload Screenshot</h3>
                      <p className="text-gray-400 text-sm">Share a clear image of your order details</p>
                    </div>

                    {/* Screenshot Tips */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-300 mb-2">📸 Screenshot Tips:</h4>
                      <ul className="text-sm text-blue-200 space-y-1">
                        <li>• Include restaurant name, items, and total price</li>
                        <li>• Make sure text is clear and readable</li>
                        <li>• Include any special instructions or modifications</li>
                        <li>• Screenshots from any food delivery app work!</li>
                      </ul>
                    </div>

                    {!formData.screenshotPreview ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          errors.screenshot ? 'border-red-500 bg-red-500/5' : 'border-[#333333] hover:border-orange-500 hover:bg-orange-500/5'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Upload Your Screenshot</h3>
                        <p className="text-gray-400 mb-4">
                          Click here or drag and drop your order screenshot
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports: JPG, PNG, WebP (Max 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border border-[#333333] rounded-lg p-4">
                          <div className="relative w-full h-64 mb-4">
                            <img
                              src={formData.screenshotPreview}
                              alt="Order screenshot"
                              className="w-full h-full object-contain rounded-lg bg-[#111111]"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              {formData.screenshot?.name} ({Math.round((formData.screenshot?.size || 0) / 1024)}KB)
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeScreenshot}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {errors.screenshot && (
                      <p className="text-red-500 text-sm">{errors.screenshot}</p>
                    )}
                  </div>

                  {/* Step 4: Special Instructions */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="text-xl font-semibold mb-2">Step 4: Additional Notes (Optional)</h3>
                      <p className="text-gray-400 text-sm">Any special delivery instructions or notes</p>
                    </div>

                    <div>
                      <Textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        className="bg-[#111111] border-[#333333] min-h-[100px] text-base"
                        placeholder="Leave at door, call when arriving, etc."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg h-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting Order...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Submit Screenshot Order
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with helpful information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Important Notice */}
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  <FaExclamationTriangle className="h-5 w-5" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-yellow-200 text-sm space-y-2">
                  <p><strong>📞 We'll call you:</strong> Within 15-30 minutes to confirm details</p>
                  <p><strong>💰 Payment:</strong> Collected when we pick up your order</p>
                  <p><strong>🚗 Service fee:</strong> Will be discussed during confirmation call</p>
                  <p><strong>⏰ Processing:</strong> Orders handled Mon-Sun, 10 AM - 10 PM</p>
                </div>
              </CardContent>
            </Card>
            
            {/* How it Works */}
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-green-400">✅ How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium">You submit this form</p>
                      <p className="text-gray-400 text-xs">With your screenshot and details</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium">We review & call you</p>
                      <p className="text-gray-400 text-xs">To confirm details and payment</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium">We place & pick up</p>
                      <p className="text-gray-400 text-xs">Your order from the restaurant</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                    <div>
                      <p className="font-medium">Fast delivery</p>
                      <p className="text-gray-400 text-xs">Right to your door</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-blue-400">📞 Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Call us:</strong> (555) 123-4567</p>
                  <p><strong>Text us:</strong> (555) 123-4567</p>
                  <p><strong>Email:</strong> support@ezyzip.com</p>
                  <p className="text-gray-400 text-xs mt-3">Available Mon-Sun, 10 AM - 10 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}