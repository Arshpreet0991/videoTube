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
// configure middleware
// accept json data
app.use(express.json({ limit: "16kb" }));

//accept data from url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// temporary storage for files from user (images, pdf etc)
app.use(express.static("public"));

// configure cookie parser
app.use(cookieParser());

//-----------------------------------------

export { app };
