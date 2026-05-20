// src/routes/auth.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

export const authRouter = Router();

authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('displayName').trim().isLength({ min: 2 }),
  ],
  validate,
  async (_req, res) => {
    // TODO: implement with Prisma + bcrypt + JWT
    res.json({ success: true, message: 'User registered' });
  },
);

authRouter.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  async (_req, res) => {
    // TODO: verify credentials, return JWT
    res.json({ success: true, data: { token: 'mock-jwt-token', user: {} } });
  },
);

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true });
});

authRouter.post('/refresh', (_req, res) => {
  // TODO: refresh JWT
  res.json({ success: true, data: { token: 'new-mock-token' } });
});

authRouter.post('/oauth/google', async (_req, res) => {
  // TODO: verify Google OAuth token
  res.json({ success: true, data: { token: 'mock-jwt', user: {} } });
});

authRouter.post('/oauth/apple', async (_req, res) => {
  // TODO: verify Apple OAuth token
  res.json({ success: true, data: { token: 'mock-jwt', user: {} } });
});
