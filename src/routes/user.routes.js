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
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// route
router.route("/register").post(
  // middleware
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser // controller
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT, logoutUser); // add middleware for identify user securely
router.route("/refreshtoken").post(refreshAccessToken); // issue new tokens
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // change current password
router.route("/get-current-user").get(verifyJWT, getCurrentUser); // get current user
router.route("/update-user-details").post(verifyJWT, updateAccountDetails); // update user account info
router
  .route("/update-user-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar); // update avatar
router
  .route("/update-user-coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // update cover Image

export default router;
