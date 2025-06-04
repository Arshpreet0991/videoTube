import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ROUTES

// Un-Secured Routes
router.route("/register").post(
  // middleware
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser // controller
);

// login user
router.route("/login").post(loginUser);

// refresh tokens
router.route("/refreshtoken").post(refreshAccessToken); // issue new tokens

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Secured route
router.route("/logout").post(verifyJWT, logoutUser); // add middleware for identify user securely
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // change current password
router.route("/get-current-user").get(verifyJWT, getCurrentUser); // get current user
router.route("/update-user-details").post(verifyJWT, updateAccountDetails); // update user account info
router
  .route("/update-user-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar); // update avatar
router
  .route("/update-user-coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // update cover Image

// get user params from url
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// watch history
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
