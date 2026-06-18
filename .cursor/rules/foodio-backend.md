# Foodio Backend — Cursor Rules

> Full backend architecture. See also [`foodio-backend-cursor-prompt.md`](../../foodio-backend-cursor-prompt.md) in the workspace root.

## Stack

Node.js 20+, Express 5, Mongoose, Socket.IO, JWT, Stripe, BullMQ + Redis.

## Module Pattern

`routes → controller → service → model/schema` per feature module under `src/modules/`.

## Rules

1. Validate every `req.body` with Zod `validate(schema)` middleware.
2. Always `throw new ApiError(statusCode, message)` — never plain `Error`.
3. Wrap async controllers in `asyncHandler`.
4. Business logic in services; DB queries in models.
5. Snapshot item name/price on order creation.
6. Paginate list endpoints: default `page=1`, `limit=10`, max `50`.
7. Stripe webhooks use raw body + `constructEvent`.
8. Write integration tests in `tests/` with `mongodb-memory-server`.

## API Base

`http://localhost:3001/api/v1`

## Response Envelope

```ts
{ success, statusCode, message, data, pagination? }
```
