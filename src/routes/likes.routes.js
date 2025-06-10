import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likeComment, likeVideo } from "../controllers/likes.controllers.js";

const router = Router();

// like a video
router.route("/:videoId/like").post(verifyJWT, likeVideo);

// like a video
router.route("/:commentId/like").post(verifyJWT, likeComment);

export default router;
