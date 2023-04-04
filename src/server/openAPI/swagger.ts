import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import YAML from "yamljs";
import path from "path";

export function setupSwagger(app: Express): void {
  const apiSpecPath = path.join(__dirname, "./specification.yaml");
  const swaggerDocument = YAML.load(apiSpecPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
