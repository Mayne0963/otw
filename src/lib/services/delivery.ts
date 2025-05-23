import { firestore } from "../firebaseAdmin";
import { calculateRoute, geocodeAddress, type Location } from "../maps";
import { createCheckoutSession } from "../stripe";
import { z } from "zod";

// Validation schemas
export const deliveryAddressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  instructions: z.string().optional(),
});

export const deliveryRequestSchema = z.object({
  pickupAddress: deliveryAddressSchema,
  dropoffAddress: deliveryAddressSchema,
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    }),
  ),
  scheduledTime: z.string().datetime().optional(),
  priority: z.enum(["standard", "express", "rush"]),
  contactPhone: z.string().regex(/^\+?1?\d{10}$/),
});

// Delivery pricing
const PRICING = {
  BASE_FEE: 5.99,
  PER_MILE_RATE: 1.5,
  PRIORITY_MULTIPLIERS: {
    standard: 1,
    express: 1.5,
    rush: 2,
  },
};

export interface DeliveryEstimate {
  distance: number;
  duration: number;
  fee: number;
  route: string; // Encoded polyline
}

export async function estimateDelivery(
  pickupAddress: string,
  dropoffAddress: string,
  priority: keyof typeof PRICING.PRIORITY_MULTIPLIERS,
): Promise<DeliveryEstimate> {
  // Geocode addresses
  const [pickup, dropoff] = await Promise.all([
    geocodeAddress(pickupAddress),
    geocodeAddress(dropoffAddress),
  ]);

  // Calculate route
  const route = await calculateRoute(
    { lat: pickup.lat, lng: pickup.lng },
    { lat: dropoff.lat, lng: dropoff.lng },
  );

  // Calculate fee
  const distanceMiles = route.distance.value / 1609.34; // Convert meters to miles
  const baseFee = PRICING.BASE_FEE + distanceMiles * PRICING.PER_MILE_RATE;
  const fee = baseFee * PRICING.PRIORITY_MULTIPLIERS[priority];

  return {
    distance: route.distance.value,
    duration: route.duration.value,
    fee: Math.round(fee * 100) / 100, // Round to 2 decimal places
    route: route.polyline,
  };
}

export async function createDeliveryRequest(
  userId: string,
  request: z.infer<typeof deliveryRequestSchema>,
) {
  // Validate request
  const validatedRequest = deliveryRequestSchema.parse(request);

  // Get delivery estimate
  const estimate = await estimateDelivery(
    formatAddress(validatedRequest.pickupAddress),
    formatAddress(validatedRequest.dropoffAddress),
    validatedRequest.priority,
  );

  // Calculate total cost including items
  const itemsTotal = validatedRequest.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = itemsTotal + estimate.fee;

  // Create Stripe checkout session
  const session = await createCheckoutSession({
    userId,
    items: [
      ...validatedRequest.items,
      {
        name: `Delivery Fee (${validatedRequest.priority})`,
        price: estimate.fee,
        quantity: 1,
      },
    ],
    metadata: {
      type: "delivery",
      priority: validatedRequest.priority,
      pickupAddress: formatAddress(validatedRequest.pickupAddress),
      dropoffAddress: formatAddress(validatedRequest.dropoffAddress),
    },
  });

  // Store delivery request
  const deliveryRef = firestore.collection("deliveries").doc();
  await deliveryRef.set({
    userId,
    status: "pending_payment",
    request: validatedRequest,
    estimate,
    stripeSessionId: session.id,
    total,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    deliveryId: deliveryRef.id,
    checkoutUrl: session.url,
    estimate,
    total,
  };
}

export async function getDeliveryStatus(deliveryId: string) {
  const doc = await firestore.collection("deliveries").doc(deliveryId).get();
  if (!doc.exists) {
    throw new Error("Delivery not found");
  }
  return doc.data();
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status:
    | "pending_payment"
    | "paid"
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled",
  updates: Partial<{
    driverId: string;
    currentLocation: Location;
    estimatedArrival: Date;
    actualArrival: Date;
    notes: string;
  }> = {},
) {
  const ref = firestore.collection("deliveries").doc(deliveryId);
  await ref.update({
    status,
    ...updates,
    updatedAt: new Date(),
  });
}

// Helper function to format address
function formatAddress(address: z.infer<typeof deliveryAddressSchema>): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}
