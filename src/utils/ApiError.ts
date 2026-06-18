export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
