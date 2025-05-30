import { calculateRoute, geocodeAddress, type Location } from "../maps";

export interface FeeCalculationOptions {
  baseFee?: number;
  perMileRate?: number;
  perMinuteRate?: number;
  priorityMultipliers?: {
    standard: number;
    express: number;
    rush: number;
  };
  minimumFee?: number;
  maximumFee?: number;
  freeDeliveryThreshold?: number;
}

export interface DeliveryEstimate {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  baseFee: number;
  distanceFee: number;
  timeFee: number;
  priorityFee: number;
  totalFee: number;
  isFreeDelivery: boolean;
  route: string; // Encoded polyline
}

export interface AddressValidationResult {
  isValid: boolean;
  formatted_address: string;
  location: {
    lat: number;
    lng: number;
  };
  place_id?: string;
  address_components: {
    street_number?: string;
    route?: string;
    locality?: string;
    administrative_area_level_1?: string;
    postal_code?: string;
    country?: string;
  };
}

const DEFAULT_OPTIONS: Required<FeeCalculationOptions> = {
  baseFee: 5.99,
  perMileRate: 1.5,
  perMinuteRate: 0.1,
  priorityMultipliers: {
    standard: 1,
    express: 1.5,
    rush: 2,
  },
  minimumFee: 3.99,
  maximumFee: 50.0,
  freeDeliveryThreshold: 35.0,
};

export class FeeCalculatorService {
  private options: Required<FeeCalculationOptions>;

  constructor(options: FeeCalculationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Validate and format an address using Google Places API
   */
  async validateAddress(address: string): Promise<AddressValidationResult> {
    try {
      const geocodeResult = await geocodeAddress(address);
      
      if (!geocodeResult) {
        return {
          isValid: false,
          formatted_address: address,
          location: { lat: 0, lng: 0 },
          address_components: {},
        };
      }
      
      // Parse address components
      const addressComponents: AddressValidationResult['address_components'] = {};
      geocodeResult.address_components.forEach(component => {
        if (component.types.includes('street_number')) {
          addressComponents.street_number = component.long_name;
        }
        if (component.types.includes('route')) {
          addressComponents.route = component.long_name;
        }
        if (component.types.includes('locality')) {
          addressComponents.locality = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          addressComponents.administrative_area_level_1 = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          addressComponents.postal_code = component.long_name;
        }
        if (component.types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });
      
      return {
        isValid: true,
        formatted_address: geocodeResult.formatted_address,
        location: {
          lat: geocodeResult.geometry.location.lat,
          lng: geocodeResult.geometry.location.lng,
        },
        place_id: geocodeResult.place_id,
        address_components: addressComponents,
      };
    } catch (error) {
      return {
        isValid: false,
        formatted_address: address,
        location: { lat: 0, lng: 0 },
        address_components: {},
      };
    }
  }

  /**
   * Calculate delivery fee based on route information
   */
  async calculateDeliveryFee(
    originAddress: string,
    destinationAddress: string,
    priority: keyof typeof DEFAULT_OPTIONS.priorityMultipliers = "standard",
    orderTotal?: number
  ): Promise<DeliveryEstimate> {
    try {
      // Geocode addresses
      const [originResult, destinationResult] = await Promise.all([
        geocodeAddress(originAddress),
        geocodeAddress(destinationAddress),
      ]);

      if (!originResult || !destinationResult) {
        throw new Error("Unable to geocode one or both addresses");
      }

      // Calculate route
      const route = await calculateRoute(
        { lat: originResult.geometry.location.lat, lng: originResult.geometry.location.lng },
        { lat: destinationResult.geometry.location.lat, lng: destinationResult.geometry.location.lng }
      );

      // Calculate fees
      const distanceInMiles = route.distance.value / 1609.34;
      const durationInMinutes = route.duration.value / 60;

      const baseFee = this.options.baseFee;
      const distanceFee = distanceInMiles * this.options.perMileRate;
      const timeFee = durationInMinutes * this.options.perMinuteRate;
      const priorityMultiplier = this.options.priorityMultipliers[priority];
      
      let totalFee = (baseFee + distanceFee + timeFee) * priorityMultiplier;
      const priorityFee = (baseFee + distanceFee + timeFee) * (priorityMultiplier - 1);

      // Apply minimum and maximum fee constraints
      totalFee = Math.max(totalFee, this.options.minimumFee);
      totalFee = Math.min(totalFee, this.options.maximumFee);

      // Check for free delivery
      const isFreeDelivery = orderTotal ? orderTotal >= this.options.freeDeliveryThreshold : false;
      if (isFreeDelivery) {
        totalFee = 0;
      }

      // Round to 2 decimal places
      totalFee = Math.round(totalFee * 100) / 100;

      return {
        distance: route.distance,
        duration: route.duration,
        baseFee: Math.round(baseFee * 100) / 100,
        distanceFee: Math.round(distanceFee * 100) / 100,
        timeFee: Math.round(timeFee * 100) / 100,
        priorityFee: Math.round(priorityFee * 100) / 100,
        totalFee,
        isFreeDelivery,
        route: route.polyline,
      };
    } catch (error) {
      console.error("Error calculating delivery fee:", error);
      throw new Error("Unable to calculate delivery fee. Please check the addresses and try again.");
    }
  }

  /**
   * Get estimated delivery time based on distance and current traffic
   */
  getEstimatedDeliveryTime(durationInSeconds: number, priority: keyof typeof DEFAULT_OPTIONS.priorityMultipliers = "standard"): string {
    const baseMinutes = Math.ceil(durationInSeconds / 60);
    
    // Add preparation time based on priority
    const preparationTime = {
      standard: 15,
      express: 10,
      rush: 5,
    };

    const totalMinutes = baseMinutes + preparationTime[priority];
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Update fee calculation options
   */
  updateOptions(newOptions: Partial<FeeCalculationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get current fee calculation options
   */
  getOptions(): Required<FeeCalculationOptions> {
    return { ...this.options };
  }
}

// Export a default instance
export const feeCalculator = new FeeCalculatorService();

// Export utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) {
    return `${Math.round(meters)} m`;
  } else if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  } else {
    return `${miles.toFixed(1)} mi`;
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
}