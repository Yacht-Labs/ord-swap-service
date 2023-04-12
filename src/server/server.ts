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

// Load environment variables from .env file
dotenv.config();

const defaultPort = process.env.PORT || 3001;

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
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
app.use("/", (req, res, next) => {
  res.sendStatus(200);
});
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
  const runningPort = port ? port : defaultPort;
  return app.listen(runningPort, () => {
    console.log(`Server is running on port ${runningPort}`);
  });
};

export default app;
export { startServer };
