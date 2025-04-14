# Creating Utilites

## AsyncHandler

- we will be talking to DB a lot during the project and everytime we talk, we will have to use async await or promise .then .catch
- To avoid repition, we are going to create an HOF which will take a function as an argument and wrap it in a try catch async await or promise .then .catch and return the wrapped function.

- Async handler using try-catch async await

  ```javascript
  const asyncHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        res.status(error.code || 500).json({
          success: false,
          message: error.message,
        });
      }
    };
  };
  ```

  - we are passing a function fn, which is then passed to another function (async)
  - so whichever function is coming in (fn), we will extract 3 args from it, (req,res,next)
  - execute the incoming function fn with await

- Async Handler using Promise

  ```javascript
  const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        next(err);
      });
    };
  };
  ```

  - pass fn to a new function which will extract the parameters from the input function fn
  - return a function which takes the args (req,res.next)
  - we create a new Promise
  - In the resolve part, we execute the funtion fn
  - In reject part we handle errors

## Standardize Error Handling

- node.js gives us an error class
- we will inherit this class and overwrite some of the things according to our needs

  ```javascript
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
  ```

## Standardize API Response

```javascript
class ApiRespnse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```
