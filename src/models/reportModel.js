import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true
    },
    idDestinate: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reporter: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null
        },
        centerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Center"
        },
        reason: {
          type: String,
          required: true
        }
      }
    ],
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    status: {
      type: String,
      enum: ["PENDING", "HANDLED", "REJECTED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

const reportModel = mongoose.model("Report", reportSchema);
export default reportModel;
