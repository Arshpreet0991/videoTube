# MongoDB Aggregation Pipeline

- we have to join our subscription model to user model
- we are going to create a controller for user's channel profile.

  ```js
  const getUserChannelProfile = asyncHandler(async (req, res) => {

    // 1. we will get our username from the url
        const {username}=req.params

    // 2. check if we got the username or not

    if(!username?.trim()){
        throw new Error("Username is required)
    }

    // 3. use aggregate pipline- use the username to enquire something in the  DB
        const channel= await User.aggregate(
            [
                // stage 1
                {
                    $match:{
                        username:username?.toLowerCase()
                    }
                },
                // stage 2- get all the subscribers of a channel by joining the subscription model to user model
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"channel",
                        as:"subscribers"
                    }
                },
                // stage 3- get all the channels that i have subscribed to, by joining the subscription model to user model
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"subscriber",
                        as:"subscribedTo"
                    }
                },
                // stage 4- add field
                {
                    // count the total subscribers
                    $addFields:{
                        subscribersCount:{
                            $size:"$subscribers"
                        },
                        channelSubscribedToCount:{
                            $size:"$subscribedTo$
                        },
                        // check if the user is already subscribed to a channel
                        isSubscribed:{
                            $cond:{
                                if: {
                                    $in: [req.user?._id,"$subscribers.subscriber"]
                                },
                                then: true,
                                else:false
                            }
                        }
                    }

                },
                // stage 5: // send the required data to front end
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1,
                        subscriberCount:1,
                        channelsSubscribedTo:1,
                        email:1
                    }
                } //end of stage 5
            ] // aggregation array
        )







  }); // async function
  ```

  when we collect all the channels that have our user ID, we get the total number of subscribers.

# 📘 MongoDB Aggregation Notes: `$lookup` for Subscriptions

## Context

You have:

- A `User` collection (each user has `_id`, `username`, etc.)
- A `subscriptions` collection where each document represents one user subscribing to another.

### Example `subscriptions` document:

```js
{
  _id: ObjectId("..."),
  subscriber: ObjectId("user123"), // person who subscribed
  channel: ObjectId("user456"),    // person being subscribed to
  subscribedAt: ISODate("...")
}
```

---

## 📊 Aggregation Pipeline Breakdown

### 🔍 Stage 1: `$match` — Find the target user

```js
{
  $match: {
    username: username?.toLowerCase(),
  }
}
```

- Filters the `User` collection to return the document of the user whose `username` matches the input.

---

### 👥 Stage 2: `$lookup` — Who subscribed to me?

```js
{
  $lookup: {
    from: "subscriptions",
    localField: "_id",
    foreignField: "channel",
    as: "subscribers"
  }
}
```

- Looks in the `subscriptions` collection.
- Finds all documents where `channel === this user’s _id`.
- Adds these as a new array field `subscribers`.

---

### 📺 Stage 3: `$lookup` — Whom did I subscribe to?

```js
{
  $lookup: {
    from: "subscriptions",
    localField: "_id",
    foreignField: "subscriber",
    as: "subscribedTo"
  }
}
```

- Finds all documents where `subscriber === this user’s _id`.
- Adds these as a new array field `subscribedTo`.

---

### ✅ Important Clarification

- `$lookup` stages are **independent**.
- Each one uses the entire document from the previous stage.
- They do **not overwrite** or limit each other.
- They only **add new fields**.

---

### 🧮 Stage 4: `$addFields` — Add counts and check subscription status

```js
{
  $addFields: {
    subscribersCount: { $size: "$subscribers" },
    channelsSubscribedToCount: { $size: "$subscribedTo" },
    isSubscribed: {
      $cond: {
        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
        then: true,
        else: false
      }
    }
  }
}
```

- Adds:
  - Count of subscribers.
  - Count of subscriptions.
  - `isSubscribed` flag for current viewer.

---

### 🎯 Stage 5: `$project` — Final output

```js
{
  $project: {
    fullname: 1,
    username: 1,
    subscribersCount: 1,
    channelsSubscribedToCount: 1,
    isSubscribed: 1,
    coverImage: 1,
    avatar: 1,
    email: 1
  }
}
```

- Only keeps the final useful fields for the frontend or client.

---

## ✅ Summary — In Plain English

- You get a user by `username`.
- You find:
  - Who subscribed to them (`subscribers`)
  - Whom they subscribed to (`subscribedTo`)
- You count both, check if current viewer is subscribed.
- You return only selected data to client.

---

## 🧠 Quick Cheatsheet

| Goal                               | How                                                |
| ---------------------------------- | -------------------------------------------------- |
| Find who subscribed to user        | `$lookup` where `subscriptions.channel === _id`    |
| Find whom user subscribed to       | `$lookup` where `subscriptions.subscriber === _id` |
| Check if logged-in user subscribed | Use `$in` on `subscribers.subscriber`              |
