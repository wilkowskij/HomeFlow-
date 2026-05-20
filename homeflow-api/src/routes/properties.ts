import { Router, Request, Response } from 'express';
import { query, param } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

export const propertiesRouter = Router();

// GET /api/properties — search with filters
propertiesRouter.get(
  '/',
  [
    query('query').optional().isString(),
    query('priceMin').optional().isNumeric(),
    query('priceMax').optional().isNumeric(),
    query('bedsMin').optional().isInt({ min: 1 }),
    query('bathsMin').optional().isFloat({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  async (req: Request, res: Response) => {
    // TODO: query MLS data source / database
    res.json({
      success: true,
      data: [],
      total: 0,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      hasMore: false,
    });
  },
);

// GET /api/properties/recommendations — AI-personalized feed
propertiesRouter.get(
  '/recommendations',
  authenticate,
  async (_req: Request, res: Response) => {
    // TODO: call AI service for personalized recommendations
    res.json({ success: true, data: [] });
  },
);

// GET /api/properties/:id
propertiesRouter.get(
  '/:id',
  [param('id').isString()],
  validate,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: fetch from database
    res.json({ success: true, data: { id } });
  },
);

// GET /api/properties/:id/availability — open house / viewing slots
propertiesRouter.get(
  '/:id/availability',
  [param('id').isString()],
  validate,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: fetch slots from calendar integration
    res.json({ success: true, data: [] });
  },
);

// GET /api/properties/:id/neighborhood — neighborhood intel
propertiesRouter.get(
  '/:id/neighborhood',
  [param('id').isString()],
  validate,
  async (req: Request, res: Response) => {
    res.json({ success: true, data: {} });
  },
);
