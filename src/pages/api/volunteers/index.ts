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
        // Try to get from database first
        let volunteerData = await databaseService.getVolunteers();

        // TODO: Remove static data fallback - all data should come from database
        // If no data in database, volunteerData will remain empty

        res.status(200).json({
          success: true,
          data: volunteerData,
          count: volunteerData.length
        });
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch volunteer opportunities'
        });
      }
      break;

    case 'POST':
      try {
        const volunteerData = req.body;
        const id = await databaseService.createVolunteer(volunteerData);
        
        if (id) {
          res.status(201).json({
            success: true,
            data: { id, ...volunteerData }
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create volunteer opportunity'
          });
        }
      } catch (error) {
        console.error('Error creating volunteer opportunity:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create volunteer opportunity'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}