import express, { Request, Response, NextFunction } from "express";
import Logger from "./utils/Logger";
import cors from "cors";
import { corsUrl, environment } from "./config";
import {
  NotFoundError,
  ApiError,
  InternalError,
  ErrorType,
} from "./utils/ApiError";
import routes from "./modules";
import authRoutes from "./modules/auth/routes";
import rateLimit from 'express-rate-limit';

process.on("uncaughtException", (e) => {
  Logger.error(e);
});

const app = express();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }),
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// Apply rate limiting
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', routes);

// Error handling
app.use((req, res, next) => next(new NotFoundError()));

app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL) {
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      );
    }
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    Logger.error(err);
    if (environment === "development") {
      res.status(500).json({ 
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: err.message
        }
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      });
    }
  }
});

export default app;
