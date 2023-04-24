import path from "path";
import YAML from "yamljs";
import * as OpenApiValidator from "express-openapi-validator";

const isDevelopment = process.env.NODE_ENV === "dev";
const relativePath = isDevelopment
  ? "./specification.yaml"
  : "../../../../src/server/openAPI/specification.yaml";

const apiSpecPath = path.join(__dirname, relativePath);

const swaggerDoc = YAML.load(apiSpecPath);

export const openApiMiddleware = OpenApiValidator.middleware({
  apiSpec: swaggerDoc,
  validateRequests: true,
  validateResponses: false,
  ignorePaths: /\/docs.*|\/favicon.ico/,
});

export { setupSwagger } from "./swagger";
