export interface Volunteer {
  id: string;
  name: string;
  area: string;
  availability: string;
  contact: string;
  photoUrl?: string;
  quote?: string;
  hoursServed: number;
}

export const mockVolunteers: Volunteer[] = [
  {
    id: "vol1",
    name: "Aaliyah Johnson",
    area: "Downtown",
    availability: "Weekends",
    contact: "aaliyah@email.com",
    photoUrl: "/assets/logos/broskis-logo.jpg",
    quote: "I love giving back to my city!",
    hoursServed: 42,
  },
  {
    id: "vol2",
    name: "Marcus Lee",
    area: "North Side",
    availability: "Evenings",
    contact: "marcus@email.com",
    hoursServed: 18,
  },
];

export function getFeaturedVolunteers(): Volunteer[] {
  // In real app, fetch from DB. Here, return mock.
  return mockVolunteers;
} 