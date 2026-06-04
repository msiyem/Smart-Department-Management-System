// ─── Standardised API Response ───────────────────────────────────────────────

export class ApiResponse {
  constructor(statusCode, message = 'Success', data = null) {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;
    this.message    = message;
    if (data !== null) this.data = data;
  }
}


export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success    = false;
    this.errors     = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
