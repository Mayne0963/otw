import type { Location } from "../types/location";

export const locationData: Location[] = [
  {
    id: "1",
    name: "Broski's Kitchen - Downtown",
    address: "123 Main Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90012",
    phone: "(555) 123-4567",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    hours: [
      { day: "Monday", hours: "11:00 AM - 10:00 PM" },
      { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
      { day: "Friday", hours: "11:00 AM - 11:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
      { day: "Sunday", hours: "10:00 AM - 9:00 PM" }
    ],
    features: ["Dine-in", "Takeout", "Delivery", "Parking Available", "WiFi"]
  },
  {
    id: "2",
    name: "Broski's Kitchen - Beverly Hills",
    address: "456 Rodeo Drive",
    city: "Beverly Hills",
    state: "CA",
    zipCode: "90210",
    phone: "(555) 234-5678",
    coordinates: {
      lat: 34.0736,
      lng: -118.4004
    },
    hours: [
      { day: "Monday", hours: "11:00 AM - 10:00 PM" },
      { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
      { day: "Friday", hours: "11:00 AM - 11:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
      { day: "Sunday", hours: "10:00 AM - 9:00 PM" }
    ],
    features: ["Dine-in", "Takeout", "Delivery", "Valet Parking", "WiFi", "Private Dining"]
  },
  {
    id: "3",
    name: "Broski's Kitchen - Santa Monica",
    address: "789 Ocean Avenue",
    city: "Santa Monica",
    state: "CA",
    zipCode: "90401",
    phone: "(555) 345-6789",
    coordinates: {
      lat: 34.0195,
      lng: -118.4912
    },
    hours: [
      { day: "Monday", hours: "11:00 AM - 10:00 PM" },
      { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
      { day: "Friday", hours: "11:00 AM - 11:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
      { day: "Sunday", hours: "10:00 AM - 9:00 PM" }
    ],
    features: ["Dine-in", "Takeout", "Delivery", "Beach View", "WiFi", "Outdoor Seating"]
  }
];