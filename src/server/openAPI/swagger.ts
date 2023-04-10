import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import YAML from "yamljs";
import path from "path";

export function setupSwagger(app: Express): void {
  const isDevelopment = process.env.NODE_ENV === "dev";
  const relativePath = isDevelopment
    ? "./specification.yaml"
    : "../../../../src/server/openAPI/specification.yaml";

  const apiSpecPath = path.join(__dirname, relativePath);
  const swaggerDocument = YAML.load(apiSpecPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
