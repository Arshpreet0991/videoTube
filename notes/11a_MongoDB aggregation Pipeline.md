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
