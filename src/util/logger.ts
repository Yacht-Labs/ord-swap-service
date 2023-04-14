import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp, metadata = {} }) => {
  const metadataString =
    Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
  return `${timestamp} [${level}] ${message}${metadataString}`;
});

const logger = createLogger({
  level: "info", // Set your desired log level
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new transports.Console(),
    // You can add more transports, like File or Http, as needed
  ],
});

export default logger;
