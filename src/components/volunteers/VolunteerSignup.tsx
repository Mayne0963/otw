"use client";

import type React from "react";

import { Button } from "../ui/button";
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

const availabilityOptions = [
  "Weekday Mornings",
  "Weekday Afternoons",
  "Weekday Evenings",
  "Weekends",
  "Flexible",
];

const interestAreas = [
  "Food Delivery",
  "Senior Assistance",
  "Moving Help",
  "Community Events",
  "Emergency Response",
];

export default function VolunteerSignup() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Enter your last name" required />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="volunteer@otwdelivery.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="(260) 555-0123" required />
        </div>

        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option} value={option.toLowerCase()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="interests">Areas of Interest</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select your interests" />
            </SelectTrigger>
            <SelectContent>
              {interestAreas.map((area) => (
                <SelectItem key={area} value={area.toLowerCase()}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Relevant Experience</Label>
          <Textarea
            id="experience"
            placeholder="Tell us about any relevant experience..."
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="motivation">Why do you want to volunteer?</Label>
          <Textarea
            id="motivation"
            placeholder="Share your motivation to join OTW..."
            className="h-24"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-otw-red hover:bg-otw-gold hover:text-black"
      >
        Submit Application
      </Button>
    </form>
  );
}
