export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  priceLevel: string;
  deliveryFee: number;
  deliveryTime: string;
  distance: number;
  isPartner: boolean;
  dietaryOptions?: string[];
  features?: string[];
  featured?: boolean;
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Sample Restaurant',
    description: 'A sample restaurant description',
    rating: 4.5,
    reviewCount: 100,
    categories: ['italian', 'pizza'],
    priceLevel: '$$',
    deliveryFee: 2.99,
    deliveryTime: '30-45',
    distance: 1.5,
    isPartner: true,
  },
];

export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  return restaurants.filter((r) => r.featured);
}
