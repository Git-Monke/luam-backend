const { createLogger, transports, format } = require("winston");

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const serverLogger = createLogger({
  format: format.combine(format.colorize(), format.timestamp(), myFormat),
  transports: [
    new transports.File({
      filename: "logs/server.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.Console(),
  ],
});

module.exports = serverLogger;
