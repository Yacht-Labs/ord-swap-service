import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { logger } from "../../utils/logger";

export const configureExpress = (app: express.Application) => {
  app.use(cors());
  app.use(helmet());
  app.use(
    morgan(
      (tokens, req: express.Request, res: express.Response) => {
        const logData = {
          timestamp: tokens.date(req, res, "iso"),
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: tokens.status(req, res),
          responseTime: tokens["response-time"](req, res),
          requestBody: JSON.stringify(req.body),
        };

        return JSON.stringify(logData);
      },
      {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
      }
    )
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
};
