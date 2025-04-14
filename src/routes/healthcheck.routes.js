import { Router } from "express";
import { healthcheck } from "../controllers/healthCheckAPI.controllers.js";

// create a route
const router = Router();

// define the path of the router
router.route("/").get(healthcheck);

// the slash above is not for homepage. we are creating our routes

export default router;
