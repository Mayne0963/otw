// Environment variables configuration with validation
export const env = {
  // API Keys
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  
  // External API Keys
  DOCUMENU_API_KEY: process.env.DOCUMENU_API_KEY || "",
  ZOMATO_API_KEY: process.env.ZOMATO_API_KEY || "",
  YELP_API_KEY: process.env.YELP_API_KEY || "",
  KROGER_CLIENT_ID: process.env.KROGER_CLIENT_ID || "",
  KROGER_CLIENT_SECRET: process.env.KROGER_CLIENT_SECRET || "",
  BESTBUY_API_KEY: process.env.BESTBUY_API_KEY || "",

  // Firebase Configuration
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",

  // Application Settings
  WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://ontheway.com",
  AGE_VERIFICATION_EXPIRY_DAYS: Number.parseInt(
    process.env.AGE_VERIFICATION_EXPIRY_DAYS || "30",
  ),

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
};

// Validate required environment variables
export function validateEnv() {
  const requiredVars = [
    "GOOGLE_MAPS_API_KEY",
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    // External APIs are optional for now
    // "DOCUMENU_API_KEY",
    // "ZOMATO_API_KEY", 
    // "YELP_API_KEY",
    // "KROGER_CLIENT_ID",
    // "BESTBUY_API_KEY",
  ];

  const missingVars = requiredVars.filter((key) => {
    const envKey = key.startsWith("FIREBASE_") ? `NEXT_PUBLIC_${key}` : key;
    return !process.env[envKey];
  });

  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
    return false;
  }

  return true;
}
