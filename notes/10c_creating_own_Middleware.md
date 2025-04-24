# Creating our Own Middleware

- Problem: when creating our logout functionality, we have to identify the user which we have to log out.
- To logout, we want to clear out the cookies and delete the refresh token from the database.
- During log-in we took the data from user and found the user from that data using req.body, but to log out, right now we dont have a way to get the userId from the user who wants to logout.
- to mitigate that, we will create our own middleware.
  - We will use cookies to identify the user.
  - Due to our cookie-parser middleware, the cookies are sent in both request and response objects.

## Creating a middleware (Theory)

- this middleware will check if the user exists or not
- we want to add a new object called "_user_" to the request object.
- **Important:**
  - Our strat is to identify the user by its tokens and then log out the user.
  - cookies are stored inside headers of the request. In that cookie-header, we have are access and refresh tokens that we sent to the client via our login response.
  - we can access these cookies via **_req.cookies.accessToken;_**
  - But in case our client is a mobile app, then they dont send our cookie in headers. Instead, the mobile apps send our tokens inside the "**_Authorization_**" header under the name of "**_Bearer_**" tokens,
    ```javascript
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // we created the accessToken field in our login response.
    // accessing tokens from authorization header.
    ```
    - So, when we access the authorization header, our output looks something like this: "_Authorization: Bearer abc.def.ghi_" where Bearer tell us these are the tokens and abc.def.ghi is the JWT token itself.
    - to access the just the token, we replaced bearer with and empty string, thus req.header("Authorization") becomes the access token name, "abc.def.ghi" (header,payload,signature)

## Creating Middleware

- in middleware folder, create a file named auth.middlware.js
- import the following:

  ```javascript
  import { ApiError } from "../utils/ApiError.js";
  import { asyncHandler } from "../utils/asynchHandler.js";
  import { User } from "../models/user.model.js";
  import jwt from "jsonwebtoken";
  ```

- create and export an async function

  ```javascript
  export const verifyJWT = asyncHandler(async (req, res, next) => {
    // middlware logic here
  });
  ```

- get access to the access token from the request

  ```javascript
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Request");
  }
  ```

- decode our access token. We already saved the token secret key in our.env.

  ```javascript
  // decode the JWT using secret from .env
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // identify user from extracting user id from token
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
  ```

- we will also find the user id from out token. In our user model, we added the userId info inside our access and refresh tokens.

  ```javascript
  // identify user from extracting user id from token
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }
  ```

- We will add the user object that we got from JWT and add it to our request.
- By doing this we will be able to identify our user as the request now has userid as well.

  ```javascript
  req.user = user;
  next();
  ```

  - next() method is necesarry to call in middlware.
