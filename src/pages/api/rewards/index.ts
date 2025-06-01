import type { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../lib/services/database';
import { rewards } from '../../../data/rewards-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { category, available, limit } = req.query;
        
        // Try to get from database first
        let rewardData = await databaseService.getRewards({
          category: category as string,
          available: available === 'true' ? true : available === 'false' ? false : undefined,
          limit: limit ? parseInt(limit as string) : undefined
        });

        // If no data in database, use static data as fallback
        if (rewardData.length === 0) {
          rewardData = rewards.filter(reward => {
            if (category && reward.category !== category) {
              return false;
            }
            if (available !== undefined && reward.available !== (available === 'true')) {
              return false;
            }
            return true;
          });

          if (limit) {
            rewardData = rewardData.slice(0, parseInt(limit as string));
          }
        }

        res.status(200).json({
          success: true,
          data: rewardData,
          count: rewardData.length
        });
      } catch (error) {
        console.error('Error fetching rewards:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch rewards'
        });
      }
      break;

    case 'POST':
      try {
        const rewardData = req.body;
        const id = await databaseService.createReward(rewardData);
        
        if (id) {
          res.status(201).json({
            success: true,
            data: { id, ...rewardData }
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create reward'
          });
        }
      } catch (error) {
        console.error('Error creating reward:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create reward'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}