# Database Connection

### Create a DB online on mongo atlas

1.  Go to mongoDB Atlas
2.  Create a New project
3.  fill the required fields
4.  Enter the username and password for the database.
5.  Choose local environment
6.  Configure IP address on Network Access setting
    - on ip address type: 0.0.0.0/0
    - This will give access to all ip
    - remove your ip from the list.
7.  add a new user to database if needed. Go to database access under security tab.
8.  Go to database tab and click on connect. Select compass or any other option and copy the connection string

### Connecting DB in VsCode

1. go to .env

   - PORT=whatever
   - MONGODB_URL= paste the connection string from the mongo atlas
   - write the password of the DB inside the string
   - Remove the ending "/" at the end of the string.

2. Go to src, then to constants.js
   - write a name for the database and export it.
   ```javascript
   export const DB_NAME = "videoTube";
   ```
3. install mongoose: npm i mongoose
4. go to src/db and create a file databaseConnection.js
5. import mongoose and database name
6. syntax for DB connection:

   ```javascript
   mongoose.connect("database url from mongoose atlas");
   ```

7. basic structure

   ```javascript
        const connectDB = async function ()=>{
            try{
               //database connection
            }
            catch(error){
               // log error
               process.exit(1)
            }
         }

         export default connectDB
   ```

### calling connectDB in index.js

1. import connectDB and dotenv

   ```javascript
   import connectDB from "./db/databaseConnection.js";
   import dotenv from "dotenv";
   ```

2. Since our entry point into project is index.js, we have to configure our dotenv so that environment variables from .env are accessible everywhere in the project

   ```javascript
   dotenv.config({
     path: "./env",
   });
   ```

3. Sometimes the nodemon doesnt work with dotenv, so combat that, we will configure our dev script in package.json

   ```javascript
     "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
   ```

4. call the connectDB function

   ```javascript
   connectDB(); // call the function to connect database
   ```
