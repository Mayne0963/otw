import { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../../lib/services/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Try to get restaurant info and menu from database
        const restaurant = await databaseService.getRestaurant(id as string);
        const menuData = await databaseService.getMenuItems(id as string);

        // TODO: Remove static data fallback - all data should come from database
        // If no menu data in database, menuData will remain empty

        if (restaurant || menuData.length > 0) {
          res.status(200).json({
            success: true,
            data: {
              restaurant: restaurant || { id, name: 'Restaurant' },
              menu: menuData
            }
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Restaurant or menu not found'
          });
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch menu'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
