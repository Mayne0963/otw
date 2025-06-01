import type { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../lib/services/database';
import { menuItems } from '../../../data/menu-data';

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
          category as string
        );

        // If no data in database, use static data as fallback
        if (menuData.length === 0) {
          menuData = menuItems.filter(item => {
            if (restaurantId && item.restaurantId && item.restaurantId !== restaurantId) {
              return false;
            }
            if (category && item.category !== category) {
              return false;
            }
            if (popular === 'true' && !item.popular) {
              return false;
            }
            return true;
          }).map(item => ({
            ...item,
            restaurantId: restaurantId as string || 'broskis-kitchen'
          }));

          if (limit) {
            menuData = menuData.slice(0, parseInt(limit as string));
          }
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