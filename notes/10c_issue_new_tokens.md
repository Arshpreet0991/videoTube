# Issue new token

- access tokens are short lived. For example 30 min.
- so, after 30 mins, the front end will send a request to our special created route.
- As, we know, in the request, the user will send its refresh token inside the cookies.
- Our special route, will compare the refresh token from the user to the refresh token saved in the DB.
- if it matches, our route will generate new access and refresh token for the client so that the client's session can continue beyond 30 mins.

  ```javascript
  const refreshAccessToken = asyncHandler(async (req, res) => {
    // access refresh token from cookies
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    // verify token

    try {
      // decode token sent by user as it is encrypted
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // token has a user id, so we will find our user by id
      const user = await User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // compare the two tokens (incoming and DB token)
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired/used");
      }

      const { newAccessToken, newRefreshToken } =
        await generateAccessTokenAndRefreshTokens(user._id);

      return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { newAccessToken, newRefreshToken },
            "Access token refreshed successfully"
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token");
    }
  }); // new tokens
  ```

- create user route in routes

  ```javascript
  router.route("/refresh-token").post(refreshAccessToken);
  ```

  - no need for jwtVerify middlware as it is used to verify the access token and we dont need to that here.
