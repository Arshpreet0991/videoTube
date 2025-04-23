# Log out User

- we will identify the user using our created middleware.
- we will clear out cookies and set access token to _undefined_.

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
