import connectDB from "./db/databaseConnection.js";
import dotenv from "dotenv";
import { app } from "./app.js";

// config dotenv so that it is available everywhere in the project
dotenv.config({
  path: "./env",
});

// call the function to connect DB.

/* 
Now we want to start the server, but we only want to start the server once the database is connected...otherwise server wont have any data to serve. therefore to that we connect it with database connecting by consuming the Promise given by connectDB(). because connectDB is an async function it always return a promise
Since, connectDB is an async function, it must return a promise. So we can consume that promise here with .then and .catch.
The reason we dont create a server inside connectDB where database is connecing, is to keep the code modular
*/

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is up and running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to connect to MongoDB. Aborting server start.`, err);
  });

// another way to start server using async await
/*
async function startServer() {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is up and running at port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(`Failed to connect to MongoDB. Aborting server start.`, err);
  }
}

startServer();
*/
