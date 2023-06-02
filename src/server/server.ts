import express from "express";
import apicache from "apicache";
import dotenv from "dotenv";
import { setupSwagger } from "./openAPI/swagger";

// Routes
import AccountsRoutes from "./routes/accounts/accounts.routes";
import ListingsRoutes from "./routes/listings/listings.routes";
import SwapdataRoutes from "./routes/swapdata/swapdata.routes";
import { logger } from "../utils/logger";

import { configureExpress } from "./config";
import { openApiMiddleware } from "./openAPI/openApi";
import {
  appErrorHandler,
  unhandledErrorHandler,
} from "./middleware/errorHandlers";
import { read } from "fs";
import { readServerPort } from "../utils/env";

// Load environment variables from .env file
dotenv.config();

let defaultPort: number;
try {
  defaultPort = readServerPort();
} catch (e) {
  logger.error(
    "Invalid server port number in .env file. Using default port 3001"
  );
  defaultPort = 3001;
}

// Initialize express app
const app = express();
configureExpress(app);

// Set up OpenAPI Validator middleware
app.use(openApiMiddleware);
setupSwagger(app);

const cache = apicache.middleware;
app.use(cache("10 minutes"));

app.use("/accounts", AccountsRoutes);
app.use("/listings", ListingsRoutes);
app.use("/swapdata", SwapdataRoutes);
app.use("/", (req, res) => {
  return res.sendStatus(200);
});

// Error handling middleware
app.use(appErrorHandler);
app.use(unhandledErrorHandler);

const startServer = (port?: number) => {
  const runningPort = port ? port : defaultPort;
  return app.listen(runningPort, () => {
    logger.info(`Server is running on port ${runningPort}`);
  });
};

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // You can exit the process or perform other actions here.
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // You can exit the process or perform other actions here.
});

export default app;
export { startServer };
