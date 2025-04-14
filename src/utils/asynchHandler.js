// asyncHandler using promises
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };

//using try catch and async await

/*
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

*/
