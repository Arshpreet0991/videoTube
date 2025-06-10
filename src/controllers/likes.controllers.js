import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

// like a video
const likeVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { videoId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id not received");
  }

  const video = await Video.findOne({ _id: videoId, owner: userId });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const like = await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Video liked successfully"));
});

// like a Comment
const likeComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { commentId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id not found");
  }

  if (!commentId) {
    throw new ApiError(400, "Video id not received");
  }

  const comment = await Comment.findOne({ _id: commentId, owner: userId });

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Video liked successfully"));
});
export { likeVideo, likeComment };
