# steps

3.  go to app.js
4.  import express and create app from express
5.  export {app}
6.  go to index.js
7.  add.then and .catch to connectDB function and createa a server
8.  come back to app.js
9.  install cookie parser:
    - npm i cookie-parser
    - Cookie parser reads the cookie headers sent by the user during the request and reads the headers and create an object from it. This object contains all the cookies send by the client/user and can be accessed by req.cookies
10. install CORS:
    - npm i cors
11. Most of the time, when we use a middleware or we have to configure something on our express, we use it through app.use()
12. import cookie-parser and cors in app.js

    ```javascript
    import cors from "cors";
    import cookieParser from "cookie-parser";
    ```

13. configure cors

    ```javascript
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      })
    );
    ```

    - we have to create a variable in .env named CORS_ORIGIN. We will give our orgin as here (meaning which origin is allowed to contact our backend)
    - for testing puposes we are writing here CORS_ORIGIN= \*, which means everyone is allowed to contact our backend but it is not done like this in professional setting.

14. Configure some of the middlewares.

    - Configure json data

      - Now, since we will be receiving data from multiple sources (eg. json, url, form etc.), we will configure how we should receive data. These are the best practices.
      - We will configure that our app will revieve data in json format. Also, we will write the max size of the data we will receive, otherwise our server can crash with if we accept infinite data.

        ```javascript
        app.use(express.json({ limit: "16kb" }));
        ```

    - Confiugre url encoding

      - The url from different websites looks differnet because they use special characters to encode the url (for eg. %,&,$ etc.). So, if we want express to understand the data send by URL, we need to provide it with the functionality to extract the data from the url.

        ```javascript
        app.use(express.urlencoded({ extended: true, limit: "16kb" }));
        ```

    - Configure Cookie-Parser

      - allows us to perform CRUD operations on cookies
        ```javascript
        app.use(cookieParser());
        ```

    - configure public folder
      - a temporary folder(public) to store files, which we might need to upload on our server later.
      ```javascript
      app.use(express.static("public"));
      ```
