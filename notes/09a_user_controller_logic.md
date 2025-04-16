# write business logic for User Controller

#### Steps: (algorithm)

1. get user details from front-end
2. validations
   - _we can add validations for empty strings, email format etc._
3. check if user already exists
   - _check by username and email_
4. Check if the files uploaded by user are saved on server Disk.
   - _in our app, user avatar is a required field._
5. upload the files to cloudinary.
   - _check if the avatar is uploaded on cloudinary successfully._
6. Now in the response, create a user object
   - _create entry in DB._
7. remove password and refresh token fields from response.
   - _for security, we will not send the user password (although encrypted) and refresh token in response._
8. check for user creation
9. if yes, return response

## Step 1: Get user data from front end

- We can take the user data from forms and from url.
- for forms, we use req.body and for url, we use req.params
- in our case, we are taking data from body.
- we will take a look at our user model and check what are we recieving and destructure it.
- Go to user controller

  ```javascript
  const { fullname, email, username, password } = req.body;
  console.log("fullname", fullname);
  console.log("email", email);
  console.log("username", username);
  console.log("password", password);
  ```

- by using req.body we are only able to get the json data, but we are supposed to take files (image) from the user as well.
- To get files from the user, we do the following:

  - Go to routes and import multer (upload object)
  - we will apply mutler middleware between route and controller

    ```javascript
    import { upload } from "../middlewares/multer.middleware.js";

    // apply middleware between route and controller
    router.route("/register").post(
      // middleware
      upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
      ]),
      registerUser // user controller
    );
    ```

  - In the above code, _route("/register")_ is the, route and we inject middleware after it.
  - **router . route ("/") . post ( middlware, controller )**
  - _upload.fields([])_ is the middleware. It takes an array of different objects. To upload multiple files, we use this. For single file, we use _upload.single()_
  - the name of the files, like avatar and coverImage has to be communicated with front-end devs so that they will name it the same in front-end side.
  - regiterUser is the user controller.

**_Now we have both the user input and files_**

## Step 2: Applying validations

- we will check each field and check if they are empty or not.
- import ApiError.js to throw errors.
- If we have to check multiple fields for "empty string", we will need a lot of if statements. To avoid that, we will use a modern code, where we will pass everything in an array in one IF.

  ```javascript
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }
  ```

  - we pass all the variables in an array and run .some method on it.
  - .some method checks whether atleast one item in the array meets a certain condition.
  - "?" checks for "null" and "undefined". It can be read as, if field is not null and not undefined, then trim the field, and then after trimming, if the field is equal to en empty string, then return an error.
  - "?" in terms of code can be viewed as:

    ```javascript
    if (field !== null && field !== undefined) {
      return field.trim();
    } else {
      return undefined;
    }
    ```

  - throw new ApiError (statusCode,message)

  In production, since there are so many validations, usually, we have a separate file for validations and we call methods from that file.

## Step 3: Check if User alrady Exists

- import { User } from "../models/user.model.js"

  - import the model that we created for user
  - this "User" model can contact mongoDB directly as it is created by mongoose.

    ```javascript
    import { User } from "../models/user.mode.js";

    const existedUser = User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "Username or email already exists");
    }
    ```

  - FindOne() returns the first document that matches our query.
    - findOne() accepts object as its argument. The object is our query.
  - **$or** is a logical operator in mongoDB.
  - It means, match documents where at least one of these conditions is true.
  - In our code, $or will check each document and returns true if if finds the exact username or email in the DB.

## Step 4: Upload Files on Server's local storage and check if avatar is uploaded successfully

- Middleware usually gives us access to additional fields on the req.

- when using multer, we created this middleware:

  ```javascript
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]);
  ```

- Multer stores them in req.files. The req.files looks like this:

  ```javascript
  req.files = {
    avatar: [{ fileObject }],
    coverImage: [{ fileObject }],
  };
  ```

  - fileObject contains the information about the files like fieldname, originalname,path,size etc.
  - since in our multer setup, we wrote maxCount: 1, there can only be one object file.
  - suppose we are allowing user to upload 3 avatars at once, we the req. files would look like this:

    ```javascript
    req.files = {
      avatar: [{ fileObject 1}, { fileObject 2}, { fileObject 3}],
    };
    ```

- now, in user controller, we will get access to file path using multer

  ```javascript
  const avatarLocalPath = req.file?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required");
  }
  ```

  - here avatar[0] refers to the first fileObject in req.files.
  - **if** block checks if avatar image is successfully uploaded to server

## Step 5: Upload Images to Cloudinary

- import {uploadOnCloudinary} from cloudinary.js

  ```javascript
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is required");
  }
  ```

  - Since uploading an image can take time, we will have to use await. Await returns a resolved value of promise, which we stored in const avatar and coverImage
  - since avatar is a required field, we have to check if the avatar was uploaded to cloudinary successfully or not.

## Step 6: Create a user object and enter it in DB

- we have access to DB using User model.
- we will use User.create() method, which takes in an object as an argument.
- Inside that object we mention the fields that we want to enter.
- user creation can take time, because we are talking to database. Thus we have to use **await**

  ```javascript
  const user = await User.create({
    fullname,
    avatar: avatar.url, // get url from cloudinary
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  }); //create() takes an object

  const createdUser = await User.findById(user._id);
  ```

  - **Very Important**: Since cover Image is not set as required in the User model, the client can chose to skip to upload the cover image.
  - In that case, we want to cover the corner cases like that.
  - Therefore, we will check if coverImage is not null or undefined then only we get its url, otherwise we keep it empty.
  - If we simply wrote **_coverImage: coverImage.url_**, then our DB will expect a url from cloudinary. And if the user chose to not upload cover image then our app will crash.

- To check if our user is created succesfully, we can do this.

  ```javascript
  const createdUser = await User.findById(user._id);
  ```

  - It finds our current created user by ID. This unique id is assigned by mongo every time a new user is created.

## Step 7: Remove password and refresh Token from the response

- for this, we will add a .select method to our createdUser.
- This method takes in a string and we write the name of the fields which we want to remove from the response with a prefix of "-".

  ```javascript
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  ```

## Step 8: Check if User is created successfully in DB or not

```javascript
if (!createdUser) {
  throw new ApiError(500, "Error during registering a User");
}
```

## Step 9: Now return the back the response

- Since we have standardize our response by creating a class named Apiresponse, we will use that.
- import Apiresponse.
- our response will be like this, res.status(statusCode,json({data}))

  ```javascript
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
  ```

  - We will create a new object of Apiresponse and send the data according to that class.
