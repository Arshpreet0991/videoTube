# Handling files in our app

- We are going to enable our express app to handle files from the user like images, pdf, videos etc.
- we will use cloudinary to host our files and link it to our DB.
- Express does't handle files on its own. To handle files we will use the mutler package.
  (**npm i multer**)

## Multer

- Multer is a middleware used for file uploads in Node.js with Express.
- Multer gives us ability to upload single files and array of files.
- Since multer is middleware, it is will be placed between our route and our controller. For example:

  ```javascript
  app.post("/profile"),
    upload.single("avatar"),
    function (req, res, next) {
      // controller code here
    };
  ```

  - "/profile" is route
  - upload.single is multer middleware. Upload is provided my multer.
  - function (req,res,next) is controller

## System Flow for File Uploading

- In a professional set up, where we use cloud services, our flow of the sytem would be like this:
  - Multer saves files to disk (on server side). This functionality is provided by multer.
  - Then we upload the file to cloud
  - we get a url from the cloud
  - save the cloud url to DB
  - delete the uploaded file from the server disk.

## System flow with code

1.  **Allow multer to use disk storage**

    ```javascript
    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads') // path of the storage folder
    },
    filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() \* 1E9) // create unique suffix for our files
    cb(null, file.fieldname + '-' + uniqueSuffix) //create our own unique file name
    }
    })

    export const upload = multer({ storage: storage })
    ```

2.  **Upload the image on Cloudinary**

    - Create a file in _utils_ folder named cloudinary.js
    - install cloudinary package: npm i cloudinary
    - in _.env_ file, write
      - cloudinary_cloud_name
      - cloudinary_api_key
      - cloudinary_api_secret
    - The above data is present in our cloudinary profile.
    - Now go to the file _cloudinary.js_. In this code:
      - localFilePath: path of the file on server storage.
      - import cloudinary and file system.
        - File system is used to read, write, remove, update the file.
        - "fs" has a method called fs.unlink(path). This method is used to remove / delete a file from the directory.

    ```javascript
    import { v2 as cloudinary } from "cloudinary";
    import fs from "fs";
    ```

    - configure Cloudinary.
      - save the sensetive info in _.env_

    ```javascript
    // configure cloudinary. Copy the code from clouinary account
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    ```

    - Next, we will do the following steps:
      - Create a method which takes local File Path as parameter
      - then we upload it using cloudinary.uploader.upload
      - then unlink (delete) the file from the server storage.
      - Since, we are taking a file from the user, it is an async operation and we will have to use try catch

    ```javascript
    const uploadOnCloudinary = async (localFilePath) => {
      try {
        if (!localFilePath) return null; // if there is no local path, return null
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto", // automatically detect the file type
        }); // upload to cloudinary
        console.log("File uploaded on cloudinary. File src: " + response.url);
        // once the file is uploaded we would like to delete from our server
        fs.unlinkSync(localFilePath);
        return response;
      } catch (error) {
        fs.unlinkSync(localFilePath); // if there is an error, delete the file from the local storage
        return null;
      }
    };

    export { uploadOnCloudinary };
    ```
