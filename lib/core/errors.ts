/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: string,
    public readonly module?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      module: this.module,
    };
  }
}

/**
 * Helper to retry operations with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelay: number,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Type guard for checking if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper to ensure an error is always an Error instance
 */
export function ensureError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(String(error));
}
