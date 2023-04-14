import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import * as OpenApiValidator from "express-openapi-validator";
import YAML from "yamljs";
import { setupSwagger } from "./openAPI/swagger";

// Routes
import AccountsRoutes from "./routes/accounts/accounts.routes";
import ListingsRoutes from "./routes/listings/listings.routes";
import { AppError } from "../types/errors";
import logger from "../util/logger";

// Load environment variables from .env file
dotenv.config();

const defaultPort = process.env.PORT || 3001;

// Initialize express app
const app = express();

// Middleware
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

const isDevelopment = process.env.NODE_ENV === "dev";
const relativePath = isDevelopment
  ? "./openAPI/specification.yaml"
  : "../../../src/server/openAPI/specification.yaml";

const apiSpecPath = path.join(__dirname, relativePath);

const swaggerDoc = YAML.load(apiSpecPath);
app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDoc,
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /\/docs.*/,
  })
);

// Use routes
app.use("/accounts", AccountsRoutes);
app.use("/listings", ListingsRoutes);
setupSwagger(app);
app.use("/", (req, res, next) => {
  return res.sendStatus(200);
});

// Error handling middleware
app.use(
  (
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
      logger.error(`UnhandledError: ${err.message}`, {
        errorType: err.constructor.name,
        message: err.message,
      });
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
);

// Get port from environment or default to 3000

const startServer = (port?: number) => {
  const runningPort = port ? port : defaultPort;
  return app.listen(runningPort, () => {
    console.log(`Server is running on port ${runningPort}`);
  });
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // You can exit the process or perform other actions here.
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // You can exit the process or perform other actions here.
});

export default app;
export { startServer };
