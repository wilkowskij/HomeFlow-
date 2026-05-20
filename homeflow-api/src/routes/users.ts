import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id ?? 'guest';
    const user = {
      id: userId,
      email: 'user@example.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      avatarUrl: null,
      buyerProfile: {
        locations: ['Freehold, NJ', 'Marlboro, NJ', 'Howell, NJ'],
        budgetMin: 400000,
        budgetMax: 600000,
        timeline: 'WITHIN_6_MONTHS',
        bedrooms: { min: 3, max: 4 },
        bathrooms: { min: 2, max: null },
        propertyTypes: ['SINGLE_FAMILY', 'TOWNHOUSE'],
        mustHaves: ['GOOD_SCHOOLS', 'COMMUTE_UNDER_30', 'YARD'],
        preApprovalStatus: 'APPROVED',
        preApprovalAmount: 575000,
      },
      preferences: {
        notifications: { push: true, email: true, sms: false },
        searchAlerts: true,
        theme: 'light',
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/me - Update profile
router.patch('/me', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    res.json({
      success: true,
      data: { ...updates, updatedAt: new Date().toISOString() },
      message: 'Profile updated',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// PATCH /api/users/me/buyer-profile - Update buyer profile
router.patch('/me/buyer-profile', async (req: Request, res: Response) => {
  try {
    const profileUpdates = req.body;
    res.json({
      success: true,
      data: { ...profileUpdates, updatedAt: new Date().toISOString() },
      message: 'Buyer profile updated',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update buyer profile' });
  }
});

// GET /api/users/me/saved-homes - Get saved homes
router.get('/me/saved-homes', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: [], message: 'Saved homes fetched' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch saved homes' });
  }
});

// POST /api/users/me/saved-homes/:propertyId - Save a home
router.post('/me/saved-homes/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    res.json({ success: true, data: { propertyId, savedAt: new Date().toISOString() }, message: 'Home saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save home' });
  }
});

// DELETE /api/users/me/saved-homes/:propertyId - Remove saved home
router.delete('/me/saved-homes/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    res.json({ success: true, data: { propertyId }, message: 'Home removed from saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove saved home' });
  }
});

// DELETE /api/users/me - Delete account
router.delete('/me', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Account deletion scheduled' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

export default router;
