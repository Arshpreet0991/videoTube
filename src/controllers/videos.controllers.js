import { asyncHandler } from "../utils/asynchHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

// CREATE- upload a video
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const ownerId = req.user?._id;

  // get video file local path
  const videoLocalPath = req.files?.video[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "video file missing");
  }

  // get thumbnail path
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file missing");
  }
  //console.log("here");

  // upload videoFile on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!videoFile.url) {
    throw new ApiError(400, "Error while uploading the video");
  }

  // get video duration
  const videoDuration = videoFile.duration;

  // upload videoFile on cloudinary
  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailFile.url) {
    throw new ApiError(400, "Error while uploading the thumbnail");
  }

  console.log(videoFile);

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    title,
    description,
    duration: videoDuration,
    owner: ownerId,
  });

  const uploadedVideo = await Video.findById(video._id);

  if (!uploadedVideo) {
    throw new ApiError(500, "Error during uploading the file to DB");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded success"));
});

// READ- fetch a video
const getVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const video = await Video.findOne({ _id: videoId, owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// update a video title and description
const updateVideoTitleAndDescription = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const { title, description } = req.body;

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId },
    {
      title,
      description,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

// update video thumbnail
const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail not uploaded to server");
  }

  const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!cloudinaryThumbnail) {
    throw new ApiError(500, "upload to cloudinary failed");
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId },
    {
      thumbnail: cloudinaryThumbnail.url,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

// delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  await Video.findOneAndDelete({ _id: videoId, owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
  uploadVideo,
  getVideo,
  updateVideoTitleAndDescription,
  updateVideoThumbnail,
  deleteVideo,
};
