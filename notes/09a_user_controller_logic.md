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
