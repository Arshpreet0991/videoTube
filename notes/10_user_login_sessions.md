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
