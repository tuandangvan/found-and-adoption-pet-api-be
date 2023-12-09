import mongoose, { Schema } from "mongoose";

const notifySchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true
    },
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    content: {
      type: String,
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
      default: false
    }
  },
  {
    timestamps: true
  }
);

const notifyModel = mongoose.model("Notify", notifySchema);
export default notifyModel;
