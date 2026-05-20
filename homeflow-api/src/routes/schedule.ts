import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

export const scheduleRouter = Router();
scheduleRouter.use(authenticate);

scheduleRouter.get('/appointments', async (_req, res) => {
  // TODO: return user's appointments from DB
  res.json({ success: true, data: [] });
});

scheduleRouter.post('/appointments', async (req, res) => {
  // TODO: create appointment, sync to calendar
  res.status(201).json({ success: true, data: { id: 'new-appt-id', ...req.body } });
});

scheduleRouter.put('/appointments/:id', async (req, res) => {
  res.json({ success: true, data: req.body });
});

scheduleRouter.delete('/appointments/:id', async (req, res) => {
  res.json({ success: true });
});

scheduleRouter.post('/itinerary/optimize', async (req, res) => {
  // TODO: call Google Maps Routes API for optimization
  const { propertyIds, date } = req.body;
  res.json({
    success: true,
    data: {
      optimizedOrder: propertyIds,
      totalDriveMinutes: 45,
      totalMiles: 18,
      stops: [],
    },
  });
});
