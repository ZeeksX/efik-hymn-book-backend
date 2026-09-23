import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';

const swaggerUi = require('swagger-ui-express');
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import errorHandler from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import routes from './routes';

const app: Express = express();

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.use(
  pinoHttp({
    logger,
    customProps: () => ({
      service: 'efik-hymn-book-backend',
    }),
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' } },
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ success: true, data: { name: 'Efik Hymn Book API', status: 'ready' } });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
