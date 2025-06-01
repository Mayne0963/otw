import type { NextApiRequest, NextApiResponse } from 'next';
import { databaseService } from '../../../lib/services/database';
import { events } from '../../../data/event-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { category, featured, upcoming, limit } = req.query;
        
        // Try to get from database first
        let eventData = await databaseService.getEvents({
          category: category as string,
          featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
          upcoming: upcoming === 'true' ? true : undefined,
          limit: limit ? parseInt(limit as string) : undefined
        });

        // If no data in database, use static data as fallback
        if (eventData.length === 0) {
          eventData = events.filter(event => {
            if (category && event.category !== category) {
              return false;
            }
            if (featured !== undefined && event.featured !== (featured === 'true')) {
              return false;
            }
            if (upcoming === 'true') {
              const today = new Date().toISOString().split('T')[0];
              if (event.date < today) {
                return false;
              }
            }
            return true;
          });

          if (limit) {
            eventData = eventData.slice(0, parseInt(limit as string));
          }
        }

        res.status(200).json({
          success: true,
          data: eventData,
          count: eventData.length
        });
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch events'
        });
      }
      break;

    case 'POST':
      try {
        const eventData = req.body;
        const id = await databaseService.createEvent(eventData);
        
        if (id) {
          res.status(201).json({
            success: true,
            data: { id, ...eventData }
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create event'
          });
        }
      } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create event'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}