import mongoose, { Schema } from "mongoose";

const notifySchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true
    },
    receiver: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default: null
        },
        centerId: {
          type: mongoose.Schema.ObjectId,
          ref: "Center",
          default: null
        }
      }
    ],
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    content: {
      type: String
    },
    idDestinate: {
      type: String,
      required: true
    },
    allowView: {
      type: Boolean,
      required: true,
      default: false
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30*24*60*60,//tự động xóa sau 30 ngày
    }
  },
  {
    timestamps: true
  }
);

const notifyModel = mongoose.model("Notify", notifySchema);
export default notifyModel;
