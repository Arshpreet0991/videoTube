import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { channel } from "diagnostics_channel";

// set up cookie options
const options = {
  httpOnly: true,
  secure: true,
};

// generate tokens method
const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); // find the user with the user id parameter

    // generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // add refresh token to user object
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh and Access Tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1: get user details
  const { fullname, username, email, password } = req.body; // get json data from front-end

  // validations
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required"); // ApiError(statusCode, message)
  }

  // 2: check for existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // 3: upload user files to server storage using Multer

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //  console.log("Avatar local path:", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //console.log("coverImage local path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required");
  }

  //4: upload files from server to cloudinary
  let coverImage;
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is required");
  }

  //5: Create an entry in DB
  const user = await User.create({
    fullname,
    avatar: avatar.url, // get url from cloudinary
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //6: remove password and refreshToken from response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //7: Check if user is created successfully in DB
  if (!createdUser) {
    throw new ApiError(500, "Error during registering a User");
  }

  //8: Return the response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
}); // async function request

const loginUser = asyncHandler(async (req, res, next) => {
  //1. get user data
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email required ");
  }

  //2. find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user || !email) {
    throw new ApiError(404, "user doesnt exists");
  }

  //3. Check Password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid credientials");
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);

  // update our user object/ reference
  const loggedInUser = await User.findById(user._id).select(
    "-password -refresToken"
  );
  // 5. send tokens in cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
}); // login user

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // get user id

  // find user and update the details specified in the object using set operator of mongo
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //
    }
  );

  // clear cookies from response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
}); // logout user

const refreshAccessToken = asyncHandler(async (req, res) => {
  // access refresh token from cookies
  const incomingRefreshToken = req.cookies.refreshToken;

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

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
}); // new tokens

// some common user routes
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const userId = req.user?._id; // got the id from verifyJWT middleware

  const user = await User.findById(userId);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(404, "Incorrect Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body; // we want the user to be able to update these fields

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

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarlocalPath = req.file?.path; // get local path of DB Storage
  if (!avatarlocalPath) {
    throw new ApiError(400, "Avatar File Missing");
  }

  const avatar = await uploadOnCloudinary(avatarlocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error While Uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Avatar Updated"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImagelocalPath = req.file?.path; // get local path of DB Storage
  if (!coverImagelocalPath) {
    throw new ApiError(400, "coverImage File Missing");
  }

  const coverImage = await uploadOnCloudinary(coverImagelocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error While Uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated"));
});

// subscriber model- aggregation pipeline
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; // get username from url
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    // stage 1
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    // stage 2
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // stage 3
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // stage 4
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    // stage 5
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        avatar: 1,
        email: 1,
      },
    },
  ]);

  // since aggregate return an array, we will check if we got data inside the array or not.
  if (!channel?.length) {
    throw new ApiError(404, "Chanel does not exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelProfile,
};
