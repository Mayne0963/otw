"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Card } from "../ui/card";

const services = [
  {
    id: "delivery",
    name: "Delivery",
    description: "Food, packages, and more delivered to your door",
  },
  {
    id: "errands",
    name: "Errands",
    description: "Grocery shopping, pharmacy pickup, and other errands",
  },
  {
    id: "roadside",
    name: "Roadside Help",
    description: "Jump starts, tire changes, and fuel delivery",
  },
  {
    id: "moving",
    name: "Moving Help",
    description: "Furniture moving and home relocation assistance",
  },
];

export default function BookingForm() {
  const [selectedService, setSelectedService] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    // Removed async
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted", { selectedService, isEmergency }); // Added console log for now
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickup">Pickup Location</Label>
            <Input
              id="pickup"
              placeholder="Enter pickup address"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dropoff">Dropoff Location</Label>
            <Input
              id="dropoff"
              placeholder="Enter dropoff address"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="instructions">Special Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Add any special instructions or requirements"
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emergency"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="rounded border-gray-400"
          />
          <Label htmlFor="emergency" className="text-red-500">
            This is an emergency (Priority Service)
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-otw-red hover:bg-otw-gold hover:text-black transition-colors"
      >
        Book Now
      </Button>
    </form>
  );
}
