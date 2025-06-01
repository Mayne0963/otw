import type { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../lib/services/database';
import { restaurants } from '../../../data/restaurants-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { category, featured, isPartner, limit } = req.query;
        
        // Try to get from database first
        let restaurantData = await databaseService.getRestaurants({
          category: category as string,
          featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
          isPartner: isPartner === 'true' ? true : isPartner === 'false' ? false : undefined,
          limit: limit ? parseInt(limit as string) : undefined
        });

        // If no data in database, use static data as fallback
        if (restaurantData.length === 0) {
          restaurantData = restaurants.filter(restaurant => {
            if (category && category !== 'all' && !restaurant.categories.includes(category as string)) {
              return false;
            }
            if (featured !== undefined && restaurant.featured !== (featured === 'true')) {
              return false;
            }
            if (isPartner !== undefined && restaurant.isPartner !== (isPartner === 'true')) {
              return false;
            }
            return true;
          });

          if (limit) {
            restaurantData = restaurantData.slice(0, parseInt(limit as string));
          }
        }

        res.status(200).json({
          success: true,
          data: restaurantData,
          count: restaurantData.length
        });
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch restaurants'
        });
      }
      break;

    case 'POST':
      try {
        const restaurantData = req.body;
        const id = await databaseService.createRestaurant(restaurantData);
        
        if (id) {
          res.status(201).json({
            success: true,
            data: { id, ...restaurantData }
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create restaurant'
          });
        }
      } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create restaurant'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}