import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // external cloudinary url
      required: true,
    },
    thumbnail: {
      String, // external cloudinary url
      required: true,
    },
    title: {
      String,
      required: true,
    },
    description: {
      String,
      required: true,
    },
    duration: {
      type: Number, // we will get this from cloudniary(external storage)
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
