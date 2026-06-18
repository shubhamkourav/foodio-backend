import type { PaginationMeta } from '../types/models.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export interface PageLimitOptions {
  page: number;
  limit: number;
  skip: number;
}

export function parsePageLimit(query: Record<string, unknown>): PageLimitOptions {
  const rawPage = Number(query.page ?? DEFAULT_PAGE);
  const rawLimit = Number(query.limit ?? DEFAULT_LIMIT);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(MAX_LIMIT, Math.floor(rawLimit))
    : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total > 0 ? Math.ceil(total / limit) : 0,
  };
}
