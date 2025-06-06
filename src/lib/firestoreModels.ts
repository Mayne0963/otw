import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

// User roles
enum UserRole {
  Guest = 'guest',
  Member = 'member',
  Admin = 'admin',
  PartnerAdmin = 'partner-admin',
}

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  rewardPoints: z.number().int().default(0),
  orderHistory: z.array(z.string()).default([]), // order IDs
});
export type User = z.infer<typeof userSchema>;

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  image: z.string().url().optional(),
  type: z.enum(['classic', 'infused']),
  source: z.enum(['broskis', 'partner']),
});
export type MenuItem = z.infer<typeof menuItemSchema>;

export const orderSchema = z.object({
  id: z.string().optional(),
  userRef: z.string(), // user UID
  cart: z.array(menuItemSchema),
  total: z.number(),
  status: z.enum(['pending', 'paid', 'fulfilled', 'cancelled']),
  stripeId: z.string().optional(),
  createdAt: z.date(),
});
export type Order = z.infer<typeof orderSchema>;

export const rewardSchema = z.object({
  userId: z.string(),
  spinsUsed: z.number().int().default(0),
  spinsRemaining: z.number().int().default(1),
  lastSpinTime: z.date().optional(),
  prizeHistory: z
    .array(
      z.object({
        prize: z.string(),
        date: z.date(),
      }),
    )
    .default([]),
});
export type Reward = z.infer<typeof rewardSchema>;

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  categories: MenuCategory[];
  items: MenuItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
