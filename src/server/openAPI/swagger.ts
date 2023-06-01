import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import YAML from "yamljs";
import path from "path";
import { isLocal } from "../../utils/env";

export function setupSwagger(app: Express): void {
  const relativePath = isLocal()
    ? "./specification.yaml"
    : "../../../../src/server/openAPI/specification.yaml";

  const apiSpecPath = path.join(__dirname, relativePath);
  const swaggerDocument = YAML.load(apiSpecPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
