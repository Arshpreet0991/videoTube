# Log out User

### work flow

- when the user sends a log-in request, in response, we assign refresh token and access token to the user in cookies.
- refresh token is also stored in DB for future authentication.
- So, now when the next time the user sends a request to the server, it will send the access and refresh token with each request.
- now, when the user sends a log-out request, the tokens are sent along with this request in cookie-headers.
- Now, we extract user id from the access token (stored in cookies).
- To log out,

  - we find the user using user id we got from access token.(using our middleware)
  - then we delete the refresh token from the user's database. (setting it to undefined)
  - then we clear out cookies which includes access token and refresh token saved on client side.

1.  First we will creates routes in user.routes

    ```javascript
    router.route("/login").post(loginUser);

    // secured route
    router.route("/logout").post(verifyJWT, logoutUser);
    // add middleware for identify user securely
    ```

2.  then in our user controller we create our logout user function

    ```javascript
    const logoutUser = asyncHandler(async (req, res) => {
      const userId = req.user._id; // get user id

      // find user and update the details specified in the object using set operator of mongo
      // set parameter updates the documents mentioned here
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            refreshToken: undefined,
          },
        },
        {
          new: true, // tells mongoDB to return the updated document, instead of the old one.
        }
      );

      // clear cookies

      const options = {
        httpOnly: true,
        secure: true,
      };

      // clear cookies from response
      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
    }); // logout user
    ```
