/**
 * Base class for all application errors. Carries a stable machine-readable
 * code, an HTTP status, and an optional details payload so the global error
 * handler can build a consistent response envelope without scattering
 * `instanceof` checks across controllers.
 */
export class AppError extends Error {
  readonly name = "AppError";

  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

/** Input failed Zod validation (HTTP 400). */
export class ValidationError extends AppError {
  constructor(code = "VALIDATION_ERROR", message = "Validation failed", details?: unknown) {
    super(code, message, 400, details);
  }
}

/** Caller identity could not be established (HTTP 401). */
export class AuthenticationError extends AppError {
  constructor(code = "AUTHENTICATION_ERROR", message = "Authentication required") {
    super(code, message, 401);
  }
}

/** Caller lacks permission for the requested action (HTTP 403). */
export class AuthorizationError extends AppError {
  constructor(code = "AUTHORIZATION_ERROR", message = "Not authorized") {
    super(code, message, 403);
  }
}

/** The requested resource does not exist or is not visible (HTTP 404). */
export class NotFoundError extends AppError {
  constructor(code = "NOT_FOUND", message = "Not found") {
    super(code, message, 404);
  }
}

/** A uniqueness or state conflict, e.g. a duplicate slug (HTTP 409). */
export class ConflictError extends AppError {
  constructor(code = "CONFLICT", message = "Conflict", details?: unknown) {
    super(code, message, 409, details);
  }
}

/** The caller is being rate-limited (HTTP 429). */
export class RateLimitError extends AppError {
  constructor(code = "RATE_LIMIT", message = "Rate limit exceeded") {
    super(code, message, 429);
  }
}

/** A downstream dependency (Redis, S3, QStash, etc.) failed (HTTP 502). */
export class ExternalServiceError extends AppError {
  constructor(code = "EXTERNAL_SERVICE_ERROR", message = "External service error") {
    super(code, message, 502);
  }
}

/** An unexpected application failure (HTTP 500). */
export class InternalError extends AppError {
  constructor(code = "INTERNAL_ERROR", message = "Internal server error") {
    super(code, message, 500);
  }
}
