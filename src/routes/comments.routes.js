import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  fetchComment,
  updateComment,
} from "../controllers/comments.controllers.js";

const router = Router();

// create a comment
router.route("/:videoId/add-comment").post(verifyJWT, createComment);

// fetch a comment
router.route("/:videoId/get-my-comments").get(verifyJWT, fetchComment);

// update a comment
router.route("/:commentId/update-comment").put(verifyJWT, updateComment);

// delete a comment
router.route("/:commentId/delete-comment").delete(verifyJWT, deleteComment);

export default router;
