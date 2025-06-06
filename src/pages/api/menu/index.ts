import { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../lib/services/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { restaurantId, category, popular, limit } = req.query;
        
        // Try to get from database first
        let menuData = await databaseService.getMenuItems(
          restaurantId as string,
          category as string,
          popular === 'true' // Pass popular filter to database service
        );

        // TODO: Remove static data fallback - all data should come from database
        // If no data in database, return empty array (menuData already empty)
        
        if (limit && menuData.length > 0) {
          menuData = menuData.slice(0, parseInt(limit as string));
        }

        res.status(200).json({
          success: true,
          data: menuData,
          count: menuData.length
        });
      } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch menu items'
        });
      }
      break;

    case 'POST':
      try {
        const menuItemData = req.body;
        const id = await databaseService.createMenuItem(menuItemData);
        
        if (id) {
          res.status(201).json({
            success: true,
            data: { id, ...menuItemData }
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create menu item'
          });
        }
      } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create menu item'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}