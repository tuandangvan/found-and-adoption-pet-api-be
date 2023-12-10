import mongoose, { Schema } from "mongoose";
import { enums } from "../enums/enums.js";

const postSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    reaction: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null
        },
        centerId: {
          type: Schema.Types.ObjectId,
          ref: "Center",
          default: null
        }
      }
    ],
    images: [
      {
        type: String,
        default: "Chưa cập nhật"
      }
    ],
    comments: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: null
        },
        centerId: {
          type: Schema.Types.ObjectId,
          ref: "Center",
          default: null
        },
        commentId:{
          type: Schema.Types.ObjectId,
          ref: "Comment",
          required: true,
          default: null
        },
        content: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now()
        }
      }
    ],
    status: {
      type: String,
      enum: [
        enums.statusPost.ACTIVE,
        enums.statusPost.HIDDEN,
        enums.statusPost.LOCKED
      ],
      default: enums.statusPost.ACTIVE
    },
    statusAccount: {
      type: String,
      required: true,
      default: 'ACTIVE',
    }
  },
  {
    timestamps: true
  }
);

const postModel = mongoose.model("Posts", postSchema);
export default postModel;
