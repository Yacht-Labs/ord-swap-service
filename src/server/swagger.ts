import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import YAML from "yamljs";

export function setupSwagger(app: Express): void {
  const swaggerDocument = YAML.load("./openapi.yaml");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
