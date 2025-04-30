import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, context }) => {
    return `${timestamp} [${level.toUpperCase()}] ${context ? `[${context}]` : ''}: ${message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console(),
    // File transport for persistent logs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Helper functions for more readable logging
export const logInfo = (message: string, context?: string) => {
  logger.info(message, { context });
};

export const logError = (message: string, error?: Error, context?: string) => {
  if (error) {
    logger.error(`${message}: ${error.message}\n${error.stack}`, { context });
  } else {
    logger.error(message, { context });
  }
};

export const logWarning = (message: string, context?: string) => {
  logger.warn(message, { context });
};

export const logDebug = (message: string, context?: string) => {
  logger.debug(message, { context });
};

export const logAction = (action: string, element?: string, context?: string) => {
  logger.info(`Action: ${action}${element ? ` on element: ${element}` : ''}`, { context });
};

export default logger;