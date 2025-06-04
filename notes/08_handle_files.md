# Handling files in our app

- We are going to enable our express app to handle files from the user like images, pdf, videos etc.
- we will use cloudinary to host our files and link it to our DB.
- Express does't handle files on its own. To handle files we will use the mutler package.
  (**npm i multer**)

## Multer

- Multer is a middleware used for file uploads in Node.js with Express.
- Multer gives us ability to upload single files and array of files.
- Multer is also used to send form data.

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

## VERY IMPORTANT

### Multer Notes

Multer middleware processes the uploaded file and saves it locally before the route handler runs. It attaches the uploaded file’s info to `req.file` for single file uploads.

**`req.file` contains:**

- `path` — local file path (where Multer saved the file)
- `originalname` — original file name from user’s device
- `mimetype` — file type (e.g., `image/jpeg`)
- `size` — file size in bytes
- Other metadata like `filename`, `destination`, etc.

Use `req.file.path` to access the local file path for further processing (e.g., upload to Cloudinary).

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() \* 1E9)
    // create unique suffix for our files
    cb(null, file.fieldname + '-' + uniqueSuffix)
    //create our own unique file name
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
        if (!localFilePath) return null;
        // if there is no local path, return null
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          // automatically detect the file type
        }); // upload to cloudinary
        console.log("File uploaded on cloudinary. File src: " + response.url);
        // once the file is uploaded we would like to delete from our server
        fs.unlinkSync(localFilePath);
        return response;
      } catch (error) {
        fs.unlinkSync(localFilePath);
        // if there is an error, delete the file from the local storage
        return null;
      }
    };

    export { uploadOnCloudinary };
    ```

### req.file preview sent by multer

- if it is req.files, then multer will give us an array of objects, like previously discussed.

```js
  req.file:  {
  fieldname: 'avatar',
  originalname: '9.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './public/temp',
  filename: 'avatar-1747954043858-320320571',
  path: 'public\\temp\\avatar-1747954043858-320320571',
  size: 2489221
}
```

### cloudinary response preview:

- this is the response sent by uploadTocloudinary method.

```js
  cloudinary response:  {
  asset_id: 'fd005ff4760d3fe61a49e5d44842c829',
  public_id: 'p9c103lvcxdsuowe420h',
  version: 1747954047,
  version_id: '518f7a70d6643831dafda6e1e9ac767d',
  signature: '03b762526c9bbae2d728dda7972dfd5bc681f8d7',
  width: 2325,
  height: 2325,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2025-05-22T22:47:27Z',
  tags: [],
  bytes: 2489221,
  type: 'upload',
  etag: '5838eb5d42634845d254ad9ac0084df2',
  placeholder: false,
  url: 'http://res.cloudinary.com/dvezraqky/image/upload/v1747954047/p9c103lvcxdsuowe420h.jpg',
  secure_url: 'https://res.cloudinary.com/dvezraqky/image/upload/v1747954047/p9c103lvcxdsuowe420h.jpg',
  asset_folder: '',
  display_name: 'p9c103lvcxdsuowe420h',
  original_filename: 'avatar-1747954043858-320320571',
  api_key: '355666617196797'
}
```
