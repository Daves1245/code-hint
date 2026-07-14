import pino from "pino";
import { loadCredentials } from "./credentials";

const { logger } = loadCredentials();

export const log = pino({
  level: logger.level,
});
