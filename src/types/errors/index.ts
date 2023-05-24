export class AppError extends Error {
  statusCode: number;
  message: string;
  error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NotFoundError", message);
  }
}

export class RequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, "RequestError", message);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(500, "DatabaseError", message);
  }
}

export class LitError extends AppError {
  constructor(message = "Lit error") {
    super(500, "LitError", message);
  }
}

export class ApiError extends AppError {
  constructor(message = "API error") {
    super(500, "ApiError", message);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message = "Business logic error") {
    super(500, "BusinessLogicError", message);
  }
}

export class UnknownError extends AppError {
  constructor(message = "Unknown error") {
    super(500, "UnknownError", message);
  }
}
