import { startServer } from "./server";
import { checkEnvVar, readNumberEnv } from "src/util/env";
const port = checkEnvVar("PORT") ? readNumberEnv("PORT") : 3000;
startServer(port);
