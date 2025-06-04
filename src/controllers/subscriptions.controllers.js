import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";

// subscribe to channel
const subscribeToChannel = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { channelId } = req.body;

  if (!userId) {
    throw new ApiError(400, "subscriber id not found");
  }

  if (!channelId) {
    throw new ApiError(400, "channel id not found");
  }

  const checkSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (userId === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  let subscribeToChannel;
  if (!checkSubscriber) {
    subscribeToChannel = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribeToChannel,
        "Subscribed to channel Successfully"
      )
    );
});

// unsubscribe from channel
const unSubscribeFromChannel = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { channelId } = req.body;

  if (!userId) {
    throw new ApiError(400, "subscriber id not found");
  }

  if (!channelId) {
    throw new ApiError(400, "channel id not found");
  }

  const unSubscribeChannel = await Subscription.findOneAndDelete({
    subscriber: userId,
    channel: channelId,
  });

  if (!unSubscribeChannel) {
    throw new ApiError(400, "You are not suscribed to the channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, unSubscribeChannel, "UnSubscribed from Channel")
    );
});

export { subscribeToChannel };
