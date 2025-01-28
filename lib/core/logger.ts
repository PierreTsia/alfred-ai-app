export interface AppLogger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (
    message: string,
    error?: Error,
    meta?: Record<string, unknown>,
  ) => void;
}

export interface LoggerOptions {
  module: string;
  level?: "debug" | "info" | "warn" | "error";
}

/**
 * Creates a logger instance with module context
 */
export function createLogger(options: LoggerOptions): AppLogger {
  const { module, level = "info" } = options;
  const prefix = `[${module}]`;

  const shouldLog = (messageLevel: string): boolean => {
    const levels = ["debug", "info", "warn", "error"];
    return levels.indexOf(messageLevel) >= levels.indexOf(level);
  };

  return {
    debug: (message, meta) => {
      if (shouldLog("debug")) {
        console.debug(prefix, message, meta);
      }
    },
    info: (message, meta) => {
      if (shouldLog("info")) {
        console.info(prefix, message, meta);
      }
    },
    warn: (message, meta) => {
      if (shouldLog("warn")) {
        console.warn(prefix, message, meta);
      }
    },
    error: (message, error, meta) => {
      if (shouldLog("error")) {
        console.error(prefix, message, error, meta);
      }
    },
  };
}

export const defaultLogger: AppLogger = {
  debug: (message: string, meta?: any) => {
    // Disabled in production
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[PDF Processor] ${message}`, meta);
    }
  },
  info: (message: string, meta?: any) => {
    // Disabled in production
    if (process.env.NODE_ENV !== "production") {
      console.info(`[PDF Processor] ${message}`, meta);
    }
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[PDF Processor] ${message}`, meta);
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[PDF Processor] ${message}`, error, meta);
  },
};
