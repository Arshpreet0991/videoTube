import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  console.log("Avatar local path:", avatarLocalPath);

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

export { registerUser };
