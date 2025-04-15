# Hooks or Middlewares

In mongoDB (specifically in mongoose), middlewares are the functions that execute before or after certain database operations like saving, updating or deleting documents. These middlewares are called hooks in mongoose.

## Uses

A mongoose hook allows us to run a custom logic automatically when certain actions occur in our database.
These logics can be for eg. validation, data transformation, logging etc.

## Types of hooks

1. Pre Hook (pre) - run before the DB operation
2. Post Hook (post)- run after the DB operation

## Pre Hook

it is executed before a certain action occurs in our DB. Can be used to validate data, has password, modify data etc.

## Post Hook

it is executed after a certain action occurs in our DB. Can be used to send notifications, loggin or additional data processing.

## Hook methods

1. save() - eg: .pre("save",callback) or .post("save",callback)
2. remove() eg: .pre("remove",callback) or .post("remove",callback)
3. updateOne() eg: .pre("updateOne",callback) or .post("updateOne",callback)
4. find() eg: .pre("find",callback) or .post("find",callback)

# Hooks usage in our Project: V-Tube

### Step 1 install bcrypt package (npm i bcrypt)

- Here we will be using hooks in passwords. Since we want to always encrypt the user's password in DB, we will use hooks here. The idea is that whenever a user creates a password, just before saving the password into the DB, we want to encrypt it. This is called hook(pre). For encryption itself, we will need to install a package.

### Step 2 Go to user.model.js

- import bcrypt from "bcrypt";
- and apply pre hook on userSchema. Below is the boilerplate code:

```javascript
userSchema.pre("save", function (next) {
  // logic for encryption goes here
  next();
});
```

- never use arrow functions here as it will lose the context. Use the regular functions.
- The callback in the hook will have a "next" parameter. As this is a flag and will be passed onto the next . So next parameter is required everytime we use hooks
- always call the next() method inside the hook, as this method is responsible for passing the "next" flag to the next middleware or wherever it needs to go.

### Step 3 Write the encryption logic

```javascript
userSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});
```

- by default, the hash method will encrypt the password, everytime a user saves anything, like name etc. We want to encrypt the password only when the password field is modified or created for the first time. Therefore we will add a condition here.
- here "this" will have the context of whichever user is calling the save hook. It will have access to all the user keys inside our userSchema such as username, id, password etc.

### Step 4 Decrypt the password for comparison

- Since we have encrypted the password in the previous step, we need to decrypt it as well if we ever want to compare our passwords. This is another functionality of hooks. User authentication.
- to decrypt the password we will use brcypt again.

```javascript
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // decrypts and compare the passwords and returns a boolean
};
```

- we are creating our own method(isPasswordCorrect) and adding it to the userSchema.
- This method will take password from the user and compare it with the password stored inside the database and return a boolean value.
- brcypt compare method automatically decrypt the password and compare it.

### Step 5 Verify the user has logged in

- basically, whenever a user's password matches, we will give the user a Access token and a Refresh token. So, if a user has these two tokens, that user will be considered logged in and will have access to their data.
- to work with these tokens, we need to install a package called **_jsonwebtokens_**
- #### JSON Web Token (JWT):

  - JWT is a secure way to transmit information between parties as a JSON object. It is commonly used for authentication and authorization in web apps.
  - It has 3 parts:
    - Header (Contains Meta data of about the token)
    - Payload (Contains user data like id, name etc.)
    - Signature ( ensures that the token is valid and secure)

- #### How JWT Auth works

  - User logs in → Sends email & password.
  - Server verifies user → If valid, generates a JWT.
  - JWT is sent to client → Stored in localStorage or cookies.
  - Client sends JWT in requests → For protected routes.
  - Server validates JWT → Grants or denies access.

  #### Generate the access token

  ```javascript
  userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id, // getting from mongoose
        email: this.email,
        username: this.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  };
  ```

- Access token is generated one time and it has a short time period for expiry.
- Usually, on the payload, we only send user id. Here we are kust sending extra info for demo.
- jwt.sign() method generates a token. Tt takes 3 params

  - payload (data)
  - access token secret (only the server that issued the token can verify it using the secret)
  - Expiry of the token

  #### Generate a long lived token called refresh token

  ```javascript
  userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        _id: this._id, // getting from mongoose
        email: this.email,
        username: this.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  };
  ```
