export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  tier?: "free" | "silver" | "gold" | "platinum";
  tierExpiryDate?: Date;
  volunteerHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierMembership {
  id: string;
  userId: string;
  tier: "silver" | "gold" | "platinum";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Volunteer {
  id: string;
  userId: string;
  hours: number;
  activities: {
    id: string;
    type: string;
    hours: number;
    date: Date;
    description: string;
  }[];
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tracking {
  id: string;
  userId: string;
  type: "delivery" | "service" | "volunteer";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedArrival?: Date;
  actualArrival?: Date;
  createdAt: Date;
  updatedAt: Date;
}
