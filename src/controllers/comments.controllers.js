import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

// create a comment
const createComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { videoId } = req.params;
  const commentContent = req.body?.content;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id not found");
  }

  if (!commentContent) {
    throw new ApiError(400, "Error during fetching comment from the user");
  }

  const video = await Video.findOne({ _id: videoId, owner: userId });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const comment = await Comment.create({
    content: commentContent,
    video: videoId,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added Successfully"));
});

// fetch comments
const fetchComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { videoId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id not found");
  }

  const comment = await Comment.find(
    { video: videoId, owner: userId },
    "content"
  );

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment fetched Successfully"));
});

// update a comment
const updateComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { commentId } = req.params;
  const commentContent = req.body?.content;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!commentId) {
    throw new ApiError(400, "Comment id not found");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: userId },
    {
      content: commentContent,
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated Successfully"));
});

// delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { commentId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!commentId) {
    throw new ApiError(400, "Comment id not found");
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted Successfully"));
});
export { createComment, fetchComment, updateComment, deleteComment };
