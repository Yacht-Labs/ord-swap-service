class AppError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}
