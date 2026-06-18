import type { PaginationMeta } from '../types/models.js';

export class ApiResponse<T = unknown> {
  constructor(
    public success: boolean,
    public statusCode: number,
    public message: string,
    public data: T | null = null,
    public pagination?: PaginationMeta,
  ) {}

  static ok<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return new ApiResponse(true, statusCode, message, data);
  }

  static paginated<T>(
    data: T,
    pagination: PaginationMeta,
    message = 'Success',
    statusCode = 200,
  ): ApiResponse<T> {
    return new ApiResponse(true, statusCode, message, data, pagination);
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };

    if (this.pagination) {
      result.pagination = this.pagination;
    }

    return result;
  }
}
