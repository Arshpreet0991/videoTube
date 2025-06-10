import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//create app from express
const app = express();

// configure cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//-----------------------------------------
// common middleware configurations
// accept json data
app.use(express.json({ limit: "16kb" }));

//accept data from url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// temporary storage for files from user (images, pdf etc)
app.use(express.static("public"));

// configure cookie parser
app.use(cookieParser());

//-----------------------------------------

// ROUTES

// Healthcheck route
import healthcheckRouter from "./routes/healthcheck.routes.js"; // healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// User Route
import userRouter from "./routes/user.routes.js"; // user route
app.use("/api/v1/users", userRouter);

// Videos route
import videoRouter from "./routes/videos.routes.js";
app.use("/api/v1/videos", videoRouter);

// Subscriber Route
import subscriptionRouter from "./routes/subscription.routes.js"; // subscriber route
app.use("/api/v1/subscription", subscriptionRouter);

// Comments Route
import commentRouter from "./routes/comments.routes.js";
app.use("/api/v1/comments", commentRouter);

// Likes routes
import likesRouter from "./routes/likes.routes.js";
app.use("/api/v1/likes", likesRouter);

export { app };
