"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaCamera,
  FaUpload,
  FaTrash,
  FaCheck,
  FaExclamationTriangle,
  FaArrowLeft,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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
      newErrors.screenshot = "Screenshot of your order is required";
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
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-white hover:bg-[#333333] mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Screenshot Order</h1>
          <p className="text-gray-300">
            Upload a screenshot of your order from any restaurant app or website, and we'll handle the pickup for you!
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <FaExclamationTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-[#1A1A1A] border-[#333333]">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`bg-[#111111] border-[#333333] ${errors.customerName ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className={`bg-[#111111] border-[#333333] ${errors.customerPhone ? 'border-red-500' : ''}`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className={`bg-[#111111] border-[#333333] ${errors.customerEmail ? 'border-red-500' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                  )}
                </div>
              </div>

              {/* Restaurant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Restaurant Details</h3>
                
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className={`bg-[#111111] border-[#333333] ${errors.restaurantName ? 'border-red-500' : ''}`}
                    placeholder="e.g., McDonald's, Chipotle, Local Diner"
                  />
                  {errors.restaurantName && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pickupLocation">Pickup Location *</Label>
                  <Input
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className={`bg-[#111111] border-[#333333] ${errors.pickupLocation ? 'border-red-500' : ''}`}
                    placeholder="Restaurant address or location details"
                  />
                  {errors.pickupLocation && (
                    <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedTotal">Estimated Total *</Label>
                  <Input
                    id="estimatedTotal"
                    name="estimatedTotal"
                    value={formData.estimatedTotal}
                    onChange={handleInputChange}
                    className={`bg-[#111111] border-[#333333] ${errors.estimatedTotal ? 'border-red-500' : ''}`}
                    placeholder="$25.99"
                  />
                  {errors.estimatedTotal && (
                    <p className="text-red-500 text-sm mt-1">{errors.estimatedTotal}</p>
                  )}
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Screenshot *</h3>
                <p className="text-gray-400 text-sm">
                  Upload a clear screenshot of your order confirmation, cart, or receipt from the restaurant's app or website.
                </p>
                
                {!formData.screenshotPreview ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      errors.screenshot ? 'border-red-500' : 'border-[#333333] hover:border-[#555555]'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Screenshot</p>
                    <p className="text-gray-400 text-sm">
                      Click to select or drag and drop your order screenshot
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Supports: JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border border-[#333333] rounded-lg p-4">
                      <div className="relative w-full h-64 mb-4">
                        <Image
                          src={formData.screenshotPreview}
                          alt="Order screenshot preview"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                          {formData.screenshot?.name} ({Math.round((formData.screenshot?.size || 0) / 1024)}KB)
                        </p>
                        <Button
                          type="button"
                          onClick={removeScreenshot}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <FaTrash className="mr-2" /> Remove
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

              {/* Special Instructions */}
              <div>
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  className="bg-[#111111] border-[#333333] min-h-[100px]"
                  placeholder="Any special requests, dietary restrictions, or additional notes for the pickup..."
                />
              </div>

              {/* Important Notice */}
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertDescription className="text-yellow-300">
                  <strong>Important:</strong> After submitting, our team will call you to confirm order details and payment. We'll handle placing the order and picking it up for you. Delivery fee and service charges will be discussed during confirmation.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Order...
                  </>
                ) : (
                  <>
                    <FaCamera className="mr-2" />
                    Submit Screenshot Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}