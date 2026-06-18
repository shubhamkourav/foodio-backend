import { ApiError } from './ApiError.js';

type NonNullish<T> = Exclude<T, null | undefined>;

export function assertFound<T>(
  value: T,
  message: string,
): asserts value is NonNullish<T> {
  if (value === null || value === undefined) {
    throw new ApiError(404, message);
  }
}

export function ensureFound<T>(value: T, message: string): NonNullish<T> {
  if (value === null || value === undefined) {
    throw new ApiError(404, message);
  }

  return value as NonNullish<T>;
}

export function assertAuthorized(condition: boolean, message = 'Not authorized'): void {
  if (!condition) {
    throw new ApiError(403, message);
  }
}

export function assertCondition(
  condition: boolean,
  statusCode: number,
  message: string,
  errors: string[] = [],
): asserts condition {
  if (!condition) {
    throw new ApiError(statusCode, message, errors);
  }
}
