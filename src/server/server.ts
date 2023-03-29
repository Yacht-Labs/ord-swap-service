import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import * as OpenApiValidator from "express-openapi-validator";
import YAML from "yamljs";
import { setupSwagger } from "./swagger";

// Routes
import AccountsRoutes from "./routes/accounts/accounts.routes";
import ListingsRoutes from "./routes/listings/listings.routes";

// Load environment variables from .env file
dotenv.config();

const defaultPort = process.env.PORT || 3000;

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiSpecPath = path.join(__dirname, "../../openApi.yaml");
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

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  }
);

// Get port from environment or default to 3000

const startServer = (port?: number) => {
  const runningPort = port === 0 ? 0 : defaultPort;
  return app.listen(runningPort, () => {
    console.log(`Server is running on port ${runningPort}`);
  });
};

export default app;
export { startServer };

/*
I will need a route to create an account that contains a parameter ethAddress and saves the ethAddress to a new account.

I would like to automatically generate documentation using Swagger and the OpenAPI specification.  Please generate the openAPI specification for this endpoint and add the ability to start a swagger documentation server.  If possible, please have the code for the routes auto generated based on the open API specification
*/
