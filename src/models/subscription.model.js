import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // the one who is subscriber
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // the one to whom subscribing is required
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
