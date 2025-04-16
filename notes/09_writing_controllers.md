# Controllers

### User registration

1.  Create a user controller: user.controller.js

    - import asyncHandler
    - create a method register user
    - export register user

      ```javascript
      import { asyncHandler } from "../utils/asynchHandler.js";

      const registerUser = asyncHandler(async (req, res) => {
        // do something
      });

      console.log("Type of ", typeof registerUser);

      export { registerUser };
      ```

2.  Create route for controller

    - import Router from express
    - import registerUser controller
    - create router variable
    - export router

      ```javascript
      import { Router } from "express";
      import { registerUser } from "../controllers/user.controllers.js";

      const router = Router();

      router.route("/register").post(registerUser);

      export default router;
      ```

3.  Go to app.js

    - import userRoutes from routes.js
    - write the route for user

      ```javascript
      import userRouter from "./routes/user.routes.js"; // import user route

      app.use("/api/v1/users", userRouter); // User Route
      ```
