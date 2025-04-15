# uploading files to the backend

- The best practice is to upload our files like images, videos etc. to an external storage like Cloudinary, AWS etc.
- We do it because we want to keep our database light.

# Notes

- express doesnt have the capability of handling cookies and files. For this we need to import some packages.

### to handle cookies

- to handle cookies, we will install the package cookie parser. "npm i cookie-parser"
- go to app.js and import cookie parser in the "Common middleware section"

### to handle files like images etc.

- install the package multer. "npm i multer"
