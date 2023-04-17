import { startServer } from "./server";
import { checkEnvVar, readNumberEnv } from "../utils/env";
const port = checkEnvVar("PORT") ? readNumberEnv("PORT") : 3000;
startServer(port);
