class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong", // default message,
    errors = [],
    stack = ""
  ) {
    // overwrite the constructor with our own codes which we will hanldle errors during the code
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
