import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { propertiesRouter } from './routes/properties';
import { scheduleRouter } from './routes/schedule';
import { journeyRouter } from './routes/journey';
import { chatRouter } from './routes/chat';
import { usersRouter } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';

const app = express();
const PORT = process.env.PORT ?? 4000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parsing & compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trimEnd()) },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/journey', journeyRouter);
app.use('/api/chat', chatRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`HomeFlow API running on http://localhost:${PORT}`);
});

export default app;
