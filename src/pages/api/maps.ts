import type { NextApiRequest, NextApiResponse } from "next";

interface MapAvailabilityResponse {
  hasApiKey: boolean;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapAvailabilityResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ hasApiKey: false });
  }

  try {
    // Check if Google Maps API keys are configured
    const hasServerKey = !!process.env.GOOGLE_MAPS_SERVER_API_KEY;
    const hasClientKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Maps are available if at least one API key is configured
    const hasApiKey = hasServerKey || hasClientKey;
    
    res.status(200).json({ hasApiKey });
  } catch (error) {
    console.error("Error checking map availability:", error);
    res.status(500).json({ hasApiKey: false });
  }
}