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

process.on("uncaughtException", (e) => {
  Logger.error(e);
});

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }),
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

app.use("/", routes);

app.use((req, res, next) => next(new NotFoundError()));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      res.status(500).json({ error: err.message });
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
