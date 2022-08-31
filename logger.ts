import winston from "winston";
import expressWinston from "express-winston";

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const transport = new winston.transports.Console({
  level: dev ? "debug" : "info",
});

const prettyJson = winston.format.printf((info) => {
  if (info.message.constructor === Object) {
    info.message = JSON.stringify(info.message, null, 4);
  }
  return `${info.level}: ${info.message}`;
});

const log_format = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.splat(),
  prettyJson
);

export const loggerMiddleware = expressWinston.logger({
  level: dev ? "debug" : "info",
  transports: [transport],
  format: log_format,
  meta: false, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});

export const logger = winston.createLogger({
  transports: [transport],
  format: log_format,
});
