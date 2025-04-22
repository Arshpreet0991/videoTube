# User Login / Sessions

- To understand sessions, we need to understand two conepts
  - Access Token (expires in short term)
  - Refresh Token (expires in long term)

### How tokens work

- When a user logs in, we give them an Access Token.

- This access token allows the user to perform actions that require authentication — like uploading a profile picture or changing their username.

- Access tokens are short-lived. For example, they might expire in 15 minutes. Once it expires, the user can no longer access protected features.

- To avoid making the user log in again every 15 minutes, we use a Refresh Token.

- The refresh token is usually stored securely (like in a cookie or database) and is longer-lived.

- When the access token expires, the user’s app can send the refresh token to the server.

- If the refresh token is valid and matches the one stored in the database, the server will generate a new access token — keeping the user logged in without needing to re-enter their credentials.
- to completely log out the user, we have to delete both the access token and refresh token.

## Create a user login (Algorithm)

1.  get user data from req.body, get username or email to login
2.  find user in DB
3.  check user's password
4.  generate access and refresh toke
5.  send the tokens in cookies
6.  send back the response.

### Step 0: create a function for user login in user controller

```javascript
const userLogin = asynchHandler(async (req, res, next) => {
  // user login logic goes here
});
```

### Step 1: Get user data.

- we are creating a functionality that user can login via email or username.
- to do this we will check if atleast one of the fields is given by the user

  ```javascript
  const { username, email, password } = req.body; // get user data

  if (!username || !email) {
    throw new ApiError(400, "username or email required ");
  }
  ```

### Step 2: Check if user exists

- To search the DB for a user, we want to search ny either email or username.
- for this, we will use mongoDB method _findOne()_, which returns the first document when it meets our parameter.
- also, since we want to search by two conditions, we will use mongosDB **_$OR_** operator.
- $OR takes an array as input. Inside this array we can pass objects which will then be searched inside our database.
- Use **await** because talking to DB takes time.

  ```javascript
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  ```

- In case we only want to search user by one parameter, then:
  ```javascript
  const user = await User.findOne({ username });
  ```

### Step 3: Check user's password

- we will use the brcrypt to check our password.
- we have already created a function using brcypt in the user model.
- our isPassordCorrect method that we created, is available to the user which is saved in the database. In the above code, we find the user in database and save it in **_user_** variable. This user, is an instance of the DB and will have access to the methods we added to our DB in user model.

  ```javascript
  const isPasswordValid = await user.isPasswordCorrect(password); // returns a true or false

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  ```

### Step 4: Generate access and refresh tokens

- generating tokens is very common, so we will create a method, so that we can use it to generate tokens repeatedly.
- We have to save refresh token in our Database, so that we can compare it later to generate new access tokens.

  ```javascript
  const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // add refresh token to user object.
      // This object has all the fields that we specified in our User model
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false }); // save the user object with changes.

      return { refreshToken, accessToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating Refresh and Access Tokens"
      );
    }
  };
  ```

- Before saving the user object, by default, we have to provide each field that is flagged as required in our User model.
- Therefore we have to provide all the required fields again.
- To avoid this, we pass an object inside save(). ValidateBeforeSave and set it to _false_.
- we have created the method and now we simply call it wherever we require

  ```javascript
  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshTokens(user._id);
  ```

  - this method returns us an object with both the tokens and we will store these in destructured variables.
  - Reference objects are not automatically updated after saving data to the database.

    - we created our user reference first.
    - then we generated token and saved it to db.
    - now are DB user has the tokens but our reference is from an old point where it did not had those new properties(tokens).
    - Our reference still holds the old data, not including the newly saved tokens.
    - for this, we will have to reload our reference/ object. Then it will have the updated properties.

  - Always reload the user object (e.g., await User.findById(user.\_id)) if you need the latest data after saving.

  - This ensures the refresh token (or any updated data) is included in the reference, we can do another query like this:

    ```javascript
    const loggedInUser = await User.findById(user._id).select(
      "-password -refresToken"
    );
    ```

  - we are also removing important fields from the user object, so that we dont send sensetive info in our cookies.
