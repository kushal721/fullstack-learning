/**
 * An error with an HTTP status that routes throw on purpose
 * (e.g. 404 for an unknown topic). The central error handler turns it into
 * the standard `{ error: { code, message } }` response.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const notFoundError = (message: string) =>
  new HttpError(404, "NOT_FOUND", message);

export const validationError = (message: string) =>
  new HttpError(400, "VALIDATION_ERROR", message);
