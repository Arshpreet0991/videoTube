import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// generate tokens method
const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); // find the user with the user id parameter

    // generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateAccessToken();

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

  console.log("Email:", email);

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

  // set up cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

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
  const userId = req.user._id; // get user id

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
export { registerUser, loginUser, logoutUser };
