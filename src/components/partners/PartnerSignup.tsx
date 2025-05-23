"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../ui/button";
// import { Card } from "../ui/card" // Removed unused Card import
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Upload } from "lucide-react";

const businessTypes = [
  "Restaurant",
  "Retail Store",
  "Service Provider",
  "Grocery Store",
  "Other",
];

export default function PartnerSignup() {
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    // Removed async
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Partner signup submitted"); // Added console log for now
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Removed async
    if (!e.target.files?.length) return;
    setUploading(true);
    // TODO: Implement file upload
    console.log("File selected:", e.target.files && e.target.files[0] ? e.target.files[0].name : 'No file selected'); // Added console log for now
    setTimeout(() => setUploading(false), 1500); // Mock upload
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter your business name"
            required
          />
        </div>

        <div>
          <Label htmlFor="businessType">Business Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(260) 555-0123"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Business Address</Label>
          <Input
            id="address"
            placeholder="Enter your business address"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            placeholder="Tell us about your business..."
            className="h-24"
            required
          />
        </div>

        <div>
          <Label>Menu/Inventory Upload</Label>
          <div className="mt-1">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-otw-gold hover:text-otw-red"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload} // Already non-async, no 'void' needed here as it's not a promise
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, XLS up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-otw-red hover:bg-otw-gold hover:text-black"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Submit Application"}
      </Button>
    </form>
  );
}
