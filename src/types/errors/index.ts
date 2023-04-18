export class AppError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class RequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(500, message);
  }
}

export class LitError extends AppError {
  constructor(message = "Lit error") {
    super(500, message);
  }
}

export class ApiError extends AppError {
  constructor(message = "API error") {
    super(500, message);
  }
}
