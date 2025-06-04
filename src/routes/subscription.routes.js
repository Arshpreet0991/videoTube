import { Router } from "express";
import {
  subscribeToChannel,
  unSubscribeFromChannel,
  checkSubscribeStatus,
} from "../controllers/subscriptions.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// subscribe to a channel
router.route("/:channelId/subscribe").post(verifyJWT, subscribeToChannel);

// un-subscribe to a channel
router
  .route("/:channelId/un-subscribe")
  .post(verifyJWT, unSubscribeFromChannel);

// get subscribe status
router
  .route("/:channelId/subscription-status")
  .get(verifyJWT, checkSubscribeStatus);

export default router;
