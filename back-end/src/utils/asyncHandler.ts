/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";

type AsyncController<T = any> = (req: Request, res: Response) => Promise<T>;

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const asyncHandler =
  <T = any>(controller: AsyncController<T>): AsyncMiddleware =>
  async (req, res, next) => {
    try {
      await controller(req, res);
    } catch (error: unknown) {
      next(error);
    }
  };

export { asyncHandler };
