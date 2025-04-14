import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // index is used to make search operations easier but is heavy on the system, so we use it sparingly
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // external url
      required: true,
    },
    coverImage: {
      type: String, // external url
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// encrypting the password using Hooks (pre)
userSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next(); //exiting the function if the field being modified is anything other than password
  this.password = bcrypt.hash(this.password, 10); // encrypting the password. Two params, 1) what to encrypt 2) no. of rounds the algorithm takes to hash the password
  next(); // pass the next flag to next middleware
});

// user auth/ decrypting password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // decrypts and compare the passwords and returns a boolean
};

// create logged in functionality

// generate access token
userSchema.methods.generateAccessToken = function () {
  // short lived access token
  return jwt.sign(
    {
      _id: this._id, // getting from mongoose
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// generate refresh token - long lived token

userSchema.methods.generateAccessToken = function () {
  // Long lived access token
  return jwt.sign(
    {
      _id: this._id, // getting from mongoose
      email: this.email,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
