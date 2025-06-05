import { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '@/lib/services/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { city, state, featured, limit } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (state) filters.state = state as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      if (limit) filters.limit = parseInt(limit as string);
      
      const locations = await databaseService.getLocations(filters);
      res.status(200).json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  } else if (req.method === 'POST') {
    try {
      const locationId = await databaseService.createLocation(req.body);
      if (locationId) {
        const location = await databaseService.getLocation(locationId);
        res.status(201).json(location);
      } else {
        res.status(500).json({ error: 'Failed to create location' });
      }
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({ error: 'Failed to create location' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}