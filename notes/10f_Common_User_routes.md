# Common User Routes

## Change Current Password

- we will use our middleware, verifyJWT to verify if the user is currently logged in.
- Then we will get our user id from the accessToken and find our user.
- The user will send us old password and new password.
- we will check if the old password matches the password that is saved it in our DB.
- if yes, then we will replace the old password with new password and save it in DB.
- As soon as we save in DB, our "save" hook kicks in and encrypts the password before saving it in DB.
- Return a response that password changed successfully.

  ```javascript
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPasword);

  if (!isPasswordCorrect) {
    throw new ApiError("Incorrect Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(200, {}, "Password Changed Successfully");
  ```

- Routes

  ```javascript
  router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
  ```

## Get Current User

- we are getting a user object from our verifyJWT middleware during our client's request.
- we will ise that req.user object to get current User.

  ```javascript
  const getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(200, req.user, "Current User fetched successfully");
  });
  ```

## Update User details

- It is a good practice that for text data update, we will create our routes.
- But for updating any files( eg. user updates avatar ), it is advisable to create a new controller for file updates.
- Because if the user just want to update the file, we dont want to unecessarily re-write the whole user document again in database or vice-versa.
- This helps reduce congestion on DB.

  ```javascript
  const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    // we want the user to be able to update these fields

    if (!fullname || !email) {
      throw new ApiError("All Fields are required");
    }

    const user = await User.findOneAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname: fullname,
          email: email,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Accout details updated successfully"));
  });
  ```

## Update User Files (Avatar etc.)

- to update files, we have to use multer, so that we can handle files.
- verify if user logged In or not. So we will use jwtVerify
- So, here we will be using two middlewares: Multer and verifyJWT
