# Health Check API

- Basically we use a test, which will tell us if our web app is running smoothly or not.
- we will send a test request, which can generate a desireable response to check the system health.
- We use this time to time in our project to check the health of the system.

## Standard Practice for Health Check

1.  Create a health check controller in controllers folder.
2.  import Apiresonse and asyncHandler.
3.  we will create our healthcheck route

    ```javascript
    const healthcheck = asyncHandler(async (req, res) => {
      return res
        .status(200)
        .json(new ApiResoponse(200, "OK", "Health Check Passed."));
    });

    export { healthcheck };
    ```

- asyncHandler will handle our async callback function. Since our asyncHandler can also handle sync functions, therefore, it is a standard practice to write async here just to make sure that we are not missing any async operations in our route.
- We are using our custom Api response to standardize the resoponse from our server.

4.  Create a route handler. Each of our controller in our project will get their own route handler.

    - Each model gets it contoller
    - Each controller will get its Route

5.  Go to routes folder and create a file named: healthcheck.routes.js

    - import {router} from "express"
    - import {healthcheck}
    - create a router

    ```javascript
    import { Router } from "express";
    import { healthcheck } from "../controllers/healthCheckAPI.controllers.js";

    // create a route
    const router = Router();

    // define the path of the router
    router.route("/").get(healthcheck);
    export default router;
    ```

6.  go to app.js and create routes

## Understaing Routes

```javascript
/api/v1/healthcheck/
```

- ✅ Why Modular Routing?

  - **To keep our app.js clean** and not bloat it with routes.
  - **Easy to scale**- just create new router and controller files for new features
  - **Promotes separation of concerns**- routing logic and business logic stay separate.
  - To make it modular, we separate:

    - Routes (which define the endpoints)

    - Controllers (which handle the logic/response for those endpoints)

#### Basic Flow

1. In app.js we define route

   ```javascript
   import healthcheckRouter from "./routes/healthcheck.routes.js";
   app.use("/api/v1/healthcheck", healthcheckRouter); // pass the control to healthcheckRouter
   export { app };
   ```

   - we define the base route using app.use(). This will pass control on to the router. In this case healthcheckRouter.

2. In router file we define sub-route and link it with controller

   ```javascript
   const router = express.Router();
   router.get("/", healthcheck);
   ```

   - we define sub-route and this "/" will link to our healthcheck controller.
   - "/" here will be our homepage to healthcheck
   - for additional routes, we just add, for example "/test" and it will create a route to our test page.

3. In controller, we write the logic for responses.
   ```javascript
   const healthcheck = (req, res) => {
     res.status(200).json({ message: "Health Check Passed" });
   };
   ```
   - In controller, we define the function that sends the response

## Testing routes using POSTMAN

1.  create a new blank collection by using the "+"
2.  name the collection videoTube.
3.  create another folder inside videoTube using "..." and name it healthcheck
4.  add a get new request and name it healthcheck and type the route as :" https://localhost:8000/api/v1/healthcheck"
5.  save the request.
6.  Check if the response is coming or not. DONE.
