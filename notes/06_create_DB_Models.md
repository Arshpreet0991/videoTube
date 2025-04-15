# Create models

- To create a schema using mongoose we need three steps:
  1. import mongoose
  2. create schema
     - we want to create some fields in our schema, for example: userId, username, email, createdAt, updatedAt etc.
     - MongoDb automatically generates unique id for our models, so we dont need to generate ids.
  3. create a model using the schema and export it
  4. Install Mongoose aggregation paginate v2
     ```javascript
          npm i mongoose-aggregate-paginate-v2
     ```

```javascript
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  // watch history is an array of objects(Ids) of watched videos
  watchHistory: [
    {
      type: Schema.Types.ObjectId, // link the schema to other schemas
      ref: "Video", // refer the schema to which link it to
    },
  ],
},timestamps:true);

export const User = mongoose.model("User", userSchema);
```

- After creating schema with all the models, we will add the aggregation ability to the models in which we plan to use aggregation. To do that we need two steps:

```javascript
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

schemaName.plugin(mongooseAggregatePaginate);
```
