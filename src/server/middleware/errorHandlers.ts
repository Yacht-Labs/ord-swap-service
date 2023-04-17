import { ValidationError } from "express-openapi-validator/dist/framework/types";
import { AppError } from "../../types/errors";
import { logger } from "../../utils/logger";
import express from "express";

export const appErrorHandler: express.ErrorRequestHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      errorType: err.constructor.name,
      statusCode: err.statusCode,
      message: err.message,
    });
    res.status(err.statusCode).json({ error: err.message });
  } else {
    // If it's not an AppError, pass the error to the next middleware
    next(err);
  }
};

export const unhandledErrorHandler: express.ErrorRequestHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errorDetails = {
    errorType: err.name,
    message: err.message,
    method: req.method,
    path: req.path,
  };

  const logDetails = {
    ...errorDetails,
    message: `UnhandledError: ${err.message}`,
  };

  logger.error(logDetails);

  res
    .status(500)
    .json({ error: err.message || "An unexpected error occurred" });
  next();
};
