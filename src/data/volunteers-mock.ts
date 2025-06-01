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

export const featuredVolunteers: Volunteer[] = [
  {
    id: "vol1",
    name: "Aaliyah Johnson",
    area: "Downtown Fort Wayne",
    availability: "Weekends",
    contact: "aaliyah.j@otwvolunteers.org",
    photoUrl: "/assets/volunteers/aaliyah.jpg",
    quote: "Proud to serve my Fort Wayne community through OTW!",
    hoursServed: 127,
  },
  {
    id: "vol2",
    name: "Marcus Thompson",
    area: "Northeast Side",
    availability: "Evenings & Weekends",
    contact: "marcus.t@otwvolunteers.org",
    photoUrl: "/assets/volunteers/marcus.jpg",
    quote: "Every delivery makes a difference in someone's day.",
    hoursServed: 89,
  },
  {
    id: "vol3",
    name: "Carmen Rodriguez",
    area: "Southwest Fort Wayne",
    availability: "Flexible Schedule",
    contact: "carmen.r@otwvolunteers.org",
    photoUrl: "/assets/volunteers/carmen.jpg",
    quote: "Connecting our community one delivery at a time.",
    hoursServed: 156,
  },
];

export function getFeaturedVolunteers(): Volunteer[] {
  // In real app, fetch from database. Currently returns featured volunteers.
  return featuredVolunteers;
}
