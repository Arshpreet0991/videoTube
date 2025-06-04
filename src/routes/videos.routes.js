import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadVideo,
  getVideo,
  updateVideoTitleAndDescription,
  updateVideoThumbnail,
  deleteVideo,
} from "../controllers/videos.controllers.js";

const router = Router();

// upload a video
router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

// read / get a video
router.route("/:videoId").get(verifyJWT, getVideo);

// update a video
router
  .route("/:videoId/update-video-title-description")
  .put(verifyJWT, updateVideoTitleAndDescription);

// update a video
router
  .route("/:videoId/update-video-thumbnail")
  .put(verifyJWT, upload.single("thumbnail"), updateVideoThumbnail);

// delete a video
router.route("/:videoId/delete").delete(verifyJWT, deleteVideo);

export default router;
